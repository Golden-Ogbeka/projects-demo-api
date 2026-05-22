export interface GraphqlRequestBody {
  query: string;
  operationName?: string;
  variables?: Record<string, unknown>;
}
