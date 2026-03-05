const { poolPromise, sql } = require("../../config/db");
const { hashPassword } = require("../../utils/hash");



exports.findByEmail = async (email) => {
  const pool = await poolPromise;
  return pool.request()
    .input("email", sql.VarChar, email)
    .query(`
      SELECT *
      FROM auth.Restaurants
      WHERE email = @email
    `);
};

/**
 * 🔍 Find restaurant by email OR phone (for duplicate check)
 */
exports.findByEmailOrPhone = async (email, phone) => {
  const pool = await poolPromise;
  return pool.request()
    .input("email", sql.VarChar, email)
    .input("phone", sql.VarChar, phone)
    .query(`
      SELECT email, phone
      FROM auth.Restaurants
      WHERE email = @email OR phone = @phone
    `);
};

/**
 * 🏗 Create restaurant (NO HASHING HERE)
 */
exports.createRestaurant = async (data) => {
  const pool = await poolPromise;
      const hashedPassword = await hashPassword(data.password);

  return pool.request()
    .input("restaurant_name", sql.VarChar, data.restaurant_name)
    .input("owner_name", sql.VarChar, data.owner_name)
    .input("email", sql.VarChar, data.email)
    .input("phone", sql.VarChar, data.phone)
    .input("password_hash", sql.VarChar,hashedPassword)
    .input("address", sql.VarChar, data.address)
    .query(`
      INSERT INTO auth.Restaurants
      (restaurant_name, owner_name, email, phone, password_hash, address)
      VALUES
      (@restaurant_name, @owner_name, @email, @phone, @password_hash, @address)
    `);
};

exports.findUserByEmail = async (email) => {
  const result = await db.request()
    .input("email", sql.VarChar, email)
    .query("SELECT * FROM auth.Users WHERE username = @email");
  return result.recordset[0];
};




exports.createUser = async ({
  restaurant_id,
  full_name,
  username,
  password_hash,
  role
}) => {
  await db.request()
    .input("restaurant_id", sql.Int, restaurant_id)
    .input("full_name", sql.VarChar, full_name)
    .input("username", sql.VarChar, username)
    .input("password_hash", sql.VarChar, password_hash)
    .input("role", sql.VarChar, role.toUpperCase())
    .query(`
      INSERT INTO auth.Users
      (restaurant_id, full_name, username, password_hash, role)
      VALUES
      (@restaurant_id, @full_name, @username, @password_hash, @role)
    `);
};

exports.createOrder = async ({
  restaurant_id,
  table_id,
  user_id
}) => {
  const pool = await poolPromise;
  return pool.request()
    .input("restaurant_id", sql.Int, restaurant_id)
    .input("table_id", sql.Int, table_id)
    .input("user_id", sql.Int, user_id)
    .query(`
      INSERT INTO orders.Orders
      (restaurant_id, table_id, user_id, order_status)
      OUTPUT INSERTED.order_id
      VALUES
      (@restaurant_id, @table_id, @user_id, 'CREATED')
    `);
};

/* =====================================================
   ADD ORDER ITEMS
===================================================== */
exports.addOrderItem = async ({
  order_id,
  item_id,
  quantity,
  item_price
}) => {
  const pool = await poolPromise;
  return pool.request()
    .input("order_id", sql.Int, order_id)
    .input("item_id", sql.Int, item_id)
    .input("quantity", sql.Int, quantity)
    .input("item_price", sql.Decimal(10, 2), item_price)
    .query(`
      INSERT INTO orders.OrderItems
      (order_id, item_id, quantity, item_price)
      VALUES
      (@order_id, @item_id, @quantity, @item_price)
    `);
};

