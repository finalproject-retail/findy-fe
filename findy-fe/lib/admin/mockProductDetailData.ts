/** @deprecated adminProductPerformanceTypes / mockProductPerformanceData 로 통합됨 */
export type {
  AdminMonthlyViewPoint,
  AdminProductPerformance,
  AdminRecommendationFunnelStep,
} from "@/lib/admin/adminProductPerformanceTypes";

export {
  formatAdminViewCount,
  getAdminProductFinalConversionRate,
} from "@/lib/admin/adminProductPerformanceTypes";

export { getAdminProductPerformanceDetail as getAdminProductDetailMock } from "@/lib/admin/mockProductPerformanceData";
