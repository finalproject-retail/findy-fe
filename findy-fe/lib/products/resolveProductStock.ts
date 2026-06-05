type StockFields = {
  saleStatus?: string | null;
  stockStatus?: string | null;
  stockCount?: number | null;
  stockQuantity?: number | null;
  stock?: number | null;
};

const OUT_OF_STOCK_SALE_STATUSES = new Set([
  "OUT_OF_STOCK",
  "SOLD_OUT",
  "DISCONTINUED",
]);

const OUT_OF_STOCK_STOCK_STATUSES = new Set(["OUT_OF_STOCK"]);

function normalizeStatus(value?: string | null) {
  if (!value) {
    return null;
  }
  return value.trim().toUpperCase();
}

export function resolveStockCountFromApiFields(dto: StockFields): number | undefined {
  const saleStatus = normalizeStatus(dto.saleStatus);
  const stockStatus = normalizeStatus(dto.stockStatus);

  if (saleStatus && OUT_OF_STOCK_SALE_STATUSES.has(saleStatus)) {
    return 0;
  }
  if (stockStatus && OUT_OF_STOCK_STOCK_STATUSES.has(stockStatus)) {
    return 0;
  }

  const raw = dto.stockCount ?? dto.stockQuantity ?? dto.stock;
  if (raw != null && Number.isFinite(Number(raw))) {
    return Math.max(0, Math.round(Number(raw)));
  }

  return undefined;
}
