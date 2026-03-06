
const model = require("./restaurant.model");
const { hashPassword, comparePassword } = require("../../utils/hash");
const { generateToken } = require("../../utils/jwt");

const sql = require("mssql");
const db = require("../../config/db");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


/**
 * Create Razorpay order
 * @param {number} amount - Amount in paise
 * @returns {Promise<object>}
 */
exports.createRazorpayOrderService = async (amount) => {
  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
    payment_capture: 1,
  });
  return order;
};

/**
 * Verify Razorpay payment
 * @param {string} orderId 
 * @param {string} paymentId 
 * @param {string} signature 
 * @returns {boolean}
 */
exports.verifyRazorpayPayment = (orderId, paymentId, signature) => {
  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generated_signature === signature;
};

exports.getRestaurantById = async (restaurantId) => {
  const pool = await db.poolPromise;
  const result = await pool.request()
    .input("restaurantId", sql.Int, restaurantId)
    .query(`
      SELECT 
        restaurant_id,
        restaurant_name,
        owner_name,
        email,
        phone,
        address,
        is_active,
        created_at
      FROM auth.Restaurants
      WHERE restaurant_id = @restaurantId
    `);

  return result.recordset[0];
};
exports.registerRestaurant = async (data) => {
  let { email, phone, password } = data;

  // normalize
  email = email.trim().toLowerCase();

  // ✅ Phone validation (exactly 10 digits)
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    const err = new Error("Phone number must be exactly 10 digits");
    err.code = "INVALID_PHONE";
    throw err;
  }

  // ✅ Password validation
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

  if (!passwordRegex.test(password)) {
    const err = new Error(
      "Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character"
    );
    err.code = "INVALID_PASSWORD";
    throw err;
  }

  // ✅ Check duplicate email / phone
  const existing = await model.findByEmailOrPhone(email, phone);

  if (existing.recordset.some((r) => r.email === email)) {
    const err = new Error("Email already exists");
    err.code = "DUPLICATE_EMAIL";
    throw err;
  }

  if (existing.recordset.some((r) => r.phone === phone)) {
    const err = new Error("Phone already exists");
    err.code = "DUPLICATE_PHONE";
    throw err;
  }

  // 🔐 HASH PASSWORD (ONLY HERE 🔥)
  const password_hash = await hashPassword(password);

  // ✅ Insert restaurant
  await model.createRestaurant({
    ...data,
    email,
    password_hash, // hashed ONCE
  });

  return true;
};


exports.loginRestaurant = async (email, password) => {
  email = email.trim().toLowerCase();
  password = password.trim();
  const result = await model.findByEmail(email);

  if (!result.recordset.length) {
    throw new Error("INVALID_LOGIN");
  }

  const restaurant = result.recordset[0];
  // ✅ Compare RAW password with HASH
  const isMatch = await comparePassword(
    password,
    restaurant.password_hash
  );

  if (!isMatch) {
    throw new Error("INVALID_LOGIN");
  }

  const token = generateToken({
    id: restaurant.restaurant_id,
    email: restaurant.email,
    role: "RESTAURANT",
  });

  // ❌ never return hash
  delete restaurant.password_hash;

  return { token, restaurant };
};




exports.registerUserService = async (data, restaurant_id) => {
  const { name, email, phone, password, role } = data;

  /* ================= SAFETY CHECK ================= */
  if (!restaurant_id) {
    throw new Error("Restaurant ID is missing");
  }

  const finalRestaurantId = Number(restaurant_id);
  if (isNaN(finalRestaurantId)) {
    throw new Error("Invalid Restaurant ID");
  }

  /* ================= PHONE VALIDATION ================= */
  if (phone) {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error("Phone number must be exactly 10 digits");
    }
  }

  /* ================= PASSWORD VALIDATION ================= */
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

  if (!passwordRegex.test(password)) {
    throw new Error(
      "Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character"
    );
  }

  /* ================= ROLE VALIDATION ================= */
  const allowedRoles = ["ADMIN", "CASHIER", "WAITER", "KITCHEN_CHEF"];
  const finalRole = role.toUpperCase();

  if (!allowedRoles.includes(finalRole)) {
    throw new Error("Invalid role");
  }

const pool = await db.poolPromise;

  /* ================= CHECK RESTAURANT EXISTS ================= */
  const restaurantCheck = await pool
    .request()
    .input("restaurant_id", sql.Int, finalRestaurantId)
    .query(`
      SELECT restaurant_id
      FROM auth.Restaurants
      WHERE restaurant_id = @restaurant_id
    `);

  if (restaurantCheck.recordset.length === 0) {
    throw new Error("Restaurant does not exist");
  }

  /* ================= DUPLICATE EMAIL CHECK ================= */
  const duplicateCheck = await pool
    .request()
    .input("username", sql.VarChar, email)
    .input("restaurant_id", sql.Int, finalRestaurantId)
    .query(`
      SELECT user_id
      FROM auth.Users
      WHERE username = @username
        AND restaurant_id = @restaurant_id
    `);

  if (duplicateCheck.recordset.length > 0) {
    throw new Error("Email already exists for this restaurant");
  }

  /* ================= PASSWORD HASH ================= */
  const password_hash = await hashPassword(password);

  /* ================= INSERT USER ================= */
  await pool
    .request()
    .input("restaurant_id", sql.Int, finalRestaurantId)
    .input("full_name", sql.VarChar, name)
    .input("username", sql.VarChar, email)
    .input("password_hash", sql.VarChar, password_hash)
    .input("role", sql.VarChar, finalRole)
    .query(`
      INSERT INTO auth.Users
      (restaurant_id, full_name, username, password_hash, role)
      VALUES
      (@restaurant_id, @full_name, @username, @password_hash, @role)
    `);

  return {
    success: true,
    message: "User registered successfully",
  };
};

