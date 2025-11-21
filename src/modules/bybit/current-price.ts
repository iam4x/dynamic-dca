import { request } from "@iam4x/request";

import { TOKEN } from "~/config";

export const getCurrentPrice = async () => {
  const response = await request<{
    result: { list: [{ symbol: string; lastPrice: string }] };
  }>({
    url: "https://api.bybit.com/v5/market/tickers",
    params: {
      category: "linear",
      symbol: TOKEN,
    },
  });

  return parseFloat(response.result.list[0].lastPrice);
};
