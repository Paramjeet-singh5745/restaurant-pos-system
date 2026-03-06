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

require('dotenv').config({ override: true });
const express = require("express");
const cors = require("cors");

const authRoutes = require("./modules/restaurant/restaurant.routes");

const app = express();


/* ✅ PROPER CORS FIX */
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://restaurant-pos-system-psl1.vercel.app"
  ],
  methods: ["GET","POST","PUT","DELETE"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
}));

app.use(express.json());

/* ROUTES */
app.use("/api", authRoutes);

/* TEST ROUTE */
app.get("/", (req, res) => {
  res.send("🚀 Restaurant POS Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});