exports.loginUserService = async (email, password, restaurant_id) => {
const pool = await db.poolPromise;
  // ✅ Fetch employee by username and restaurant_id
  const result = await pool
    .request()
    .input("username", sql.VarChar, email)
    .input("restaurant_id", sql.Int, restaurant_id)
    .query(`
      SELECT *
      FROM auth.Users
      WHERE username = @username
        AND restaurant_id = @restaurant_id
        AND is_active = 1
    `);

  if (result.recordset.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = result.recordset[0];
  

  // ✅ Compare password
  const match = await comparePassword(password, user.password_hash);
  if (!match) {
    throw new Error("Invalid email or password");
  }

  // ✅ Generate JWT token
  const token = generateToken({
    user_id: user.user_id,
    restaurant_id: user.restaurant_id,
    role: user.role,
  });

  return {
    token,
    user: {
      user_id: user.user_id,
      full_name: user.full_name,
      role: user.role,
    },
  };
};



exports.getDashboardByUser = async (userId) => {
  const pool = await db.poolPromise;

  /* ================= GET RESTAURANT ================= */
  const userResult = await pool.request()
    .input("userId", sql.Int, userId)
    .query(`
      SELECT restaurant_id
      FROM auth.Users
      WHERE user_id = @userId
    `);

  if (!userResult.recordset.length) {
    throw new Error("User not found");
  }

  const restaurantId = userResult.recordset[0].restaurant_id;

  /* ================= EARNINGS TODAY ================= */
  const earningsToday = await pool.request()
    .input("restaurantId", sql.Int, restaurantId)
    .query(`
      SELECT ISNULL(SUM(b.grand_total),0) AS total
      FROM billing.Bills b
      JOIN billing.Payments p ON b.order_id = p.order_id
      JOIN orders.Orders o ON o.order_id = b.order_id
      WHERE o.restaurant_id = @restaurantId
      AND p.payment_status = 'PAID'
      AND CAST(b.bill_date AS DATE) = CAST(GETDATE() AS DATE)
    `);

  /* ================= EARNINGS ALL ================= */
  const earningsAll = await pool.request()
    .input("restaurantId", sql.Int, restaurantId)
    .query(`
      SELECT ISNULL(SUM(b.grand_total),0) AS total
      FROM billing.Bills b
      JOIN billing.Payments p ON b.order_id = p.order_id
      JOIN orders.Orders o ON o.order_id = b.order_id
      WHERE o.restaurant_id = @restaurantId
      AND p.payment_status = 'PAID'
    `);

  /* ================= ORDERS TODAY ================= */
  const ordersToday = await pool.request()
    .input("restaurantId", sql.Int, restaurantId)
    .query(`
      SELECT COUNT(*) AS total
      FROM orders.Orders
      WHERE restaurant_id = @restaurantId
      AND CAST(order_datetime AT TIME ZONE 'India Standard Time' AS DATE)
=
CAST(SYSDATETIMEOFFSET() AT TIME ZONE 'India Standard Time' AS DATE)
    `);

  /* ================= ORDERS ALL ================= */
  const ordersAll = await pool.request()
    .input("restaurantId", sql.Int, restaurantId)
    .query(`
      SELECT COUNT(*) AS total
      FROM orders.Orders
      WHERE restaurant_id = @restaurantId
    `);

  /* ================= IN PROGRESS ================= */
  const inProgress = await pool.request()
    .input("restaurantId", sql.Int, restaurantId)
    .query(`
      SELECT COUNT(*) AS total
      FROM orders.Orders
      WHERE restaurant_id = @restaurantId
      AND order_status NOT IN ('COMPLETED','CANCELLED')
    `);

  /* ================= TOTAL CATEGORIES ================= */
  const categories = await pool.request()
    .input("restaurantId", sql.Int, restaurantId)
    .query(`
      SELECT COUNT(*) AS total
      FROM master.Categories
      WHERE restaurant_id = @restaurantId
    `);

  /* ================= TOTAL ITEMS ================= */
  const items = await pool.request()
    .input("restaurantId", sql.Int, restaurantId)
    .query(`
      SELECT COUNT(*) AS total
      FROM master.MenuItems
      WHERE restaurant_id = @restaurantId
    `);

  /* ================= POPULAR DISHES ================= */
  const popular = await pool.request()
    .input("restaurantId", sql.Int, restaurantId)
    .query(`
      SELECT TOP 5
        mi.item_name AS name,
        SUM(oi.quantity) AS total
      FROM orders.OrderItems oi
      JOIN master.MenuItems mi ON oi.item_id = mi.item_id
      JOIN orders.Orders o ON oi.order_id = o.order_id
      JOIN billing.Payments p ON o.order_id = p.order_id
      WHERE o.restaurant_id = @restaurantId
      AND p.payment_status = 'PAID'
      GROUP BY mi.item_name
      ORDER BY total DESC
    `);

  /* ================= ORDER STATUS PIE ================= */
 /* ================= ORDER STATUS (UI FORMAT) ================= */
const orderStatus = await pool.request()
  .input("restaurantId", sql.Int, restaurantId)
  .query(`
    SELECT 
      CASE 
        WHEN order_status IN ('CREATED','PLACED') THEN 'PENDING'
        WHEN order_status IN ('SENT_TO_KITCHEN','PREPARING') THEN 'PREPARING'
        WHEN order_status = 'READY' THEN 'READY'
        WHEN order_status = 'CANCELLED' THEN 'CANCELLED'
        ELSE order_status
      END AS name,
      COUNT(*) AS value
    FROM orders.Orders
    WHERE restaurant_id = @restaurantId
    GROUP BY 
      CASE 
        WHEN order_status IN ('CREATED','PLACED') THEN 'PENDING'
        WHEN order_status IN ('SENT_TO_KITCHEN','PREPARING') THEN 'PREPARING'
        WHEN order_status = 'READY' THEN 'READY'
        WHEN order_status = 'CANCELLED' THEN 'CANCELLED'
        ELSE order_status
      END
  `);

  /* ================= LAST 7 DAYS REVENUE ================= */
  const revenueChart = await pool.request()
    .input("restaurantId", sql.Int, restaurantId)
    .query(`
    WITH Last7Days AS (
    SELECT CAST(DATEADD(DAY, -v.number, CAST(GETDATE() AS DATE)) AS DATE) AS dt
    FROM master..spt_values v
    WHERE v.type = 'P' AND v.number BETWEEN 0 AND 6
)
SELECT 
    FORMAT(l.dt, 'dd MMM') AS date,
    ISNULL(SUM(b.grand_total), 0) AS total
FROM Last7Days l
LEFT JOIN billing.Bills b 
    ON CAST(b.bill_date AS DATE) = l.dt
LEFT JOIN billing.Payments p 
    ON b.order_id = p.order_id
    AND p.payment_status = 'PAID'
LEFT JOIN orders.Orders o 
    ON o.order_id = b.order_id
    AND o.restaurant_id = @restaurantId
GROUP BY l.dt
ORDER BY l.dt;
    `);

  /* ================= ORDERS BY HOUR ================= */
  const ordersByHour = await pool.request()
    .input("restaurantId", sql.Int, restaurantId)
    .query(`
      SELECT 
        DATEPART(HOUR, order_datetime) AS hour,
        COUNT(*) AS total
      FROM orders.Orders
      WHERE restaurant_id = @restaurantId
      AND CAST(order_datetime AT TIME ZONE 'India Standard Time' AS DATE)
=
CAST(SYSDATETIMEOFFSET() AT TIME ZONE 'India Standard Time' AS DATE)
      GROUP BY DATEPART(HOUR, order_datetime)
      ORDER BY hour
    `);

  return {
    earningsToday: earningsToday.recordset[0].total,
    earningsAll: earningsAll.recordset[0].total,
    ordersToday: ordersToday.recordset[0].total,
    ordersAll: ordersAll.recordset[0].total,
    inProgress: inProgress.recordset[0].total,
    totalCategories: categories.recordset[0].total,
    totalItems: items.recordset[0].total,
    popularDishes: popular.recordset,
    revenueChart: revenueChart.recordset,
    orderStatus: orderStatus.recordset,
    ordersByHour: ordersByHour.recordset,
    topItems: popular.recordset
  };
};
exports.createTableService = async ({ restaurant_id, table_number, seating_capacity }) => {
  const existing = await model.getTableByNumber(restaurant_id, table_number);
  if (existing) {
    throw new Error("Table number already exists");
  }

  return await model.createTable({
    restaurant_id,
    table_number,
    seating_capacity
  });
};

exports.getTablesService = async (restaurant_id) => {
  return await model.getTablesByRestaurant(restaurant_id);
};

exports.updateTableService = async (tableId, restaurant_id, data) => {
  const table = await model.getTableById(tableId, restaurant_id);
  if (!table) {
    throw new Error("Table not found");
  }

  await model.updateTable(tableId, restaurant_id, data);
};

exports.deleteTableService = async (tableId, restaurant_id) => {
  const rowsAffected = await model.deleteTable(tableId, restaurant_id);

  if (rowsAffected === 0) {
    throw new Error("Table not found");
  }

  return true;
};



/* ===== GET USERS BY RESTAURANT ===== */
exports.getUsersByRestaurant = async (restaurantId) => {
  try {
    if (!restaurantId) {
      throw new Error("Restaurant ID is required");
    }

    const finalRestaurantId = Number(restaurantId);
    if (isNaN(finalRestaurantId)) {
      throw new Error("Invalid Restaurant ID");
    }

const pool = await db.poolPromise;
    const result = await pool
      .request()
      .input("restaurant_id", sql.Int, finalRestaurantId)
      .query(`
        SELECT 
          user_id,
          full_name,
          username,
          role,
          is_active,
          created_at
        FROM auth.Users
        WHERE restaurant_id = @restaurant_id
        ORDER BY created_at DESC
      `);

    return result.recordset;
  } catch (error) {
    console.error("GET USERS ERROR:", error.message);
    throw error;
  }
};

/* ===== UPDATE USER ===== */
exports.updateUser = async (userId, data) => {
const pool = await db.poolPromise;

  await pool.request()
    .input("user_id", sql.Int, userId)
    .input("full_name", sql.VarChar, data.full_name || "")
    .input("username", sql.VarChar, data.username || "")
    .input("role", sql.VarChar, data.role)
    .input("is_active", sql.Bit, data.is_active ? 1 : 0)
    .query(`
      UPDATE auth.Users
      SET
        full_name = @full_name,
        username = @username,
        role = @role,
        is_active = @is_active
      WHERE user_id = @user_id
    `);
};

/* ===== DELETE USER SERVICE ===== */
exports.deleteUser = async (userId, restaurantId) => {
  if (!userId || !restaurantId) {
    throw new Error("User ID and Restaurant ID are required");
  }

const pool = await db.poolPromise;

  // 1️⃣ Check user exists in same restaurant
  const check = await pool
    .request()
    .input("user_id", sql.Int, userId)
    .input("restaurant_id", sql.Int, restaurantId)
    .query(`
      SELECT user_id
      FROM auth.Users
      WHERE user_id = @user_id
        AND restaurant_id = @restaurant_id
    `);

  if (check.recordset.length === 0) {
    throw new Error("User not found or access denied");
  }

  // 2️⃣ Delete user (HARD DELETE)
  await pool
    .request()
    .input("user_id", sql.Int, userId)
    .query(`
      DELETE FROM auth.Users
      WHERE user_id = @user_id
    `);

  return true;
};


exports.getCategories = async (restaurantId) => {
const pool = await db.poolPromise;
  const res = await pool.request()
    .input("restaurant_id", sql.Int, restaurantId)
    .query(`
SELECT 
category_id,category_name
FROM master.Categories
WHERE restaurant_id = @restaurant_id
    `);
  return res.recordset;
};

exports.createCategory = async (restaurantId, name) => {
const pool = await db.poolPromise;
  await pool.request()
    .input("restaurant_id", sql.Int, restaurantId)
    .input("category_name", sql.VarChar, name)
    .query(`
      INSERT INTO master.Categories (restaurant_id, category_name)
      VALUES (@restaurant_id, @category_name)
    `);
};

exports.updateCategory = async (categoryId, restaurantId, name) => {
const pool = await db.poolPromise;
  await pool.request()
    .input("category_id", sql.Int, categoryId)
    .input("restaurant_id", sql.Int, restaurantId)
    .input("category_name", sql.VarChar, name)
    .query(`
      UPDATE master.Categories
      SET category_name = @category_name
      WHERE category_id = @category_id
        AND restaurant_id = @restaurant_id
    `);
};



exports.deleteCategory = async (categoryId, restaurantId) => {
  const pool = await db.poolPromise;

  const result = await pool.request()
    .input("category_id", sql.Int, categoryId)
    .input("restaurant_id", sql.Int, restaurantId)
    .query(`
      DELETE FROM master.Categories
      WHERE category_id = @category_id
      AND restaurant_id = @restaurant_id
    `);

  if (result.rowsAffected[0] === 0) {
    throw new Error("Category not found");
  }

  return true;
};




/* ===== MENU ITEMS ===== */
// service.js
const sql = require("mssql");
const db = require("../db"); // your db config

exports.getMenuItems = async (restaurantId, categoryId) => {
  try {
    const pool = await db.poolPromise;

    const result = await pool.request()
      .input("restaurant_id", sql.Int, restaurantId)
      .input("category_id", sql.Int, categoryId)
      .query(`
        SELECT item_id, item_name, price, isAvailable
        FROM master.MenuItems
        WHERE restaurant_id = @restaurant_id
          AND category_id = @category_id
      `);

    return result.recordset;
  } catch (error) {
    console.error("Database error in getMenuItems:", error);
    throw new Error("Database query failed");
  }
};

exports.createMenuItem = async (restaurantId, data) => {
  const { category_id, item_name, price } = data;

  if (!category_id || !item_name || !price) {
    throw new Error("All fields are required");
  }

  const pool = await db.poolPromise;

  await pool.request()
    .input("restaurant_id", sql.Int, restaurantId)
    .input("category_id", sql.Int, category_id)
    .input("item_name", sql.VarChar, item_name)
    .input("price", sql.Decimal(10, 2), price)
    .input("isAvailable", sql.Bit, 1) // default true
    .query(`
      INSERT INTO master.MenuItems
      (restaurant_id, category_id, item_name, price, isAvailable)
      VALUES
      (@restaurant_id, @category_id, @item_name, @price, @isAvailable)
    `);
};

exports.updateMenuItem = async (itemId, restaurantId, data) => {
const pool = await db.poolPromise;
  await pool.request()
    .input("item_id", sql.Int, itemId)
    .input("restaurant_id", sql.Int, restaurantId)
    .input("item_name", sql.VarChar, data.item_name)
    .input("price", sql.Decimal(10,2), data.price)
    .input("isAvailable", sql.Bit, data.isAvailable)
    .query(`
      UPDATE master.MenuItems
      SET item_name = @item_name,
          price = @price,
          isAvailable = @isAvailable
      WHERE item_id = @item_id
        AND restaurant_id = @restaurant_id
    `);
};

// exports.deleteMenuItem = async (itemId, restaurantId) => {
//   const pool = await db.poolPromise;

//   const result = await pool.request()
//     .input("item_id", sql.Int, itemId)
//     .input("restaurant_id", sql.Int, restaurantId)
//     .query(`
//       UPDATE master.MenuItems
//       SET isAvailable = 0
//       WHERE item_id = @item_id
//       AND restaurant_id = @restaurant_id
//     `);

//   if (result.rowsAffected[0] === 0) {
//     throw new Error("Item not found");
//   }

//   return true;
// };
exports.deleteMenuItem = async (itemId, restaurantId) => {
  const pool = await db.poolPromise;

  const result = await pool.request()
    .input("item_id", sql.Int, itemId)
    .input("restaurant_id", sql.Int, restaurantId)
    .query(`
      DELETE FROM master.MenuItems
      WHERE item_id = @item_id
      AND restaurant_id = @restaurant_id
    `);

  if (result.rowsAffected[0] === 0) {
    throw new Error("Item not found");
  }

  return true;
};


/* ================= INVENTORY ================= */

exports.getInventory = async (restaurantId) => {
  try {
  const pool = await db.poolPromise; // Ensure 'db' is your config object
    const result = await pool.request()
      .input("restaurantId", sql.Int, restaurantId)
      .query(`
        SELECT 
          m.item_id,
          m.item_name,
          c.category_name,
          i.inventory_id,
          i.quantity_in_stock,
          i.reorder_level,
          CASE WHEN i.inventory_id IS NULL THEN 0 ELSE 1 END AS has_inventory,
          CASE 
            WHEN i.quantity_in_stock IS NOT NULL AND i.quantity_in_stock <= i.reorder_level THEN 1
            ELSE 0
          END AS low_stock
        FROM master.MenuItems m
        JOIN master.Categories c ON m.category_id = c.category_id
        LEFT JOIN master.Inventory i ON i.item_id = m.item_id AND i.restaurant_id = @restaurantId
        WHERE m.restaurant_id = @restaurantId
        ORDER BY c.category_name, m.item_name
      `);
    return result.recordset;
  } catch (err) {
    console.error("SQL Error in getInventory:", err); // This shows the REAL error in your terminal
    throw err;
  }
};
exports.createInventory = async (restaurantId, data) => {
  const { item_id, quantity_in_stock, reorder_level } = data;

const pool = await db.poolPromise;

  await pool.request()
    .input("restaurantId", sql.Int, restaurantId)
    .input("item_id", sql.Int, item_id)
    .input("quantity", sql.Int, quantity_in_stock || 0)
    .input("reorder", sql.Int, reorder_level || 5)
    .query(`
      IF NOT EXISTS (
        SELECT 1 FROM master.Inventory
        WHERE item_id = @item_id AND restaurant_id = @restaurantId
      )
      INSERT INTO master.Inventory
      (restaurant_id, item_id, quantity_in_stock, reorder_level)
      VALUES (@restaurantId, @item_id, @quantity, @reorder)
    `);

  return { message: "Inventory created successfully" };
};

exports.updateInventory = async (inventoryId, data) => {
  const pool = await db.poolPromise;
  await pool.request()
    .input("inventoryId", sql.Int, inventoryId)
    .input("quantity", sql.Int, data.quantity_in_stock)
    .input("reorder", sql.Int, data.reorder_level)
    .query(`
      UPDATE master.Inventory
      SET quantity_in_stock = @quantity,
          reorder_level = @reorder,
          last_updated = GETDATE()
      WHERE inventory_id = @inventoryId
    `);

  return { message: "Inventory updated successfully" };
};

exports.deleteInventory = async (inventoryId) => {
const pool = await db.poolPromise;

  await pool.request()
    .input("inventoryId", sql.Int, inventoryId)
    .query(`
      DELETE FROM master.Inventory
      WHERE inventory_id = @inventoryId
    `);
};



exports.getFullMenu = async (restaurantId) => {

const pool = await db.poolPromise;

  const result = await pool.request()
    .input("restaurant_id", sql.Int, restaurantId)
    .query(`
      SELECT 
          c.category_id,
          c.category_name,
          m.item_id,
          m.item_name,
          m.price,
          m.isAvailable,
          ISNULL(i.quantity_in_stock, 0) AS quantity_in_stock
      FROM master.Categories c
      LEFT JOIN master.MenuItems m 
          ON c.category_id = m.category_id
      LEFT JOIN master.Inventory i
          ON m.item_id = i.item_id
      WHERE c.restaurant_id = @restaurant_id
      ORDER BY c.category_id
    `);

  const rows = result.recordset;

  // Group by category
  const grouped = [];

  rows.forEach(row => {
    let category = grouped.find(c => c.category_id === row.category_id);

    if (!category) {
      category = {
        category_id: row.category_id,
        category_name: row.category_name,
        items: []
      };
      grouped.push(category);
    }

    if (row.item_id) {
      category.items.push({
        item_id: row.item_id,
        item_name: row.item_name,
        price: row.price,
        isAvailable: row.isAvailable,
        quantity_in_stock: row.quantity_in_stock
      });
    }
  });

  return grouped;
};




exports.createOrderService = async (restaurant_id, user_id, orderData) => {
  const pool = await db.poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    /* ===============================
       VALIDATIONS
    =============================== */
    if (!orderData.table_id) throw new Error("table_id is required");
    if (!orderData.customer || !orderData.customer.phone)
      throw new Error("Customer information is required");
    if (!orderData.items || orderData.items.length === 0)
      throw new Error("Order must contain items");

    /* ===============================
       1️⃣ CREATE OR FIND CUSTOMER
    =============================== */
    let customer_id;
    const checkCustomerRequest = new sql.Request(transaction);

    const existingCustomer = await checkCustomerRequest
      .input("restaurant_id_check", sql.Int, restaurant_id)
      .input("phone_check", sql.VarChar(20), orderData.customer.phone)
      .query(`
        SELECT TOP 1 customer_id
        FROM master.Customers
        WHERE restaurant_id = @restaurant_id_check
        AND phone = @phone_check
      `);

    if (existingCustomer.recordset.length > 0) {
      customer_id = existingCustomer.recordset[0].customer_id;
    } else {
      const insertCustomerRequest = new sql.Request(transaction);
      const newCustomer = await insertCustomerRequest
        .input("restaurant_id_new", sql.Int, restaurant_id)
        .input("customer_name", sql.VarChar(100), orderData.customer.customer_name)
        .input("phone_new", sql.VarChar(20), orderData.customer.phone)
        .query(`
          INSERT INTO master.Customers
          (restaurant_id, customer_name, phone)
          OUTPUT INSERTED.customer_id
          VALUES (@restaurant_id_new, @customer_name, @phone_new)
        `);
      customer_id = newCustomer.recordset[0].customer_id;
    }

    /* ===============================
       2️⃣ INSERT ORDER
    =============================== */
    const orderRequest = new sql.Request(transaction);
    const orderResult = await orderRequest
      .input("restaurant_id", sql.Int, restaurant_id)
      .input("table_id", sql.Int, orderData.table_id)
      .input("user_id", sql.Int, user_id)
      .input("customer_id", sql.Int, customer_id)
      .input("order_status", sql.VarChar(20), "CREATED") // default status
      .query(`
        INSERT INTO orders.Orders
        (restaurant_id, table_id, user_id, customer_id, order_status)
        OUTPUT INSERTED.order_id
        VALUES (@restaurant_id, @table_id, @user_id, @customer_id, @order_status)
      `);

    const order_id = orderResult.recordset[0].order_id;

    /* ===============================
       3️⃣ INSERT ORDER ITEMS
    =============================== */
    for (let item of orderData.items) {
      const itemRequest = new sql.Request(transaction);
      await itemRequest
        .input("order_id", sql.Int, order_id)
        .input("item_id", sql.Int, item.item_id)
        .input("quantity", sql.Int, item.quantity)
        .input("item_price", sql.Decimal(10, 2), Number(item.price))
        .query(`
          INSERT INTO orders.OrderItems
          (order_id, item_id, quantity, item_price)
          VALUES (@order_id, @item_id, @quantity, @item_price)
        `);
    }

    /* ===============================
       4️⃣ INSERT PAYMENT RECORD
    =============================== */
    const paymentMethodRaw = (orderData.payment_method || "cash")
      .toString()
      .trim()
      .toUpperCase();
    const paymentMethod = paymentMethodRaw === "CASH" ? "CASH" : "ONLINE";

    const paymentRequest = new sql.Request(transaction);
    await paymentRequest
      .input("order_id", sql.Int, order_id)
      .input("payment_method", sql.VarChar(20), paymentMethod)
      .input("payment_status", sql.VarChar(20), "PAID") // default pending
      .query(`
        INSERT INTO billing.Payments
        (order_id, payment_method, payment_status)
        VALUES (@order_id, @payment_method, @payment_status)
      `);

      /* ===============================
   4️⃣ CALCULATE BILL
================================ */

// Calculate subtotal from OrderItems
const billCalcRequest = new sql.Request(transaction);

const billData = await billCalcRequest
  .input("order_id", sql.Int, order_id)
  .query(`
    SELECT SUM(quantity * item_price) AS sub_total
    FROM orders.OrderItems
    WHERE order_id = @order_id
  `);

const sub_total = billData.recordset[0].sub_total || 0;

const tax_rate = 0.05; // 5% tax (change if needed)
const tax_amount = sub_total * tax_rate;
const discount = 0;
const grand_total = sub_total + tax_amount - discount;

// Insert into billing.Bills
const billInsertRequest = new sql.Request(transaction);

await billInsertRequest
  .input("order_id", sql.Int, order_id)
  .input("sub_total", sql.Decimal(10, 2), sub_total)
  .input("tax_amount", sql.Decimal(10, 2), tax_amount)
  .input("discount", sql.Decimal(10, 2), discount)
  .input("grand_total", sql.Decimal(10, 2), grand_total)
  .query(`
    INSERT INTO billing.Bills
    (order_id, sub_total, tax_amount, discount, grand_total)
    VALUES (@order_id, @sub_total, @tax_amount, @discount, @grand_total)
  `);
    /* ===============================
       5️⃣ INSERT INTO KITCHEN TABLE
    =============================== */
    const kitchenRequest = new sql.Request(transaction);
    await kitchenRequest
      .input("order_id", sql.Int, order_id)
      .input("kitchen_status", sql.VarChar(20), "PENDING") // default PENDING
      .query(`
        INSERT INTO kitchen.KitchenOrders
        (order_id, kitchen_status)
        VALUES (@order_id, @kitchen_status)
      `);

    /* ===============================
       COMMIT TRANSACTION
    =============================== */
    await transaction.commit();

    return {
      message: "Order, Payment & Kitchen record created successfully",
      order_id,
      payment_method: paymentMethod,
      payment_status: "PENDING",
      kitchen_status: "PENDING",
    };
  } catch (error) {
    console.error("REAL SQL ERROR:", error);
    if (transaction._aborted !== true) await transaction.rollback();
    throw error;
  }
};


