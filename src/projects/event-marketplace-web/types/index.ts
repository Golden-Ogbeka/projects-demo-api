export type GraphqlRequestBody = {
  query?: string;
  operationName?: string;
  variables?: Record<string, unknown>;
};

export type EventMarketplaceUser = {
  _id: string;
  typeOfAccount: string;
  username: string;
  email: string;
  isVerified: boolean;
  profileStatus: string;
  website?: string;
  companyLegalName?: string;
  personalInformation: {
    profileImageLink?: string;
    firstName?: string;
    lastName?: string;
    address?: {
      address1?: string;
      address2?: string;
      city?: string;
      zipCode?: string;
      countryCode?: string;
      countryLabel?: string;
      region?: string;
      civility?: string;
    };
    phoneNumber?: string;
    interestTags?: string[];
    description?: string;
    favouriteCategories?: string[];
  };
  creditCardInformation?: {
    IBAN: string;
    bankName: string;
    city: string;
  };
  CITI_APE_NAF?: string;
  followers?: number;
  gender?: string;
  attendedEvents?: number;
};

export type EventMarketplaceBrand = {
  _id: string;
  name: string;
  profileImage: string;
  address: {
    address1: string;
    countryLabel: string;
    countryCode: string;
    city: string;
  };
  phoneNumber: string;
  email: string;
  rating: number;
  additionalMedia: string[];
  description: string;
  products: {
    total: number;
    data: EventMarketplaceProduct[];
  };
};

export type EventMarketplaceProduct = {
  _id: string;
  name: string;
  shortDescription: string;
  images: { _id: string; src: string; alt: string }[];
  variants: {
    price: number;
    compareAtPrice: number;
  }[];
};

export type EventMarketplaceEvent = {
  _id: string;
  name: string;
  description: string;
  typeOfEvent: string;
  statusOfEvent: string;
  startingEventDateTime: string;
  eventMedia: string[];
  isSellerApplicationOpen: boolean;
  isHostessApplicationOpen: boolean;
  affiliatedSeller?: EventMarketplaceUser;
  affiliatedBrands?: EventMarketplaceBrand[];
  affiliatedHosts?: EventMarketplaceUser[];
  invitedPeople?: EventMarketplaceUser[];
  eventLocation?: {
    address1?: string;
    address2?: string;
    city?: string;
    zipCode?: string;
    countryCode?: string;
    countryLabel?: string;
    geoCodedAddress?: string;
  };
  liveShopping?: boolean;
};

export type EventMarketplaceConversation = {
  id: string;
  participants: EventMarketplaceUser[];
  messages?: EventMarketplaceMessage[];
};

export type EventMarketplaceMessage = {
  _id?: string;
  id?: string;
  sender: string;
  recipients: string[];
  message: string;
  messageType: string;
  conversationId?: string;
  recipientsReadReceipt?: string[];
  senderReadReceipt?: string[];
  createdAt?: string;
};

export type EventMarketplaceNotification = {
  _id: string;
  message: string;
  typeOfNotification: string;
  read: boolean;
  parentId: string;
  dismissed: boolean;
  followerId: string;
  followedId: string;
};

export type EventMarketplaceMedia = {
  _id: string;
  src: string;
  alt: string;
  name: string;
  type: string;
};
