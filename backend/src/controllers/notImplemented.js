import { HttpError } from '../middleware/errorHandler.js';

export const notImplemented = (name) => () => {
  throw new HttpError(501, `${name} is not implemented yet`, 'not_implemented');
};
