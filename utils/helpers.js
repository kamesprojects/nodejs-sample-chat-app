export const sendSuccess = (res, statusCode = 200, data, message = "OK") => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};
