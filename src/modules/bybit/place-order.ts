import { request } from "@iam4x/request";
import { hmac } from "@noble/hashes/hmac.js";
import { sha256 } from "@noble/hashes/sha2.js";

const RECV_WINDOW = 5000;
const BROKER_ID = "Gi000266";

export const placeOrder = async (amount: number) => {
  const body = {
    category: "linear",
    symbol: "BTCUSDT",
    side: "Buy",
    orderType: "Market",
    qty: amount.toString(),
    positionIdx: 0,
  };

  const timestamp = new Date().getTime();
  const message = [
    timestamp,
    process.env.BYBIT_API_KEY!,
    RECV_WINDOW,
    JSON.stringify(body),
  ].join("");

  const signature = hmac(sha256, process.env.BYBIT_API_SECRET!, message);
  const response = await request<{ retCode: number; retMsg: string }>({
    url: `https://api.bybit.com/v5/order/create`,
    method: "POST",
    body,
    headers: {
      "X-BAPI-SIGN": signature.toHex(),
      "X-BAPI-API-KEY": process.env.BYBIT_API_KEY!,
      "X-BAPI-TIMESTAMP": `${timestamp}`,
      "X-BAPI-RECV-WINDOW": `${RECV_WINDOW}`,
      "X-Referer": BROKER_ID,
    },
  });

  return response;
};
