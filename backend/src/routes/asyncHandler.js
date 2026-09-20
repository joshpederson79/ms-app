// Express 4 doesn't catch rejected promises from async handlers; forward them to the error middleware.
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
