import { headers } from "next/headers";

/**
 * Valida o header Origin para proteção CSRF básica
 * Deve ser chamado em server actions críticas
 */
export async function validateCsrf(requestOrigin?: string): Promise<boolean> {
  if (process.env.NODE_ENV === "development") {
    // Em desenvolvimento, permitir sem validação estrita
    return true;
  }

  const headersList = await headers();
  const origin = headersList.get("origin");
  const referer = headersList.get("referer");

  // Se não há origin nem referer, pode ser uma requisição direta (não permitida)
  if (!origin && !referer) {
    return false;
  }

  // Se foi fornecido um requestOrigin, validar contra ele
  if (requestOrigin) {
    return (
      origin === requestOrigin ||
      (!!referer && referer.startsWith(requestOrigin))
    );
  }

  // Validar contra BETTER_AUTH_URL
  const authUrl = process.env.BETTER_AUTH_URL;
  if (authUrl) {
    try {
      const url = new URL(authUrl);
      const allowedOrigin = `${url.protocol}//${url.host}`;

      return (
        origin === allowedOrigin ||
        (!!referer && referer.startsWith(allowedOrigin)) ||
        // Permitir também requisições locais em desenvolvimento
        (!!origin && origin.startsWith("http://localhost")) ||
        (!!referer && referer.startsWith("http://localhost"))
      );
    } catch {
      // Se BETTER_AUTH_URL é inválido, permitir por enquanto
      return true;
    }
  }

  // Se não há BETTER_AUTH_URL configurado, permitir (mas logar aviso)
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "BETTER_AUTH_URL não configurado - validação CSRF desabilitada"
    );
  }

  return true;
}
