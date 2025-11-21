export const calculateRSI = (
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
  period: number = 14,
) => {
  if (klines.length < period * 2) {
    throw new Error(`Need at least ${period * 2} candles for smoothed RSI`);
  }

  const closes = klines.map((k) => k[4]);

  // Calculate all price changes
  const changes: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    changes.push(closes[i] - closes[i - 1]);
  }

  // Initial average (first 'period' values)
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i];
    } else {
      avgLoss += Math.abs(changes[i]);
    }
  }

  avgGain /= period;
  avgLoss /= period;

  // Smooth subsequent values using Wilder's method
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  // Calculate RSI
  if (avgLoss === 0) {
    return 100;
  }

  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  return rsi;
};

export const getRSIMultiplier = (rsi: number) => {
  if (rsi < 30) {
    // Oversold - increase buying
    return 1.5;
  } else if (rsi < 40) {
    // Slightly oversold
    return 1.2;
  } else if (rsi > 70) {
    // Overbought - reduce buying
    return 0.5;
  } else if (rsi > 60) {
    // Slightly overbought
    return 0.8;
  } else {
    // Neutral
    return 1.0;
  }
};
