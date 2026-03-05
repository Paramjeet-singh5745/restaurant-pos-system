/* =========================================================
   ENTERPRISE RESTAURANT POS SYSTEM – FINAL VERSION
   SQL SERVER - SINGLE FILE COMPLETE STRUCTURE
========================================================= */

---------------------------------------------------------
-- 1️⃣ DATABASE
---------------------------------------------------------
IF DB_ID('RestaurantPOS') IS NOT NULL
DROP DATABASE RestaurantPOS;
GO  

CREATE DATABASE RestaurantPOS;
GO

USE RestaurantPOS;
GO          

---------------------------------------------------------
-- 2️⃣ SCHEMAS
---------------------------------------------------------
CREATE SCHEMA auth;
GO
CREATE SCHEMA master;
GO
CREATE SCHEMA orders;
GO
CREATE SCHEMA kitchen;
GO
CREATE SCHEMA billing;
GO

/* =========================================================
   3️⃣ RESTAURANT AUTH MODULE
========================================================= */

CREATE TABLE auth.Restaurants (
    restaurant_id INT IDENTITY(1,1) PRIMARY KEY,
    restaurant_name VARCHAR(150) NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(15) UNIQUE,
    address VARCHAR(255),

    reset_token VARCHAR(255) NULL,
    reset_token_expiry DATETIME NULL,
    reset_otp NVARCHAR(10) NULL,
    reset_otp_expiry DATETIME NULL,

    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE()
);
GO

/* =========================================================
   4️⃣ USERS / STAFF MODULE
========================================================= */

CREATE TABLE auth.Users (
    user_id INT IDENTITY(1001,1) PRIMARY KEY,
    restaurant_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    role VARCHAR(30),

    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),

    CONSTRAINT UQ_User UNIQUE (restaurant_id, username),

    CONSTRAINT CK_Users_Role
    CHECK (role IN ('ADMIN','CASHIER','WAITER','KITCHEN_CHEF')),

    CONSTRAINT FK_Users_Restaurant
    FOREIGN KEY (restaurant_id)
    REFERENCES auth.Restaurants(restaurant_id)
    ON DELETE CASCADE
);
GO

/* =========================================================
   5️⃣ TABLE MANAGEMENT
========================================================= */

CREATE TABLE master.RestaurantTables (
    table_id INT IDENTITY(101,1) PRIMARY KEY,
    restaurant_id INT NOT NULL,
    table_number INT NOT NULL,
    seating_capacity INT NOT NULL,

    table_status VARCHAR(20)
    CHECK (table_status IN ('AVAILABLE','OCCUPIED'))
    DEFAULT 'AVAILABLE',

    is_active BIT DEFAULT 1,

    CONSTRAINT UQ_Table UNIQUE (restaurant_id, table_number),

    CONSTRAINT FK_Tables_Restaurant
    FOREIGN KEY (restaurant_id)
    REFERENCES auth.Restaurants(restaurant_id)
    ON DELETE CASCADE
);
GO

/* =========================================================
   6️⃣ CATEGORY & MENU
========================================================= */

CREATE TABLE master.Categories (
    category_id INT IDENTITY(101,1) PRIMARY KEY,
    restaurant_id INT NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    is_active BIT DEFAULT 1,

    CONSTRAINT UQ_Category UNIQUE (restaurant_id, category_name),

    CONSTRAINT FK_Categories_Restaurant
    FOREIGN KEY (restaurant_id)
    REFERENCES auth.Restaurants(restaurant_id)
    ON DELETE CASCADE
);
GO

CREATE TABLE master.MenuItems (
    item_id INT IDENTITY(101,1) PRIMARY KEY,
    restaurant_id INT NOT NULL,
    category_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),

    is_available BIT DEFAULT 1,
    is_active BIT DEFAULT 1,

    CONSTRAINT UQ_MenuItem UNIQUE (restaurant_id, item_name),

    CONSTRAINT FK_MenuItems_Restaurant
    FOREIGN KEY (restaurant_id)
    REFERENCES auth.Restaurants(restaurant_id)
    ON DELETE CASCADE,

    CONSTRAINT FK_MenuItems_Category
    FOREIGN KEY (category_id)
    REFERENCES master.Categories(category_id)
    ON DELETE CASCADE
);
GO

/* =========================================================
   7️⃣ INVENTORY MODULE
========================================================= */

