const { createModel } = require("../config/orm");

const user = createModel("users");
const token = createModel("refresh_tokens");
const passwordReset = createModel("password_resets");

const product = createModel("products");
const category = createModel("categories");

module.exports = { user, token, passwordReset, product, category };