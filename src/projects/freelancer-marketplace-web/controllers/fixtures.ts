import { sqlite } from "../../../config/db.js";
import {
  FreelancerMarketplaceUser, FreelancerMarketplaceTag, FreelancerMarketplaceCategory, FreelancerMarketplaceMasterCategory,
  FreelancerMarketplaceListing, FreelancerMarketplaceMessage, FreelancerMarketplaceConversation, FreelancerMarketplaceSavedList, Filter,
} from "../types/index.js";

const UNSPLASH = {
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
  avatar2: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  avatar3: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
};

const getUser = (_id: string): FreelancerMarketplaceUser | null => {
  const row = sqlite.prepare("SELECT * FROM freelancer_marketplace_users WHERE _id = ?").get(_id) as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    _id: row._id as string, name: row.name as string, email: row.email as string,
    categoryFollowed: JSON.parse(row.categoryFollowed_json as string || "[]"),
    skills: JSON.parse(row.skills_json as string || "[]"),
    chatId: row.chatId as string, avgResponseTime: row.avgResponseTime as string,
    searchHistory: JSON.parse(row.searchHistory_json as string || "[]"),
    userFollowed: JSON.parse(row.userFollowed_json as string || "[]"),
    role: row.role as string, total_experience_years: (row.total_experience_years as number) || 0,
    freelancer: Boolean(row.freelancer), intern: Boolean(row.intern),
    active_status: row.active_status as string, about: row.about as string,
    profile_img: row.profile_img as string,
    offering: JSON.parse(row.offering_json as string || "[]"),
    languages: JSON.parse(row.languages_json as string || "[]"),
    shortlisted: Boolean(row.shortlisted), blacklisted: Boolean(row.blacklisted),
  };
};

const getMasterCategories = (): FreelancerMarketplaceMasterCategory[] => {
  const rows = sqlite.prepare("SELECT * FROM freelancer_marketplace_master_categories").all() as Record<string, unknown>[];
  return rows.map((r) => {
    const cats = sqlite.prepare("SELECT * FROM freelancer_marketplace_categories WHERE masterCategoryId = ?").all(r._id as string) as Record<string, unknown>[];
    return {
      id: r._id as string, _id: r._id as string,
      categoryName: r.categoryName as string, categoryImg: r.categoryImg as string,
      gradientColor: r.gradientColor as string,
      subCategories: cats.map((c) => ({
        _id: c._id as string, id: c._id as string,
        categoryName: c.categoryName as string, categoryImg: c.categoryImg as string,
        categoryDescription: c.categoryDescription as string,
        totalViews: c.totalViews as number, totalListings: c.totalListings as number,
        gradientColor: c.gradientColor as string,
        tags: JSON.parse(c.tags_json as string || "[]"),
      })),
    };
  });
};

const getCategories = (): FreelancerMarketplaceCategory[] => {
  const rows = sqlite.prepare("SELECT * FROM freelancer_marketplace_categories").all() as Record<string, unknown>[];
  return rows.map((r) => ({
    _id: r._id as string, id: r._id as string,
    categoryName: r.categoryName as string, categoryImg: r.categoryImg as string,
    categoryDescription: r.categoryDescription as string,
    totalViews: r.totalViews as number, totalListings: r.totalListings as number,
    gradientColor: r.gradientColor as string,
    tags: JSON.parse(r.tags_json as string || "[]"),
  }));
};

