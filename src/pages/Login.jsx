import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import useColorMode from "../hooks/useColorMode";
import { dataUser } from "../data/data";
import { useDispatch } from "react-redux";
import { loginUser } from "../store/authSlice";

const Login = () => {
  const [formData, setFormData] = useState({
    password: "",
    email: "",
    captcha: "",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    const user = dataUser.find((a) => a.email === formData.email);
    if (!user) {
      return setError("Invalid username or password");
    }
    if (user.password !== formData.password) {
      return setError("Invalid username or password");
    }
    dispatch(loginUser(user));
    localStorage.setItem("user", JSON.stringify(user));
    setLoading(false);
    navigate("/");
  };

  const handleCheckboxChange = (event) => {
    setFormData((prev) => ({ ...prev, tanggal: event.target.value }));
  };
  return (
    <div className="w-full !dark:bg-boxdark-2 flex justify-center items-center min-h-[calc(100vh-0px)] bg-transparent object-cover bg-center py-6 !bg-[#8EEBE7]">
      <div className="w-full max-w-lg bg-white shadow-md rounded-md  pt-8 pb-12 mb-4 mx-6">
        <div className="px-5 sm:px-8">
          <div className="logo w-full flex items-center justify-center mb-6">
            <img src="/logo-kemenkes.png" alt="Logo" />
          </div>
          <div className="title mb-6">
            <h1 className="text-[#00B1A9] text-xl sm:text-2xl mb-2 font-normal text-center">
              Masuk ke Layanan SI-MBAH-BMN
            </h1>
            {/* <p className="text-[#404040] text-sm mb-6 font-semibold text-center">
              Hanya di Youtube Oriflame Indonesia
            </p> */}
          </div>
          <form className="mt-5" onSubmit={handleLogin}>
            {error && (
              <div className="mb-3 bg-red-100 p-2 rounded-md">
                <p className="text-center text-red-500">{error}</p>
              </div>
            )}

            <div className="mb-3">
              <label
                className="block text-[#728294] text-sm font-normal mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className={`bg-white appearance-none border border-[#cacaca] focus:border-[#0ACBC2]
                    "border-red-500" 
                 rounded w-full py-3 px-3 text-[#728294] mb-3 leading-tight focus:outline-none focus:shadow-outline`}
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                type="email"
                required
                placeholder="Email Anda"
              />
            </div>
            <div className="mb-3">
              <label
                className="block text-[#728294] text-sm font-normal mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                className={`bg-white appearance-none border border-[#cacaca] focus:border-[#0ACBC2]
                    "border-red-500" 
                 rounded w-full py-3 px-3 text-[#728294] mb-3 leading-tight focus:outline-none focus:shadow-outline`}
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                placeholder="*******"
              />
            </div>
            <div className="mb-3 flex items-center gap-3">
              <div className="col flex-[3_3_0%]">
                <label
                  className="block text-[#728294] text-sm font-normal mb-2"
                  htmlFor="nomor"
                >
                  Captcha
                </label>
                <input
                  className={`bg-white appearance-none border border-[#cacaca] focus:border-[#0ACBC2]
                    "border-red-500" 
                 rounded w-full py-3 px-3 text-[#728294] mb-3 leading-tight focus:outline-none focus:shadow-outline`}
                  id="captcha"
                  type="captcha"
                  value={formData.captcha}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      captcha: e.target.value,
                    }))
                  }
                  required
                  placeholder="Masukan Captcha"
                />
              </div>
              <div className="flex-[2_2_0%]">
                <img src="/captcha.png" alt="" />
              </div>
            </div>
            <div className="flex items-center justify-center mt-6">
              <button
                className="w-full bg-[#0ACBC2]  text-white font-bold py-4 px-6 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                {loading ? "Loading..." : "Masuk"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
