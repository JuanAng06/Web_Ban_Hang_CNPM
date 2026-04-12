/** Số điện thoại VN: bắt đầu 09, đúng 10 chữ số. */
export const VN_PHONE_09_REGEX = /^09\d{8}$/;

export function normalizeDigitsPhoneInput(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 10);
}

export function isValidVnPhone09(phone: string): boolean {
  return VN_PHONE_09_REGEX.test(phone.trim());
}
