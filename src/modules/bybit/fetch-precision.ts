import { request } from "@iam4x/request";

import { TOKEN } from "~/config";

export const fetchTokenPrecision = async () => {
  const response = await request<
    Record<string, { precision: { amount: number } }>
  >({
    url: "https://aggr.proliquid.xyz/api/markets/bybit",
  });

  return response[TOKEN].precision.amount;
};