/* ========== CUSTOMER SERVICES ========== */
exports.createCustomer = async (restaurant_id, data) => {
const pool = await db.poolPromise;
  const result = await pool.request()
    .input("restaurant_id", sql.Int, restaurant_id)
    .input("customer_name", sql.VarChar, data.customer_name)
    .input("phone", sql.VarChar, data.phone)
    .query(`
      INSERT INTO master.Customers
      (restaurant_id, customer_name, phone)
      OUTPUT INSERTED.*
      VALUES (@restaurant_id, @customer_name, @phone)
    `);

  return result.recordset[0];
};

exports.getCustomers = async (restaurant_id) => {
const pool = await db.poolPromise;
  const result = await pool.request()
    .input("restaurant_id", sql.Int, restaurant_id)
    .query(`
      SELECT *
      FROM master.Customers
      WHERE restaurant_id = @restaurant_id
      ORDER BY created_at DESC
    `);

  return result.recordset;
};

/* ========== PAYMENT SERVICES ========== */
exports.createPayment = async (data) => {
const pool = await db.poolPromise;
  const result = await pool.request()
    .input("order_id", sql.Int, data.order_id)
    .input("payment_method", sql.VarChar, data.payment_method)
    .input("payment_status", sql.VarChar, data.payment_status)
    .query(`
      INSERT INTO billing.Payments
      (order_id, payment_method, payment_status)
      OUTPUT INSERTED.*
      VALUES (@order_id, @payment_method, @payment_status)
    `);

  return result.recordset[0];
};

