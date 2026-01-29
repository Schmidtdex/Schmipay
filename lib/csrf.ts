import { headers } from "next/headers";

/**
 * Valida o header Origin para proteção CSRF básica
 * Deve ser chamado em server actions críticas
 */
export async function validateCsrf(requestOrigin?: string): Promise<boolean> {
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  const headersList = await headers(); // 👈 SEM await
  const origin = headersList.get("origin");
  const referer = headersList.get("referer");

  // Server Actions não possuem origin/referer
  if (!origin && !referer) {
    return true;
  }

  if (requestOrigin) {
    return (
      origin === requestOrigin ||
      (!!referer && referer.startsWith(requestOrigin))
    );
  }

  const authUrl = process.env.BETTER_AUTH_URL;
  if (authUrl) {
    try {
      const url = new URL(authUrl);
      const allowedOrigin = `${url.protocol}//${url.host}`;

      return (
        origin === allowedOrigin ||
        (!!referer && referer.startsWith(allowedOrigin))
      );
    } catch {
      return true;
    }
  }

  return true;
}
