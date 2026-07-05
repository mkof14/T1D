export const logInfo = (scope, message, meta = {}) => {
  console.info(JSON.stringify({ level: 'info', scope, message, ...meta, time: new Date().toISOString() }));
};

export const logWarn = (scope, message, meta = {}) => {
  console.warn(JSON.stringify({ level: 'warn', scope, message, ...meta, time: new Date().toISOString() }));
};

export const logError = (scope, message, meta = {}) => {
  console.error(JSON.stringify({ level: 'error', scope, message, ...meta, time: new Date().toISOString() }));
};
