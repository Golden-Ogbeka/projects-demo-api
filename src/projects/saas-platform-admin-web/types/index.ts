export type GraphqlRequestBody = {
  operationName?: string;
  query?: string;
  variables?: Record<string, unknown>;
};

export type PageInfo = {
  totalItems: number;
  totalCount: number;
  currentPage: number;
  page: number;
  size: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};
