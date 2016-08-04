const APP_CLIENT_ID = process.env.APP_CLIENT_ID || "";
const DATABASE_URL = process.env.DATABASE_URL||
"postgres:postgres:postgres@localhost:5432/theOpportunisticShopper";
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL||
"postgres:postgres:postgres@localhost:5432/theOpportunisticShopperTest";
const PORT = process.env.PORT || 3000;

exports.APP_CLIENT_ID = APP_CLIENT_ID;
exports.DATABASE_URL = DATABASE_URL;
exports.PORT = PORT;
