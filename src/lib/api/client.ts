// src/lib/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Router from 'next/router';

/* ------------------------------------------- */
/*  Helper: verifica se está no navegador     */
/* ------------------------------------------- */
const isBrowser = typeof window !== 'undefined';

/* ------------------------------------------- */
/* Funções para tokens via sessionStorage     */
/* ------------------------------------------- */
const getAccessToken = () => isBrowser ? sessionStorage.getItem('accessToken') : null;
const getRefreshToken = () => isBrowser ? sessionStorage.getItem('refreshToken') : null;

const setTokens = (access: string, refresh: string) => {
  if (!isBrowser) return;
  sessionStorage.setItem('accessToken', access);
  sessionStorage.setItem('refreshToken', refresh);
};

const clearTokens = () => {
  if (!isBrowser) return;
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
};

/* ------------------------------------------- */
/* Instância principal do axios              */
/* ------------------------------------------- */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.NEXT_PUBLIC_BLOXIFY_API_KEY!,
  },
});

/* ------------------------------------------- */
/*  Interceptor de requisição: adiciona token */
/* ------------------------------------------- */
api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token && config.headers) {
    
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
});


/* ------------------------------------------- */
/*  Interceptor de resposta: tenta refresh    */
/* ------------------------------------------- */
let isRefreshing = false;
let queue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = [];

function flushQueue(error: AxiosError | null, token: string | null = null) {
  queue.forEach((p) => {
    if (error) p.reject(error);
    else if (token) p.resolve(token);
  });
  queue = [];
}

api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token: string) => {
            if (original.headers)
              original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) throw error;

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
        { refreshToken },
        {
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_BLOXIFY_API_KEY!,
            'Content-Type': 'application/json',
          },
        }
      );

      const { accessToken: newAccess, refreshToken: newRefresh } = data;
      setTokens(newAccess, newRefresh);
      flushQueue(null, newAccess);

      if (original.headers)
        original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original);
    } catch (err) {
      flushQueue(err as AxiosError);
      clearTokens();
      if (isBrowser) Router.replace('/login');
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
