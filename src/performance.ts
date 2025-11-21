import { ALLOCATION_PERIOD, BUY_INTERVAL_HOURS, TOTAL_CAPITAL } from "./config";
import { getCurrentPrice } from "./current-price";
import { logger } from "./logger";
import { getState } from "./state";

export const getCapitalMetrics = async () => {
  const state = await getState();
  const price = await getCurrentPrice();

  const totalInvested = TOTAL_CAPITAL - state.REMAINING_CAPITAL;
  const btcValue = state.TOTAL_BTC_ACCUMULATED * price;
  const unrealizedPNL = btcValue - totalInvested;
  const roi = (unrealizedPNL / totalInvested) * 100;

  const elapsedHours = (Date.now() - state.START_TIME) / 1000 / 3600;
  const totalIntervals = (ALLOCATION_PERIOD * 24) / BUY_INTERVAL_HOURS;
  const intervalsRemaining = totalIntervals - elapsedHours / BUY_INTERVAL_HOURS;

  logger.info({
    msg: "Capital metrics",
    totalInvested: totalInvested.toFixed(2),
    btcAccumulated: state.TOTAL_BTC_ACCUMULATED.toFixed(4),
    currentValue: btcValue.toFixed(2),
    unrealizedPnL: unrealizedPNL.toFixed(2),
    roi: roi.toFixed(2) + "%",
    daysRemaining: Math.ceil((ALLOCATION_PERIOD * 24 - elapsedHours) / 24),
    cyclesRemaining: Math.ceil(intervalsRemaining),
  });
};
