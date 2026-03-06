// require('dotenv').config({ override: true });
// const express = require("express");
// const cors = require("cors");

// const authRoutes = require("./modules/restaurant/restaurant.routes");
// const app = express();

// app.use(cors({
//   origin: "http://localhost:5173",
//   credentials: true
// }));


// app.use(express.json());

// app.use("/api", authRoutes);

// app.listen(5000, () => {
//   console.log("✅ Server running on port 5000");
// });

require("dotenv").config({ override: true });

const express = require("express");
const cors = require("cors");

const authRoutes = require("./modules/restaurant/restaurant.routes");

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    "http://localhost:5173",   // local frontend
    "https://your-frontend.vercel.app"  // replace after Vercel deploy
  ],
  credentials: true
}));

// middleware
app.use(express.json());

// routes
app.use("/api", authRoutes);

// health check route
app.get("/", (req, res) => {
  res.send("🚀 Restaurant POS Backend Running");
});

// Render uses dynamic port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});