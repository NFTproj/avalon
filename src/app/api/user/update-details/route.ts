import { NextRequest, NextResponse } from 'next/server';
import FormDataNode from 'form-data';           // npm i form-data

export const runtime = 'nodejs';                // garante Node (não edge)

export async function POST(req: NextRequest) {
  try {
    /* ───── variáveis sensíveis (server-only) ───── */
    const apiUrl   = process.env.BLOXIFY_URL_BASE;
    const apiKey   = process.env.BLOXIFY_API_KEY;
    const clientId = process.env.CLIENT_ID;
    const accessToken = req.cookies.get('accessToken')?.value;

    if (!apiUrl || !apiKey || !clientId || !accessToken) {
      return NextResponse.json({ error: 'Configuração ou token ausente' }, { status: 500 });
    }

    /* ───── multipart recebido do navegador ───── */
    const reqFormData = await req.formData();

    console.table(
      [...reqFormData.entries()].map(([k, v]) => ({
        key: k,
        isFile: v instanceof File,
        size: v instanceof File ? v.size : undefined,
        value: v instanceof File ? v.name : v,
      })),
    );

    /* ───── monta novo multipart ───── */
    const form = new FormDataNode();
    const append = (k: string, v: unknown) => {
      if (v !== null && v !== undefined && v !== '') {
        form.append(k, String(v));
      }
    };

    append('clientId', clientId);
    append('type',     reqFormData.get('type'));
    append('name',     reqFormData.get('name'));
    append('address',  reqFormData.get('address'));
    append('city',     reqFormData.get('city'));
    append('state',    reqFormData.get('state'));
    append('country',  reqFormData.get('country'));
    append('zipCode',  reqFormData.get('zipCode'));

    if (reqFormData.get('type') === 'individual') {
      append('cpf', reqFormData.get('cpf'));
    } else {
      append('cnpj', reqFormData.get('cnpj'));

      const addPdf = async (key: string) => {
        const file = reqFormData.get(key) as File | null;
        if (!file) return;
        const buffer = Buffer.from(await file.arrayBuffer());
        form.append(key, buffer, { filename: file.name, contentType: file.type });
      };

      await addPdf('contractFile');
      await addPdf('proofOfAddressFile');
    }

    /* ───── headers p/ backend ───── */
    const headers: Record<string, string> = {
      ...form.getHeaders(),                       // Content-Type + boundary
      Authorization: `Bearer ${accessToken}`,
      'x-api-key': apiKey,
    };

    /* Logs de sanidade antes do fetch */
    console.log('Content-Type =>', headers['content-type']);
    form.getLength((err, len) =>
      console.log('Content-Length =>', err ? 'erro' : len),
    );

    /* ───── PUT → backend ───── */
    const response = await fetch(`${apiUrl}/user/update-details`, {
      method: 'PUT',
      headers,
      body: form as any,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    console.error('[UPDATE DETAILS ERROR]', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
