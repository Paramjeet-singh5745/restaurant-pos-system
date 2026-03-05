
/* ================= RESTAURANT AUTH ================= */

// Save restaurant token AND restaurant ID
export const setRestaurantAuth = (token, restaurantId) => {
  if (!token || !restaurantId) {
    console.error("❌ Missing restaurant token or restaurantId");
    return;
  }

  // Always store as string (important fix)
  localStorage.setItem("restaurant_token", String(token));
  localStorage.setItem("restaurant_id", String(restaurantId));
};

// Get restaurant token
export const getRestaurantAuth = () => {
  return localStorage.getItem("restaurant_token");
};

// Get restaurant ID
export const getRestaurantId = () => {
  return localStorage.getItem("restaurant_id");
};

// Check if restaurant is logged in
export const isRestaurantLoggedIn = () => {
  return !!getRestaurantAuth() && !!getRestaurantId();
};


/* ================= EMPLOYEE AUTH ================= */

// Save employee token, ID, name & role
export const setEmployeeAuth = (
  token,
  employeeId,
  employeeName,
  role = "Staff"
) => {
  if (!token || !employeeId) {
    console.error("❌ Missing employee auth data");
    return;
  }

  localStorage.setItem("employee_token", String(token));
  localStorage.setItem("employee_id", String(employeeId));
  localStorage.setItem("employee_name", String(employeeName || ""));
  localStorage.setItem("employee_role", String(role));
};

// Get employee token
export const getEmployeeAuth = () => {
  return localStorage.getItem("employee_token");
};

// Get employee ID
export const getEmployeeId = () => {
  return localStorage.getItem("employee_id");
};

// Get employee name
export const getEmployeeName = () => {
  return localStorage.getItem("employee_name");
};

// Get employee role
export const getEmployeeRole = () => {
  return localStorage.getItem("employee_role");
};

// Check if employee is logged in
export const isEmployeeLoggedIn = () => {
  return !!getEmployeeAuth() && !!getEmployeeId();
};


/* ================= TABLE AUTH ================= */

// Save last created/selected table (optional)
export const setTableInfo = (tableId, tableNumber) => {
  if (!tableId) return;

  localStorage.setItem("table_id", String(tableId));

  if (tableNumber) {
    localStorage.setItem("table_number", String(tableNumber));
  }
};

// Get table ID
export const getTableId = () => {
  return localStorage.getItem("table_id");
};

// Get table number
export const getTableNumber = () => {
  return localStorage.getItem("table_number");
};

// Clear table info
export const clearTableInfo = () => {
  localStorage.removeItem("table_id");
  localStorage.removeItem("table_number");
};


/* ================= COMMON ================= */

export const clearAuth = () => {

  localStorage.removeItem("employee_token");
  localStorage.removeItem("employee_id");
  localStorage.removeItem("employee_name");
  localStorage.removeItem("employee_role");

  clearTableInfo();
};  