/* =====================================================
   GET ALL ORDERS (ADMIN / CASHIER)
===================================================== */
exports.getOrdersByRestaurant = async (restaurant_id, status) => {
  const pool = await poolPromise;

  let query = `
    SELECT
      o.order_id,
      o.order_status,
      o.order_datetime,
      u.full_name,
      t.table_number,
      SUM(oi.quantity) AS total_items,
      ISNULL(b.grand_total, 0) AS grand_total
    FROM orders.Orders o
    JOIN auth.Users u ON o.user_id = u.user_id
    JOIN master.RestaurantTables t ON o.table_id = t.table_id
    JOIN orders.OrderItems oi ON o.order_id = oi.order_id
    LEFT JOIN billing.Bills b ON o.order_id = b.order_id
    WHERE o.restaurant_id = @restaurant_id
  `;

  if (status) {
    query += ` AND o.order_status = @status`;
  }

  query += `
    GROUP BY
      o.order_id,
      o.order_status,
      o.order_datetime,
      u.full_name,
      t.table_number,
      b.grand_total
    ORDER BY o.order_datetime DESC
  `;

  const request = pool.request()
    .input("restaurant_id", sql.Int, restaurant_id);

  if (status) {
    request.input("status", sql.VarChar, status);
  }

  return request.query(query);
};

/* =====================================================
   GET ORDER DETAILS (CLICK ORDER)
===================================================== */
exports.getOrderDetailsById = async (order_id, restaurant_id) => {
  const pool = await poolPromise;
  return pool.request()
    .input("order_id", sql.Int, order_id)
    .input("restaurant_id", sql.Int, restaurant_id)
    .query(`
      SELECT
        o.order_id,
        o.order_status,
        o.order_datetime,
        u.full_name AS ordered_by,
        t.table_number,
        mi.item_name,
        oi.quantity,
        oi.item_price,
        (oi.quantity * oi.item_price) AS item_total,
        b.sub_total,
        b.tax_amount,
        b.discount,
        b.grand_total,
        p.payment_method,
        p.payment_status
      FROM orders.Orders o
      JOIN auth.Users u ON o.user_id = u.user_id
      JOIN master.RestaurantTables t ON o.table_id = t.table_id
      JOIN orders.OrderItems oi ON o.order_id = oi.order_id
      JOIN master.MenuItems mi ON oi.item_id = mi.item_id
      LEFT JOIN billing.Bills b ON o.order_id = b.order_id
      LEFT JOIN billing.Payments p ON o.order_id = p.order_id
      WHERE o.order_id = @order_id
        AND o.restaurant_id = @restaurant_id
    `);
};

/* =====================================================
   UPDATE ORDER STATUS (ADMIN)
===================================================== */
exports.updateOrderStatus = async (order_id, status) => {
  const pool = await poolPromise;
  return pool.request()
    .input("order_id", sql.Int, order_id)
    .input("status", sql.VarChar, status)
    .query(`
      UPDATE orders.Orders
      SET order_status = @status
      WHERE order_id = @order_id
    `);
};

/* =====================================================
   CANCEL ORDER (ADMIN)
===================================================== */
exports.cancelOrder = async (order_id) => {
  const pool = await poolPromise;
  return pool.request()
    .input("order_id", sql.Int, order_id)
    .query(`
      UPDATE orders.Orders
      SET order_status = 'CANCELLED'
      WHERE order_id = @order_id
    `);
};

/* =====================================================
   SEND ORDER TO KITCHEN
===================================================== */
exports.sendToKitchen = async (order_id) => {
  const pool = await poolPromise;
  return pool.request()
    .input("order_id", sql.Int, order_id)
    .query(`
      INSERT INTO kitchen.KitchenOrders
      (order_id, kitchen_status)
      VALUES
      (@order_id, 'PENDING')
    `);
};



/* =====================================================
   CHECK TABLE NUMBER (DUPLICATE)
===================================================== */
exports.getTableByNumber = async (restaurant_id, table_number) => {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("restaurant_id", sql.Int, restaurant_id)
    .input("table_number", sql.Int, table_number)
    .query(`
      SELECT TOP 1 *
      FROM master.RestaurantTables
      WHERE restaurant_id = @restaurant_id
        AND table_number = @table_number
    `);

  return result.recordset[0];
};

