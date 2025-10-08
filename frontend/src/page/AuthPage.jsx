import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa6";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {toast} from 'react-hot-toast';

import Img from "../assets/login-illustration.jpg";

export default function AuthPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
   const [showPassword, setShowPassword] = useState(false);
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
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));

  // Clear error for the specific field
  if (errors[name]) {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }
};


  // ✅ Submit handler
const handleSubmit = async (e) => {
  e.preventDefault();

  const newErrors = {};

  // ✅ Detailed Email Validation
  if (!formData.email) {
    newErrors.email = "Email is required";
  } else if (!formData.email.includes("@")) {
    newErrors.email = "Email must contain @";
  } else {
    const parts = formData.email.split("@");
    const local = parts[0];
    const domain = parts[1];

    if (!domain) {
      newErrors.email = "Email must have a domain (example.com)";
    } else if (!domain.includes(".")) {
      newErrors.email = "Domain must contain a dot (.)";
    } else if (/[^a-zA-Z0-9@._-]/.test(formData.email)) {
      newErrors.email = "Email contains invalid characters";
    } else if (local.length === 0) {
      newErrors.email = "Email must have characters before @";
    } else if (domain.split(".")[0].length === 0) {
      newErrors.email = "Domain must have characters before dot";
    } else if (domain.split(".")[1]?.length === 0) {
      newErrors.email = "Domain must have characters after dot";
    }
  }

  // ✅ Password validation
  if (!formData.password) newErrors.password = "Password is required";

  setErrors(newErrors);

  if (Object.keys(newErrors).length > 0) return;

  setLoading(true);
  setMessage(null);

  try {
    const res = await fetch(
      `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/auth/login`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );

    const data = await res.json();

    if (res.ok) {
      setErrors({});
      setIsSuccess(true);
      toast.success("Login successful!");
      setTimeout(() => navigate("/home"), 1000);
    } else {
      if (data.errors) {
        setErrors((prev) => ({ ...prev, ...data.errors }));
      } else {
        setMessage(data.message || "Invalid credentials");
      }
      setIsSuccess(false);
    }
  } catch (err) {
    console.error("Login error:", err);
    setMessage("Network error");
  } finally {
    setLoading(false);
  }
};

  // if (checkingAuth) {
  //   return <div>Loading...</div>;
  // } 

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
{/* Email */}
<div className="relative">
  <FaEnvelope className="absolute left-3 top-3 text-fuchsia-700" />
  <input
    type="text"
    name="email"
    placeholder="Email"
    className="w-full pl-10 pr-4 py-2 border-b focus:outline-none"
    value={formData.email}
    onChange={handleChange}
  />
  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
</div>

{/* Password */}
<div className="relative">
  {/* Lock Icon */}
  <FaLock className="absolute left-3 top-3 text-fuchsia-700" />

  {/* Password Input */}
  <input
    type={showPassword ? "text" : "password"}
    name="password"
    placeholder="Password"
    className="w-full pl-10 pr-10 py-2 border-b focus:outline-none"
    value={formData.password}
    onChange={(e) => {
      handleChange(e);
      if (errors.password) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.password;
          return newErrors;
        });
      }
    }}
  />

  {/* Toggle Show/Hide Button */}
  <button
    type="button"
    onClick={() => setShowPassword((prev) => !prev)}
    className="absolute right-3 top-2.5 text-gray-500 hover:text-fuchsia-700"
  >
    {showPassword ? <FaEyeSlash /> : <FaEye />}
  </button>

  {/* Error Message */}
  {errors.password && (
    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
  )}
</div>



{message && <p className="text-red-500 text-sm mt-1">{message}</p>}


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

          {/* {message && (
            <p
              className={`mt-4 text-center ${
                isSuccess ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )} */}
        </div>
      </div>
    </div>
  );
}
