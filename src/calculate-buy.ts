import {
  ALLOCATION_PERIOD,
  BUY_INTERVAL_HOURS,
  SENSITIVITY,
  MAX_BUY_PERCENT,
  MIN_BUY_PERCENT,
  CIRCUIT_BREAKER,
} from "./config";
import { getState } from "./state";

export const calculateBuySize = async (price: number) => {
  const state = await getState();

  const elapsedHours = (Date.now() - state.START_TIME) / 1000 / 3600;
  const totalIntervals = (ALLOCATION_PERIOD * 24) / BUY_INTERVAL_HOURS;
  const intervalsRemaining = totalIntervals - elapsedHours / BUY_INTERVAL_HOURS;

  // If we're in the last interval, buy the remaining capital
  if (intervalsRemaining <= 1) return state.REMAINING_CAPITAL;

  const baseBuySize = state.REMAINING_CAPITAL / intervalsRemaining;
  const averageBuyingPrice =
    state.TOTAL_BTC_ACCUMULATED === 0
      ? price
      : state.WEIGHTED_SUM_COST / state.TOTAL_BTC_ACCUMULATED;

  const priceDeviation = (price - averageBuyingPrice) / averageBuyingPrice;

  let factor = 1;
  if (price < averageBuyingPrice) {
    const deviation = Math.abs(priceDeviation);
    factor = 1 + Math.sqrt(deviation) * SENSITIVITY;
    factor = Math.min(factor, MAX_BUY_PERCENT);
  } else {
    factor = 1 - Math.sqrt(priceDeviation) * (SENSITIVITY / MAX_BUY_PERCENT);
    factor = Math.max(factor, MIN_BUY_PERCENT);
  }

  const adjustedBuySize = baseBuySize * factor;

  // Capital preservation check
  const minFutureAllocation =
    baseBuySize * (intervalsRemaining - 1) * MIN_BUY_PERCENT;
  const maxSafeBuy = state.REMAINING_CAPITAL - minFutureAllocation;

  // If the circuit breaker is triggered, set the buy size to the circuit breaker max
  const circuitBreakerMax = state.REMAINING_CAPITAL * CIRCUIT_BREAKER;

  const finalBuySize = Math.min(
    adjustedBuySize,
    maxSafeBuy,
    state.REMAINING_CAPITAL,
    circuitBreakerMax,
  );

  return finalBuySize;
};
