export type DemoUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  otp: string | null;
};

export type Packaging = {
  id: number;
  name: string;
  description: string;
  dimensions: string;
  price: number;
  created_at: string;
};

export type Shipping = {
  id: number;
  tracking_number: string;
  user_id: number;
  origin: string;
  destination: string;
  weight: number;
  packaging_id: number;
  status: string;
  pickup_date: string | null;
  delivered_date: string | null;
  created_at: string;
};

export type Address = {
  id: number;
  user_id: number;
  label: string;
  street: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  is_default: number;
  created_at: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type RegisterBody = LoginBody & {
  name: string;
  phone: string;
};

export type VerifyOtpBody = {
  email: string;
  otp: string;
};

export type ForgotPasswordBody = {
  email: string;
};

export type ResetPasswordBody = {
  email: string;
  otp: string;
  password: string;
};
