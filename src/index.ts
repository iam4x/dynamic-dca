import { Cron } from "croner";

import { executeBuy } from "./execute-buy";
import { getCapitalMetrics } from "./performance";
import { getState } from "./state";

// Register cron jobs
// ------------------
new Cron("0 */12 * * *", async () => await executeBuy());
new Cron("0 * * * *", async () => await getCapitalMetrics());

// If no purchases have been made, execute a buy to start
// ------------------------------------------------------
if ((await getState()).PURCHASE_HISTORY.length === 0) {
  await executeBuy();
}
