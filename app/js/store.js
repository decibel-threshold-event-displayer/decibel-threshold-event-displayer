import { logger } from "./logger.js";

const initState = {};

let data = { ...initState };

export const store = {
  clear: () => {
    logger.debug("Clear store");
    data = { ...initState };
  },
};
