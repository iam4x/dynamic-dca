import {
  calculateBollingerBands,
  getBollingerMultiplier,
} from "./calculate-bollinger-bands";
import { calculateRSI, getRSIMultiplier } from "./calculate-rsi";
import {
  calculateVolatility,
  getVolatilityMultiplier,
} from "./calculate-volatility";

import {
  ALLOCATION_PERIOD,
  BUY_INTERVAL_HOURS,
  SENSITIVITY,
  MAX_BUY_PERCENT,
  MIN_BUY_PERCENT,
  VOLATILITY_LOOKBACK,
  RSI_PERIOD,
  BB_PERIOD,
  BB_STDDEV,
  VOLATILITY_WEIGHT,
  RSI_WEIGHT,
  BB_WEIGHT,
  CIRCUIT_BREAKER,
} from "~/config";
import { logger } from "~/modules/logger";
import { getState } from "~/modules/state";

export const calculateBuySize = async (
  price: number,
  kline: Array<[number, number, number, number, number, number]>,
) => {
  const state = await getState();

  const elapsedHours = (Date.now() - state.START_TIME) / 1000 / 3600;
  const totalIntervals = (ALLOCATION_PERIOD * 24) / BUY_INTERVAL_HOURS;
  const intervalsRemaining = totalIntervals - elapsedHours / BUY_INTERVAL_HOURS;

  // If we're in the last interval, buy the remaining capital
  if (intervalsRemaining <= 1) return state.REMAINING_CAPITAL;

  const baseBuySize = state.REMAINING_CAPITAL / intervalsRemaining;
  const averageBuyingPrice =
    state.TOTAL_TOKEN_ACCUMULATED === 0
      ? price
      : state.WEIGHTED_SUM_COST / state.TOTAL_TOKEN_ACCUMULATED;

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

  const volatility = calculateVolatility(kline, VOLATILITY_LOOKBACK);
  const rsi = calculateRSI(kline, RSI_PERIOD);
  const bb = calculateBollingerBands(kline, BB_PERIOD, BB_STDDEV);

  const volFactor = getVolatilityMultiplier(volatility);
  const rsiFactor = getRSIMultiplier(rsi);
  const bbFactor = getBollingerMultiplier(price, bb);

  const indicatorFactor =
    volFactor * VOLATILITY_WEIGHT +
    rsiFactor * RSI_WEIGHT +
    bbFactor * BB_WEIGHT;

  const adjustBuySizeWithIndicators = adjustedBuySize * indicatorFactor;

  // Capital preservation check
  const minFutureAllocation =
    baseBuySize * (intervalsRemaining - 1) * MIN_BUY_PERCENT;
  const maxSafeBuy = state.REMAINING_CAPITAL - minFutureAllocation;

  // If the circuit breaker is triggered, set the buy size to the circuit breaker max
  const circuitBreakerMax = state.REMAINING_CAPITAL * CIRCUIT_BREAKER;

  const finalBuySize = Math.min(
    adjustBuySizeWithIndicators,
    maxSafeBuy,
    state.REMAINING_CAPITAL,
    circuitBreakerMax,
  );

  logger.info({
    msg: `Buy size calculated`,
    baseBuySize,
    volatility: (volatility * 100).toFixed(1) + "%",
    rsi: rsi.toFixed(1),
    bbPosition: ((price - bb.lower) / (bb.upper - bb.lower)).toFixed(2),
    volMultiplier: volFactor.toFixed(2),
    rsiMultiplier: rsiFactor.toFixed(2),
    bbMultiplier: bbFactor.toFixed(2),
    combinedMultiplier: indicatorFactor.toFixed(2),
    finalBuySize,
  });

  return finalBuySize;
};
