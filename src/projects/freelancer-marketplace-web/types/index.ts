export type GraphqlRequestBody = {
  query?: string;
  operationName?: string;
  variables?: Record<string, unknown>;
};

export type FreelancerMarketplaceUser = {
  _id: string;
  name: string;
  email: string;
  password?: string;
  categoryFollowed: string[];
  skills: { _id: string; categoryName: string }[];
  chatId: string;
  avgResponseTime: string;
  searchHistory: string[];
  userFollowed: string[];
  role: string;
  total_experience_years: number;
  freelancer: boolean;
  intern: boolean;
  active_status: string;
  about: string;
  profile_img: string;
  offering: string[];
  languages: string[];
  shortlisted: boolean;
  blacklisted: boolean;
};

export type FreelancerMarketplaceTag = {
  _id?: string;
  id?: string;
  tagName: string;
  tagDescription?: string;
};

export type FreelancerMarketplaceCategory = {
  _id?: string;
  id?: string;
  categoryName: string;
  categoryImg?: string;
  categoryDescription?: string;
  totalViews?: number;
  totalListings?: number;
  gradientColor?: string;
  tags?: FreelancerMarketplaceTag[];
};

export type FreelancerMarketplaceMasterCategory = {
  id?: string;
  _id?: string;
  categoryName: string;
  categoryImg?: string;
  gradientColor?: string;
  subCategories?: FreelancerMarketplaceCategory[];
};

export type FreelancerMarketplaceListing = {
  _id: string;
  user: {
    _id: string;
    name: string;
    profile_img?: string;
    email?: string;
    about?: string;
    languages?: string[];
    skills?: Record<string, unknown>;
    createdAt?: string;
  };
  job_title: string;
  videos: { question: string; video_link: string; thumbnail: string; answer: string }[];
  category: { id: string; categoryName: string } | string;
  tags: FreelancerMarketplaceTag[];
  rating: number;
  numReviews: number;
  flexibility: string;
  total_experience_years: number;
  hourly_rate: number;
  offering: string[];
  listingStatus: string;
  freelancer: boolean;
  related_work?: { _id: string; title: string; about: string; images: string[] }[];
  experience?: { _id: string; company: string; role: string; start_date: string; end_date: string; responsility: string }[];
  conversation?: { id: string; participants: Record<string, unknown>[]; messages: Record<string, unknown>[]; conservationType: string };
};

export type FreelancerMarketplaceMessage = {
  id?: string;
  _id?: string;
  sender: string;
  recipients: string[];
  message: string;
  senderReadReceipt?: string[];
  recipientsReadReceipt?: string[];
  createdAt?: string;
  conversationId?: string;
};

export type FreelancerMarketplaceConversation = {
  id: string;
  participants: { _id: string; name: string; email?: string }[];
  messages?: FreelancerMarketplaceMessage[];
  conservationType: string;
};

export type FreelancerMarketplaceNotification = {
  id: string;
  message: string;
  recipientsReadReceipt?: string[];
};

export type FreelancerMarketplaceSavedList = {
  _id: string;
  owner: string;
  listName: string;
  listType: string;
  listClass: string;
  listings: string[];
  canModify?: boolean;
  canDelete?: boolean;
};

export type Filter = {
  tags?: string[];
  price?: [number, number];
  experience?: [number, number];
  recent?: boolean | string;
  flexibility?: string | string[];
  status?: string;
  location?: string[];
};
