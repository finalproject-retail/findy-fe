/** 바코드 스캔 시 랜덤 포인트 당첨 확률 */
export const BARCODE_POINT_REWARD_PROBABILITY = 0.05;

export const BARCODE_POINT_REWARD_MIN = 1;
export const BARCODE_POINT_REWARD_MAX = 10;

/** 5% 확률로 1~10P 반환, 미당첨 시 null */
export function rollBarcodePointReward(): number | null {
  if (Math.random() >= BARCODE_POINT_REWARD_PROBABILITY) {
    return null;
  }

  return (
    Math.floor(
      Math.random() *
        (BARCODE_POINT_REWARD_MAX - BARCODE_POINT_REWARD_MIN + 1),
    ) + BARCODE_POINT_REWARD_MIN
  );
}
