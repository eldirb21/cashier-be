const success = (
  res,
  { message = "OK", data = undefined, status = 200 } = {},
) => {
  let body = { success: true, message };
  if (data !== undefined) body = { ...data, ...body };
  return res.status(status).json(body);
};

const error = (
  res,
  { message = "Internal server error", status = 500, errors = undefined } = {},
) => {
  let body = { success: false, message };
  if (errors !== undefined) body = { ...errors, ...body };
  return res.status(status).json(body);
};

module.exports = { success, error };
