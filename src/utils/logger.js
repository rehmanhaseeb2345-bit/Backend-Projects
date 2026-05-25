const log = (level, event, data = {}) => {
  console.log(JSON.stringify({ level, event, timestamp: new Date().toISOString(), ...data }));
};

export const logger = {
  info: (event, data) => log("info", event, data),
  warn: (event, data) => log("warn", event, data),
  error: (event, data) => log("error", event, data),
};
