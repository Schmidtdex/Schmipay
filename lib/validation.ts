/**
 * Validação robusta de email usando regex melhorada e verificação de domínio
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Regex melhorada para validação de email
  // Baseada em RFC 5322 (versão simplificada mas robusta)
  const emailRegex =
    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

  if (!emailRegex.test(trimmedEmail)) {
    return false;
  }

  // Verificações adicionais
  if (trimmedEmail.length > 254) {
    // Limite máximo de tamanho de email
    return false;
  }

  const [localPart, domain] = trimmedEmail.split("@");

  if (!localPart || !domain) {
    return false;
  }

  // Local part não pode exceder 64 caracteres
  if (localPart.length > 64) {
    return false;
  }

  // Domain não pode exceder 253 caracteres
  if (domain.length > 253) {
    return false;
  }

  // Domain deve ter pelo menos um ponto (ex: exemplo.com)
  if (!domain.includes(".")) {
    return false;
  }

  // Domain não pode começar ou terminar com ponto ou hífen
  if (
    domain.startsWith(".") ||
    domain.endsWith(".") ||
    domain.startsWith("-") ||
    domain.endsWith("-")
  ) {
    return false;
  }

  return true;
}
