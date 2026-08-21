const { createModel } = require("../config/orm");

const user = createModel("users");
const token = createModel("refresh_tokens");
const passwordReset = createModel("password_resets");

const product = createModel("products");
const category = createModel("categories");

const transaction = createModel("transactions");
const transactionItem = createModel("transaction_items");

const customer = createModel("customers");
const supplier = createModel("suppliers");

module.exports = { user, token, passwordReset, product, category, transaction, transactionItem, customer, supplier };