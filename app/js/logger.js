export const logger = {
  debug: (...args) => (IS_DEBUG ? console.log("[DEBUG]", ...args) : null),
};