const getListings = (filters?: Filter): FreelancerMarketplaceListing[] => {
  let query = "SELECT * FROM freelancer_marketplace_listings";
  const params: unknown[] = [];
  if (filters?.status) {
    query += " WHERE listingStatus = ?";
    params.push(filters.status);
  }
  const rows = sqlite.prepare(query).all(...params) as Record<string, unknown>[];
  return rows.map((r) => {
    const user = getUser(r.userId as string);
    return {
      _id: r._id as string,
      user: { _id: user?._id || "", name: user?.name || "", profile_img: user?.profile_img, email: user?.email, about: user?.about, languages: user?.languages, createdAt: (user as Record<string, unknown>)?.createdAt as string },
      job_title: r.job_title as string,
      videos: JSON.parse(r.videos_json as string || "[]"),
      category: r.categoryId as string,
      tags: JSON.parse(r.tags_json as string || "[]"),
      rating: (r.rating as number) || 0,
      numReviews: (r.numReviews as number) || 0,
      flexibility: r.flexibility as string,
      total_experience_years: (r.total_experience_years as number) || 0,
      hourly_rate: (r.hourly_rate as number) || 0,
      offering: JSON.parse(r.offering_json as string || "[]"),
      listingStatus: r.listingStatus as string,
      freelancer: Boolean(r.freelancer),
      related_work: JSON.parse(r.related_work_json as string || "[]"),
      experience: JSON.parse(r.experience_json as string || "[]"),
    };
  });
};

const getTags = (): FreelancerMarketplaceTag[] => {
  return (sqlite.prepare("SELECT * FROM freelancer_marketplace_tags").all() as Record<string, unknown>[]).map((r) => ({
    _id: r._id as string, id: r._id as string,
    tagName: r.tagName as string, tagDescription: r.tagDescription as string,
  }));
};

const paginatedListings = (listings: FreelancerMarketplaceListing[]) => ({
  statusCode: 200, success: true, message: "Profiles found",
  data: listings,
});

const paginatedCategories = (categories: FreelancerMarketplaceCategory[]) => ({
  statusCode: 200, success: true, message: "Categories found",
  data: categories,
});

const listingWithCategory = (listing: FreelancerMarketplaceListing, catName: string) => ({
  ...listing,
  category: { id: listing.category as string, categoryName: catName },
  user: { ...listing.user, skills: {}, createdAt: listing.user.createdAt || new Date().toISOString() },
});

