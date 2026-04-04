const { createModel } = require("../config/orm");

const user = createModel("users");
const token = createModel("refresh_tokens");
const passwordReset = createModel("password_resets");

module.exports = { user, token, passwordReset };