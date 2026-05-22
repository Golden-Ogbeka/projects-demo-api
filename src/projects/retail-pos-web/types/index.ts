export interface GraphqlRequestBody {
  query: string;
  operationName?: string;
  variables?: Record<string, unknown>;
}

export interface RetailPosUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  businessId: string;
  createdAt: string;
}

export interface RetailPosBusiness {
  id: string;
  businessName: string;
  businessEmail: string;
  businessPlan: string;
  createdAt: string;
}
