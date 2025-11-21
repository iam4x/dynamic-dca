import { calculateBuySize } from "./calculate-buy";

import { adjust } from "~/utils";
import { getCurrentPrice } from "~/modules/bybit/current-price";
import { fetchKline } from "~/modules/bybit/fetch-kline";
import { logger } from "~/modules/logger";
import { placeOrder } from "~/modules/bybit/place-order";
import { getState, setState } from "~/modules/state";
import { TOKEN } from "~/config";
import { fetchTokenPrecision } from "~/modules/bybit/fetch-precision";

export const executeBuy = async () => {
  logger.info(`Executing buy ${TOKEN}...`);

  const [currentPrice, kline, precision] = await Promise.all([
    getCurrentPrice(),
    fetchKline(),
    fetchTokenPrecision(),
  ]);

  logger.info(`Current price: $${currentPrice}`);

  const buySize = await calculateBuySize(currentPrice, kline);
  const tokenAmount = buySize / currentPrice;

  const adjustedTokenAmount = adjust(tokenAmount, precision);
  const adjustedBuySize = adjustedTokenAmount * currentPrice;

  logger.info(`Will buy ${adjustedTokenAmount} ${TOKEN} at $${currentPrice}`);

  const response = await placeOrder(adjustedTokenAmount);

  if (response.retCode !== 0) {
    logger.error({ msg: "Failed to place order", response });
    return;
  }

  logger.info("Order succesfully placed");

  const state = await getState();

  state.REMAINING_CAPITAL -= adjustedBuySize;
  state.TOTAL_TOKEN_ACCUMULATED += adjustedTokenAmount;
  state.WEIGHTED_SUM_COST += adjustedBuySize;

  const newAveragePrice =
    state.WEIGHTED_SUM_COST / state.TOTAL_TOKEN_ACCUMULATED;

  state.PURCHASE_HISTORY.push({
    timestamp: Date.now(),
    price: currentPrice,
    usdSpent: adjustedBuySize,
    tokenBought: adjustedTokenAmount,
    averagePrice: newAveragePrice,
    capitalRemaining: state.REMAINING_CAPITAL,
  });

  await setState(state);

  logger.info(`Bought ${adjustedTokenAmount} ${TOKEN} at $${currentPrice}`);
  logger.info(`New average: $${newAveragePrice}`);
  logger.info(`Remaining capital: $${state.REMAINING_CAPITAL}`);
};
