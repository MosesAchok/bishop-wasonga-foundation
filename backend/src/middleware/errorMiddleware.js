
export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;

  console.error(err.stack || err);

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Something went wrong on the server. Please try again later."
        : err.message,
  });
};
