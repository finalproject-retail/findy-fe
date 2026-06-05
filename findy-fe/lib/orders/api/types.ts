export type OrderSummaryApiDto = {
  orderId: number;
  orderStatus: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  earnedReward: number;
  orderedAt: string;
  itemCount: number;
  firstProductName: string;
};

export type OrderItemApiDto = {
  orderItemId: number;
  productId: number;
  productName: string;
  quantity: number;
  productPrice: number;
  itemDiscountAmount: number;
  itemFinalAmount: number;
};

export type OrderDetailApiDto = {
  orderId: number;
  shoppingListId: number | null;
  orderStatus: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  earnedReward: number;
  orderedAt: string;
  couponId: number | null;
  couponName: string | null;
  items: OrderItemApiDto[];
};

export type OrderListApiData = {
  orders?: OrderSummaryApiDto[];
};
