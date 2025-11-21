import { redis } from "bun";

import { TOTAL_CAPITAL } from "../config";

const DEFAULT_STATE = {
  REMAINING_CAPITAL: TOTAL_CAPITAL,
  TOTAL_BTC_ACCUMULATED: 0,
  WEIGHTED_SUM_COST: 0,
  PURCHASE_HISTORY: [] as {
    timestamp: number;
    price: number;
    usdSpent: number;
    btcBought: number;
    averagePrice: number;
    capitalRemaining: number;
  }[],
  START_TIME: Date.now(),
};

export const getState = async (): Promise<typeof DEFAULT_STATE> => {
  const state = await redis.get("state");
  return state ? JSON.parse(state) : DEFAULT_STATE;
};

export const setState = async (state: typeof DEFAULT_STATE) => {
  await redis.set("state", JSON.stringify(state));
};
