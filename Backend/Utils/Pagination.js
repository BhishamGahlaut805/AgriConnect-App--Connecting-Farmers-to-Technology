exports.paginate = ({ page = 1, limit = 20 }) => {
  page = parseInt(page);
  limit = parseInt(limit);
  return { skip: (page - 1) * limit, limit };
};
