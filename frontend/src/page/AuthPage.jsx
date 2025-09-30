import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa6";
import Img from "../assets/login-illustration.jpg";

export default function AuthPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Check if user already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/auth/profile`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (res.ok) {
          navigate("/home", { replace: true });
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // ✅ Handle input change
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(
        `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/auth/login`,
        {
          method: "POST",
          credentials: "include", // cookie-based session
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setMessage("Login successful!");
        setTimeout(() => navigate("/home"), 1000);
      } else {
        setIsSuccess(false);
        setMessage(data.message || "Invalid credentials");
      }
    } catch (err) {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen items-stretch justify-center bg-white">
      {/* Left - Illustration */}
      <div
        className="hidden md:flex w-1/2 items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${Img})` }}
      />

      {/* Right - Auth Card */}
      <div className="flex-1 flex bg-gray-100 items-center justify-center">
        <div className="w-full max-w-md p-10">
          <h2 className="text-2xl mb-4 font-semibold text-gray-800 mb-1 text-center">
            Sign In
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3 text-fuchsia-700" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full pl-10 pr-4 py-2 border-b focus:outline-none"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-fuchsia-700" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full pl-10 pr-4 py-2 border-b focus:outline-none"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="text-right text-sm">
              <a href="#" className="text-blue-600 hover:underline">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-800 text-white py-2 rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {message && (
            <p
              className={`mt-4 text-center ${
                isSuccess ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
