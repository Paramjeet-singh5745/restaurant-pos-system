require('dotenv').config({ override: true });
const express = require("express");
const cors = require("cors");

const authRoutes = require("./modules/restaurant/restaurant.routes");
const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));


app.use(express.json());

app.use("/api", authRoutes);

app.listen(5000, () => {
  console.log("✅ Server running on port 5000");
});
