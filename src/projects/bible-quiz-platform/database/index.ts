import { sqlite } from "../../../config/db.js";

export const setupBibleQuizDatabase = () => {
  // Drop all tables to ensure fresh schema + seed data on every start
  sqlite.exec(`
    DROP TABLE IF EXISTS bq_streaks; DROP TABLE IF EXISTS bq_leaderboard;
    DROP TABLE IF EXISTS bq_feedback; DROP TABLE IF EXISTS bq_faqs;
    DROP TABLE IF EXISTS bq_achievements; DROP TABLE IF EXISTS bq_broadcasts;
    DROP TABLE IF EXISTS bq_notifications; DROP TABLE IF EXISTS bq_progress;
    DROP TABLE IF EXISTS bq_enrollments; DROP TABLE IF EXISTS bq_bookmarks;
    DROP TABLE IF EXISTS bq_test_reviews; DROP TABLE IF EXISTS bq_tests;
    DROP TABLE IF EXISTS bq_questions; DROP TABLE IF EXISTS bq_lessons;
    DROP TABLE IF EXISTS bq_sub_topics; DROP TABLE IF EXISTS bq_topics;
    DROP TABLE IF EXISTS bq_classes; DROP TABLE IF EXISTS bq_permissions;
    DROP TABLE IF EXISTS bq_roles; DROP TABLE IF EXISTS bq_admin_users;
    DROP TABLE IF EXISTS bq_subscription_plans; DROP TABLE IF EXISTS bq_transactions;
    DROP TABLE IF EXISTS bq_users;
  `);
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS bq_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      _id TEXT UNIQUE, email TEXT, userName TEXT, firstName TEXT, lastName TEXT,
      password TEXT, isVerified INTEGER DEFAULT 0, acceptTermsAndConditions INTEGER DEFAULT 0,
      verificationCode TEXT, verificationCodeExpires TEXT, resetCode TEXT, resetExpires TEXT,
      passwordChangedAt TEXT, classLevel TEXT, country TEXT, countryState TEXT, gender TEXT,
      school TEXT, guardianEmail TEXT, guardianFullName TEXT, reportToGuardian TEXT,
      goal INTEGER DEFAULT 0, numOfReferrals INTEGER DEFAULT 0, referralEarnings REAL DEFAULT 0,
      personalReferralCode TEXT, profilePicture TEXT DEFAULT '', profilePictureId TEXT DEFAULT '',
      role TEXT DEFAULT 'user', freeAccess INTEGER DEFAULT 1,
      subscription_plan TEXT, subscription_active INTEGER DEFAULT 0,
      subscription_gateway TEXT, lastPaymentDate TEXT, nextPaymentDate TEXT,
      subscription_token TEXT, createdAt TEXT, referralEarningsBalance REAL DEFAULT 0,
      isFrozen INTEGER DEFAULT 0, isDeleted INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS bq_admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      _id TEXT UNIQUE, email TEXT, firstName TEXT, lastName TEXT, userName TEXT,
      phoneNumber TEXT, password TEXT, role TEXT DEFAULT 'admin',
      isVerified INTEGER DEFAULT 1, verificationCode TEXT, resetCode TEXT,
      profileImage TEXT DEFAULT '', createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS bq_roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT, _id TEXT UNIQUE, name TEXT,
      permissions TEXT DEFAULT '[]', createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS bq_permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT, _id TEXT UNIQUE, name TEXT, createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS bq_classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT, _id TEXT UNIQUE, name TEXT, createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS bq_topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT, _id TEXT UNIQUE, title TEXT, class_id TEXT,
      description TEXT, test_notice TEXT, num_of_questions INTEGER DEFAULT 10,
      test_duration INTEGER DEFAULT 30, createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS bq_sub_topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT, _id TEXT UNIQUE, title TEXT, description TEXT,
      topic_id TEXT, test_notice TEXT, num_of_questions INTEGER DEFAULT 10,
      test_duration INTEGER DEFAULT 30, createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS bq_lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT, _id TEXT UNIQUE, title TEXT, description TEXT,
      topic_id TEXT, sub_topic_id TEXT, resourceUrl TEXT DEFAULT '',
      videoUrl TEXT DEFAULT '', audioUrl TEXT DEFAULT '', documentUrl TEXT DEFAULT '',
      currentTime REAL DEFAULT 0, createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS bq_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT, _id TEXT UNIQUE, title TEXT,
      question_type TEXT DEFAULT 'radio', question_input_type TEXT DEFAULT '',
      topic_id TEXT, sub_topic_id TEXT, options TEXT DEFAULT '[]',
      createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS bq_subscription_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT, _id TEXT UNIQUE, name TEXT, description TEXT,
      amount REAL, duration_days INTEGER, features TEXT DEFAULT '[]',
      popular INTEGER DEFAULT 0, createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS bq_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT, _id TEXT UNIQUE, owner TEXT, amount REAL,
      reference TEXT, txnType TEXT, txnName TEXT, status TEXT DEFAULT 'pending',
      gateway TEXT, createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS bq_tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT, _id TEXT UNIQUE, user_id TEXT,
      topic_id TEXT, sub_topic_id TEXT, questions TEXT DEFAULT '[]',
      completed INTEGER DEFAULT 0, creation_date TEXT
    );
    CREATE TABLE IF NOT EXISTS bq_test_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT, _id TEXT UNIQUE, test_id TEXT, user_id TEXT,
      questions TEXT DEFAULT '[]', time INTEGER DEFAULT 0,
      correct INTEGER DEFAULT 0, mistakes INTEGER DEFAULT 0, creation_date TEXT
    );
    CREATE TABLE IF NOT EXISTS bq_bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT, _id TEXT UNIQUE, user_id TEXT,
      lesson_id TEXT, createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS bq_enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT, _id TEXT UNIQUE, user_id TEXT,
      topic_id TEXT, createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS bq_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT, _id TEXT UNIQUE, user_id TEXT,
      topic_id TEXT, lesson_id TEXT, test_id TEXT, type TEXT,
      time INTEGER DEFAULT 0, duration INTEGER DEFAULT 0, currentTime REAL DEFAULT 0,
      createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS bq_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT, _id TEXT UNIQUE, user_id TEXT,
      title TEXT, message TEXT, category TEXT, isRead INTEGER DEFAULT 0,
      createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS bq_broadcasts (
      id INTEGER PRIMARY KEY AUTOINCREMENT, _id TEXT UNIQUE, admin_id TEXT,
      message TEXT, type TEXT, createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS bq_achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT, _id TEXT UNIQUE, name TEXT,
      notification_message TEXT, badge TEXT DEFAULT '', points INTEGER DEFAULT 0,
      createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS bq_faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT, _id TEXT UNIQUE, question TEXT, answer TEXT,
      createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS bq_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT, _id TEXT UNIQUE, fullName TEXT, email TEXT,
      message TEXT, createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS bq_leaderboard (
      id INTEGER PRIMARY KEY AUTOINCREMENT, _id TEXT UNIQUE, user_id TEXT,
      userName TEXT, points INTEGER DEFAULT 0, createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS bq_streaks (
      id INTEGER PRIMARY KEY AUTOINCREMENT, _id TEXT UNIQUE, user_id TEXT,
      date TEXT, createdAt TEXT
    );
  `);

  if ((sqlite.prepare("SELECT COUNT(*) as c FROM bq_users").get() as { c: number }).c === 0) {
    const now = new Date();
    const d = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();

    const insertUser = sqlite.prepare(`INSERT INTO bq_users (_id,email,userName,firstName,lastName,password,isVerified,acceptTermsAndConditions,verificationCode,classLevel,country,countryState,gender,school,guardianEmail,guardianFullName,goal,numOfReferrals,referralEarnings,personalReferralCode,profilePicture,role,freeAccess,subscription_plan,subscription_active,subscription_gateway,lastPaymentDate,nextPaymentDate,createdAt,isFrozen) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);

    const users = [
      ["bq-user-1","demo@example.com","demo","Demo","User","password",1,1,"","SS1","Nigeria","Lagos","Male","Demo High School","parent@example.com","Parent Demo",3,5,2500,"DEMO001","https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200","user",1,"Premium",1,"paystack",d(25),d(65),d(90),0],
      ["bq-user-2","jane@example.com","jane123","Jane","Smith",".",1,1,"","JS2","Nigeria","Abuja","Female","City Academy","mother@example.com","Mary Smith",2,3,1200,"JANE002","https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200","user",1,"Basic",1,"flutterwave",d(10),d(55),d(60),0],
      ["bq-user-3","mike@example.com","mike_learner","Mike","Johnson","password",1,1,"","SS2","Nigeria","Rivers","Male","Port Harcourt Intl","","",3,8,5000,"MIKE003","","user",1,"Premium",1,"paystack",d(30),d(70),d(120),0],
      ["bq-user-4","sarah@example.com","sarah_quiz","Sarah","Williams","password",1,1,"","JS3","Nigeria","Oyo","Female","Ibadan Grammar School","guardian@example.com","Mr Williams",1,2,800,"SARAH004","","user",1,"Basic",1,"flutterwave",d(5),d(50),d(45),0],
      ["bq-user-5","unverified@example.com","unverified_user","Unverified","User","password",0,1,"UNV-123","SS3","Nigeria","Lagos","Male","","","",0,0,0,"UNV005","","user",0,"",0,"","","",d(2),0],
      ["bq-user-6","parent@example.com","parent_user","Parent","Account","password",1,1,"","","Nigeria","","","","","",0,0,0,"PARENT006","","user",0,"",0,"","","",d(80),0],
    ];
    for (const u of users) insertUser.run(...u);

    const insertAdmin = sqlite.prepare(`INSERT INTO bq_admin_users (_id,email,firstName,lastName,userName,phoneNumber,password,role,isVerified,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)`);
    insertAdmin.run("bq-admin-1","admin@example.com","Super","Admin","superadmin","08012345678","password","superAdmin",1,d(180));
    insertAdmin.run("bq-admin-2","editor@example.com","Content","Editor","contenteditor","08098765432","password","admin",1,d(90));
    insertAdmin.run("bq-admin-3","viewer@example.com","View","Only","viewonly","08055556666","password","viewer",1,d(30));

    const insertRole = sqlite.prepare(`INSERT INTO bq_roles (_id,name,permissions,createdAt) VALUES (?,?,?,?)`);
    insertRole.run("bq-role-1","Super Admin",JSON.stringify(["all"]),d(180));
    insertRole.run("bq-role-2","Admin",JSON.stringify(["view_dashboard","manage_users","manage_classes","manage_topics","manage_lessons","manage_questions"]),d(90));
    insertRole.run("bq-role-3","Viewer",JSON.stringify(["view_dashboard"]),d(30));

    const insertPerm = sqlite.prepare(`INSERT INTO bq_permissions (_id,name,createdAt) VALUES (?,?,?)`);
    const perms = ["view_dashboard","manage_users","manage_classes","manage_topics","manage_sub_topics","manage_lessons","manage_questions","manage_admins","manage_roles","manage_achievements","manage_broadcasts","view_reports","manage_settings"];
    for (let i = 0; i < perms.length; i++) insertPerm.run(`bq-perm-${i+1}`,perms[i],d(180));

    const insertClass = sqlite.prepare(`INSERT INTO bq_classes (_id,name,createdAt) VALUES (?,?,?)`);
    const classNames = ["JS1","JS2","JS3","SS1","SS2","SS3"];
    for (let i = 0; i < classNames.length; i++) insertClass.run(`bq-class-${i+1}`,classNames[i],d(180));

    const insertTopic = sqlite.prepare(`INSERT INTO bq_topics (_id,title,class_id,description,test_notice,num_of_questions,test_duration,createdAt) VALUES (?,?,?,?,?,?,?,?)`);
    const topics = [
      ["bq-topic-1","Whole Numbers and Place Value","bq-class-1","Understanding place value, comparing numbers, and rounding","Read each question carefully",10,30,d(170)],
      ["bq-topic-2","Fractions","bq-class-1","Types of fractions, operations with fractions","Show all workings",12,35,d(165)],
      ["bq-topic-3","Decimals","bq-class-1","Understanding decimals, operations, and conversions","Pay attention to decimal places",10,25,d(160)],
      ["bq-topic-4","Introduction to Algebra","bq-class-2","Algebraic expressions, simplification, substitution","Learn the basic rules first",10,30,d(155)],
      ["bq-topic-5","Linear Equations","bq-class-2","Solving equations and word problems","Check your answers by substitution",12,35,d(150)],
      ["bq-topic-6","Ratios and Proportion","bq-class-2","Understanding ratios, proportions, and scale drawings","Simplify ratios where possible",10,25,d(145)],
      ["bq-topic-7","Statistics","bq-class-3","Data collection, measures of central tendency, charts","Know the difference between mean, median, mode",10,30,d(140)],
      ["bq-topic-8","Probability","bq-class-3","Introduction to probability, experiments, tree diagrams","Probability ranges from 0 to 1",12,35,d(135)],
      ["bq-topic-9","Factorization","bq-class-3","Common factors, difference of squares, quadratics","Always check for common factors first",10,30,d(130)],
      ["bq-topic-10","Set Theory","bq-class-4","Types of sets, operations, Venn diagrams","Know the set notation symbols",12,35,d(125)],
      ["bq-topic-11","Functions","bq-class-4","Domain, range, types of functions, composite functions","Understand the vertical line test",10,30,d(120)],
      ["bq-topic-12","Trigonometry","bq-class-4","Trig ratios, sine and cosine rules, graphs","SOH CAH TOA is your friend",15,40,d(115)],
      ["bq-topic-13","Differentiation","bq-class-5","Limits, first principles, rules of differentiation","Learn the standard derivatives",12,35,d(110)],
      ["bq-topic-14","Integration","bq-class-5","Indefinite and definite integrals, area under curves","Don't forget the constant of integration",12,35,d(105)],
      ["bq-topic-15","Vectors","bq-class-5","Vector representation, operations, dot product","Vectors have magnitude and direction",10,30,d(100)],
      ["bq-topic-16","Complex Numbers","bq-class-6","Imaginary numbers, Argand diagram, polar form","i² = -1",12,35,d(95)],
      ["bq-topic-17","Advanced Calculus","bq-class-6","Chain rule, integration by parts, differential equations","Practice the chain rule thoroughly",15,40,d(90)],
      ["bq-topic-18","Revision: Algebra","bq-class-6","Polynomials, partial fractions, inequalities","Review all algebraic methods",10,30,d(85)],
    ];
    for (const t of topics) insertTopic.run(...t);

    const insertSub = sqlite.prepare(`INSERT INTO bq_sub_topics (_id,title,description,topic_id,test_notice,num_of_questions,test_duration,createdAt) VALUES (?,?,?,?,?,?,?,?)`);
    const subs = [
      ["bq-sub-1","Place Value up to Millions","Understanding the value of digits in numbers up to 7 digits","bq-topic-1","",5,15,d(170)],
      ["bq-sub-2","Comparing and Ordering Numbers","Using inequality symbols to compare and order whole numbers","bq-topic-1","",5,15,d(169)],
      ["bq-sub-3","Rounding Numbers","Rounding to the nearest ten, hundred, thousand, etc.","bq-topic-1","",5,15,d(168)],
      ["bq-sub-4","Types of Fractions","Proper, improper, mixed numbers, and equivalent fractions","bq-topic-2","",5,15,d(165)],
      ["bq-sub-5","Addition and Subtraction of Fractions","Adding and subtracting fractions with like and unlike denominators","bq-topic-2","",5,15,d(164)],
      ["bq-sub-6","Multiplication and Division of Fractions","Multiplying and dividing fractions and mixed numbers","bq-topic-2","",5,15,d(163)],
      ["bq-sub-7","Understanding Decimals","Decimal place value and reading decimal numbers","bq-topic-3","",5,15,d(160)],
      ["bq-sub-8","Operations with Decimals","Adding, subtracting, multiplying, and dividing decimals","bq-topic-3","",5,15,d(159)],
      ["bq-sub-9","Converting Fractions to Decimals","Methods for converting between fractions and decimals","bq-topic-3","",5,15,d(158)],
      ["bq-sub-10","Algebraic Expressions","Writing and interpreting algebraic expressions","bq-topic-4","",5,15,d(155)],
      ["bq-sub-11","Simplifying Expressions","Collecting like terms and simplifying","bq-topic-4","",5,15,d(154)],
      ["bq-sub-12","Substitution in Algebra","Evaluating expressions by substituting values","bq-topic-4","",5,15,d(153)],
      ["bq-sub-13","Solving One-Step Equations","Using inverse operations to solve simple equations","bq-topic-5","",5,15,d(150)],
      ["bq-sub-14","Solving Two-Step Equations","Equations requiring two inverse operations","bq-topic-5","",5,15,d(149)],
      ["bq-sub-15","Word Problems with Equations","Translating word problems into equations","bq-topic-5","",5,15,d(148)],
      ["bq-sub-16","Understanding Ratios","Simplifying ratios and dividing quantities in a ratio","bq-topic-6","",5,15,d(145)],
      ["bq-sub-17","Direct and Inverse Proportion","Recognizing and solving proportional problems","bq-topic-6","",5,15,d(144)],
      ["bq-sub-18","Data Collection and Presentation","Collecting data and creating frequency tables","bq-topic-7","",5,15,d(140)],
      ["bq-sub-19","Mean, Median, Mode","Calculating and interpreting measures of central tendency","bq-topic-7","",5,15,d(139)],
      ["bq-sub-20","Bar Charts and Histograms","Drawing and interpreting bar charts and histograms","bq-topic-7","",5,15,d(138)],
      ["bq-sub-21","Introduction to Probability","Basic probability concepts and terminology","bq-topic-8","",5,15,d(135)],
      ["bq-sub-22","Theoretical vs Experimental","Comparing theoretical and experimental probability","bq-topic-8","",5,15,d(134)],
      ["bq-sub-23","Common Factors","Finding HCF and factorizing with common factors","bq-topic-9","",5,15,d(130)],
      ["bq-sub-24","Difference of Two Squares","Using the DOTS method for factorization","bq-topic-9","",5,15,d(129)],
      ["bq-sub-25","Factorizing Quadratic Expressions","Factorizing ax²+bx+c into brackets","bq-topic-9","",5,15,d(128)],
      ["bq-sub-26","Types of Sets","Finite, infinite, empty, universal, and subset definitions","bq-topic-10","",5,15,d(125)],
      ["bq-sub-27","Set Operations","Union, intersection, complement, and difference of sets","bq-topic-10","",5,15,d(124)],
      ["bq-sub-28","Venn Diagrams","Representing set operations using Venn diagrams","bq-topic-10","",5,15,d(123)],
      ["bq-sub-29","Domain and Range","Finding the domain and range of functions","bq-topic-11","",5,15,d(120)],
      ["bq-sub-30","Types of Functions","One-to-one, onto, inverse, and identity functions","bq-topic-11","",5,15,d(119)],
      ["bq-sub-31","Composite Functions","Finding f(g(x)) and g(f(x))","bq-topic-11","",5,15,d(118)],
      ["bq-sub-32","Trigonometric Ratios","Sine, cosine, and tangent in right-angled triangles","bq-topic-12","",5,15,d(115)],
      ["bq-sub-33","Sine and Cosine Rules","Applying the sine and cosine rules in non-right triangles","bq-topic-12","",5,15,d(114)],
      ["bq-sub-34","Limits and Continuity","Understanding limits and continuity of functions","bq-topic-13","",5,15,d(110)],
      ["bq-sub-35","First Principles","Differentiation from first principles","bq-topic-13","",5,15,d(109)],
      ["bq-sub-36","Rules of Differentiation","Power, product, quotient, and chain rules","bq-topic-13","",5,15,d(108)],
      ["bq-sub-37","Indefinite Integration","Finding antiderivatives and the constant of integration","bq-topic-14","",5,15,d(105)],
      ["bq-sub-38","Definite Integration","Evaluating definite integrals and properties","bq-topic-14","",5,15,d(104)],
      ["bq-sub-39","Vector Representation","Column vectors, magnitude, and direction","bq-topic-15","",5,15,d(100)],
      ["bq-sub-40","Vector Operations","Addition, subtraction, and scalar multiplication","bq-topic-15","",5,15,d(99)],
      ["bq-sub-41","Imaginary Numbers","Introduction to i, powers of i, and complex numbers","bq-topic-16","",5,15,d(95)],
      ["bq-sub-42","The Argand Diagram","Representing complex numbers on a plane","bq-topic-16","",5,15,d(94)],
      ["bq-sub-43","Chain Rule","Differentiating composite functions","bq-topic-17","",5,15,d(90)],
      ["bq-sub-44","Integration by Parts","Using the u dv method for integration","bq-topic-17","",5,15,d(89)],
      ["bq-sub-45","Polynomials","Operations with polynomials and the remainder theorem","bq-topic-18","",5,15,d(85)],
      ["bq-sub-46","Partial Fractions","Decomposing rational expressions into partial fractions","bq-topic-18","",5,15,d(84)],
    ];
    for (const s of subs) insertSub.run(...s);

    const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?w=800&q=80`;
    const sVideos = [
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    ];
    const sAudios = [
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    ];
    const sImages = [
      unsplash("1509225770129-9d6e8e9e4b9e"),
      unsplash("1513542789411-b6a5d4f31634"),
      unsplash("1522202176988-66273c2fd55f"),
      unsplash("1509062525-03f80b4f5e9c"),
      unsplash("1481627834876-b7833e8f5570"),
      unsplash("1456513080510-7bf3a84b82f8"),
      unsplash("1503676260728-1c00da094a0b"),
      unsplash("1497633762265-9d179a990aa6"),
      unsplash("1532012197267-da84d127e765"),
      unsplash("1434030216411-0b793f4b4173"),
      unsplash("1460518451285-97b6aa326961"),
      unsplash("1571260899304-425eee4c7efc"),
      unsplash("1554774853-aae0a22c8aa4"),
      unsplash("1513258496099-48168024aec0"),
      unsplash("1635070041078-e363dbe005cb"),
    ];
    let vi = 0, ai = 0, ii = 0;
    const vid = () => sVideos[vi++ % sVideos.length];
    const aud = () => sAudios[ai++ % sAudios.length];
    const img = () => sImages[ii++ % sImages.length];

    const insertLesson = sqlite.prepare(`INSERT INTO bq_lessons (_id,title,description,topic_id,sub_topic_id,videoUrl,audioUrl,documentUrl,currentTime,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)`);
    const lessons = [
      ["bq-lesson-1","Understanding Place Value","Learn what each digit represents in numbers up to millions","bq-topic-1","bq-sub-1",vid(),aud(),img(),0,d(170)],
      ["bq-lesson-2","Reading and Writing Large Numbers","How to read and write numbers in words and figures","bq-topic-1","bq-sub-1",vid(),aud(),img(),0,d(169)],
      ["bq-lesson-3","Using Inequality Symbols","Using <, >, and = to compare numbers","bq-topic-1","bq-sub-2",vid(),aud(),img(),0,d(169)],
      ["bq-lesson-4","Ordering Sets of Numbers","Arranging numbers in ascending and descending order","bq-topic-1","bq-sub-2",vid(),aud(),"",0,d(168)],
      ["bq-lesson-5","Rounding to the Nearest Ten and Hundred","Rounding rules and practice","bq-topic-1","bq-sub-3",vid(),aud(),img(),0,d(168)],
      ["bq-lesson-6","Proper and Improper Fractions","Identifying and converting between proper and improper fractions","bq-topic-2","bq-sub-4",vid(),aud(),img(),0,d(165)],
      ["bq-lesson-7","Equivalent Fractions","Finding equivalent fractions and simplifying","bq-topic-2","bq-sub-4",vid(),aud(),img(),0,d(164)],
      ["bq-lesson-8","Adding and Subtracting Like Fractions","Fractions with the same denominator","bq-topic-2","bq-sub-5",vid(),aud(),img(),0,d(164)],
      ["bq-lesson-9","Adding and Subtracting Unlike Fractions","Finding the LCM and converting denominators","bq-topic-2","bq-sub-5",vid(),aud(),"",0,d(163)],
      ["bq-lesson-10","Multiplying Fractions","Simple multiplication and cancelling common factors","bq-topic-2","bq-sub-6",vid(),aud(),img(),0,d(163)],
      ["bq-lesson-11","Dividing Fractions","Using reciprocals to divide fractions","bq-topic-2","bq-sub-6",vid(),aud(),"",0,d(162)],
      ["bq-lesson-12","Decimal Place Value","Understanding tenths, hundredths, and thousandths","bq-topic-3","bq-sub-7",vid(),aud(),img(),0,d(160)],
      ["bq-lesson-13","Adding and Subtracting Decimals","Aligning decimal points for accurate calculations","bq-topic-3","bq-sub-8",vid(),aud(),img(),0,d(159)],
      ["bq-lesson-14","Multiplying Decimals","Multiplying decimals by whole numbers and powers of 10","bq-topic-3","bq-sub-8",vid(),aud(),"",0,d(159)],
      ["bq-lesson-15","Converting Fractions to Decimals","Using division to convert fractions to decimals","bq-topic-3","bq-sub-9",vid(),aud(),img(),0,d(158)],
      ["bq-lesson-16","Writing Algebraic Expressions","Translating words into algebraic expressions","bq-topic-4","bq-sub-10",vid(),aud(),img(),0,d(155)],
      ["bq-lesson-17","Collecting Like Terms","Simplifying expressions by grouping similar terms","bq-topic-4","bq-sub-11",vid(),aud(),img(),0,d(154)],
      ["bq-lesson-18","Expanding Brackets","Using the distributive property to expand expressions","bq-topic-4","bq-sub-11",vid(),aud(),"",0,d(154)],
      ["bq-lesson-19","Substitution into Expressions","Replacing variables with given values","bq-topic-4","bq-sub-12",vid(),aud(),img(),0,d(153)],
      ["bq-lesson-20","Solving x + a = b","Using inverse operations to solve simple equations","bq-topic-5","bq-sub-13",vid(),aud(),img(),0,d(150)],
      ["bq-lesson-21","Solving ax = b","Multiplication and division in equations","bq-topic-5","bq-sub-13",vid(),aud(),"",0,d(149)],
      ["bq-lesson-22","Solving ax + b = c","Two-step equations with addition and multiplication","bq-topic-5","bq-sub-14",vid(),aud(),img(),0,d(149)],
      ["bq-lesson-23","Equations with Variables on Both Sides","Moving variables to one side","bq-topic-5","bq-sub-14",vid(),aud(),img(),0,d(148)],
      ["bq-lesson-24","Writing Equations from Word Problems","Translating real-world problems into equations","bq-topic-5","bq-sub-15",vid(),aud(),img(),0,d(148)],
      ["bq-lesson-25","Simplifying Ratios","Writing ratios in their simplest form","bq-topic-6","bq-sub-16",vid(),aud(),img(),0,d(145)],
      ["bq-lesson-26","Dividing in a Given Ratio","Sharing quantities according to a ratio","bq-topic-6","bq-sub-16",vid(),aud(),"",0,d(144)],
      ["bq-lesson-27","Direct Proportion","When two quantities increase together","bq-topic-6","bq-sub-17",vid(),aud(),img(),0,d(144)],
      ["bq-lesson-28","Inverse Proportion","When one quantity increases as another decreases","bq-topic-6","bq-sub-17",vid(),aud(),img(),0,d(143)],
      ["bq-lesson-29","Collecting and Recording Data","Methods for gathering and organizing data","bq-topic-7","bq-sub-18",vid(),aud(),img(),0,d(140)],
      ["bq-lesson-30","Frequency Tables","Creating and interpreting frequency distribution tables","bq-topic-7","bq-sub-18",vid(),aud(),"",0,d(139)],
      ["bq-lesson-31","Calculating the Mean","Finding the average of a data set","bq-topic-7","bq-sub-19",vid(),aud(),img(),0,d(139)],
      ["bq-lesson-32","Median and Mode","Finding the middle value and most frequent value","bq-topic-7","bq-sub-19",vid(),aud(),img(),0,d(138)],
      ["bq-lesson-33","Drawing Bar Charts","Creating bar charts from frequency data","bq-topic-7","bq-sub-20",vid(),aud(),img(),0,d(138)],
      ["bq-lesson-34","Introduction to Probability","Basic probability terms: experiment, outcome, event","bq-topic-8","bq-sub-21",vid(),aud(),img(),0,d(135)],
      ["bq-lesson-35","Calculating Simple Probability","P(event) = favorable outcomes / total outcomes","bq-topic-8","bq-sub-21",vid(),aud(),"",0,d(134)],
      ["bq-lesson-36","Theoretical Probability","What should happen in theory","bq-topic-8","bq-sub-22",vid(),aud(),img(),0,d(134)],
      ["bq-lesson-37","Experimental Probability","What happens when we run experiments","bq-topic-8","bq-sub-22",vid(),aud(),"",0,d(133)],
      ["bq-lesson-38","Finding the Highest Common Factor","Using factor trees and listing factors","bq-topic-9","bq-sub-23",vid(),aud(),img(),0,d(130)],
      ["bq-lesson-39","Factorizing with Common Factors","Taking out the HCF from algebraic expressions","bq-topic-9","bq-sub-23",vid(),aud(),img(),0,d(129)],
      ["bq-lesson-40","Difference of Two Squares","The formula a² - b² = (a+b)(a-b)","bq-topic-9","bq-sub-24",vid(),aud(),img(),0,d(129)],
      ["bq-lesson-41","Factorizing x² + bx + c","Finding factors that multiply to c and add to b","bq-topic-9","bq-sub-25",vid(),aud(),img(),0,d(128)],
      ["bq-lesson-42","Factorizing ax² + bx + c","Using the AC method for harder quadratics","bq-topic-9","bq-sub-25",vid(),aud(),"",0,d(127)],
      ["bq-lesson-43","Finite and Infinite Sets","Definitions and examples of different set types","bq-topic-10","bq-sub-26",vid(),aud(),img(),0,d(125)],
      ["bq-lesson-44","Union and Intersection","Finding elements in A∪B and A∩B","bq-topic-10","bq-sub-27",vid(),aud(),img(),0,d(124)],
      ["bq-lesson-45","Drawing Venn Diagrams","Representing sets visually with Venn diagrams","bq-topic-10","bq-sub-28",vid(),aud(),img(),0,d(124)],
      ["bq-lesson-46","Solving Problems with Venn Diagrams","Using Venn diagrams for three-set problems","bq-topic-10","bq-sub-28",vid(),aud(),img(),0,d(123)],
      ["bq-lesson-47","Domain of a Function","Determining allowable input values","bq-topic-11","bq-sub-29",vid(),aud(),img(),0,d(120)],
      ["bq-lesson-48","Range of a Function","Determining possible output values","bq-topic-11","bq-sub-29",vid(),aud(),"",0,d(119)],
      ["bq-lesson-49","One-to-One and Onto Functions","Understanding different function classifications","bq-topic-11","bq-sub-30",vid(),aud(),img(),0,d(119)],
      ["bq-lesson-50","Composite Functions","Evaluating f(g(x)) step by step","bq-topic-11","bq-sub-31",vid(),aud(),img(),0,d(118)],
      ["bq-lesson-51","Sine, Cosine and Tangent","Finding trig ratios in right-angled triangles","bq-topic-12","bq-sub-32",vid(),aud(),img(),0,d(115)],
      ["bq-lesson-52","Using SOH CAH TOA","Mnemonics for remembering trig ratios","bq-topic-12","bq-sub-32",vid(),aud(),"",0,d(114)],
      ["bq-lesson-53","The Sine Rule","Using a/sinA = b/sinB = c/sinC","bq-topic-12","bq-sub-33",vid(),aud(),img(),0,d(114)],
      ["bq-lesson-54","The Cosine Rule","Using a² = b² + c² - 2bc cosA","bq-topic-12","bq-sub-33",vid(),aud(),img(),0,d(113)],
      ["bq-lesson-55","Introduction to Limits","Understanding the concept of a limit","bq-topic-13","bq-sub-34",vid(),aud(),img(),0,d(110)],
      ["bq-lesson-56","Evaluating Limits","Techniques for finding limits algebraically","bq-topic-13","bq-sub-34",vid(),aud(),"",0,d(109)],
      ["bq-lesson-57","Differentiation from First Principles","Using the limit definition of derivative","bq-topic-13","bq-sub-35",vid(),aud(),img(),0,d(109)],
      ["bq-lesson-58","The Power Rule","Differentiating xⁿ","bq-topic-13","bq-sub-36",vid(),aud(),img(),0,d(108)],
      ["bq-lesson-59","The Product and Quotient Rules","Differentiating products and quotients of functions","bq-topic-13","bq-sub-36",vid(),aud(),img(),0,d(107)],
      ["bq-lesson-60","Basic Integration Rules","Finding antiderivatives of common functions","bq-topic-14","bq-sub-37",vid(),aud(),img(),0,d(105)],
      ["bq-lesson-61","The Constant of Integration","Why we add +C to indefinite integrals","bq-topic-14","bq-sub-37",vid(),aud(),"",0,d(104)],
      ["bq-lesson-62","Evaluating Definite Integrals","Using limits of integration","bq-topic-14","bq-sub-38",vid(),aud(),img(),0,d(104)],
      ["bq-lesson-63","Area Under a Curve","Finding the area between a curve and the x-axis","bq-topic-14","bq-sub-38",vid(),aud(),img(),0,d(103)],
      ["bq-lesson-64","Column Vectors","Representing vectors as coordinates","bq-topic-15","bq-sub-39",vid(),aud(),img(),0,d(100)],
      ["bq-lesson-65","Magnitude of a Vector","Finding the length of a vector using Pythagoras","bq-topic-15","bq-sub-39",vid(),aud(),img(),0,d(99)],
      ["bq-lesson-66","Adding and Subtracting Vectors","Vector addition and subtraction graphically","bq-topic-15","bq-sub-40",vid(),aud(),"",0,d(99)],
      ["bq-lesson-67","Scalar Multiplication","Multiplying vectors by scalars","bq-topic-15","bq-sub-40",vid(),aud(),img(),0,d(98)],
      ["bq-lesson-68","The Number i","Understanding the imaginary unit","bq-topic-16","bq-sub-41",vid(),aud(),img(),0,d(95)],
      ["bq-lesson-69","Powers of i","The cyclic pattern of iⁿ","bq-topic-16","bq-sub-41",vid(),aud(),"",0,d(94)],
      ["bq-lesson-70","Complex Numbers on the Argand Diagram","Plotting complex numbers as points","bq-topic-16","bq-sub-42",vid(),aud(),img(),0,d(94)],
      ["bq-lesson-71","The Chain Rule","Differentiating f(g(x))","bq-topic-17","bq-sub-43",vid(),aud(),img(),0,d(90)],
      ["bq-lesson-72","Applying the Chain Rule","Chain rule with trigonometric and exponential functions","bq-topic-17","bq-sub-43",vid(),aud(),"",0,d(89)],
      ["bq-lesson-73","Integration by Parts","Using ∫u dv = uv - ∫v du","bq-topic-17","bq-sub-44",vid(),aud(),img(),0,d(89)],
      ["bq-lesson-74","Polynomial Division","Dividing polynomials using long division","bq-topic-18","bq-sub-45",vid(),aud(),img(),0,d(85)],
      ["bq-lesson-75","The Remainder Theorem","Finding remainders without division","bq-topic-18","bq-sub-45",vid(),aud(),"",0,d(84)],
      ["bq-lesson-76","Decomposing into Partial Fractions","Splitting rational expressions into simpler parts","bq-topic-18","bq-sub-46",vid(),aud(),img(),0,d(84)],
    ];
    for (const l of lessons) insertLesson.run(...l);

    const insertQuestion = sqlite.prepare(`INSERT INTO bq_questions (_id,title,question_type,question_input_type,topic_id,sub_topic_id,options,createdAt) VALUES (?,?,?,?,?,?,?,?)`);
    const qs = [
      ["bq-q-1","What is the value of the digit 7 in 3,745,281?","radio","","bq-topic-1","bq-sub-1",JSON.stringify([{option_value:"7,000",isCorrectAnswer:false},{option_value:"700,000",isCorrectAnswer:true},{option_value:"70,000",isCorrectAnswer:false},{option_value:"7,000,000",isCorrectAnswer:false}]),d(170)],
      ["bq-q-2","Round 4,678 to the nearest hundred.","radio","","bq-topic-1","bq-sub-3",JSON.stringify([{option_value:"4,600",isCorrectAnswer:false},{option_value:"4,700",isCorrectAnswer:true},{option_value:"4,680",isCorrectAnswer:false},{option_value:"5,000",isCorrectAnswer:false}]),d(169)],
      ["bq-q-3","Which is larger: 0.5 or 0.25?","radio","","bq-topic-3","bq-sub-7",JSON.stringify([{option_value:"0.5",isCorrectAnswer:true},{option_value:"0.25",isCorrectAnswer:false},{option_value:"They are equal",isCorrectAnswer:false},{option_value:"Cannot determine",isCorrectAnswer:false}]),d(168)],
      ["bq-q-4","What is 3/4 as a decimal?","radio","","bq-topic-3","bq-sub-9",JSON.stringify([{option_value:"0.34",isCorrectAnswer:false},{option_value:"0.75",isCorrectAnswer:true},{option_value:"0.25",isCorrectAnswer:false},{option_value:"0.5",isCorrectAnswer:false}]),d(167)],
      ["bq-q-5","What is 2/3 + 1/6?","radio","","bq-topic-2","bq-sub-5",JSON.stringify([{option_value:"3/9",isCorrectAnswer:false},{option_value:"5/6",isCorrectAnswer:true},{option_value:"1/2",isCorrectAnswer:false},{option_value:"2/9",isCorrectAnswer:false}]),d(165)],
      ["bq-q-6","Simplify: 3x + 2x - x","radio","","bq-topic-4","bq-sub-11",JSON.stringify([{option_value:"5x",isCorrectAnswer:false},{option_value:"4x",isCorrectAnswer:true},{option_value:"3x",isCorrectAnswer:false},{option_value:"6x",isCorrectAnswer:false}]),d(160)],
      ["bq-q-7","If x = 3, what is 2x + 5?","radio","","bq-topic-4","bq-sub-12",JSON.stringify([{option_value:"10",isCorrectAnswer:false},{option_value:"11",isCorrectAnswer:true},{option_value:"12",isCorrectAnswer:false},{option_value:"13",isCorrectAnswer:false}]),d(159)],
      ["bq-q-8","Solve: x + 7 = 15","radio","","bq-topic-5","bq-sub-13",JSON.stringify([{option_value:"x = 7",isCorrectAnswer:false},{option_value:"x = 8",isCorrectAnswer:true},{option_value:"x = 22",isCorrectAnswer:false},{option_value:"x = 15",isCorrectAnswer:false}]),d(155)],
      ["bq-q-9","Solve: 2x + 3 = 11","radio","","bq-topic-5","bq-sub-14",JSON.stringify([{option_value:"x = 4",isCorrectAnswer:true},{option_value:"x = 5",isCorrectAnswer:false},{option_value:"x = 3",isCorrectAnswer:false},{option_value:"x = 7",isCorrectAnswer:false}]),d(154)],
      ["bq-q-10","Divide 60 in the ratio 2:3","radio","","bq-topic-6","bq-sub-16",JSON.stringify([{option_value:"20 and 40",isCorrectAnswer:false},{option_value:"24 and 36",isCorrectAnswer:true},{option_value:"30 and 30",isCorrectAnswer:false},{option_value:"12 and 48",isCorrectAnswer:false}]),d(150)],
      ["bq-q-11","What is the mean of 4, 8, 12, 16?","radio","","bq-topic-7","bq-sub-19",JSON.stringify([{option_value:"8",isCorrectAnswer:false},{option_value:"10",isCorrectAnswer:true},{option_value:"12",isCorrectAnswer:false},{option_value:"14",isCorrectAnswer:false}]),d(145)],
      ["bq-q-12","A fair coin is tossed. What is P(Heads)?","radio","","bq-topic-8","bq-sub-21",JSON.stringify([{option_value:"0",isCorrectAnswer:false},{option_value:"1/2",isCorrectAnswer:true},{option_value:"1",isCorrectAnswer:false},{option_value:"1/4",isCorrectAnswer:false}]),d(140)],
      ["bq-q-13","Factorize: x² - 9","radio","","bq-topic-9","bq-sub-24",JSON.stringify([{option_value:"(x+3)(x-3)",isCorrectAnswer:true},{option_value:"(x+9)(x-9)",isCorrectAnswer:false},{option_value:"(x-3)²",isCorrectAnswer:false},{option_value:"(x+3)²",isCorrectAnswer:false}]),d(135)],
      ["bq-q-14","If A = {1,2,3} and B = {2,3,4}, what is A∩B?","radio","","bq-topic-10","bq-sub-27",JSON.stringify([{option_value:"{1,2,3,4}",isCorrectAnswer:false},{option_value:"{2,3}",isCorrectAnswer:true},{option_value:"{1,4}",isCorrectAnswer:false},{option_value:"{ }",isCorrectAnswer:false}]),d(130)],
      ["bq-q-15","What is the domain of f(x) = 1/x?","radio","","bq-topic-11","bq-sub-29",JSON.stringify([{option_value:"All real numbers",isCorrectAnswer:false},{option_value:"All real numbers except 0",isCorrectAnswer:true},{option_value:"All positive numbers",isCorrectAnswer:false},{option_value:"All integers",isCorrectAnswer:false}]),d(125)],
      ["bq-q-16","If sin θ = 3/5, what is cos θ? (Right triangle)","radio","","bq-topic-12","bq-sub-32",JSON.stringify([{option_value:"4/5",isCorrectAnswer:true},{option_value:"3/5",isCorrectAnswer:false},{option_value:"5/4",isCorrectAnswer:false},{option_value:"4/3",isCorrectAnswer:false}]),d(120)],
      ["bq-q-17","What is the derivative of x³?","radio","","bq-topic-13","bq-sub-36",JSON.stringify([{option_value:"3x²",isCorrectAnswer:true},{option_value:"x²",isCorrectAnswer:false},{option_value:"3x",isCorrectAnswer:false},{option_value:"x³",isCorrectAnswer:false}]),d(115)],
      ["bq-q-18","Evaluate ∫ 2x dx","radio","","bq-topic-14","bq-sub-37",JSON.stringify([{option_value:"x² + C",isCorrectAnswer:true},{option_value:"2x² + C",isCorrectAnswer:false},{option_value:"x²",isCorrectAnswer:false},{option_value:"2 + C",isCorrectAnswer:false}]),d(110)],
      ["bq-q-19","What is the magnitude of vector (3,4)?","radio","","bq-topic-15","bq-sub-39",JSON.stringify([{option_value:"5",isCorrectAnswer:true},{option_value:"7",isCorrectAnswer:false},{option_value:"12",isCorrectAnswer:false},{option_value:"25",isCorrectAnswer:false}]),d(105)],
      ["bq-q-20","What is i²?","radio","","bq-topic-16","bq-sub-41",JSON.stringify([{option_value:"1",isCorrectAnswer:false},{option_value:"-1",isCorrectAnswer:true},{option_value:"i",isCorrectAnswer:false},{option_value:"-i",isCorrectAnswer:false}]),d(100)],
      ["bq-q-21","What is the derivative of sin x?","radio","","bq-topic-17","bq-sub-43",JSON.stringify([{option_value:"cos x",isCorrectAnswer:true},{option_value:"-cos x",isCorrectAnswer:false},{option_value:"sin x",isCorrectAnswer:false},{option_value:"-sin x",isCorrectAnswer:false}]),d(95)],
      ["bq-q-22","Divide x³ - 1 by x - 1","radio","","bq-topic-18","bq-sub-45",JSON.stringify([{option_value:"x² + x + 1",isCorrectAnswer:true},{option_value:"x² - x + 1",isCorrectAnswer:false},{option_value:"x² + x - 1",isCorrectAnswer:false},{option_value:"x² - 1",isCorrectAnswer:false}]),d(90)],
    ];
    for (const q of qs) insertQuestion.run(...q);

    const insertPlan = sqlite.prepare(`INSERT INTO bq_subscription_plans (_id,name,description,amount,duration_days,features,popular,createdAt) VALUES (?,?,?,?,?,?,?,?)`);
    insertPlan.run("bq-plan-1","Basic","Access to all math classes and basic quizzes. Perfect for beginners.",0,0,JSON.stringify(["All math classes","Basic practice quizzes","Limited progress tracking","Community forum access","Sample video lessons"]),0,d(180));
    insertPlan.run("bq-plan-2","Premium","Full access to all math topics, detailed lessons, and advanced quizzes.",1500,30,JSON.stringify(["All math classes and topics","Full video lesson library","Advanced quizzes and tests","Full progress tracking","Bookmarks and notes","Priority support","PDF lesson notes"]),1,d(180));
    insertPlan.run("bq-plan-3","Premium+","Everything in Premium plus parent reports and guardian features for maximum support.",2500,30,JSON.stringify(["All Premium features","Parent/guardian reports","Multiple student profiles","Detailed performance analytics","Certificate of completion","Downloadable audio lessons","Dedicated support"]),0,d(180));

    const insertTx = sqlite.prepare(`INSERT INTO bq_transactions (_id,owner,amount,reference,txnType,txnName,status,gateway,createdAt) VALUES (?,?,?,?,?,?,?,?,?)`);
    const txs = [
      ["bq-tx-1","bq-user-1",1500,"REF-PAY-001","debit","Premium Subscription","successful","paystack",d(25)],
      ["bq-tx-2","bq-user-1",5000,"REF-WAL-001","credit","Wallet Funding","successful","paystack",d(20)],
      ["bq-tx-3","bq-user-2",0,"REF-BAS-002","credit","Basic Subscription","successful","flutterwave",d(10)],
      ["bq-tx-4","bq-user-3",1500,"REF-PAY-003","debit","Premium Subscription","successful","paystack",d(30)],
      ["bq-tx-5","bq-user-3",10000,"REF-WAL-003","credit","Wallet Funding","successful","paystack",d(28)],
      ["bq-tx-6","bq-user-4",0,"REF-BAS-004","credit","Basic Subscription","successful","flutterwave",d(5)],
      ["bq-tx-7","bq-user-1",2000,"REF-TRF-001","debit","Transfer to Bank","successful","paystack",d(15)],
      ["bq-tx-8","bq-user-3",500,"REF-PAY-005","debit","Quiz Challenge Entry","successful","paystack",d(12)],
    ];
    for (const t of txs) insertTx.run(...t);

    const insertNotif = sqlite.prepare(`INSERT INTO bq_notifications (_id,user_id,title,message,category,isRead,createdAt) VALUES (?,?,?,?,?,?,?)`);
    for (let i = 0; i < 8; i++) {
      insertNotif.run(`bq-notif-${i+1}`,"bq-user-1",["New Lesson Available","Quiz Reminder","Achievement Unlocked","Subscription Renewed","Welcome to A1Quest","Streak Reward","New Feature Alert","Weekly Report"][i],["A new lesson on Factorization is now available","You have an unfinished quiz on Linear Equations","Congratulations! You earned the 'Math Master' badge","Your Premium subscription has been renewed for another month","Welcome to A1Quest! Start your math learning journey","You've maintained a 7-day streak! Keep it up!","New practice problem generator is now available","You scored in the top 10% this week!"][i],"general",i>3?1:0,d(i*7));
    }

    const insertNotifAll = sqlite.prepare(`INSERT INTO bq_notifications (_id,user_id,title,message,category,isRead,createdAt) VALUES (?,?,?,?,?,?,?)`);
    insertNotifAll.run("bq-notif-admin-1","bq-user-2","Welcome to A1Quest","Start exploring math lessons today","general",1,d(60));
    insertNotifAll.run("bq-notif-admin-2","bq-user-2","Quiz Available","New quiz on Quadratic Equations is ready","general",0,d(10));

    const bc = (id: string, w: number) => `https://images.unsplash.com/${id}?w=${w}&q=80`;
    const insertAchievement = sqlite.prepare(`INSERT INTO bq_achievements (_id,name,notification_message,badge,points,createdAt) VALUES (?,?,?,?,?,?)`);
    insertAchievement.run("bq-ach-1","First Quiz","You completed your first math quiz!",bc("photo-1513258496099-48168024aec0",200),50,d(170));
    insertAchievement.run("bq-ach-2","Perfect Score","You got 100% in a math quiz!",bc("photo-1635070041078-e363dbe005cb",200),100,d(165));
    insertAchievement.run("bq-ach-3","Math Scholar","You completed 10 math lessons",bc("photo-1497633762265-9d179a990aa6",200),200,d(160));
    insertAchievement.run("bq-ach-4","Streak Master","7-day learning streak",bc("photo-1513542789411-b6a5d4f31634",200),150,d(155));
    insertAchievement.run("bq-ach-5","Top Performer","Top 10 in the leaderboard",bc("photo-1509225770129-9d6e8e9e4b9e",200),300,d(150));
    insertAchievement.run("bq-ach-6","Quiz Champion","Completed 5 math quizzes",bc("photo-1522202176988-66273c2fd55f",200),100,d(145));
    insertAchievement.run("bq-ach-7","Dedicated Learner","Spent 10 hours learning math",bc("photo-1503676260728-1c00da094a0b",200),250,d(140));
    insertAchievement.run("bq-ach-8","Problem Solver","Perfect score on 3 math quizzes",bc("photo-1532012197267-da84d127e765",200),200,d(135));

    const insertFaq = sqlite.prepare(`INSERT INTO bq_faqs (_id,question,answer,createdAt) VALUES (?,?,?,?)`);
    insertFaq.run("bq-faq-1","What is A1Quest?","A1Quest is a mathematics learning platform designed to help students master math from basic arithmetic to advanced calculus.",d(180));
    insertFaq.run("bq-faq-2","How do I subscribe?","Go to the Pricing page, select a plan, and complete payment via Paystack or Flutterwave.",d(180));
    insertFaq.run("bq-faq-3","Can I change my plan?","Yes, you can upgrade or downgrade your plan at any time from your account settings.",d(175));
    insertFaq.run("bq-faq-4","How are leaderboard points calculated?","Points are earned by completing lessons, quizzes, maintaining streaks, and achieving perfect scores.",d(170));
    insertFaq.run("bq-faq-5","Can parents monitor progress?","Yes, Premium+ subscribers can add guardian emails to receive regular progress reports.",d(165));
    insertFaq.run("bq-faq-6","Is there a free plan?","Yes! The Basic plan gives you access to all classes and basic math quizzes at no cost.",d(160));
    insertFaq.run("bq-faq-7","How do I reset my password?","Click 'Forgot Password' on the login page and follow the instructions sent to your email.",d(155));
    insertFaq.run("bq-faq-8","Can I use A1Quest on mobile?","Yes, A1Quest is fully responsive and works on all devices including phones and tablets.",d(150));

    const insertFeedback = sqlite.prepare(`INSERT INTO bq_feedback (_id,fullName,email,message,createdAt) VALUES (?,?,?,?,?)`);
    insertFeedback.run("bq-fb-1","Demo User","demo@example.com","Great platform! I have learned so much about mathematics.",d(20));
    insertFeedback.run("bq-fb-2","Jane Smith","jane@example.com","The step-by-step lessons make math so easy to understand.",d(15));
    insertFeedback.run("bq-fb-3","Mike Johnson","mike@example.com","The video tutorials are excellent for visual learners.",d(10));

    const insertLB = sqlite.prepare(`INSERT INTO bq_leaderboard (_id,user_id,userName,points,createdAt) VALUES (?,?,?,?,?)`);
    const lb = [
      ["bq-lb-1","bq-user-3","mike_learner",2850,d(1)],
      ["bq-lb-2","bq-user-1","demouser",2400,d(2)],
      ["bq-lb-3","bq-user-2","jane123",1850,d(3)],
      ["bq-lb-4","bq-user-4","sarah_quiz",1200,d(4)],
      ["bq-lb-5","bq-user-6","parent_user",800,d(5)],
      ["bq-lb-6","bq-user-5","unverified_user",300,d(6)],
    ];
    for (const l of lb) insertLB.run(...l);

    const insertStreak = sqlite.prepare(`INSERT INTO bq_streaks (_id,user_id,date,createdAt) VALUES (?,?,?,?)`);
    for (let i = 0; i < 7; i++) {
      insertStreak.run(`bq-streak-${i+1}`,"bq-user-1",new Date(now.getTime() - i * 86400000).toISOString().split("T")[0],d(i));
    }

    const enr = sqlite.prepare(`INSERT INTO bq_enrollments (_id,user_id,topic_id,createdAt) VALUES (?,?,?,?)`);
    enr.run("bq-enr-1","bq-user-1","bq-topic-1",d(80));
    enr.run("bq-enr-2","bq-user-1","bq-topic-2",d(60));
    enr.run("bq-enr-3","bq-user-1","bq-topic-3",d(40));
    enr.run("bq-enr-4","bq-user-2","bq-topic-1",d(50));
    enr.run("bq-enr-5","bq-user-2","bq-topic-2",d(30));
    enr.run("bq-enr-6","bq-user-3","bq-topic-4",d(20));

    const bk = sqlite.prepare(`INSERT INTO bq_bookmarks (_id,user_id,lesson_id,createdAt) VALUES (?,?,?,?)`);
    bk.run("bq-bm-1","bq-user-1","bq-lesson-1",d(5));
    bk.run("bq-bm-2","bq-user-1","bq-lesson-4",d(4));
    bk.run("bq-bm-3","bq-user-2","bq-lesson-7",d(3));

    const brd = sqlite.prepare(`INSERT INTO bq_broadcasts (_id,admin_id,message,type,createdAt) VALUES (?,?,?,?,?)`);
    brd.run("bq-brd-1","bq-admin-1","Welcome to A1Quest! Start your mathematics learning journey today.","in-app",d(30));
    brd.run("bq-brd-2","bq-admin-1","New lessons on Differentiation are now available!","push",d(15));
    brd.run("bq-brd-3","bq-admin-2","Weekend quiz challenge: Test your knowledge of Trigonometry!","in-app",d(7));
  }
};