/* =====================================================
   CREATE TABLE
===================================================== */
exports.createTable = async ({ restaurant_id, table_number, seating_capacity }) => {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("restaurant_id", sql.Int, restaurant_id)
    .input("table_number", sql.Int, table_number)
    .input("seating_capacity", sql.Int, seating_capacity)
    .query(`
      INSERT INTO master.RestaurantTables
      (restaurant_id, table_number, seating_capacity)
      OUTPUT INSERTED.*
      VALUES
      (@restaurant_id, @table_number, @seating_capacity)
    `);

  return result.recordset[0];
};

/* =====================================================
   GET ALL TABLES (ADMIN / CASHIER)
===================================================== */
exports.getTablesByRestaurant = async (restaurant_id) => {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("restaurant_id", sql.Int, restaurant_id)
    .query(`
        SELECT
    table_id,
    table_number,
    seating_capacity,
    table_status,
    is_active
  FROM master.RestaurantTables
  WHERE restaurant_id = @restaurant_id
  ORDER BY table_number
    `);

  return result.recordset;
};


exports.getTableById = async (table_id, restaurant_id) => {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("table_id", sql.Int, table_id)
    .input("restaurant_id", sql.Int, restaurant_id)
    .query(`
      SELECT
    table_id,
    table_number,
    seating_capacity,
    table_status,
    is_active
  FROM master.RestaurantTables
  WHERE restaurant_id = @restaurant_id
  ORDER BY table_number
    `);

  return result.recordset[0];
};

/* =====================================================
   UPDATE TABLE (ADMIN ONLY)
===================================================== */
// exports.updateTable = async (table_id, restaurant_id, data) => {
//   const { table_number, seating_capacity, table_status } = data;
//   const pool = await poolPromise;

//   await pool.request()
//     .input("table_id", sql.Int, table_id)
//     .input("restaurant_id", sql.Int, restaurant_id)
//     .input("table_number", sql.Int, table_number || null)
//     .input("seating_capacity", sql.Int, seating_capacity || null)
//     .input("table_status", sql.VarChar, table_status || null)
//     .query(`
//       UPDATE master.RestaurantTables
//       SET
//         table_number = ISNULL(@table_number, table_number),
//         seating_capacity = ISNULL(@seating_capacity, seating_capacity),
//         table_status = ISNULL(@table_status, table_status)
//       WHERE table_id = @table_id
//         AND restaurant_id = @restaurant_id
//     `);

//   return true;
// };


exports.updateTable = async (table_id, restaurant_id, data) => {
  const { table_number, seating_capacity, table_status, is_active } = data;
  const pool = await poolPromise;

  await pool.request()
    .input("table_id", sql.Int, table_id)
    .input("restaurant_id", sql.Int, restaurant_id)
    .input("table_number", sql.Int, table_number || null)
    .input("seating_capacity", sql.Int, seating_capacity || null)
    .input("table_status", sql.VarChar, table_status || null)
    .input("is_active", sql.Bit, is_active ?? null)
    .query(`
      UPDATE master.RestaurantTables
      SET
        table_number = ISNULL(@table_number, table_number),
        seating_capacity = ISNULL(@seating_capacity, seating_capacity),
        table_status = ISNULL(@table_status, table_status),
        is_active = ISNULL(@is_active, is_active)
      WHERE table_id = @table_id
        AND restaurant_id = @restaurant_id
    `);

  return true;
};
/* =====================================================
   DELETE TABLE (ADMIN ONLY)
===================================================== */
exports.deleteTable = async (table_id, restaurant_id) => {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("table_id", sql.Int, Number(table_id))
    .input("restaurant_id", sql.Int, Number(restaurant_id))
    .query(`
 UPDATE master.RestaurantTables
    SET is_active = 0
    WHERE table_id = @table_id
      AND restaurant_id = @restaurant_id;
    `);

  return result.rowsAffected[0]; // return affected rows
};

exports.createCategory = async ({ restaurant_id, category_name }) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input("restaurant_id", sql.Int, restaurant_id)
    .input("category_name", sql.VarChar, category_name)
    .query(`
      INSERT INTO master.Categories (restaurant_id, category_name)
      VALUES (@restaurant_id, @category_name);
      SELECT SCOPE_IDENTITY() AS category_id;
    `);
  return result.recordset[0];
};

