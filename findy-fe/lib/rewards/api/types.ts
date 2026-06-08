/** POST /api/v1/users/me/rewards/orders 응답 */
export type EarnPurchaseRewardApiDto = {
  userId: number;
  orderId: number;
  earnedReward: number;
  rewardBalance: number;
  purchaseAmount: number;
  grade: string;
  rewardRate: number;
};

export type EarnPurchaseRewardResult = {
  orderId: number;
  earnedReward: number;
  rewardBalance: number;
  purchaseAmount: number;
  grade: string;
  rewardRate: number;
};

/** GET /api/v1/users/me/rewards 응답 항목 */
export type RewardHistoryApiDto = {
  id: number;
  type: string;
  date: string;
  title: string;
  subtitle: string;
  amount: number;
};

export type RewardHistoriesApiData = {
  histories: RewardHistoryApiDto[];
  count: number;
};

export type RewardHistoriesResult = {
  histories: RewardHistoryApiDto[];
  count: number;
};

/** POST /api/v1/users/me/rewards/use 응답 */
export type UseRewardApiDto = {
  userId: number;
  orderId: number;
  usedReward: number;
  rewardBalance: number;
};

export type UseRewardResult = {
  orderId: number;
  usedReward: number;
  rewardBalance: number;
};
