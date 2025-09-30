import { useAuth } from "../hooks/useAuth.js";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute({ requiredModule, requiredAction, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (requiredModule && requiredAction) {
    // console.log("Checking permissions for:", requiredModule, requiredAction);
    // console.log("User permissions:", user.permissions);

    const modulePerm = user.permissions?.find((m) => {
      // console.log("Checking module:", m.module); //Debugging
      return m.module.toLowerCase() === requiredModule.toLowerCase();
    });

    // console.log("Found module permission:", modulePerm); //Debugging

    const actions = modulePerm?.actions || [];

    if (!modulePerm) {
      // console.log("Module not found"); //Debugging
      return <Navigate to="/" replace state={{ from: location }} />;
    }

    if (!actions.includes(requiredAction)) {
      // console.log("Action not allowed", actions); //Debugging
      return <Navigate to="/" replace state={{ from: location }} />;
    }
  }

  return children || <Outlet />;
}