export const resolveField = (field: string, variables: Record<string, unknown>): unknown => {
  // Auth
  if (field === "getUser") {
    return { statusCode: 200, success: true, message: "User found", data: getUser("user-1") };
  }
  if (field === "login") {
    const { email, password } = variables as { email?: string; password?: string };
    const row = sqlite.prepare("SELECT _id FROM freelancer_marketplace_users WHERE email = ? AND password = ?").get(email, password) as { _id: string } | undefined;
    if (!row) return { statusCode: 401, success: false, message: "Invalid credentials" };
    return { statusCode: 200, message: "Login successful", data: getUser(row._id) };
  }
  if (field === "createUser") {
    return { success: true, statusCode: 200, message: "create_password", data: { name: (variables.name as string) || "Demo User", email: (variables.email as string) || "demo@example.com" } };
  }
  if (field === "logout") {
    return { statusCode: 200, message: "Logged out", success: true };
  }
  if (field === "createPasswordLink") {
    return { statusCode: 200, success: true, message: "Password reset link sent" };
  }
  if (field === "newPassword") {
    return { data: { name: "Demo User" }, message: "Password updated" };
  }

  // Homepage
  if (field === "getHomePagedata") {
    const mcs = getMasterCategories();
    const cats = getCategories();
    const allTags = getTags();
    const listings = getListings();
    return {
      statusCode: 200,
      data: {
        trendingCategory: cats.slice(0, 2).map((c) => ({ categoryName: c.categoryName, profiles: listings.filter((l) => l.category === c._id).map((l) => listingWithCategory(l, c.categoryName)) })),
        recommendedProfiles: cats.slice(0, 2).map((c) => ({ categoryName: c.categoryName, profiles: listings.filter((l) => l.category === c._id).map((l) => listingWithCategory(l, c.categoryName)) })),
        masterCategory: mcs.map((mc) => ({ categoryName: mc.categoryName, subCategories: (mc.subCategories || []).map((sc) => sc.categoryName) })),
        categories: cats.map((c) => ({ _id: c._id, categoryName: c.categoryName, totalViews: c.totalViews, categoryImg: c.categoryImg, gradientColor: c.gradientColor, totalListings: c.totalListings, tags: c.tags })),
      },
    };
  }

  // Master Categories
  if (field === "getMasterCategories" || field === "getAllMasterCategories") {
    const mcs = getMasterCategories();
    return { statusCode: 200, success: true, message: "Master categories found", data: mcs.map((mc) => ({ id: mc.id, categoryName: mc.categoryName, categoryImg: mc.categoryImg, gradientColor: mc.gradientColor })) };
  }
  if (field === "getAllMasterCategoryWithSubCategories") {
    return { statusCode: 200, success: true, message: "Data found", data: getMasterCategories() };
  }
  if (field === "getCategoriesByMaster") {
    const cats = sqlite.prepare("SELECT * FROM freelancer_marketplace_categories WHERE masterCategoryId = ?").all(variables.id as string) as Record<string, unknown>[];
    return { statusCode: 200, success: true, message: "Categories found", data: cats.map((r) => ({ id: r._id, categoryName: r.categoryName, categoryImg: r.categoryImg, categoryDescription: r.categoryDescription, tags: JSON.parse(r.tags_json as string || "[]") })) };
  }

  // Categories
  if (field === "getAllCategories" || field === "list") {
    return { statusCode: 200, success: true, message: "Categories found", data: getCategories().map((c) => ({ id: c.id, _id: c._id, categoryName: c.categoryName, categoryImg: c.categoryImg, categoryDescription: c.categoryDescription, tags: c.tags })) };
  }
  if (field === "getAllTags") {
    return getTags();
  }
  if (field === "viewCategory") {
    const catId = (variables.categoryId || variables.categoryID) as string;
    const cats = getCategories();
    const cat = cats.find((c) => c._id === catId || c.id === catId) || cats[0];
    return { statusCode: 200, success: true, message: "Category found", data: { _id: cat._id, id: cat.id, categoryName: cat.categoryName, categoryImg: cat.categoryImg, gradientColor: cat.gradientColor, categoryDescription: cat.categoryDescription, tags: cat.tags, totalViews: cat.totalViews, totalListings: cat.totalListings } };
  }
  if (field === "saveCategory" || field === "unSaveCategory") {
    return { statusCode: 200, success: true, message: "Category updated", data: getUser("user-1") };
  }

  // Browse
  if (field === "browseCategories") {
    const cats = getCategories();
    const start = (variables.start as number) || 0;
    const count = (variables.count as number) || 10;
    return { statusCode: 200, success: true, message: "Categories found", data: cats.slice(start, start + count).map((c) => ({ id: c.id, categoryName: c.categoryName, categoryImg: c.categoryImg, categoryDescription: c.categoryDescription, tags: c.tags })) };
  }
  if (field === "browseProfiles") {
    const listings = getListings();
    const start = (variables.start as number) || 0;
    const count = (variables.count as number) || 10;
    return { statusCode: 200, success: true, message: "Profiles found", data: listings.slice(start, start + count).map((l) => listingWithCategory(l, "Web Development")) };
  }

  // Profile/Listing detail
  if (field === "getOneListing") {
    const listings = getListings();
    const listing = listings.find((l) => l._id === ((variables.listingData as Record<string, unknown>)?.id as string)) || listings[0];
    const cats = getCategories();
    const cat = cats.find((c) => c._id === listing.category) || cats[0];
    return { statusCode: 200, success: true, message: "Listing found", data: listingWithCategory(listing, cat.categoryName) };
  }
  if (field === "getTrendingCategory") {
    const cats = getCategories();
    const listings = getListings();
    return { statusCode: 200, success: true, message: "Trending found", data: cats.slice(0, 2).map((c) => ({ categoryName: c.categoryName, profiles: listings.filter((l) => l.category === c._id).map((l) => listingWithCategory(l, c.categoryName)) })) };
  }
  if (field === "recommendedProfiles") {
    const cats = getCategories();
    const listings = getListings();
    return { statusCode: 200, success: true, message: "Recommended found", data: cats.slice(0, 2).map((c) => ({ categoryName: c.categoryName, profiles: listings.filter((l) => l.category === c._id).map((l) => listingWithCategory(l, c.categoryName)) })) };
  }

  // CVP (Category View Page) operations
  const cvpFields = ["getCVPRecommendedProfiles", "getCVPRecentlyOnlineProfiles", "getCVPMostSearchedProfiles", "getCVPFeaturedProfiles"];
  if (cvpFields.includes(field)) {
    return paginatedListings(getListings().map((l) => listingWithCategory(l, "Web Development")));
  }

  // Shortlist
  if (field === "getShortlistedData") {
    const cats = getCategories();
    const listings = getListings();
    return { statusCode: 200, success: true, message: "Shortlisted data found", data: { recommendedCategories: cats.slice(0, 3), recommendedProfiles: cats.slice(0, 2).map((c) => ({ categoryName: c.categoryName, profiles: listings.filter((l) => l.category === c._id).map((l) => listingWithCategory(l, c.categoryName)) })), listingViewHistory: [], categoryFollowed: cats.slice(0, 2), userShortlisted: [] } };
  }
  if (field === "getShortlistedProfiles" || field === "getAllShortlistedProfiles" || field === "getShortlistedProfilesByMCID") {
    return { statusCode: 200, success: true, message: "Shortlisted found", data: getMasterCategories().slice(0, 2).map((mc) => ({ masterCategoryName: mc.categoryName, masterCategoryID: mc.id, profiles: getListings().map((l) => listingWithCategory(l, "Web Development")) })) };
  }
  if (field === "getSavedCategories" || field === "getSavedCategoriesByMCID" || field === "getAllSavedCategories") {
    const cats = getCategories();
    return { statusCode: 200, success: true, message: "Saved categories found", data: [cats[0], cats[1]].map((c) => ({ _id: c._id, id: c.id, categoryName: c.categoryName, categoryImg: c.categoryImg, totalViews: c.totalViews, totalListings: c.totalListings, tags: c.tags })) };
  }
  if (field === "getSavedList") {
    const rows = sqlite.prepare("SELECT * FROM freelancer_marketplace_saved_lists").all() as Record<string, unknown>[];
    return { statusCode: 200, message: "Saved lists found", data: rows.map((r) => ({ _id: r._id, owner: r.owner, listName: r.listName, listType: r.listType, listClass: r.listClass, listings: JSON.parse(r.listings_json as string || "[]") })) };
  }

  // Search
  if (field === "getSearchResultFeaturedProfiles" || field === "getMostSearchedProfiles" || field === "getRecentlyOnlineProfiles") {
    return paginatedListings(getListings().map((l) => listingWithCategory(l, "Web Development")));
  }
  if (field === "getSearchResultCategories") {
    return paginatedCategories(getCategories());
  }
  if (field === "initiateSearch" || field === "debouncedListingSearcher") {
    const listings = getListings();
    return { statusCode: 200, success: true, message: "Search results", data: { debouncedListing: field === "debouncedListingSearcher" ? listings.map((l) => ({ _id: l._id, user: { name: l.user.name }, tags: l.tags })) : undefined, isFollowing: false, profileCount: listings.length, aggregatedResult: listings.map((l) => listingWithCategory(l, "Web Development")), updatedUser: getUser("user-1") } };
  }
  if (field === "deleteSearchHistory") {
    return { statusCode: 200, success: true, message: "Search history deleted", data: getUser("user-1") };
  }
  if (field === "getHeaderInputSearchResult") {
    const cats = getCategories();
    const mcs = getMasterCategories();
    const users = [getUser("user-1"), getUser("user-2"), getUser("user-3")].filter(Boolean);
    return { statusCode: 200, success: true, message: "Search results", data: { categoriesResponse: { type: "category", results: cats.slice(0, 3) }, mcategoryResponse: { type: "masterCategory", results: mcs }, userResponse: { type: "user", results: users } } };
  }

  // Explore
  if (field === "getExploredCategories") {
    return paginatedCategories(getCategories());
  }
  if (field === "getExploredProfiles") {
    return paginatedListings(getListings().map((l) => listingWithCategory(l, "Web Development")));
  }

  // Featured/Promoted
  if (field === "getHPRecommendedProfiles" || field === "getRecommendedBrowseProfiles") {
    const cats = getCategories();
    const listings = getListings();
    return { statusCode: 200, success: true, message: "Profiles found", data: cats.slice(0, 2).map((c) => ({ categoryName: c.categoryName, categoryID: c._id, profiles: listings.filter((l) => l.category === c._id).map((l) => listingWithCategory(l, c.categoryName)) })) };
  }
  if (field === "getTopRatedProfiles") {
    const mcs = getMasterCategories();
    const listings = getListings();
    return { statusCode: 200, success: true, message: "Top rated found", data: mcs.slice(0, 2).map((mc) => ({ masterCategoryName: mc.categoryName, masterCategoryID: mc.id, topRatedlistings: listings.map((l) => listingWithCategory(l, "Web Development")) })) };
  }
  if (field === "getRecommendedCategory") {
    const mcs = getMasterCategories();
    const cats = getCategories();
    return { statusCode: 200, success: true, message: "Recommended found", data: mcs.slice(0, 2).map((mc) => ({ masterCategoryName: mc.categoryName, masterCategoryID: mc.id, categories: cats.filter((c) => { const row = sqlite.prepare("SELECT masterCategoryId FROM freelancer_marketplace_categories WHERE _id = ?").get(c._id) as { masterCategoryId: string } | undefined; return row?.masterCategoryId === mc.id; }) })) };
  }
  if (field === "getSPFeaturedProfiles") {
    return paginatedListings(getListings().map((l) => listingWithCategory(l, "Web Development")));
  }

  // Filter
  if (field === "getfilterAppliedCategories" || field === "getMostSearchedCategory" || field === "getNewlyAddedCategories" || field === "getMostSearchedByMainCategory") {
    return paginatedCategories(getCategories());
  }
  if (field === "getfilterAppliedListings" || field === "filterProfilesByMasterCategories" || field === "filterCategotriesByTags") {
    return { statusCode: 200, success: true, message: "Filtered results", data: getListings().map((l) => listingWithCategory(l, "Web Development")) };
  }

  // MC specific
  if (field === "getMCPFeaturedProfiles" || field === "getProfilesByMCID" || field === "getMCPRecommendedProfiles") {
    return paginatedListings(getListings().map((l) => listingWithCategory(l, "Web Development")));
  }
  if (field === "getSidebarData") {
    const cats = getCategories();
    const listings = getListings();
    return { statusCode: 200, data: { recommendedFreelancers: listings.slice(0, 2).map((l) => listingWithCategory(l, "Web Development")), recommendedCategories: cats.slice(0, 3), shortListedCategory: cats.slice(0, 2) } };
  }

  // DB (Discover Browse Page)
  if (field === "getDBPFeaturedProfiles") {
    return paginatedListings(getListings().map((l) => listingWithCategory(l, "Web Development")));
  }

  // Chat
  if (field === "getOneConversationMessage") {
    const rows = sqlite.prepare("SELECT * FROM freelancer_marketplace_messages WHERE conversationId = ?").all("conv-1") as Record<string, unknown>[];
    return { message: "Messages found", data: rows.map((r) => ({ _id: r._id, sender: r.sender, recipients: JSON.parse(r.recipients_json as string), message: r.message, senderReadReceipt: JSON.parse(r.senderReadReceipt_json as string || "[]"), recipientsReadReceipt: JSON.parse(r.recipientsReadReceipt_json as string || "[]"), createdAt: r.createdAt })) };
  }
  if (field === "getAllConversations") {
    const rows = sqlite.prepare("SELECT * FROM freelancer_marketplace_conversations").all() as Record<string, unknown>[];
    return { message: "Conversations found", data: rows.map((r) => ({ id: r._id, participants: JSON.parse(r.participants_json as string), conservationType: r.conservationType as string })) };
  }
  if (field === "getUnreadMessages") {
    return { message: "Unread messages", data: [] };
  }
  if (field === "getOneConversationByUserId") {
    const rows = sqlite.prepare("SELECT * FROM freelancer_marketplace_conversations").all() as Record<string, unknown>[];
    const conv = rows[0];
    const messages = sqlite.prepare("SELECT * FROM freelancer_marketplace_messages WHERE conversationId = ?").all(conv?._id as string) as Record<string, unknown>[];
    return { statusCode: 200, success: true, message: "Conversation found", data: { participants: JSON.parse((conv?.participants_json as string) || "[]"), messages: messages.map((m) => ({ _id: m._id, sender: m.sender, recipients: JSON.parse(m.recipients_json as string), message: m.message, createdAt: m.createdat })), conservationType: (conv?.conservationType as string) || "direct" } };
  }
  if (field === "createMessage") {
    return { statusCode: 200, message: "Message sent", data: { conversationId: "conv-1" } };
  }
  if (field === "updateReadReceipt") {
    return { data: { acknowledged: true, modifiedCount: 1, matchedCount: 1 } };
  }

  // Notifications
  if (field === "getNotification") {
    const rows = sqlite.prepare("SELECT * FROM freelancer_marketplace_notifications").all() as Record<string, unknown>[];
    return { success: true, data: rows.map((r) => ({ id: r._id, message: r.message, recipientsReadReceipt: [] })) };
  }
  if (field === "createNotification") {
    return { message: "Notification created", data: { message: "Notification sent" } };
  }
  if (field === "deleteNotification") {
    return { message: "Notification deleted" };
  }

  // Saved Lists CRUD
  if (field === "createSavedList") {
    return { message: "Saved list created", data: { listName: (variables.listName as string) || "New List" } };
  }
  if (field === "updateSavedList") {
    return { statusCode: 200, message: "Saved list updated" };
  }

  // Follow
  if (field === "followUser" || field === "unfollowUser") {
    return { statusCode: 200, success: true, message: "Follow updated" };
  }
  if (field === "followCategory" || field === "unFollowCategory") {
    return { statusCode: 200, success: true, message: "Category follow updated", data: getUser("user-1") };
  }

  // Rate, shortlist, blacklist
  if (field === "rateProfile") {
    return { efficiency: 4.5, timeliness: 4.5, satisfaction: 4.5, serviceAsDescribed: 4.5, responseRate: 4.5, communication: 4.5, ratedBy: "user-1", profileRated: (variables.inputRateData as Record<string, unknown>)?.profileId as string || "listing-1" };
  }
  if (field === "shortlisting" || field === "blacklisting" || field === "unShortlist" || field === "unBlacklist") {
    return { statusCode: 200, success: true, message: "Listing updated", data: getUser("user-1") };
  }
  if (field === "viewUser") {
    return { statusCode: 200, success: true, message: "User viewed", data: getUser("user-1") };
  }

  // History
  if (field === "getBrowsingHistory") {
    return paginatedListings(getListings().map((l) => listingWithCategory(l, "Web Development")));
  }
  if (field === "createBrowsingHistory") {
    return { userId: "user-1", category_view_history: [], profile_view_history: [] };
  }

  // Admin-like CRUD
  if (field === "createTag") {
    return { tagName: (variables.tagInput as Record<string, unknown>)?.tagName as string || "New Tag", tagDescription: (variables.tagInput as Record<string, unknown>)?.tagDescription as string || "", id: "tag-new" };
  }
  if (field === "createCategory") {
    const input = variables.categoryInput as Record<string, unknown> || {};
    return { id: "cat-new", categoryName: input.categoryName as string || "Demo Category", categoryImg: input.categoryImg as string || "", categoryDescription: input.categoryDescription as string || "", tags: [] };
  }
  if (field === "createMasterCategory") {
    const input = variables.categoryInput as Record<string, unknown> || {};
    return { id: "mc-new", categoryName: input.categoryName as string || "New Master Category", categoryDescription: input.categoryDescription as string || "" };
  }
  if (field === "filterByMasterCategories") {
    return { statusCode: 200, success: true, data: getCategories().map((c) => ({ _id: c._id, categoryName: c.categoryName, totalViews: c.totalViews, categoryImg: c.categoryImg, totalListings: c.totalListings, tags: c.tags })) };
  }

  return { statusCode: 200, success: true, message: "Operation completed", data: {} };
};
