import { Navigate } from "react-router-dom";
import { isRestaurantLoggedIn } from "../utils/auth";

const RestaurantProtected = ({ children }) => {
  if (!isRestaurantLoggedIn()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default RestaurantProtected;
