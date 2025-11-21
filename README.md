# Dynamic DCA Bot

A sophisticated automated trading bot for dynamic Dollar Cost Averaging (DCA) that intelligently adjusts buy sizes based on technical indicators and market conditions. This bot implements a "buy the dip" strategy by analyzing price movements, volatility, RSI, and Bollinger Bands to optimize entry points.

**⚠️ Currently supports Bybit exchange only.**

## Features

- **Dynamic Buy Size Calculation**: Automatically adjusts purchase amounts based on multiple factors:
  - **Price Deviation**: Increases buy size when price drops below average buying price (buy the dip)
  - **RSI (Relative Strength Index)**: Adjusts buying based on overbought/oversold conditions
  - **Bollinger Bands**: Modifies buy size based on price position relative to volatility bands
  - **Volatility Analysis**: Adapts to market volatility conditions

- **Capital Management**:
  - Allocates capital over a configurable period (default: 30 days)
  - Circuit breaker prevents excessive buying in a single transaction
  - Ensures minimum capital remains for future purchases

- **Performance Tracking**:
  - Real-time ROI and PnL calculations
  - Purchase history tracking
  - Weighted average cost calculation

- **Automated Execution**:
  - Scheduled buys every 12 hours (configurable)
  - Automatic execution on startup if no purchases have been made
  - Hourly performance metrics logging

## How It Works

### Buy Size Calculation

The bot calculates buy sizes using a multi-factor approach:

1. **Base Allocation**: Distributes remaining capital evenly across remaining intervals
2. **Price Deviation Factor**:
   - If price < average buying price: Increases buy size (up to 2.5x)
   - If price > average buying price: Decreases buy size (down to 0.4x)
3. **Technical Indicators** (weighted combination):
   - **Volatility** (25% weight): Higher volatility increases buy size
   - **RSI** (30% weight): Oversold conditions (<30) increase buying, overbought (>70) reduce it
   - **Bollinger Bands** (45% weight): Price near lower band increases buying, near upper band decreases it
4. **Safety Limits**: Final buy size is constrained by:
   - Minimum future allocation requirements
   - Circuit breaker (max 25% of remaining capital per buy)
   - Remaining capital balance

### Scheduling

- **Buy Execution**: Every 12 hours (configurable via `BUY_INTERVAL_HOURS`)
- **Performance Metrics**: Every hour
- **Initial Buy**: Executes immediately on startup if no purchase history exists

## Prerequisites

- [Bun](https://bun.sh/) runtime (v1.0+)
- Redis server (for state management)
- Bybit API credentials (API key and secret)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dynamic-dca.git
cd dynamic-dca
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
# Required
REDIS_URL=redis://default:password@locahost:6379
BYBIT_API_KEY="your_api_key"
BYBIT_API_SECRET="your_api_secret"

# Optional (with defaults)
TOKEN="BTCUSDT"              # Trading pair (default: BTCUSDT)
TOTAL_CAPITAL="10000"        # Total capital in USD (default: 10000)
```

## Configuration

Edit `src/config.ts` to customize bot behavior:

```typescript
export const ALLOCATION_PERIOD = 30;          // Days to allocate capital
export const BUY_INTERVAL_HOURS = 12;         // Hours between buys
export const SENSITIVITY = 3.0;               // Price deviation sensitivity
export const MIN_BUY_PERCENT = 0.4;           // Minimum buy size multiplier
export const MAX_BUY_PERCENT = 2.5;           // Maximum buy size multiplier
export const CIRCUIT_BREAKER = 0.25;          // Max % of capital per buy

// Technical indicator parameters
export const VOLATILITY_LOOKBACK = 42;        // Candles for volatility calc
export const VOLATILITY_WEIGHT = 0.25;        // Weight in buy calculation
export const RSI_PERIOD = 14;                 // RSI period
export const RSI_WEIGHT = 0.3;                // Weight in buy calculation
export const BB_PERIOD = 20;                  // Bollinger Bands period
export const BB_STDDEV = 2.0;                 // Bollinger Bands std dev
export const BB_WEIGHT = 0.45;                // Weight in buy calculation
```

## Usage

### Development Mode

Run with hot reload:
```bash
bun run dev
```

### Production Mode

1. Build the project:
```bash
bun run build
```

2. Start the bot:
```bash
bun run start
```

### Running with Docker

```bash
docker build -t dynamic-dca .
docker run -e BYBIT_API_KEY="your_key" -e BYBIT_API_SECRET="your_secret" dynamic-dca
```

## Project Structure

```
src/
├── index.ts                    # Main entry point, cron job setup
├── config.ts                   # Configuration parameters
├── utils.ts                    # Utility functions
├── modules/
│   ├── bybit/                 # Bybit exchange integration
│   │   ├── current-price.ts   # Fetch current price
│   │   ├── fetch-kline.ts     # Fetch candlestick data
│   │   ├── fetch-precision.ts # Get token precision
│   │   └── place-order.ts     # Execute buy orders
│   ├── logger.ts              # Logging setup
│   └── state.ts               # Redis state management
└── services/
    ├── calculate-buy.ts       # Main buy size calculation logic
    ├── calculate-rsi.ts       # RSI calculation
    ├── calculate-bollinger-bands.ts  # Bollinger Bands calculation
    ├── calculate-volatility.ts       # Volatility calculation
    ├── execute-buy.ts         # Execute buy order flow
    └── track-performance.ts   # Performance metrics
```

## State Management

The bot uses Redis to persist state between restarts:

- `REMAINING_CAPITAL`: Capital not yet allocated
- `TOTAL_TOKEN_ACCUMULATED`: Total tokens purchased
- `WEIGHTED_SUM_COST`: Sum of all purchases (for average calculation)
- `PURCHASE_HISTORY`: Array of all purchase records
- `START_TIME`: Bot start timestamp

State is keyed by trading pair: `state:{TOKEN}`

## Logging

The bot uses [Pino](https://github.com/pinojs/pino) for structured logging:

- **Development**: Pretty-printed logs with debug level
- **Production**: JSON logs with info level

Logs include:
- Buy execution details
- Calculated buy sizes and multipliers
- Performance metrics (ROI, PnL)
- Error messages

## Risk Disclaimer

⚠️ **This software is provided for educational purposes only. Cryptocurrency trading involves substantial risk of loss. Use at your own risk.**

- Always test with small amounts first
- Monitor the bot regularly
- Understand the trading strategy before deploying
- Ensure you have sufficient capital for the allocation period
- The bot executes real trades on Bybit - use with caution

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0). See [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or contributions, please open an issue on GitHub.