exports.getPaymentByOrder = async (orderId) => {
const pool = await db.poolPromise;
  const result = await pool.request()
    .input("order_id", sql.Int, orderId)
    .query(`
      SELECT *
      FROM billing.Payments
      WHERE order_id = @order_id
    `);

  return result.recordset[0];
};







exports.getOrdersService = async (restaurantId, kitchenStatus = null, search = null) => {
  const pool = await db.poolPromise;
  const request = pool.request();

  request.input("restaurantId", sql.Int, restaurantId);
  request.input("kitchenStatus", sql.VarChar(20), kitchenStatus);
  request.input("search", sql.VarChar(100), search ? `%${search}%` : null);

  const query = `
    SELECT 
    o.order_id,
    o.order_status,
     FORMAT(o.order_datetime, 'yyyy-MM-dd HH:mm:ss') AS order_datetime,
    t.table_number,
    u.full_name AS waiter_name,
    ISNULL(c.customer_name, 'Walk-in') AS customer_name,
    k.kitchen_status,

    -- Count items properly
    (
        SELECT COUNT(*) 
        FROM orders.OrderItems oi 
        WHERE oi.order_id = o.order_id
    ) AS total_items,

    -- Use bill grand total (with tax)
    ISNULL(b.grand_total, 0) AS grand_total

FROM orders.Orders o

INNER JOIN kitchen.KitchenOrders k 
    ON o.order_id = k.order_id

INNER JOIN master.RestaurantTables t 
    ON o.table_id = t.table_id

INNER JOIN auth.Users u 
    ON o.user_id = u.user_id

LEFT JOIN master.Customers c 
    ON o.customer_id = c.customer_id

LEFT JOIN billing.Bills b 
    ON o.order_id = b.order_id

WHERE 
    o.restaurant_id = @restaurantId
    AND (@kitchenStatus IS NULL OR k.kitchen_status = @kitchenStatus)
    AND (
        @search IS NULL
        OR c.customer_name LIKE @search
        OR CAST(o.order_id AS VARCHAR) LIKE @search
        OR CAST(t.table_number AS VARCHAR) LIKE @search
    )

ORDER BY o.order_datetime DESC;
  `;

  const result = await request.query(query);
  return result.recordset;
};


