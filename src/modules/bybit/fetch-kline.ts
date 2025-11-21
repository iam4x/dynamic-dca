import { request } from "@iam4x/request";

import { TOKEN } from "~/config";

export const fetchKline = async (): Promise<
  Array<[number, number, number, number, number, number]>
> => {
  const response = await request<{
    result: { list: Array<[string, string, string, string, string, string]> };
  }>({
    url: "https://api.bybit.com/v5/market/kline",
    params: {
      category: "linear",
      symbol: TOKEN,
      interval: "240",
      limit: 60,
    },
  });

  return response.result.list
    .reverse()
    .map((k) => [
      Number(k[0]),
      Number(k[1]),
      Number(k[2]),
      Number(k[3]),
      Number(k[4]),
      Number(k[5]),
    ]);
};
