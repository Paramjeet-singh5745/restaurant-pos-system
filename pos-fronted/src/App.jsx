
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

/* ================= PAGES ================= */
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Orders from "./pages/Orders";
import Tables from "./pages/Tables";
import Menu from "./pages/Menu";
import Payemnt from "./pages/Payemnt";
import More from "./pages/More";

/* ============ ADMIN (MORE) ============ */
import UserDetails from "./components/more/UserDetails";
import MenuManagement from "./components/more/MenuManagement";
import Inventory from "./components/more/Inventory";

/* ================= SHARED ================= */
import Header from "./components/shared/Header";
import RestaurantRegister from "./pages/RestaurantRegister";
import RestaurantLogin from "./pages/RestaurantLogin";

/* ================= ROUTE GUARDS ================= */
import ProtectedRoute from "./routes/ProtectedRoute";
import RestaurantProtected from "./routes/RestaurantProtected";

import { CartProvider } from "./components/context/CartContext";

/* ================= UTILS ================= */
import {
  isEmployeeLoggedIn,
  isRestaurantLoggedIn,
  getRestaurantId,
} from "./utils/auth";
import KitchenPage from "./pages/KitchenPage";





/* ================= HEADER CONTROLLER ================= */
const HeaderController = () => {
  const location = useLocation();

  const hideHeaderRoutes = ["/", "/restaurant-register"];
  const isAuthPage = location.pathname.startsWith("/auth");

  if (
    !isEmployeeLoggedIn() ||
    hideHeaderRoutes.includes(location.pathname) ||
    isAuthPage
  ) {
    return null;
  }

  return <Header />;
};

/* ================= APP ================= */
function App() {
  return (
        <CartProvider>

    <Router>
      <HeaderController />

      <Routes>
        {/* ========== PUBLIC ========== */}
        <Route path="/" element={<RestaurantLogin />} />
        <Route path="/restaurant-register" element={<RestaurantRegister />} />

        {/* ========== RESTAURANT AUTH ========== */}
        <Route
          path="/auth/:restaurantId"
          element={
            <RestaurantProtected>
              <Auth />
            </RestaurantProtected>
          }
        />

        {/* ========== EMPLOYEE ========== */}
        <Route
          path="/home/:userId"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tables"
          element={
            <ProtectedRoute>
              <Tables />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <Payemnt />
            </ProtectedRoute>
          }
        />

        <Route
          path="/menu/:tableId"
          element={
            <ProtectedRoute>
              <Menu />
            </ProtectedRoute>
          }
        />
        <Route
  path="/kitchen"
  element={
    <ProtectedRoute>
      <KitchenPage />
    </ProtectedRoute>
  }
/>


        {/* ========== MORE (ADMIN) ========== */}
        <Route
          path="/more"
          element={
            <ProtectedRoute>
              <More />
            </ProtectedRoute>
          }
        />

        <Route
          path="/more/users"
          element={
            <ProtectedRoute>
              <UserDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/more/menu"
          element={
            <ProtectedRoute>
              <MenuManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/more/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />

        {/* ========== FALLBACK ========== */}
        <Route
          path="*"
          element={
            isEmployeeLoggedIn() ? (
              <Navigate
                to={`/home/${localStorage.getItem("employee_id")}`}
                replace
              />
            ) : isRestaurantLoggedIn() ? (
              <Navigate to={`/auth/${getRestaurantId()}`} replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

      </Routes>
    </Router>
            </CartProvider>

  );
}

export default App;
