import { calculateBuySize } from "./calculate-buy";
import { getCurrentPrice } from "./current-price";
import { logger } from "./logger";
import { placeOrder } from "./place-order";
import { getState, setState } from "./state";

export const executeBuy = async () => {
  logger.info(`Executing buy BTC...`);

  const currentPrice = await getCurrentPrice();

  logger.info(`Current price: $${currentPrice}`);

  const buySize = await calculateBuySize(currentPrice);
  const btcAmount = buySize / currentPrice;

  const response = await placeOrder(btcAmount);

  logger.info({ msg: "Order placed", response });

  const state = await getState();

  state.REMAINING_CAPITAL -= buySize;
  state.TOTAL_BTC_ACCUMULATED += btcAmount;
  state.WEIGHTED_SUM_COST += buySize;

  const newAveragePrice = state.WEIGHTED_SUM_COST / state.TOTAL_BTC_ACCUMULATED;

  state.PURCHASE_HISTORY.push({
    timestamp: Date.now(),
    price: currentPrice,
    usdSpent: buySize,
    btcBought: btcAmount,
    averagePrice: newAveragePrice,
    capitalRemaining: state.REMAINING_CAPITAL,
  });

  await setState(state);

  logger.info(`Bought ${btcAmount} BTC at $${currentPrice}`);
  logger.info(`New average: ${newAveragePrice}`);
  logger.info(`Remaining capital: ${state.REMAINING_CAPITAL}`);
};
