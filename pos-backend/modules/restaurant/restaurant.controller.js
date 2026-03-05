const service = require("./restaurant.service");

const crypto = require("crypto");

exports.getRestaurant = async (req, res) => {
  try {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not attached to request",
      });
    }

    const restaurantId = Number(
      req.user.restaurant_id || req.user.id
    );


    if (!restaurantId || isNaN(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Restaurant ID",
      });
    }

    const restaurant = await service.getRestaurantById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: restaurant,
    });

  } catch (error) {
    console.error("🔥 BACKEND CRASH:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.register = async (req, res) => {
    try {
      const result = await service.registerRestaurant(req.body);
      
      return res.status(201).json({
        success: true,
        message: "Restaurant registered successfully",
        data: result,
      });
    } catch (err) {
      // Expected validation errors (DO NOT LOG)
      if (err.code === "INVALID_PHONE") {
        return res.status(400).json({
          success: false,
          message: "Phone number must be exactly 10 digits.",
        });
      }

      if (err.code === "DUPLICATE_EMAIL") {
        return res.status(400).json({
          success: false,
          message: "Email already registered.",
        });
      }

      if (err.code === "DUPLICATE_PHONE") {
        return res.status(400).json({
          success: false,
          message: "Phone number already registered.",
        });
      }

      if (err.code === "INVALID_PASSWORD") {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 8 characters and include uppercase, number, and special character.",
        });
      }

      // ONLY unexpected errors should be logged
      console.error("Unexpected error:", err);

      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  };

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { token, restaurant } = await service.loginRestaurant(email, password);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      restaurant:restaurant.restaurant_id,
    });
  } catch (err) {
    console.log("Login error:", err); // <--- log actual error
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }
};


// -------- EMPLOYEE --------

