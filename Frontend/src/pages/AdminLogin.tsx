import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

import api from "../lib/api";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  admin: Admin;
  message?: string;
}

interface LoginErrorResponse {
  message?: string;
  error?: string;
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const { data } = await api.post<LoginResponse>("/admin/login", {
        email,
        password,
      });

      if (!data.success || !data.token || !data.admin) {
        setError("Login failed. Please try again.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("admin", JSON.stringify(data.admin));
      localStorage.setItem("adminAuth", data.token);

      navigate("/admin", { replace: true });
    } catch (err) {
      if (axios.isAxiosError<LoginErrorResponse>(err)) {
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else if (err.response?.data?.error) {
          setError(err.response.data.error);
        } else if (err.request) {
          setError(
            "Unable to reach the server. Please check your connection and try again.",
          );
        } else {
          setError("Something went wrong. Please try again.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#fdf6f0] px-4">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl border border-[#eadfd6] bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-[#2f241f]">Meika Admin</h1>
            <p className="mt-2 text-[#7b685d]">Sign in to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>

              <div className="flex items-center gap-3 rounded-2xl border px-4 py-3">
                <Mail size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@meika.com"
                  className="w-full outline-none"
                  autoComplete="email"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Password</label>

              <div className="flex items-center gap-3 rounded-2xl border px-4 py-3">
                <Lock size={18} />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="********"
                  className="w-full outline-none"
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-gray-500 transition-colors hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 p-3 text-sm text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#b46b4e] py-3 font-medium text-white disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
            </button>

            <Link
              to="/"
              className="flex items-center justify-center gap-2 pt-2 text-sm font-medium text-[#7b685d] transition hover:text-[#c96f4f]"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
