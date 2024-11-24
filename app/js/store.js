import { ENGINE_STATUS } from "./enum.js";
import { logger } from "./logger.js";

const initState = {
  engineStatus: ENGINE_STATUS.IDLE,
};

let data = { ...initState };

export const store = {
  setEngineStatus: (status) => {
    logger.debug("Updating engine status to:", status);
    data.engineStatus = status;
  },
  getEngineStatus: () => {
    return data.engineStatus;
  },
  clear: () => {
    logger.debug("Clear store");
    data = { ...initState };
  },
};
