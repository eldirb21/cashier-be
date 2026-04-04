// src/utils/response.js

const success = (res, { message = "OK", data = undefined, status = 200 } = {}) => {
  const body = { success: true, message };
  if (data !== undefined) body.data = data;
  return res.status(status).json(body);
};

const error = (res, { message = "Internal server error", status = 500, errors = undefined } = {}) => {
  const body = { success: false, message };
  if (errors !== undefined) body.errors = errors;
  return res.status(status).json(body);
};

module.exports = { success, error };