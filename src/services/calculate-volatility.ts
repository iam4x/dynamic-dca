export const calculateVolatility = (
  klines: Array<
    [
      timestamp: number,
      open: number,
      high: number,
      low: number,
      close: number,
      volume: number,
    ]
  >,
  lookbackPeriods: number = 42, // 7 days of 4h candles
) => {
  // Need at least lookbackPeriods + 1 candles for returns calculation
  if (klines.length < lookbackPeriods + 1) {
    throw new Error(`Need at least ${lookbackPeriods + 1} candles`);
  }

  // Get most recent candles
  const recentKlines = klines.slice(-lookbackPeriods - 1);

  // 1. Calculate log returns
  const logReturns: number[] = [];
  for (let i = 1; i < recentKlines.length; i++) {
    const prevClose = recentKlines[i - 1][4]; // close price
    const currClose = recentKlines[i][4];
    const logReturn = Math.log(currClose / prevClose);
    logReturns.push(logReturn);
  }

  // 2. Calculate standard deviation (population, zero drift)
  const mean = 0; // Assume zero drift (standard for volatility calc)
  const squaredDiffs = logReturns.map((r) => Math.pow(r - mean, 2));
  const variance =
    squaredDiffs.reduce((sum, val) => sum + val, 0) / logReturns.length;
  const stdDev = Math.sqrt(variance);

  // 3. Annualize the volatility
  // For 4-hour candles: 6 candles per day, 365 days per year = 2190 periods/year
  const periodsPerYear = (24 / 4) * 365; // Adjust based on candle timeframe
  const annualizedVolatility = stdDev * Math.sqrt(periodsPerYear);

  return annualizedVolatility;
};

export const getVolatilityMultiplier = (volatility: number) => {
  // Normalize volatility to multiplier
  // Typical BTC vol: 40-80% annualized
  // Use 60% as baseline
  const baselineVol = 0.6;
  const volRatio = volatility / baselineVol;

  // Scale: 1.0 at baseline, up to 1.5 at high vol
  const multiplier = 0.7 + volRatio * 0.5;

  // Clamp between 0.8 and 1.5
  return Math.max(0.8, Math.min(1.5, multiplier));
};
