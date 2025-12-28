// src/pages/login/Login.jsx
import React, { useState, useContext } from "react";
import PageWrapper from "../../components/PageWrapper";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      Swal.fire("Incomplete Details", "Please fill all required fields!", "error");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire("Login Failed", data.msg || "Invalid credentials", "error");
        return;
      }

      // ✅ SINGLE SOURCE OF TRUTH
      login(data.token, data.user);
      // console.log(data.token);
      

      const role = data.user?.role?.toLowerCase();

      Swal.fire("Login Successful!", "Redirecting to your dashboard...", "success");


      if (role === "manager") {
        navigate("/manager/dashboard", { replace: true });
      } else if (role === "employee") {
        navigate("/employee/dashboard", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);
      Swal.fire("Server Error", "Unable to connect to server.", "error");
    }
  };

  return (
    <PageWrapper>
      <div className="w-screen min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-4">
        {/* Outer card: responsive sizing */}
        <div className="flex flex-col md:flex-row bg-white/70 backdrop-blur-md border-b-2 border-r-2 shadow-lg rounded-xl overflow-hidden max-w-4xl w-full">
          {/* LEFT SIDE — LOGIN FORM */}
          <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-10 bg-white/60">
            <h1 className="text-3xl font-semibold mb-2 text-gray-800">Welcome Back</h1>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Please log in to access your Employee Dashboard
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-md">
              {/* Email */}
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="placeholder-black/50 border-2 text-black border-transparent shadow-black/5 shadow-[0px_0px_10px_0px] hover:border-purple-500 focus:border-pink-500 bg-white p-3 focus:pl-4 mb-3 outline-0 rounded transition-all ease-in-out duration-500 w-full"
                value={formData.email}
                onChange={handleChange}
                required
              />

              {/* Password */}
              <div className="relative mb-3 w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className="placeholder-black/50 border-2 text-black border-transparent shadow-black/5 shadow-[0px_0px_10px_0px] p-3 w-full outline-0 pr-10 hover:border-purple-500 focus:border-pink-500 rounded bg-white focus:pl-4 transition-all ease-in-out duration-500"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black transition"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
                </button>
              </div>

              {/* Forget password */}
              <div className="w-full flex justify-end mb-3">
                <a
                  href="/forget-password"
                  className="text-sm text-gray-700 hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              {/* Login button */}
              <button
                type="submit"
                className="bg-black text-white p-3 rounded-md hover:bg-gray-800 transition cursor-pointer w-full"
              >
                Login
              </button>

              {/* Google login */}
              <div className="flex flex-col justify-center items-center mt-4">
                <p className="text-gray-600 text-[13px] mb-2">Or login with</p>
                <button
                  type="button"
                  className="bg-white border border-gray-300 cursor-pointer text-black p-3 w-full flex justify-center items-center gap-2 rounded-md hover:bg-gray-100 transition max-w-md"
                >
                  <FcGoogle /> Google
                </button>
              </div>
            </form>

            {/* Register redirect */}
            <p className="text-sm text-gray-700 mt-6 text-center">
              Don’t have an account?{" "}
              <Link to="/register" className="text-purple-600 underline">
  Create one
</Link>
            </p>
          </div>

          {/* RIGHT SIDE — ILLUSTRATION / TEXT */}
          <div className="w-full md:w-1/2 flex flex-col justify-center items-center text-white p-8 md:p-10 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Login Portal</h2>
            <p className="text-base md:text-lg text-center mb-6 px-4 md:px-10">
              Manage your tasks, view updates, and stay connected with your team in one place.
            </p>
            <img
              src="./website-logo.png"
              alt="Login illustration"
              className="w-36 md:w-48 drop-shadow-lg"
            />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Login;
