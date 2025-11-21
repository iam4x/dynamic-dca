import { Cron } from "croner";

import { executeBuy } from "./services/execute-buy";
import { getCapitalMetrics } from "./services/track-performance";
import { getState } from "./modules/state";
import { logger } from "./modules/logger";

logger.info("Starting Dynamic DCA...");

// Register cron jobs
// ------------------
new Cron("0 */12 * * *", async () => await executeBuy());
new Cron("0 * * * *", async () => await getCapitalMetrics());

logger.info("Dynamic DCA started");

// If no purchases have been made, execute a buy to start
// ------------------------------------------------------
if ((await getState()).PURCHASE_HISTORY.length === 0) {
  logger.info("No purchases have been made, executing buy to start");
  await executeBuy();
} else {
  logger.info("Initial purchase have been made, skipping buy");
}
