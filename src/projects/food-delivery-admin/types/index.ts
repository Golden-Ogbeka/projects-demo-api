export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}
export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
    };
  };
}
