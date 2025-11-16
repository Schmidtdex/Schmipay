/**
 * Remove caracteres HTML e sanitiza strings
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  // Remove tags HTML básicas
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&[#\w]+;/g, "");

  // Remove caracteres de controle (exceto espaços e quebras de linha)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  return sanitized.trim();
}

/**
 * Sanitiza e valida string para campos de texto simples
 */
export function sanitizeText(input: string, maxLength?: number): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  let sanitized = input.trim();

  // Remove caracteres HTML
  sanitized = sanitizeHtml(sanitized);

  // Remove caracteres especiais perigosos
  sanitized = sanitized.replace(/[<>{}[\]]/g, "");

  // Aplica limite de tamanho se fornecido
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}
