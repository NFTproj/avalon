// Fix para Next.js 15 navigation types
declare module 'next/navigation' {
  export function useRouter(): {
    push: (href: string) => void
    replace: (href: string) => void
    refresh: () => void
    back: () => void
    forward: () => void
    prefetch: (href: string) => void
  }
  
  export function useParams(): Record<string, string | string[]>
  export function useSearchParams(): URLSearchParams
  export function usePathname(): string
  export function redirect(url: string): never
  export function notFound(): never
}