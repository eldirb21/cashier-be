function notFound(req, res, next) {
  const error = new Error("Endpoint tidak ditemukan");
  error.status = 404;
  next(error);
}

module.exports = { notFound };