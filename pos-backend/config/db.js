require("dotenv").config();
const sql = require("mssql");

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  authentication: {
    type: "default",
    options: {
      userName: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
  },
  options: {
    trustServerCertificate: process.env.DB_TRUST_CERT === "true",
  },
};

let poolPromise;

async function connectDB() {
  try {
    console.log("🔹 Connecting to the Server...");
    poolPromise = await sql.connect(config);
    console.log("✅ SQL Server connected");
    return poolPromise;
  } catch (error) {
    console.log("❌ Database connection error:", error);
  }
}

poolPromise = connectDB();

module.exports = {
  sql,
  poolPromise,
};