const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,16}$/;
const PHONE_PATTERN = /^01[016789]\d{7,8}$/;

export function isValidSignupEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim());
}

export function isValidSignupPassword(value: string) {
  return PASSWORD_PATTERN.test(value);
}

export function isValidSignupPhone(value: string) {
  return PHONE_PATTERN.test(value.replace(/\D/g, ""));
}