exports.getOrderDetails = async (orderId) => {
  const pool = await db.poolPromise;

  const result = await pool.request()
    .input("orderId", sql.Int, orderId)
    .query(`
    SELECT 
    oi.order_item_id,
    o.order_id,
    k.kitchen_status,
    t.table_number,
    ISNULL(c.customer_name, 'Walk-in') AS customer_name,
    mi.item_name,
    oi.quantity,
    oi.item_price,
    (oi.quantity * oi.item_price) AS item_total,

    -- Bill data
    ISNULL(b.sub_total, 0) AS sub_total,
    ISNULL(b.tax_amount, 0) AS tax_amount,
    ISNULL(b.grand_total, 0) AS grand_total

FROM orders.Orders o

JOIN kitchen.KitchenOrders k 
    ON o.order_id = k.order_id

JOIN master.RestaurantTables t 
    ON o.table_id = t.table_id

LEFT JOIN master.Customers c 
    ON o.customer_id = c.customer_id

JOIN orders.OrderItems oi 
    ON o.order_id = oi.order_id

JOIN master.MenuItems mi 
    ON oi.item_id = mi.item_id

LEFT JOIN billing.Bills b 
    ON o.order_id = b.order_id

WHERE o.order_id = @orderId;
    `);

  return result.recordset;
};