exports.registerEmployee = async (req, res) => {
  try {
    const { restaurantId } = req.params; // ✅ CORRECT

    if (!restaurantId) {
      return res.status(400).json({
        message: "Restaurant ID missing in URL",
      });
    }

    await service.registerUserService(req.body, restaurantId);

    res.status(201).json({
      message: "Employee registered successfully",
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.loginEmployee = async (req, res) => {
  try {
    const { restaurantId } = req.params; // from URL
    const { email, password } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    const { token, user } = await service.loginUserService(
      email,
      password,
      restaurantId
    );

    // ✅ Respond with token and user data
    res.json({
      success: true,
      message: "Login successful",
      token,
      user, // includes user_id
    });
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
};

exports.employeeHome = (req, res) => {
  res.json({
    message: "Employee Authorized",
    user: req.user
  });
};




exports.dashboardByUser = async (req, res) => {
  try {
    if (!req.user?.user_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.user_id;

    const data = await service.getDashboardByUser(userId);

    res.status(200).json(data);
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};

/* ================= TABLE CONTROLLERS ================= */

exports.createTable = async (req, res) => {
  try {
    const table = await service.createTableService({
      ...req.body,
      restaurant_id: req.user.restaurant_id
    });

    res.status(201).json({
      success: true,
      message: "Table created successfully",
      table
    });

  } catch (err) {

    // SQL duplicate error code
    if (err.number === 2627 || err.number === 2601) {
      return res.status(400).json({
        success: false,
        message: "Table number already exists"
      });
    }

    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

exports.getTables = async (req, res) => {
  try {
    const restaurant_id = req.user.restaurant_id;

    const tables = await service.getTablesService(restaurant_id);

    res.status(200).json({
      success: true,
      tables
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateTable = async (req, res) => {
  try {
    await service.updateTableService(
      req.params.tableId,
      req.user.restaurant_id,
      req.body
    );

    res.json({
      success: true,
      message: "Table updated successfully"
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteTable = async (req, res) => {
  try {
    await service.deleteTableService(
      req.params.tableId,
      req.user.restaurant_id
    );

    res.json({
      success: true,
      message: "Table deleted successfully"
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* ===== GET USERS ===== */
exports.getUsers = async (req, res) => {
  try {
    if (!req.user || !req.user.restaurant_id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token or restaurant not found",
      });
    }

    const restaurantId = req.user.restaurant_id;

    const users = await service.getUsersByRestaurant(restaurantId);

    res.json({
      success: true,
      data: users,
    });
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};
/* ===== UPDATE USER ===== */
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params; // ✅ FROM URL PARAM
    const { full_name, username, role, is_active } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID missing",
      });
    }

    await service.updateUser(userId, {
      full_name,
      username,
      role,
      is_active,
    });

    res.json({
      success: true,
      message: "User updated successfully",
    });
  } catch (err) {
    console.error("UPDATE USER ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

/* ===== DELETE USER ===== */
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const restaurantId = req.user.restaurant_id; // ✅ FROM TOKEN

    await service.deleteUser(userId, restaurantId);

    res.status(200).json({
      message: "User deleted successfully",
      selfDeleted:String(userId) === String(req.user.user_id)

    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(400).json({ message: error.message });
  }
};




exports.getCategories = async (req, res) => {
  const data = await service.getCategories(req.user.restaurant_id);
  res.json({ data });
};

exports.createCategory = async (req, res) => {
  const { category_name } = req.body;
  await service.createCategory(req.user.restaurant_id, category_name);
  res.json({ message: "Category created" });
};

exports.updateCategory = async (req, res) => {
  await service.updateCategory(
    req.params.categoryId,
    req.user.restaurant_id,
    req.body.category_name
  );
  res.json({ message: "Category updated" });
};

exports.deleteCategory = async (req, res) => {
  await service.deleteCategory(
    req.params.categoryId,
    req.user.restaurant_id
  );
  res.json({ message: "Category deleted" });
};

/* ===== MENU ITEMS ===== */

exports.getMenuItems = async (req, res) => {
  const data = await service.getMenuItems(
    req.user.restaurant_id,
    req.params.categoryId
  );
  res.json({ data });
};

exports.createMenuItem = async (req, res) => {
  await service.createMenuItem(req.user.restaurant_id, req.body);
  res.json({ message: "Item added" });
};

exports.updateMenuItem = async (req, res) => {
  await service.updateMenuItem(
    req.params.itemId,
    req.user.restaurant_id,
    req.body
  );
  res.json({ message: "Item updated" });
};

exports.deleteMenuItem = async (req, res) => {
  await service.deleteMenuItem(
    req.params.itemId,
    req.user.restaurant_id
  );
  res.json({ message: "Item deleted" });
};


exports.getInventory = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant_id;
    const data = await service.getInventory(restaurantId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createInventory = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant_id;
    const result = await service.createInventory(restaurantId, req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const result = await service.updateInventory(inventoryId, req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteInventory = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    await service.deleteInventory(inventoryId);
    res.json({ message: "Inventory deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getFullMenu = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant_id; // from token
    const menu = await service.getFullMenu(restaurantId);

    res.status(200).json({
      success: true,
      data: menu
    });

  } catch (error) {
    console.error("MENU FETCH ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch menu"
    });
  }
};




exports.createOrder = async (req, res) => {
  try {

    const restaurant_id = req.user.restaurant_id;
    const user_id = req.user.user_id;

    const order = await service.createOrderService(
      restaurant_id,
      user_id,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




exports.getBill = async (req, res) => {
  try {
    const bill = await service.getBill(req.params.id);

    res.json({
      success: true,
      data: bill
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ========== CUSTOMER CONTROLLERS ========== */

exports.createCustomer = async (req, res) => {
  try {
    const restaurant_id = req.user.restaurant_id;

    const customer = await service.createCustomer(
      restaurant_id,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.getCustomers = async (req, res) => {
  try {
    const restaurant_id = req.user.restaurant_id;

    const customers = await service.getCustomers(restaurant_id);

    res.json({
      success: true,
      data: customers
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/* ========== PAYMENT CONTROLLERS ========== */

exports.createPayment = async (req, res) => {
  try {
    const payment = await service.createPayment(req.body);

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      data: payment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.getPaymentByOrder = async (req, res) => {
  try {
    const payment = await service.getPaymentByOrder(req.params.orderId);

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const Razorpay = require("razorpay");

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1️⃣ Create Razorpay Order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const options = {
      amount, // in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    if (!order) throw new Error("Order creation failed");

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2️⃣ Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const crypto = require("crypto");

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    // Use backend secret key
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Razorpay Verify Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



exports.getOrders = async (req, res) => {
  try {
    const restaurant_id = req.user.restaurant_id;
    const { kitchenStatus, search } = req.query;

    const data = await service.getOrdersService(
      restaurant_id,
      kitchenStatus,
      search
    );

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// GET Order Details by ID
exports.getOrderDetails = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Valid Order ID is required",
      });
    }

    const orderDetails = await service.getOrderDetails(orderId);

    if (!orderDetails || orderDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order details fetched successfully",
      data: orderDetails,
    });

  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


/* ================= GET ALL PAYMENTS ================= */
exports.getAllPayments = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant_id;

    const payments = await service.fetchAllPayments(restaurantId);

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });

  } catch (error) {
    console.error("Get Payments Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
    });
  }
};

exports.getPaymentDetails = async (req, res) => {
  try {
     const restaurantId = req.user.restaurant_id;

    const orderId = parseInt(req.params.orderId);

    if (!restaurantId || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant or order ID"
      });
    }

    const data = await service.fetchPaymentDetails(
      restaurantId,
      orderId
    );

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "No payment record found"
      });
    }

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error("Payment Details Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


/* ================= GET ================= */
exports.getKitchenOrders = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant_id;
    const { status, search } = req.query;

    const data = await service.getKitchenOrders(
      restaurantId,
      status || null,
      search || null
    );

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error("Kitchen Orders Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ================= UPDATE ================= */
exports.updateKitchenStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    await service.updateKitchenStatus(orderId, status);

    res.status(200).json({
      success: true,
      message: "Kitchen status updated"
    });

  } catch (error) {
    console.error("Kitchen Update Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.cancelOrderController = async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await service.cancelOrderService(
      parseInt(orderId),
      req.user.restaurant_id
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};


exports.getRestaurantDetails = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant_id;

    const result = await service.getRestaurantDetailsService(restaurantId);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.globalSearch = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant_id;
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query required" });
    }

    const data = await service.globalSearchService(restaurantId, q);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