CREATE TABLE master.Inventory (
    inventory_id INT IDENTITY(1001,1) PRIMARY KEY,
    restaurant_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity_in_stock INT NOT NULL CHECK (quantity_in_stock >= 0),
    reorder_level INT DEFAULT 5,
    last_updated DATETIME DEFAULT GETDATE(),

    CONSTRAINT UQ_Inventory UNIQUE (restaurant_id, item_id),

    CONSTRAINT FK_Inventory_Restaurant
    FOREIGN KEY (restaurant_id)
    REFERENCES auth.Restaurants(restaurant_id)
    ON DELETE CASCADE,

    CONSTRAINT FK_Inventory_Item
    FOREIGN KEY (item_id)
    REFERENCES master.MenuItems(item_id)
    ON DELETE CASCADE
);
GO

/* =========================================================
   8️⃣ CUSTOMERS
========================================================= */

CREATE TABLE master.Customers (
    customer_id INT IDENTITY(1001,1) PRIMARY KEY,
    restaurant_id INT NOT NULL,
    customer_name VARCHAR(150),
    phone VARCHAR(15),
    created_at DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Customer_Restaurant
    FOREIGN KEY (restaurant_id)
    REFERENCES auth.Restaurants(restaurant_id)
    ON DELETE CASCADE
);
GO

/* =========================================================
   9️⃣ ORDERS
========================================================= */

CREATE TABLE orders.Orders (
    order_id INT IDENTITY(101,1) PRIMARY KEY,
    restaurant_id INT NOT NULL,
    table_id INT NOT NULL,
    user_id INT NOT NULL,
    customer_id INT NULL,

    order_status VARCHAR(20)
    CHECK (order_status IN
    ('CREATED','PLACED','SENT_TO_KITCHEN','COMPLETED','CANCELLED'))
    DEFAULT 'CREATED',

    order_datetime DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Orders_Restaurant
    FOREIGN KEY (restaurant_id)
    REFERENCES auth.Restaurants(restaurant_id),

    CONSTRAINT FK_Orders_Table
    FOREIGN KEY (table_id)
    REFERENCES master.RestaurantTables(table_id)
    ON DELETE CASCADE,

    CONSTRAINT FK_Orders_User
    FOREIGN KEY (user_id)
    REFERENCES auth.Users(user_id),

    CONSTRAINT FK_Orders_Customer
    FOREIGN KEY (customer_id)
    REFERENCES master.Customers(customer_id)
);
GO

CREATE TABLE orders.OrderItems (
    order_item_id INT IDENTITY(101,1) PRIMARY KEY,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    item_price DECIMAL(10,2) NOT NULL,

    CONSTRAINT FK_OrderItems_Order
    FOREIGN KEY (order_id)
    REFERENCES orders.Orders(order_id)
    ON DELETE CASCADE,

    CONSTRAINT FK_OrderItems_Item
    FOREIGN KEY (item_id)
    REFERENCES master.MenuItems(item_id)
    ON DELETE CASCADE
);
GO

/* =========================================================
   🔟 KITCHEN
========================================================= */

CREATE TABLE kitchen.KitchenOrders (
    kitchen_order_id INT IDENTITY(101,1) PRIMARY KEY,
    order_id INT UNIQUE NOT NULL,

    kitchen_status VARCHAR(20)
    CHECK (kitchen_status IN ('PENDING','PREPARING','READY'))
    DEFAULT 'PENDING',

    sent_time DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_KitchenOrders_Order
    FOREIGN KEY (order_id)
    REFERENCES orders.Orders(order_id)
    ON DELETE CASCADE
);
GO

/* =========================================================
   1️⃣1️⃣ BILLING
========================================================= */

CREATE TABLE billing.Bills (
    bill_id INT IDENTITY(1001,1) PRIMARY KEY,
    order_id INT UNIQUE NOT NULL,
    sub_total DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    grand_total DECIMAL(10,2) NOT NULL,
    bill_date DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Bills_Order
    FOREIGN KEY (order_id)
    REFERENCES orders.Orders(order_id)
    ON DELETE CASCADE
);
GO

