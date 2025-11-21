import { calculateBuySize } from "./calculate-buy";
import { getCurrentPrice } from "./current-price";
import { logger } from "./logger";
import { placeOrder } from "./place-order";
import { getState, setState } from "./state";
import { adjust } from "./utils";

export const executeBuy = async () => {
  logger.info(`Executing buy BTC...`);

  const currentPrice = await getCurrentPrice();

  logger.info(`Current price: $${currentPrice}`);

  const buySize = await calculateBuySize(currentPrice);
  const btcAmount = buySize / currentPrice;

  const adjustedBTCAmount = adjust(btcAmount, 0.001);
  const adjustedBuySize = adjustedBTCAmount * currentPrice;

  logger.info(`Will buy ${adjustedBTCAmount} BTC at $${currentPrice}`);

  const response = await placeOrder(adjustedBTCAmount);

  if (response.retCode !== 0) {
    logger.error({ msg: "Failed to place order", response });
    return;
  }

  logger.info("Order succesfully placed");

  const state = await getState();

  state.REMAINING_CAPITAL -= adjustedBuySize;
  state.TOTAL_BTC_ACCUMULATED += adjustedBTCAmount;
  state.WEIGHTED_SUM_COST += adjustedBuySize;

  const newAveragePrice = state.WEIGHTED_SUM_COST / state.TOTAL_BTC_ACCUMULATED;

  state.PURCHASE_HISTORY.push({
    timestamp: Date.now(),
    price: currentPrice,
    usdSpent: adjustedBuySize,
    btcBought: adjustedBTCAmount,
    averagePrice: newAveragePrice,
    capitalRemaining: state.REMAINING_CAPITAL,
  });

  await setState(state);

  logger.info(`Bought ${adjustedBTCAmount} BTC at $${currentPrice}`);
  logger.info(`New average: $${newAveragePrice}`);
  logger.info(`Remaining capital: $${state.REMAINING_CAPITAL}`);
};
