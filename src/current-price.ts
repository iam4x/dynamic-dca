import { request } from "@iam4x/request";

export const getCurrentPrice = async () => {
  const response = await request<{
    result: { list: [{ symbol: "BTCUSDT"; lastPrice: string }] };
  }>({
    url: "https://api.bybit.com/v5/market/tickers",
    params: {
      category: "linear",
      symbol: "BTCUSDT",
    },
  });

  return parseFloat(response.result.list[0].lastPrice);
};