exports.fetchAllPayments = async (restaurantId) => {
  const pool = await db.poolPromise;

  const result = await pool.request()
    .input("restaurant_id", restaurantId)
    .query(`
   SELECT 
    p.payment_id,
    p.order_id,
    o.restaurant_id,
    t.table_number,
    u.full_name AS cashier,
    ISNULL(c.customer_name, 'Walk-in') AS customer_name,
    ISNULL(b.grand_total, 0) AS grand_total,
    p.payment_method,
    p.payment_status,
    p.payment_date

FROM billing.Payments p

JOIN orders.Orders o 
    ON p.order_id = o.order_id

LEFT JOIN master.RestaurantTables t 
    ON o.table_id = t.table_id

LEFT JOIN auth.Users u 
    ON o.user_id = u.user_id

LEFT JOIN master.Customers c 
    ON o.customer_id = c.customer_id

LEFT JOIN billing.Bills b
    ON o.order_id = b.order_id

WHERE o.restaurant_id = @restaurant_id

ORDER BY p.payment_date DESC;
    `);

  return result.recordset;
};


exports.fetchPaymentDetails = async (restaurantId, orderId) => {
  const pool = await db.poolPromise;

  const result = await pool.request()
    .input("restaurant_id", restaurantId)
    .input("order_id", orderId)   // ✅ YOU FORGOT THIS BEFORE
    .query(`
     SELECT 
    p.payment_id,
    p.order_id,
    t.table_number,
    u.full_name AS cashier,
    ISNULL(c.customer_name, 'Walk-in') AS customer_name,
    ISNULL(b.grand_total, 0) AS grand_total,
    p.payment_method,
    p.payment_status,
 CONVERT(VARCHAR, p.payment_date, 120) AS payment_date

FROM billing.Payments p

JOIN orders.Orders o 
    ON p.order_id = o.order_id

LEFT JOIN master.RestaurantTables t 
    ON o.table_id = t.table_id

LEFT JOIN auth.Users u 
    ON o.user_id = u.user_id

LEFT JOIN master.Customers c 
    ON o.customer_id = c.customer_id

LEFT JOIN billing.Bills b
    ON o.order_id = b.order_id

WHERE o.restaurant_id = @restaurant_id 
AND o.order_id = @order_id;
    `);

  return result.recordset[0];  // ✅ RETURN SINGLE OBJECT
};


