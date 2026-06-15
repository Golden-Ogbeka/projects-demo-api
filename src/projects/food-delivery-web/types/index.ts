export type FoodDeliveryUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  otp: string | null;
  otpExpiresAt: string | null;
  resetToken: string | null;
  verifyCode: string | null;
  isVerified: number;
  createdAt: string;
};

export type FoodDeliveryAddress = {
  id: number;
  userId: number;
  label: string;
  address: string;
  lat: number;
  lng: number;
  isDefault: number;
};

export type FoodDeliveryOrder = {
  id: number;
  userId: number;
  restaurantId: number;
  restaurantName: string;
  status: string;
  total: number;
  deliveryAddress: string;
  paymentMethod: string;
  createdAt: string;
};

export type FoodDeliveryOrderItem = {
  id: number;
  orderId: number;
  foodId: number;
  name: string;
  price: number;
  quantity: number;
};

export type FoodDeliveryCartItem = {
  id: number;
  userId: number;
  foodId: number;
  name: string;
  price: number;
  quantity: number;
  restaurantId: number;
  restaurantName: string;
  image: string;
};

export type FoodDeliveryEvent = {
  id: number;
  type: string;
  description: string;
  createdAt: string;
};
