import React, { createContext, useContext, useState, useEffect } from "react";

// Create context
const UserContext = createContext();

// Custom hook to use context
export const useUser = () => useContext(UserContext);

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch logged-in user on mount (for session persistence)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/auth/profile`, {
          method: "GET",
          credentials: "include", // include cookies if using JWT in cookie
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();
        setUser(data); // store user info
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Function to update user after login/logout
  const updateUser = (userData) => setUser(userData);

  return (
    <UserContext.Provider value={{ user, loading, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};
