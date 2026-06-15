export type ArtisanServicesEvent = {
  id: number;
  action: string;
  resource: string;
  adminId: number;
  details: string | null;
  createdAt: string;
};

export type PaginatedResponse<T> = {
  success: boolean;
  message: string;
  data: {
    count: number;
    page: number;
    totalPages: number;
    items: T[];
  };
};

export type AuthResponse = {
  success: boolean;
  message: string;
  data: {
    token: string;
    admin: ArtisanServicesAdmin;
  };
};

export type ArtisanServicesAdmin = {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar: string | null;
};

export type ArtisanServicesArtisan = {
  id: number;
  name: string;
  email: string;
  phone: string;
  category: string;
  subcategory: string;
  location: string;
  rating: number;
  jobsCompleted: number;
  status: "active" | "inactive" | "pending";
  verificationStatus: "verified" | "pending" | "rejected";
  registeredAt: string;
  avatar: string | null;
};

export type ArtisanServicesCustomer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  totalOrders: number;
  totalSpent: number;
  status: "active" | "inactive";
  registeredAt: string;
  avatar: string | null;
};

export type ArtisanServicesTicket = {
  id: number;
  subject: string;
  message: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  createdBy: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ArtisanServicesDispute = {
  id: number;
  artisanId: number;
  customerId: number;
  reason: string;
  status: "open" | "resolved" | "closed";
  resolution: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ArtisanServicesAppointment = {
  id: number;
  artisanId: number;
  customerId: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "cancelled";
  location: string;
  description: string;
  createdAt: string;
};

export type ArtisanServicesNotification = {
  id: number;
  title: string;
  message: string;
  type: "info" | "warning" | "promotion";
  audience: string;
  status: "sent" | "draft";
  createdAt: string;
};

export type ArtisanServicesWaitingListEntry = {
  id: number;
  name: string;
  email: string;
  phone: string;
  category: string;
  location: string;
  createdAt: string;
};

export type ArtisanServicesSetting = {
  key: string;
  value: string;
};

export type ArtisanServicesCategory = {
  id: number;
  name: string;
  description: string;
  icon: string;
  artisanCount: number;
  createdAt: string;
};

export type ArtisanServicesSubcategory = {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  artisanCount: number;
  createdAt: string;
};

export type ArtisanServicesPaymentTransaction = {
  id: number;
  reference: string;
  artisanId: number;
  customerId: number;
  amount: number;
  fee: number;
  status: "successful" | "failed" | "pending" | "refunded";
  method: string;
  description: string;
  createdAt: string;
};
