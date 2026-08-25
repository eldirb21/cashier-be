const { toOptions } = require("../libs/utils");
const { category } = require("../models");
const { success, error } = require("../utils/response");

const getConfig = async (req, res) => {
  try {
    const [categories, paymentMethods, units] = await Promise.all([
      category.findMany({
        where: { is_active: true },
      }),

      // paymentMethod.findMany({
      //   where: { is_active: true },
      // }),

      // unit.findMany({
      //   where: { is_active: true },
      // }),
    ]);

    const newConfig = {
      categories: [
        { label: "Semua", value: "all" },
        ...toOptions(categories, "name", "id"),
      ],

      // payment_methods: toOptions(paymentMethods),

      // units: toOptions(units),
    };

    return success(res, {
      message: "Config berhasil diambil",
      data: newConfig,
    });
  } catch (err) {
    return error(res, {
      message: "Gagal mengambil config",
      status: 500,
      errors: err.message,
    });
  }
};

module.exports = {
  getConfig,
};
