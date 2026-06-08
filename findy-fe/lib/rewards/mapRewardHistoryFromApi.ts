import type {
  PointHistoryItem,
  PointHistoryType,
} from "@/components/point/mockPointHistory";
import { formatOrderDisplayDate } from "@/lib/orders/formatOrderDate";
import type { RewardHistoryApiDto } from "@/lib/rewards/api/types";

function mapRewardHistoryType(type: string): PointHistoryType {
  if (type === "earned") {
    return "earned";
  }
  if (type === "expired") {
    return "expired";
  }
  return "used";
}

export function mapRewardHistoryFromApi(
  dto: RewardHistoryApiDto,
): PointHistoryItem {
  return {
    id: String(dto.id),
    type: mapRewardHistoryType(dto.type),
    date: formatOrderDisplayDate(dto.date),
    title: dto.title,
    subtitle: dto.subtitle,
    amount: dto.amount,
  };
}
