// backend/src/base/index.js
export { default as BaseController } from "./base-controller.js";
export { default as BaseService, ValidationError, NotFoundError, DatabaseError, UnauthorizedError } from "./base-service.js";
export { default as BaseRepository } from "./base-repository.js";
