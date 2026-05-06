export function getPagination(query: any) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
}

export function getSorting(
  query: any,
  allowedFields: string[],
  defaultField = "createdAt"
) {
  const sortBy = allowedFields.includes(query.sortBy)
    ? query.sortBy
    : defaultField;

  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  return {
    [sortBy]: sortOrder,
  };
}

export function getPaginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPreviousPage: page > 1,
  };
}