/* ================= GET KITCHEN ORDERS ================= */
exports.getKitchenOrders = async (
  restaurantId,
  status = null,
  search = null
) => {
  const pool = await db.poolPromise;
  const request = pool.request();

  request.input("restaurant_id", sql.Int, restaurantId);
  request.input("status", sql.VarChar(20), status);
  request.input("search", sql.VarChar(100), search ? `%${search}%` : null);

  const result = await request.query(`
    SELECT 
      k.kitchen_order_id,
      k.order_id,
      k.kitchen_status,
      FORMAT(k.sent_time, 'yyyy-MM-dd HH:mm:ss') AS sent_time,
      t.table_number,
      u.full_name AS waiter_name,
      ISNULL(c.customer_name, 'Walk-in') AS customer_name,
      ISNULL(SUM(oi.quantity), 0) AS total_items
    FROM kitchen.KitchenOrders k
    JOIN orders.Orders o ON k.order_id = o.order_id
    JOIN master.RestaurantTables t ON o.table_id = t.table_id
    JOIN auth.Users u ON o.user_id = u.user_id
    LEFT JOIN master.Customers c ON o.customer_id = c.customer_id
    LEFT JOIN orders.OrderItems oi ON oi.order_id = o.order_id
    WHERE 
      o.restaurant_id = @restaurant_id
      AND (@status IS NULL OR k.kitchen_status = @status)
      AND (
        @search IS NULL
        OR c.customer_name LIKE @search
        OR CAST(k.order_id AS VARCHAR) LIKE @search
        OR CAST(t.table_number AS VARCHAR) LIKE @search
        OR u.full_name LIKE @search
      )
    GROUP BY 
      k.kitchen_order_id,
      k.order_id,
      k.kitchen_status,
      k.sent_time,
      t.table_number,
      u.full_name,
      c.customer_name
    ORDER BY k.sent_time DESC
  `);

  const orders = result.recordset;

  /* ===== Fetch items for each order ===== */
  for (let order of orders) {
    const itemsResult = await pool.request()
      .input("order_id", sql.Int, order.order_id)
      .query(`
        SELECT 
          oi.order_item_id,
          oi.item_id,
          oi.quantity,
          oi.item_price,
          mi.item_name
        FROM orders.OrderItems oi
        JOIN master.MenuItems mi ON oi.item_id = mi.item_id
        WHERE oi.order_id = @order_id
      `);

    order.items = itemsResult.recordset || [];
  }

  return orders;
};

