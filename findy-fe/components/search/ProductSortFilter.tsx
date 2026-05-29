import { DropdownFilter } from "@/components/common/DropdownFilter";
import { PRODUCT_SORT_OPTIONS, type ProductSortType } from "./searchTypes";

type ProductSortFilterProps = {
  value: ProductSortType;
  onChange: (value: ProductSortType) => void;
};

export function ProductSortFilter({ value, onChange }: ProductSortFilterProps) {
  return (
    <DropdownFilter
      value={value}
      onChange={onChange}
      options={PRODUCT_SORT_OPTIONS}
      accessibilityLabel="검색 결과 정렬"
      align="start"
    />
  );
}
