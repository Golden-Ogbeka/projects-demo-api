export type MonoUser = {
  id: number;
  profileId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  isVerified: number;
  verificationToken: string | null;
  resetToken: string | null;
  twoFactorAuthStatus: "R" | "D";
  twoFactorOtp: string | null;
  profileImage: string | null;
  session: string | null;
  createdAt: string;
};

export type MonoBank = {
  id: number;
  userId: number;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
};

export type MonoTransaction = {
  id: number;
  userId: number;
  transactionRef: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
};

export type MonoInvestment = {
  id: number;
  propertyId: string;
  name: string;
  description: string;
  location: string;
  price: number;
  roi: number;
  dueDate: string;
  image: string;
  available: number;
};

export type MonoUserInvestment = {
  id: number;
  userId: number;
  propertyId: string;
  amount: number;
  transactionRef: string;
  status: string;
  createdAt: string;
};
