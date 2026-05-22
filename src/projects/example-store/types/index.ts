export type DemoUser = {
  id: number;
  name: string;
  email: string;
  password: string;
  otp: string | null;
  createdAt: string;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  inStock: boolean;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type SignupBody = LoginBody & {
  name: string;
};

export type VerifyOtpBody = {
  email: string;
  otp: string;
};
