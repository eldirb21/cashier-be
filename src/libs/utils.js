const toOptions = (items, labelKey = "name", valueKey = "id") => {
  return items.map((item) => ({
    label: item[labelKey],
    value: item[valueKey],
  }));
};

module.exports = { toOptions };
