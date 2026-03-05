import { Navigate } from "react-router-dom";
import { getRestaurantId, isEmployeeLoggedIn } from "../utils/auth";

const ProtectedRoute = ({ children }) => {
  if (!isEmployeeLoggedIn()) {
    return <Navigate to={`/auth/${getRestaurantId()}`} replace />;
  }
  return children;
};

export default ProtectedRoute;
