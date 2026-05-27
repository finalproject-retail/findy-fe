import { SPACING } from "@/constants/theme";

export const SHEET_HANDLE_HEIGHT = 4;
export const SHEET_HANDLE_WIDTH = 40;
export const SHEET_HANDLE_ROW_HEIGHT = SPACING.sm * 2 + SHEET_HANDLE_HEIGHT;
export const SHEET_BORDER_RADIUS = 20;
export const SHEET_MAX_HEIGHT_RATIO = 0.46;
export const SHEET_EXPANDED_MAX_PX = 400;
/** 푸터 버튼이 홈 인디케이터에 잘리지 않도록 추가 여백 */
export const SHEET_FOOTER_EXTRA_BOTTOM_PADDING = SPACING.lg;

/** 접었을 때 핸들 블록(핸들 + 위·아래 소량 패딩) */
export const SHEET_PEEK_TOP_PADDING = SPACING.xs;
export const SHEET_PEEK_HANDLE_BLOCK_HEIGHT =
  SHEET_HANDLE_ROW_HEIGHT + SHEET_PEEK_TOP_PADDING * 2;
/** 접었을 때 시트를 화면 하단에서 띄우는 거리 */
export const SHEET_COLLAPSED_BOTTOM_LIFT = 28;

/** 접었을 때 시트 자체 높이(핸들 블록만) */
export function getSheetCollapsedPeekHeight(_bottomInset: number) {
  return SHEET_PEEK_HANDLE_BLOCK_HEIGHT;
}

/** 접었을 때 지도/터치에서 비워 둘 하단 높이 */
export function getSheetMapBottomInset(bottomInset: number) {
  return (
    SHEET_PEEK_HANDLE_BLOCK_HEIGHT + getSheetCollapsedBottomLift(bottomInset)
  );
}

export function getSheetCollapsedBottomLift(bottomInset: number) {
  return Math.max(SHEET_COLLAPSED_BOTTOM_LIFT, bottomInset + 10);
}
