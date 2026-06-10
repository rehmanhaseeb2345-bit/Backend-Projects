const MAX_LIMIT = 50;
// Guards against pathological deep-pagination requests (e.g. ?page=999999999)
// that would force MongoDB to $skip an enormous number of documents.
const MAX_PAGE = 1000;

export const getPaginationOptions = ({ page = 1, limit = 10 } = {}) => ({
  page: Math.min(MAX_PAGE, Math.max(1, parseInt(page, 10) || 1)),
  limit: Math.min(MAX_LIMIT, Math.max(1, parseInt(limit, 10) || 10)),
});
