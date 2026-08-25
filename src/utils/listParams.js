// utils/listParams.js

const getListParams = (req) => {
  const {
    page = 1,
    size = 10,
    search = "",
    sort_by = "created_at",
    sort_order = "desc",
  } = req.query;

  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(size, 10) || 10, 1), 100);

  return {
    page: pageNumber,
    size: pageSize,
    search: search.trim(),
    sort_by,
    sort_order: sort_order === "asc" ? "asc" : "desc",
    skip: (pageNumber - 1) * pageSize,
    take: pageSize,
  };
};

module.exports = {
  getListParams,
};