CREATE TABLE billing.Payments (
    payment_id INT IDENTITY(1001,1) PRIMARY KEY,
    order_id INT UNIQUE NOT NULL,

    payment_method VARCHAR(20),
    payment_status VARCHAR(20),

    payment_date DATETIME DEFAULT GETDATE(),

    CONSTRAINT CK_Payment_Method
    CHECK (payment_method IN ('CASH','ONLINE')),

    CONSTRAINT CK_Payment_Status
    CHECK (payment_status IN ('PAID','FAILED','PENDING')),

    CONSTRAINT FK_Payments_Order
    FOREIGN KEY (order_id)
    REFERENCES orders.Orders(order_id)
    ON DELETE CASCADE
);
GO

/* =========================================================
   1️⃣2️⃣ INVENTORY TRIGGERS
========================================================= */

-- INSERT
CREATE TRIGGER orders.trg_OrderItem_Insert
ON orders.OrderItems
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        LEFT JOIN orders.Orders o ON o.order_id = i.order_id
        LEFT JOIN master.Inventory inv
             ON inv.item_id = i.item_id
            AND inv.restaurant_id = o.restaurant_id
        WHERE inv.inventory_id IS NULL
    )
        THROW 50001, 'Inventory record not found.', 1;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN orders.Orders o ON o.order_id = i.order_id
        JOIN master.Inventory inv
             ON inv.item_id = i.item_id
            AND inv.restaurant_id = o.restaurant_id
        WHERE inv.quantity_in_stock < i.quantity
    )
        THROW 50002, 'Insufficient stock.', 1;

    UPDATE inv
    SET quantity_in_stock = quantity_in_stock - i.quantity,
        last_updated = GETDATE()
    FROM master.Inventory inv
    JOIN inserted i ON inv.item_id = i.item_id
    JOIN orders.Orders o ON o.order_id = i.order_id
    WHERE inv.restaurant_id = o.restaurant_id;
END;
GO

-- UPDATE
CREATE TRIGGER orders.trg_OrderItem_Update
ON orders.OrderItems
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE inv
    SET quantity_in_stock = quantity_in_stock + d.quantity - i.quantity,
        last_updated = GETDATE()
    FROM master.Inventory inv
    JOIN inserted i ON inv.item_id = i.item_id
    JOIN deleted d ON d.order_item_id = i.order_item_id
    JOIN orders.Orders o ON o.order_id = i.order_id
    WHERE inv.restaurant_id = o.restaurant_id;
END;
GO

-- DELETE
CREATE TRIGGER orders.trg_OrderItem_Delete
ON orders.OrderItems
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE inv
    SET quantity_in_stock = quantity_in_stock + d.quantity,
        last_updated = GETDATE()
    FROM master.Inventory inv
    JOIN deleted d ON inv.item_id = d.item_id
    JOIN orders.Orders o ON o.order_id = d.order_id
    WHERE inv.restaurant_id = o.restaurant_id;
END;
GO

/* =========================================================
   1️⃣3️⃣ ORDER CANCEL RESTORE STOCK
========================================================= */

CREATE TRIGGER orders.trg_Order_Cancel
ON orders.Orders
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE inv
    SET quantity_in_stock = quantity_in_stock + oi.quantity,
        last_updated = GETDATE()
    FROM inserted i
    JOIN deleted d ON i.order_id = d.order_id
    JOIN orders.OrderItems oi ON oi.order_id = i.order_id
    JOIN master.Inventory inv
         ON inv.item_id = oi.item_id
        AND inv.restaurant_id = i.restaurant_id
    WHERE i.order_status = 'CANCELLED'
      AND d.order_status <> 'CANCELLED';
END;
GO

/* =========================================================
   1️⃣4️⃣ KITCHEN STATUS AUTO UPDATE ORDER
========================================================= */

CREATE TRIGGER kitchen.trg_UpdateOrderStatus
ON kitchen.KitchenOrders
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT UPDATE(kitchen_status)
        RETURN;

    UPDATE o
    SET order_status =
        CASE k.kitchen_status
            WHEN 'PENDING' THEN 'PLACED'
            WHEN 'PREPARING' THEN 'SENT_TO_KITCHEN'
            WHEN 'READY' THEN 'COMPLETED'
        END
    FROM orders.Orders o
    JOIN inserted k ON o.order_id = k.order_id
    JOIN deleted d ON d.kitchen_order_id = k.kitchen_order_id
    WHERE k.kitchen_status <> d.kitchen_status;
END;
GO