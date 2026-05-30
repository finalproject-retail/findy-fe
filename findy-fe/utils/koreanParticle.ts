/** 마지막 글자에 받침이 있는지 (을/를 선택용) */
export function hasKoreanBatchim(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;

  const lastChar = trimmed[trimmed.length - 1];
  const code = lastChar.charCodeAt(0);

  if (code >= 0xac00 && code <= 0xd7a3) {
    return (code - 0xac00) % 28 !== 0;
  }

  return /[b-df-hj-np-tv-z0-9]$/i.test(trimmed);
}

export function formatProductCanceledMessage(productName: string): string {
  const particle = hasKoreanBatchim(productName) ? "을" : "를";
  return `${productName} ${particle} 취소했습니다.`;
}
