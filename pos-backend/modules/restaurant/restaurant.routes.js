/**
 * =====================================================
 * Restaurant Routes
 * =====================================================
 */

const express = require("express");
const router = express.Router();

const Razorpay = require("razorpay");
const crypto = require("crypto");

const controller = require("./restaurant.controller");
const employeeAuth = require("../../middlewares/auth.middleware");
const { allowRoles } = require("../../middlewares/role.middleware");

/* =====================================================
   Razorpay Configuration
===================================================== */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* =====================================================
   RESTAURANT AUTH
===================================================== */

router.post("/register", controller.register);
router.post("/login", controller.login);

/* =====================================================
   EMPLOYEE AUTH
===================================================== */

router.post(
  "/employees/register/:restaurantId",
  controller.registerEmployee
);

router.post(
  "/employees/login/:restaurantId",
  controller.loginEmployee
);

/* =====================================================
   RESTAURANT INFO
===================================================== */

router.get(
  "/restaurant",
  employeeAuth,
  controller.getRestaurant
);

router.get(
  "/restaurant/details",
  employeeAuth,
  controller.getRestaurantDetails
);

/* =====================================================
   DASHBOARD
===================================================== */

router.get(
  "/home/:userId",
  employeeAuth,
  controller.dashboardByUser
);

/* =====================================================
   TABLE MANAGEMENT
===================================================== */

router.get(
  "/tables",
  employeeAuth,
  allowRoles("ADMIN", "WAITER"),
  controller.getTables
);

router.post(
  "/tables",
  employeeAuth,
  allowRoles("ADMIN"),
  controller.createTable
);

router.patch(
  "/tables/:tableId",
  employeeAuth,
  allowRoles("ADMIN", "WAITER"),
  controller.updateTable
);

router.delete(
  "/tables/:tableId",
  employeeAuth,
  allowRoles("ADMIN", "WAITER"),
  controller.deleteTable
);

/* =====================================================
   USER MANAGEMENT (ADMIN ONLY)
===================================================== */

router.get(
  "/users",
  employeeAuth,
  allowRoles("ADMIN"),
  controller.getUsers
);

router.patch(
  "/users/:userId",
  employeeAuth,
  allowRoles("ADMIN"),
  controller.updateUser
);

router.delete(
  "/users/:userId",
  employeeAuth,
  allowRoles("ADMIN"),
  controller.deleteUser
);

/* =====================================================
   MENU & CATEGORY MANAGEMENT
===================================================== */

// Categories
router.get(
  "/menu/categories",
  employeeAuth,
  allowRoles("ADMIN"),
  controller.getCategories
);

router.post(
  "/menu/categories",
  employeeAuth,
  allowRoles("ADMIN"),
  controller.createCategory
);

router.patch(
  "/menu/categories/:categoryId",
  employeeAuth,
  allowRoles("ADMIN"),
  controller.updateCategory
);

router.delete(
  "/menu/categories/:categoryId",
  employeeAuth,
  allowRoles("ADMIN"),
  controller.deleteCategory
);

// Menu Items
router.get(
  "/menu/items/:categoryId",
  employeeAuth,
  allowRoles("ADMIN"),
  controller.getMenuItems
);

router.post(
  "/menu/items",
  employeeAuth,
  allowRoles("ADMIN"),
  controller.createMenuItem
);

router.patch(
  "/menu/items/:itemId",
  employeeAuth,
  allowRoles("ADMIN"),
  controller.updateMenuItem
);

router.delete(
  "/menu/items/:itemId",
  employeeAuth,
  allowRoles("ADMIN"),
  controller.deleteMenuItem
);

// Full Menu (All Roles)
router.get(
  "/menu/full",
  employeeAuth,
  controller.getFullMenu
);

/* =====================================================
   INVENTORY MANAGEMENT
===================================================== */

router.get(
  "/inventory",
  employeeAuth,
  allowRoles("ADMIN"),
  controller.getInventory
);

router.post(
  "/inventory",
  employeeAuth,
  allowRoles("ADMIN"),
  controller.createInventory
);

router.patch(
  "/inventory/:inventoryId",
  employeeAuth,
  allowRoles("ADMIN"),
  controller.updateInventory
);

router.delete(
  "/inventory/:inventoryId",
  employeeAuth,
  allowRoles("ADMIN"),
  controller.deleteInventory
);

/* =====================================================
   CUSTOMER MANAGEMENT
===================================================== */

router.get(
  "/customers",
  employeeAuth,
  allowRoles("ADMIN", "WAITER"),
  controller.getCustomers
);

router.post(
  "/customers",
  employeeAuth,
  allowRoles("ADMIN", "WAITER"),
  controller.createCustomer
);

/* =====================================================
   ORDERS
===================================================== */

router.post(
  "/orders/create",
  employeeAuth,
  controller.createOrder
);

router.get(
  "/orders",
  employeeAuth,
  controller.getOrders
);

router.get(
  "/orders-detailed/:id",
  employeeAuth,
  controller.getOrderDetails
);

router.get(
  "/bill/:id",
  employeeAuth,
  controller.getBill
);

// Cancel Order
router.put(
  "/cancel/:orderId",
  employeeAuth,
  allowRoles("ADMIN", "WAITER", "CASHIER"),
  controller.cancelOrderController
);

/* =====================================================
   RAZORPAY PAYMENT
===================================================== */

router.post(
  "/razorpay/create-order",
  employeeAuth,
  controller.createRazorpayOrder
);

router.post(
  "/razorpay/verify-payment",
  employeeAuth,
  allowRoles("ADMIN", "WAITER", "CASHIER"),
  controller.verifyPayment
);

/* =====================================================
   PAYMENT LIST & RECEIPTS
===================================================== */

// Get all payments
router.get(
  "/payments-all",
  employeeAuth,
  allowRoles("ADMIN", "CASHIER"),
  controller.getAllPayments
);

// Get payment receipt
router.get(
  "/payments/:orderId",
  employeeAuth,
  allowRoles("ADMIN", "CASHIER"),
  controller.getPaymentDetails
);

/* =====================================================
   KITCHEN MANAGEMENT
===================================================== */

router.get(
  "/kitchen/orders",
  employeeAuth,
  allowRoles("ADMIN", "KITCHEN", "KITCHEN_CHEF"),
  controller.getKitchenOrders
);

router.patch(
  "/kitchen/orders/:orderId/status",
  employeeAuth,
  allowRoles("ADMIN", "KITCHEN","KITCHEN_CHEF"),
  controller.updateKitchenStatus
);

/* =====================================================
   GLOBAL SEARCH
===================================================== */

router.get(
  "/search",
  employeeAuth,
  allowRoles("ADMIN", "CASHIER", "WAITER", "KITCHEN"),
  controller.globalSearch
);

/* =====================================================
   EXPORT ROUTER
===================================================== */

module.exports = router;