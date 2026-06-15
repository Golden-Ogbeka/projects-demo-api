export type ArtisanServicesWebUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  avatar: string | null;
  isVerified: number;
  otp: string | null;
  resetToken: string | null;
  createdAt: string;
};

export type ArtisanServicesWebAddress = {
  id: number;
  userId: number;
  label: string;
  address: string;
  city: string;
  state: string;
  isDefault: number;
};

export type ArtisanServicesWebBooking = {
  id: number;
  userId: number;
  artisanId: number;
  category: string;
  description: string;
  status: string;
  date: string;
  time: string;
  amount: number;
  createdAt: string;
};

export type ArtisanServicesWebAppointment = {
  id: number;
  userId: number;
  artisanId: number;
  date: string;
  time: string;
  status: string;
  notes: string;
  createdAt: string;
};

export type ArtisanServicesWebTicket = {
  id: number;
  userId: number;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

export type ArtisanServicesWebReview = {
  id: number;
  userId: number;
  artisanId: number;
  rating: number;
  comment: string;
  createdAt: string;
};

export type ArtisanServicesWebMessage = {
  id: number;
  userId: number;
  artisanId: number;
  content: string;
  sender: "user" | "artisan";
  createdAt: string;
};

export type ArtisanServicesWebNotification = {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: number;
  createdAt: string;
};

export type ArtisanServicesWebPayment = {
  id: number;
  userId: number;
  reference: string;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
};
