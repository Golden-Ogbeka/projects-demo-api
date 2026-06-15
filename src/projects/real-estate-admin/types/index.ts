export interface ApiResponse<T = unknown> {
  status: string;
  message: string;
  data?: T;
}

export interface LoginResponse {
  status: string;
  message: string;
  data?: {
    jwt: { token: string; expiresIn: string; token_type: string };
    user: {
      _id: number;
      first_name: string;
      last_name: string;
      email: string;
      phone_number: string;
      created_at: string;
    };
  };
}
