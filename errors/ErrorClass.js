class ErrorClass extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
}

class UserNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
}
class SignUpError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 409;
  }
}
class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}
class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 403;
  }
}


module.exports = {NotFoundError: ErrorClass, UserNotFoundError, SignUpError, BadRequestError, ValidationError, ForbiddenError};