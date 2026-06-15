import { sqlite } from "../../../config/db.js";

export const setupFreelancerMarketplaceDatabase = () => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS freelancer_marketplace_users (
      _id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL DEFAULT 'password',
      categoryFollowed_json TEXT DEFAULT '[]',
      skills_json TEXT DEFAULT '[]',
      chatId TEXT,
      avgResponseTime TEXT DEFAULT '1h',
      searchHistory_json TEXT DEFAULT '[]',
      userFollowed_json TEXT DEFAULT '[]',
      role TEXT DEFAULT 'freelancer',
      total_experience_years INTEGER DEFAULT 3,
      freelancer INTEGER DEFAULT 1,
      intern INTEGER DEFAULT 0,
      active_status TEXT DEFAULT 'online',
      about TEXT,
      profile_img TEXT,
      offering_json TEXT DEFAULT '[]',
      languages_json TEXT DEFAULT '[]',
      shortlisted INTEGER DEFAULT 0,
      blacklisted INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS freelancer_marketplace_master_categories (
      _id TEXT PRIMARY KEY,
      categoryName TEXT NOT NULL,
      categoryImg TEXT,
      gradientColor TEXT
    );

    CREATE TABLE IF NOT EXISTS freelancer_marketplace_categories (
      _id TEXT PRIMARY KEY,
      categoryName TEXT NOT NULL,
      categoryImg TEXT,
      categoryDescription TEXT,
      totalViews INTEGER DEFAULT 0,
      totalListings INTEGER DEFAULT 0,
      gradientColor TEXT,
      masterCategoryId TEXT,
      tags_json TEXT DEFAULT '[]',
      FOREIGN KEY (masterCategoryId) REFERENCES freelancer_marketplace_master_categories(_id)
    );

    CREATE TABLE IF NOT EXISTS freelancer_marketplace_tags (
      _id TEXT PRIMARY KEY,
      tagName TEXT NOT NULL,
      tagDescription TEXT
    );

    CREATE TABLE IF NOT EXISTS freelancer_marketplace_listings (
      _id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      job_title TEXT,
      videos_json TEXT DEFAULT '[]',
      categoryId TEXT,
      tags_json TEXT DEFAULT '[]',
      rating REAL DEFAULT 4.5,
      numReviews INTEGER DEFAULT 0,
      flexibility TEXT DEFAULT 'remote',
      total_experience_years INTEGER DEFAULT 3,
      hourly_rate INTEGER DEFAULT 0,
      offering_json TEXT DEFAULT '[]',
      listingStatus TEXT DEFAULT 'active',
      freelancer INTEGER DEFAULT 1,
      related_work_json TEXT DEFAULT '[]',
      experience_json TEXT DEFAULT '[]',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES freelancer_marketplace_users(_id),
      FOREIGN KEY (categoryId) REFERENCES freelancer_marketplace_categories(_id)
    );

    CREATE TABLE IF NOT EXISTS freelancer_marketplace_conversations (
      _id TEXT PRIMARY KEY,
      participants_json TEXT NOT NULL,
      conservationType TEXT DEFAULT 'direct',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS freelancer_marketplace_messages (
      _id TEXT PRIMARY KEY,
      sender TEXT NOT NULL,
      recipients_json TEXT NOT NULL,
      message TEXT NOT NULL,
      conversationId TEXT NOT NULL,
      senderReadReceipt_json TEXT DEFAULT '[]',
      recipientsReadReceipt_json TEXT DEFAULT '[]',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS freelancer_marketplace_notifications (
      _id TEXT PRIMARY KEY,
      message TEXT NOT NULL,
      userId TEXT,
      recipients_json TEXT,
      notificationType TEXT DEFAULT 'general',
      read INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS freelancer_marketplace_saved_lists (
      _id TEXT PRIMARY KEY,
      owner TEXT NOT NULL,
      listName TEXT NOT NULL,
      listType TEXT DEFAULT 'custom',
      listClass TEXT DEFAULT 'general',
      listings_json TEXT DEFAULT '[]',
      canModify INTEGER DEFAULT 1,
      canDelete INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS freelancer_marketplace_ratings (
      _id TEXT PRIMARY KEY,
      profileId TEXT NOT NULL,
      ratedBy TEXT NOT NULL,
      efficiency REAL DEFAULT 4.5,
      timeliness REAL DEFAULT 4.5,
      satisfaction REAL DEFAULT 4.5,
      serviceAsDescribed REAL DEFAULT 4.5,
      responseRate REAL DEFAULT 4.5,
      communication REAL DEFAULT 4.5,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS freelancer_marketplace_browsing_history (
      _id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      category_view_history_json TEXT DEFAULT '[]',
      profile_view_history_json TEXT DEFAULT '[]',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS freelancer_marketplace_graphql_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operation_name TEXT,
      root_fields TEXT,
      variables_json TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const userCount = sqlite.prepare("SELECT COUNT(*) as count FROM freelancer_marketplace_users").get() as { count: number };
  if (userCount.count === 0) {
    sqlite.prepare(`
      INSERT INTO freelancer_marketplace_users (_id, name, email, password, categoryFollowed_json, skills_json, chatId, avgResponseTime, searchHistory_json, userFollowed_json, role, total_experience_years, freelancer, intern, active_status, about, profile_img, offering_json, languages_json, shortlisted, blacklisted)
      VALUES (@_id, @name, @email, @password, @cf, @sk, @chatId, @avgResponse, @sh, @uf, @role, @exp, @fr, @in, @as, @about, @img, @offering, @lang, @sl, @bl)
    `).run({
      _id: "user-1", name: "Demo Freelancer", email: "demo@demo.com", password: "password",
      cf: JSON.stringify(["cat-1", "cat-2"]), sk: JSON.stringify([{ _id: "cat-1", categoryName: "Web Development" }, { _id: "cat-2", categoryName: "Mobile Development" }]),
      chatId: "user-1-chat", avgResponse: "1h", sh: JSON.stringify(["web developer", "react"]), uf: JSON.stringify([]), role: "freelancer",
      exp: 5, fr: 1, in: 0, as: "online", about: "Demo freelancer with 5 years of experience in web and mobile development.",
      img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
      offering: JSON.stringify(["Web Development", "Mobile Apps", "UI/UX Design"]), lang: JSON.stringify(["English", "French"]), sl: 0, bl: 0,
    });
    sqlite.prepare(`
      INSERT INTO freelancer_marketplace_users (_id, name, email, categoryFollowed_json, skills_json, chatId, avgResponseTime, role, total_experience_years, freelancer, active_status, about, profile_img, offering_json, languages_json)
      VALUES (@_id, @name, @email, @cf, @sk, @chatId, @avgResponse, @role, @exp, @fr, @as, @about, @img, @offering, @lang)
    `).run({
      _id: "user-2", name: "Jane Designer", email: "jane@demo.com",
      cf: JSON.stringify(["cat-3"]), sk: JSON.stringify([{ _id: "cat-3", categoryName: "Graphic Design" }]),
      chatId: "user-2-chat", avgResponse: "30m", role: "freelancer", exp: 4, fr: 1, as: "online",
      about: "Creative graphic designer specializing in branding.", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
      offering: JSON.stringify(["Logo Design", "Branding", "Illustration"]), lang: JSON.stringify(["English"]),
    });
    sqlite.prepare(`
      INSERT INTO freelancer_marketplace_users (_id, name, email, categoryFollowed_json, skills_json, chatId, avgResponseTime, role, total_experience_years, freelancer, active_status, about, profile_img, offering_json, languages_json)
      VALUES (@_id, @name, @email, @cf, @sk, @chatId, @avgResponse, @role, @exp, @fr, @as, @about, @img, @offering, @lang)
    `).run({
      _id: "user-3", name: "Mike Writer", email: "mike@demo.com",
      cf: JSON.stringify(["cat-4"]), sk: JSON.stringify([{ _id: "cat-4", categoryName: "Content Writing" }]),
      chatId: "user-3-chat", avgResponse: "2h", role: "freelancer", exp: 6, fr: 1, as: "away",
      about: "Professional content writer and copywriter.", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
      offering: JSON.stringify(["Copywriting", "Blog Posts", "Technical Writing"]), lang: JSON.stringify(["English", "Spanish"]),
    });
  }

  const mcCount = sqlite.prepare("SELECT COUNT(*) as count FROM freelancer_marketplace_master_categories").get() as { count: number };
  if (mcCount.count === 0) {
    sqlite.prepare("INSERT INTO freelancer_marketplace_master_categories (_id, categoryName, categoryImg, gradientColor) VALUES ('mc-1', 'Technology', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200', 'from-blue-500 to-purple-600')").run();
    sqlite.prepare("INSERT INTO freelancer_marketplace_master_categories (_id, categoryName, categoryImg, gradientColor) VALUES ('mc-2', 'Design', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200', 'from-pink-500 to-rose-600')").run();
    sqlite.prepare("INSERT INTO freelancer_marketplace_master_categories (_id, categoryName, categoryImg, gradientColor) VALUES ('mc-3', 'Writing', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=200', 'from-yellow-500 to-orange-600')").run();
    sqlite.prepare("INSERT INTO freelancer_marketplace_master_categories (_id, categoryName, categoryImg, gradientColor) VALUES ('mc-4', 'Marketing', 'https://images.unsplash.com/photo-1557838923-2985c318be48?w=200', 'from-green-500 to-teal-600')").run();
  }

  const catCount = sqlite.prepare("SELECT COUNT(*) as count FROM freelancer_marketplace_categories").get() as { count: number };
  if (catCount.count === 0) {
    sqlite.prepare("INSERT INTO freelancer_marketplace_categories (_id, categoryName, categoryImg, categoryDescription, totalViews, totalListings, gradientColor, masterCategoryId, tags_json) VALUES ('cat-1', 'Web Development', 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=200', 'Build websites and web applications', 1500, 42, 'from-blue-400 to-indigo-500', 'mc-1', @tags)").run({ tags: JSON.stringify([{ _id: "tag-1", tagName: "React" }, { _id: "tag-2", tagName: "Node.js" }]) });
    sqlite.prepare("INSERT INTO freelancer_marketplace_categories (_id, categoryName, categoryImg, categoryDescription, totalViews, totalListings, gradientColor, masterCategoryId, tags_json) VALUES ('cat-2', 'Mobile Development', 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=200', 'Create mobile apps for iOS and Android', 1200, 28, 'from-green-400 to-emerald-500', 'mc-1', @tags)").run({ tags: JSON.stringify([{ _id: "tag-3", tagName: "React Native" }, { _id: "tag-4", tagName: "Flutter" }]) });
    sqlite.prepare("INSERT INTO freelancer_marketplace_categories (_id, categoryName, categoryImg, categoryDescription, totalViews, totalListings, gradientColor, masterCategoryId, tags_json) VALUES ('cat-3', 'Graphic Design', 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=200', 'Design logos, branding, and visuals', 2000, 56, 'from-pink-400 to-rose-500', 'mc-2', @tags)").run({ tags: JSON.stringify([{ _id: "tag-5", tagName: "Adobe Illustrator" }, { _id: "tag-6", tagName: "Photoshop" }]) });
    sqlite.prepare("INSERT INTO freelancer_marketplace_categories (_id, categoryName, categoryImg, categoryDescription, totalViews, totalListings, gradientColor, masterCategoryId, tags_json) VALUES ('cat-4', 'Content Writing', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=200', 'Write engaging content for any audience', 1800, 35, 'from-yellow-400 to-orange-500', 'mc-3', @tags)").run({ tags: JSON.stringify([{ _id: "tag-7", tagName: "SEO" }, { _id: "tag-8", tagName: "Copywriting" }]) });
    sqlite.prepare("INSERT INTO freelancer_marketplace_categories (_id, categoryName, categoryImg, categoryDescription, totalViews, totalListings, gradientColor, masterCategoryId, tags_json) VALUES ('cat-5', 'Digital Marketing', 'https://images.unsplash.com/photo-1557838923-2985c318be48?w=200', 'Market products and services online', 900, 18, 'from-green-400 to-teal-500', 'mc-4', @tags)").run({ tags: JSON.stringify([{ _id: "tag-9", tagName: "Social Media" }, { _id: "tag-10", tagName: "SEO" }]) });
  }

  const tagCount = sqlite.prepare("SELECT COUNT(*) as count FROM freelancer_marketplace_tags").get() as { count: number };
  if (tagCount.count === 0) {
    const tags = [
      ["tag-1", "React", "JavaScript library for building UIs"],
      ["tag-2", "Node.js", "JavaScript runtime"],
      ["tag-3", "React Native", "Mobile framework"],
      ["tag-4", "Flutter", "UI toolkit"],
      ["tag-5", "Adobe Illustrator", "Vector graphics editor"],
      ["tag-6", "Photoshop", "Image editor"],
      ["tag-7", "SEO", "Search engine optimization"],
      ["tag-8", "Copywriting", "Writing for marketing"],
      ["tag-9", "Social Media", "Social media marketing"],
      ["tag-10", "SEO", "Search engine optimization"],
    ];
    const insert = sqlite.prepare("INSERT INTO freelancer_marketplace_tags (_id, tagName, tagDescription) VALUES (?, ?, ?)");
    tags.forEach(([id, name, desc]) => insert.run(id, name, desc));
  }

  const listingCount = sqlite.prepare("SELECT COUNT(*) as count FROM freelancer_marketplace_listings").get() as { count: number };
  if (listingCount.count === 0) {
    sqlite.prepare(`
      INSERT INTO freelancer_marketplace_listings (_id, userId, job_title, videos_json, categoryId, tags_json, rating, numReviews, flexibility, total_experience_years, hourly_rate, offering_json, listingStatus, freelancer, related_work_json, experience_json)
      VALUES (@_id, @userId, @title, @videos, @catId, @tags, @rating, @reviews, @flex, @exp, @rate, @offering, @status, @fr, @rw, @expJson)
    `).run({
      _id: "listing-1", userId: "user-1", title: "Full Stack Web Developer", catId: "cat-1",
      videos: JSON.stringify([]), tags: JSON.stringify([{ _id: "tag-1", tagName: "React" }, { _id: "tag-2", tagName: "Node.js" }]),
      rating: 4.8, reviews: 24, flex: "remote", exp: 5, rate: 35,
      offering: JSON.stringify(["Web Development", "API Design", "Database Management"]), status: "active", fr: 1,
      rw: JSON.stringify([{ _id: "rw-1", title: "E-commerce Platform", about: "Built a full-featured e-commerce platform with React and Node.js", images: ["https://images.unsplash.com/photo-1556742049-0cfed4f06a45?w=600"] }]),
      expJson: JSON.stringify([{ _id: "exp-1", company: "Tech Corp", role: "Senior Developer", start_date: "2022-01", end_date: "Present", responsility: "Led development team" }]),
    });
    sqlite.prepare(`
      INSERT INTO freelancer_marketplace_listings (_id, userId, job_title, videos_json, categoryId, tags_json, rating, numReviews, flexibility, total_experience_years, hourly_rate, offering_json, listingStatus, freelancer, related_work_json, experience_json)
      VALUES (@_id, @userId, @title, @videos, @catId, @tags, @rating, @reviews, @flex, @exp, @rate, @offering, @status, @fr, @rw, @expJson)
    `).run({
      _id: "listing-2", userId: "user-2", title: "Senior Graphic Designer", catId: "cat-3",
      videos: JSON.stringify([]), tags: JSON.stringify([{ _id: "tag-5", tagName: "Adobe Illustrator" }, { _id: "tag-6", tagName: "Photoshop" }]),
      rating: 4.6, reviews: 18, flex: "remote", exp: 4, rate: 30,
      offering: JSON.stringify(["Logo Design", "Branding", "Packaging Design"]), status: "active", fr: 1,
      rw: JSON.stringify([{ _id: "rw-2", title: "Brand Identity", about: "Created complete brand identity for a tech startup", images: ["https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600"] }]),
      expJson: JSON.stringify([{ _id: "exp-2", company: "Design Studio", role: "Graphic Designer", start_date: "2021-03", end_date: "Present", responsility: "Created visual designs" }]),
    });
    sqlite.prepare(`
      INSERT INTO freelancer_marketplace_listings (_id, userId, job_title, videos_json, categoryId, tags_json, rating, numReviews, flexibility, total_experience_years, hourly_rate, offering_json, listingStatus, freelancer, related_work_json, experience_json)
      VALUES (@_id, @userId, @title, @videos, @catId, @tags, @rating, @reviews, @flex, @exp, @rate, @offering, @status, @fr, @rw, @expJson)
    `).run({
      _id: "listing-3", userId: "user-3", title: "Professional Content Writer", catId: "cat-4",
      videos: JSON.stringify([]), tags: JSON.stringify([{ _id: "tag-7", tagName: "SEO" }, { _id: "tag-8", tagName: "Copywriting" }]),
      rating: 4.9, reviews: 32, flex: "remote", exp: 6, rate: 25,
      offering: JSON.stringify(["Blog Writing", "Technical Writing", "Copywriting"]), status: "active", fr: 1,
      rw: JSON.stringify([{ _id: "rw-3", title: "Tech Blog", about: "Wrote 50+ articles for a tech publication", images: ["https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600"] }]),
      expJson: JSON.stringify([{ _id: "exp-3", company: "Content Agency", role: "Senior Writer", start_date: "2020-06", end_date: "Present", responsility: "Managed content team" }]),
    });
  }

  const convCount = sqlite.prepare("SELECT COUNT(*) as count FROM freelancer_marketplace_conversations").get() as { count: number };
  if (convCount.count === 0) {
    sqlite.prepare("INSERT INTO freelancer_marketplace_conversations (_id, participants_json, conservationType) VALUES ('conv-1', @participants, 'direct')").run({
      participants: JSON.stringify([{ _id: "user-1", name: "Demo Freelancer", email: "demo@demo.com" }, { _id: "user-2", name: "Jane Designer", email: "jane@demo.com" }]),
    });
    sqlite.prepare("INSERT INTO freelancer_marketplace_messages (_id, sender, recipients_json, message, conversationId, senderReadReceipt_json, recipientsReadReceipt_json) VALUES ('msg-1', 'user-1', @recipients, 'Hi, I am interested in your services', 'conv-1', @sr, @rr)").run({
      recipients: JSON.stringify(["user-2"]), sr: JSON.stringify(["user-1"]), rr: JSON.stringify([]),
    });
  }

  const notifCount = sqlite.prepare("SELECT COUNT(*) as count FROM freelancer_marketplace_notifications").get() as { count: number };
  if (notifCount.count === 0) {
    sqlite.prepare("INSERT INTO freelancer_marketplace_notifications (_id, message, userId, notificationType) VALUES ('notif-1', 'Welcome to Freelancer Marketplace!', 'user-1', 'general')").run();
  }

  const savedListCount = sqlite.prepare("SELECT COUNT(*) as count FROM freelancer_marketplace_saved_lists").get() as { count: number };
  if (savedListCount.count === 0) {
    sqlite.prepare("INSERT INTO freelancer_marketplace_saved_lists (_id, owner, listName, listType, listClass, listings_json, canModify, canDelete) VALUES ('saved-1', 'user-1', 'Favorites', 'custom', 'general', @listings, 1, 1)").run({
      listings: JSON.stringify(["listing-1", "listing-2"]),
    });
  }
};
