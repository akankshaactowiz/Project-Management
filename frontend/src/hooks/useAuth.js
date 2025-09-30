import { useState, useEffect } from "react";

let cachedUser = null; // cached user across components

export function useAuth() {
  const [user, setUser] = useState(cachedUser);
  const [loading, setLoading] = useState(!cachedUser);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/auth/profile`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      cachedUser = data; // store in cache
      setUser(data);
      setError(null);
    } catch (err) {
      console.error(err);
      cachedUser = null;
      setUser(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!cachedUser) fetchUser();
  }, []);

  return { user, loading, error, refetch: fetchUser };
}
