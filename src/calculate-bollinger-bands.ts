/**
 * Calculate Bollinger Bands
 * @param klines - Array of [timestamp, open, high, low, close, volume]
 * @param period - SMA period (standard is 20)
 * @param stdDevMultiplier - Standard deviation multiplier (standard is 2)
 * @returns { upper, middle, lower }
 */
export const calculateBollingerBands = (
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
  period: number = 20,
  stdDevMultiplier: number = 2.0,
): { upper: number; middle: number; lower: number } => {
  if (klines.length < period) {
    throw new Error(`Need at least ${period} candles for Bollinger Bands`);
  }

  // Get most recent candles
  const recentKlines = klines.slice(-period);
  const closes = recentKlines.map((k) => k[4]);

  // 1. Calculate SMA (middle band)
  const sum = closes.reduce((acc, val) => acc + val, 0);
  const sma = sum / period;

  // 2. Calculate standard deviation
  const squaredDiffs = closes.map((close) => Math.pow(close - sma, 2));
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / period;
  const stdDev = Math.sqrt(variance);

  // 3. Calculate upper and lower bands
  const upper = sma + stdDev * stdDevMultiplier;
  const lower = sma - stdDev * stdDevMultiplier;

  return {
    upper,
    middle: sma,
    lower,
  };
};

/**
 * Calculate Bollinger Band position multiplier
 */
export const getBollingerMultiplier = (
  currentPrice: number,
  bb: { upper: number; middle: number; lower: number },
): number => {
  const bandWidth = bb.upper - bb.lower;
  const pricePosition = (currentPrice - bb.lower) / bandWidth; // 0 to 1

  // Price at lower band (0) = buy aggressively (2.0x)
  // Price at middle (0.5) = neutral (1.0x)
  // Price at upper band (1.0) = buy minimally (0.3x)

  if (pricePosition <= 0) {
    // Below lower band - very aggressive
    return 2.5;
  } else if (pricePosition >= 1) {
    // Above upper band - very conservative
    return 0.3;
  } else if (pricePosition < 0.3) {
    // Near lower band
    return 1.5 + (0.3 - pricePosition) * 3.33; // Scale from 1.5 to 2.5
  } else if (pricePosition > 0.7) {
    // Near upper band
    return 0.3 + (1 - pricePosition) * 2.33; // Scale from 0.3 to 1.0
  } else {
    // Middle range - linear interpolation
    return 0.3 + (1 - pricePosition) * 1.4;
  }
};

/**
 * Alternative: Detect squeeze (low volatility, potential breakout)
 */
export const detectBollingerSqueeze = (
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
  period: number = 20,
  stdDevMultiplier: number = 2.0,
): boolean => {
  const bb = calculateBollingerBands(klines, period, stdDevMultiplier);
  const bandWidth = bb.upper - bb.lower;
  const bandWidthPercent = bandWidth / bb.middle;

  // Squeeze if band width is < 4% of middle band
  // (Typical BTC squeeze threshold)
  return bandWidthPercent < 0.04;
};