/* ================= UPDATE STATUS ================= */
exports.updateKitchenStatus = async (orderId, status) => {
  const pool = await db.poolPromise;

  const validStatuses = ["PENDING", "PREPARING", "READY"];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid kitchen status");
  }

  await pool.request()
    .input("order_id", sql.Int, orderId)
    .input("status", sql.VarChar(20), status)
    .query(`
      UPDATE kitchen.KitchenOrders
      SET kitchen_status = @status
      WHERE order_id = @order_id
    `);

  return true;
};

exports.cancelOrderService = async (orderId, restaurantId) => {
  const pool = await db.poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const request = new sql.Request(transaction);

    request.input("order_id", sql.Int, orderId);
    request.input("restaurant_id", sql.Int, restaurantId);

    // 1️⃣ Cancel Order
    const orderResult = await request.query(`
        UPDATE orders.Orders
        SET order_status = 'CANCELLED'
        WHERE order_id = @order_id
          AND restaurant_id = @restaurant_id
          AND order_status NOT IN ('CANCELLED','COMPLETED');

        SELECT @@ROWCOUNT AS affectedRows;
    `);

    const affectedRows = orderResult.recordset[0].affectedRows;

    if (affectedRows === 0) {
      throw new Error("Order cannot be cancelled (already completed or cancelled).");
    }

    // 2️⃣ Update Kitchen Status Also
    await request.query(`
        UPDATE kitchen.KitchenOrders
        SET kitchen_status = 'CANCELLED'
        WHERE order_id = @order_id
          AND kitchen_status NOT IN ('READY','CANCELLED');
    `);

    await transaction.commit();

    return { message: "Order cancelled successfully and kitchen updated." };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

exports.getRestaurantDetailsService = async (restaurantId) => {
  const pool = await db.poolPromise;

  const result = await pool.request()
    .input("restaurant_id", sql.Int, restaurantId)
    .query(`
      SELECT 
        restaurant_id,
        restaurant_name,
        owner_name,
        phone
      FROM auth.Restaurants
      WHERE restaurant_id = @restaurant_id
    `);

  if (result.recordset.length === 0) {
    throw new Error("Restaurant not found");
  }

  return result.recordset[0];
};


exports.globalSearchService = async (restaurantId, searchText) => {
  const pool = await db.poolPromise;

  const result = await pool.request()
    .input("restaurant_id", sql.Int, restaurantId)
    .input("search", sql.VarChar, `%${searchText}%`)
    .query(`
      SELECT 
        o.order_id,
        t.table_number,
        c.customer_name,
        o.order_status,
        o.created_at
      FROM orders.Orders o
      LEFT JOIN restaurant.Tables t 
        ON o.table_id = t.table_id
      LEFT JOIN customers.Customers c 
        ON o.customer_id = c.customer_id
      WHERE o.restaurant_id = @restaurant_id
      AND (
        CAST(o.order_id AS VARCHAR) LIKE @search
        OR c.customer_name LIKE @search
        OR CAST(t.table_number AS VARCHAR) LIKE @search
      )
      ORDER BY o.created_at DESC
    `);

  return result.recordset;
};