exports.createMenuItem = async ({ restaurant_id, item_name, category_id, price }) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input("restaurant_id", sql.Int, restaurant_id)
    .input("item_name", sql.VarChar, item_name)
    .input("category_id", sql.Int, category_id)
    .input("price", sql.Decimal(10, 2), price)
    .query(`
      INSERT INTO master.MenuItems (restaurant_id, item_name, category_id, price)
      VALUES (@restaurant_id, @item_name, @category_id, @price);
      SELECT SCOPE_IDENTITY() AS item_id;
    `);
  return result.recordset[0];
};

exports.createOrder = async ({ restaurant_id, table_id, user_id }) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input("restaurant_id", sql.Int, restaurant_id)
    .input("table_id", sql.Int, table_id)
    .input("user_id", sql.Int, user_id)
    .query(`
      INSERT INTO orders.Orders (restaurant_id, table_id, user_id, order_status)
      OUTPUT INSERTED.order_id
      VALUES (@restaurant_id, @table_id, @user_id, 'CREATED');
    `);
  return result.recordset[0];
};

exports.addOrderItem = async ({ order_id, item_id, quantity, item_price }) => {
  const pool = await poolPromise;
  await pool.request()
    .input("order_id", sql.Int, order_id)
    .input("item_id", sql.Int, item_id)
    .input("quantity", sql.Int, quantity)
    .input("item_price", sql.Decimal(10, 2), item_price)
    .query(`
      INSERT INTO orders.OrderItems (order_id, item_id, quantity, item_price)
      VALUES (@order_id, @item_id, @quantity, @item_price);
    `);
};


exports.saveResetToken = async (email, token, expiry) => {
  const pool = await poolPromise;
  await pool.request()
    .input("email", sql.VarChar, email)
    .input("token", sql.VarChar, token)
    .input("expiry", sql.DateTime, expiry)
    .query(`
      UPDATE auth.Restaurants
      SET reset_token = @token,
          reset_token_expiry = @expiry
      WHERE email = @email
    `);
};

exports.saveOtp = async (email, otp, expiry) => {
  const pool = await poolPromise;
  await pool.request()
    .input("email", sql.VarChar, email)
    .input("otp", sql.VarChar, otp)
    .input("expiry", sql.DateTime, expiry)
    .query(`
      UPDATE auth.Restaurants
      SET reset_otp = @otp,
          reset_otp_expiry = @expiry
      WHERE email = @email
    `);
};

exports.verifyOtp = async (email, otp) => {
  const pool = await poolPromise;
  return pool.request()
    .input("email", sql.VarChar, email)
    .input("otp", sql.VarChar, otp)
    .query(`
      SELECT * FROM auth.Restaurants
      WHERE email = @email
      AND reset_otp = @otp
      AND reset_otp_expiry > GETDATE()
    `);
};

exports.verifyToken = async (email, token) => {
  const pool = await poolPromise;
  return pool.request()
    .input("email", sql.VarChar, email)
    .input("token", sql.VarChar, token)
    .query(`
      SELECT * FROM auth.Restaurants
      WHERE email = @email
      AND reset_token = @token
      AND reset_token_expiry > GETDATE()
    `);
};

exports.updatePassword = async (email, hashed) => {
  const pool = await poolPromise;
  await pool.request()
    .input("email", sql.VarChar, email)
    .input("hash", sql.VarChar, hashed)
    .query(`
      UPDATE auth.Restaurants
      SET password_hash = @hash,
          reset_token = NULL,
          reset_token_expiry = NULL,
          reset_otp = NULL,
          reset_otp_expiry = NULL
      WHERE email = @email
    `);
};

exports.updatePasswordById = async (id, hashed) => {
  const pool = await poolPromise;
  await pool.request()
    .input("id", sql.Int, id)
    .input("hash", sql.VarChar, hashed)
    .query(`
      UPDATE auth.Restaurants
      SET password_hash = @hash
      WHERE restaurant_id = @id
    `);
};