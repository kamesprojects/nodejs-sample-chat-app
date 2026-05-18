import { AppError } from "../utils/errorHandler.js";

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return next(new AppError(400, "Validation error", result.error.errors));
  }

  req.validatedBody = result.data;
  next();
};
