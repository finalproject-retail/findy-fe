import { DropdownFilter } from "@/components/common/DropdownFilter";
import type { PointHistoryFilterType } from "./mockPointHistory";

const FILTER_OPTIONS: { key: PointHistoryFilterType; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "earned", label: "적립" },
  { key: "used_expired", label: "사용 · 소멸" },
];

type PointHistoryFilterProps = {
  value: PointHistoryFilterType;
  onChange: (value: PointHistoryFilterType) => void;
};

export function PointHistoryFilter({
  value,
  onChange,
}: PointHistoryFilterProps) {
  return (
    <DropdownFilter
      value={value}
      onChange={onChange}
      options={FILTER_OPTIONS}
      accessibilityLabel="포인트 내역 필터"
    />
  );
}
