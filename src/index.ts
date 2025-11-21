import { Cron } from "croner";

import { executeBuy } from "./execute-buy";

new Cron("0 */12 * * *", executeBuy);
