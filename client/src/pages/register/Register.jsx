// client/src/pages/Register.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/PageWrapper";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FaRegImage } from "react-icons/fa6";
import AIButton from "../../components/AIButton";
import Swal from "sweetalert2";
import { ThemeContext } from "../../context/ThemeContext";
import { FaArrowRight } from "react-icons/fa6";
import { FaArrowLeft } from "react-icons/fa";

function Register() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { isDark } = useContext(ThemeContext);

  const [formData, setFormData] = useState({
    // Step 1: Personal Details
    name: "",
    gender: "",
    dob: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    emergencyContactName: "",
    emergencyPhone: "",

    // Step 2: Employee Details
    role: "",
    employeeId: "",
    department: "",
    designation: "",
    joiningDate: "",
    employmentType: "",
    reportingManager: "",
    workEmail: "",
    workMode: "",

    // Step 3: Documents & Account Setup
    photo: null,
    signature: null,
    password: "",
    confirm_password: "",
    securityQuestion: "",
    securityAnswer: "",
    termsAccepted: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : files ? files[0] : value,
    });
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const validateStep1 = () => {
    const {
      name,
      gender,
      dob,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      country,
      emergencyPhone,
    } = formData;

    if (
      !name ||
      !gender ||
      !dob ||
      !email ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !pincode ||
      !country
    ) {
      Swal.fire(
        "Incomplete Details",
        "Please fill all required fields!",
        "error"
      );
      return false;
    }

    // Validate age >= 18
    const birthDate = new Date(dob);
    const today = new Date();
    const age =
      today.getFullYear() -
      birthDate.getFullYear() -
      (today < new Date(birthDate.setFullYear(today.getFullYear())) ? 1 : 0);
    if (age < 18) {
      Swal.fire(
        "Underage!",
        "You must be at least 18 years old to register.",
        "error"
      );
      return false;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      Swal.fire("Invalid Phone", "Phone number must be 10 digits.", "error");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Swal.fire(
        "Invalid Email",
        "Please enter a valid email address.",
        "error"
      );
      return false;
    }

    // Emergency number validation (if entered)
    if (emergencyPhone && !phoneRegex.test(emergencyPhone)) {
      Swal.fire(
        "Invalid Emergency Contact",
        "Emergency phone must be 10 digits.",
        "error"
      );
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    const {
      role,
      employeeId,
      department,
      designation,
      joiningDate,
      employmentType,
      reportingManager,
      workMode,
    } = formData;

    if (!role) {
      Swal.fire("Select Role", "Please select your role.", "error");
      return false;
    }

    if (!employeeId) {
      Swal.fire(
        "Employee ID Missing",
        "Please enter your Employee ID.",
        "error"
      );
      return false;
    }

    // Role-based employee ID format (if you want strict checks; it won't block if role not included)
    const rolePrefixes = {
      Employee: /^EMP\d{6}$/,
      HR: /^HRM\d{6}$/,
      Manager: /^MAG\d{6}$/,
      Admin: /^ADM\d{6}$/,
    };

    if (rolePrefixes[role] && !rolePrefixes[role].test(employeeId)) {
      Swal.fire(
        `Invalid ${role} ID`,
        `For ${role}, format must be ${role.toUpperCase()} + 6 digits (e.g. ${
          role === "Employee"
            ? "EMP123456"
            : role === "HR"
            ? "HRM654876"
            : role === "Manager"
            ? "MAG456789"
            : "ADM561894"
        })`,
        "error"
      );
      return false;
    }

    if (
      !department ||
      !designation ||
      !joiningDate ||
      !employmentType ||
      !reportingManager ||
      !workMode
    ) {
      Swal.fire(
        "Missing Info",
        "Please complete all official details!",
        "error"
      );
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reportingManager)) {
      Swal.fire(
        "Invalid Manager Email",
        "Enter a valid manager email address.",
        "error"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      photo,
      signature,
      password,
      confirm_password,
      securityQuestion,
      securityAnswer,
      termsAccepted,
    } = formData;

    if (
      !photo ||
      !signature ||
      !password ||
      !confirm_password ||
      !securityQuestion ||
      !securityAnswer
    ) {
      Swal.fire(
        "Incomplete Details",
        "Please complete all required fields!",
        "error"
      );
      return;
    }

    if (!termsAccepted) {
      Swal.fire(
        "Accept Terms",
        "You must accept Terms and Conditions.",
        "error"
      );
      return;
    }

    if (password !== confirm_password) {
      Swal.fire("Password Mismatch", "Passwords do not match!", "error");
      return;
    }

    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire(
          "✅ Success",
          data.msg || "Registration successful!",
          "success"
        );
        navigate(`/${formData.role.toLowerCase()}/dashboard`);
      } else {
        Swal.fire("❌ Error", data.msg || "Registration failed", "error");
      }
    } catch (error) {
      console.error("Registration error:", error);
      Swal.fire("Registration Error", `Something went wrong. ${error}`, "error");
    }
  };

  // input styles: augmented for dark mode
  const inputStyleBase =
    "border-2 border-transparent hover:border-purple-500 focus:border-pink-500 p-2 focus:pl-4 m-2 outline-0 rounded transition-all ease-in-out duration-500";
  const inputLight = "bg-gray-200 text-slate-900";
  const inputDark = "bg-slate-700 text-slate-100 border-slate-700 placeholder-slate-400";
  const inputStyle = `${inputStyleBase} ${isDark ? inputDark : inputLight}`;

  // card / container classes
  const pageBg = isDark ? "bg-slate-900" : "bg-white";
  const formBg = isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900";
  const leftText = isDark ? "text-white" : "text-white"; // left panel remains white text on gradient
  const mainContainerBg = isDark ? "bg-slate-800/60 backdrop-blur-md border-slate-700" : "bg-white/70 backdrop-blur-md border-gray-200";

  // upload card styles
  const uploadBase = "flex flex-col w-full md:w-1/2 border-2 border-dashed rounded-xl p-4 justify-center items-center text-center transition cursor-pointer";
  const uploadLight = (has) =>
    has ? "border-green-400 bg-green-50 hover:bg-green-100 text-slate-900" : "border-gray-400 hover:bg-gray-100 text-slate-900";
  const uploadDark = (has) =>
    has ? "border-green-600 bg-green-900/30 hover:bg-green-900/20 text-slate-100" : "border-slate-700 hover:bg-slate-800 text-slate-100";

  return (
    <PageWrapper>
      {/* prevent x overflow globally for this page */}
      <div className={`min-h-screen min-w-screen overflow-x-hidden ${pageBg}`}>
        {/* responsive container: columns on md+, stacked on small screens */}
        <div className="min-h-screen flex flex-col md:flex-row">
          {/* LEFT (visual) - fixed height on large screens, non-scrollable */}
          <aside className="w-full md:w-1/2 h-auto md:h-screen sticky top-0 flex-shrink-0 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center p-8 md:p-12">
            <div className="max-w-md text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: leftText === "text-white" ? "white" : undefined }}>Register Here</h1>
              <p className="text-base md:text-lg text-white/90 mb-4">
                Create your account to get started with our Employee Management
                System. Fill in your details carefully to help HR onboard you
                smoothly.
              </p>
              <p className="text-base md:text-lg text-white/90 border-t pt-3">
                <a href="/login" className="hover:underline">Login</a> to your existing account.
              </p>
            </div>
          </aside>

          {/* RIGHT (form) - scrollable only */}
          <main className="w-full md:w-1/2 h-screen overflow-y-auto">
            <div className={`w-full md:max-w-xl mx-auto p-6 md:p-8 ${isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}`}>
              <h2 className="text-2xl font-semibold mb-2 text-center">Create your Account</h2>
              <p className="text-[13px] mb-4 text-center">
                Already have an account?{" "}
                <a href="/login" className={isDark ? "text-indigo-300 underline" : "text-blue-700 underline"}>
                  Login
                </a>
              </p>
              <p className="text-[13px] mb-6 text-center" style={{ color: isDark ? "#cbd5e1" : undefined }}>
                Step {step} of 3
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col w-full transition-all duration-500">
                {/* STEP 1 */}
                {step === 1 && (
                  <>
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      className={inputStyle}
                      onChange={handleChange}
                      value={formData.name}
                    />
                    <select
                      name="gender"
                      className={inputStyle}
                      onChange={handleChange}
                      value={formData.gender}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>

                    <label className={`m-2 font-medium text-sm ${isDark ? "text-slate-200" : "text-gray-700"}`}>Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      className={`${inputStyle} text-black hide-date-icon ${isDark ? "text-slate-100" : ""}`}
                      onChange={handleChange}
                      value={formData.dob}
                    />

                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      className={inputStyle}
                      onChange={handleChange}
                      value={formData.email}
                    />
                    <input
                      type="text"
                      name="phone"
                      placeholder="Phone Number"
                      className={inputStyle}
                      onChange={handleChange}
                      value={formData.phone}
                    />
                    <textarea
                      name="address"
                      placeholder="Full Address"
                      className={`${inputStyle} resize-none`}
                      onChange={handleChange}
                      value={formData.address}
                    />
                    <AIButton name="Address" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        className={inputStyle + " m-0"}
                        onChange={handleChange}
                        value={formData.city}
                      />
                      <input
                        type="text"
                        name="state"
                        placeholder="State"
                        className={inputStyle + " m-0"}
                        onChange={handleChange}
                        value={formData.state}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      <input
                        type="text"
                        name="pincode"
                        placeholder="Pincode"
                        className={inputStyle + " m-0"}
                        onChange={handleChange}
                        value={formData.pincode}
                      />
                      <input
                        type="text"
                        name="country"
                        placeholder="Country"
                        className={inputStyle + " m-0"}
                        onChange={handleChange}
                        value={formData.country}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      <input
                        type="text"
                        name="emergencyContactName"
                        placeholder="Emergency Contact Name"
                        className={inputStyle + " m-0"}
                        onChange={handleChange}
                        value={formData.emergencyContactName}
                      />
                      <input
                        type="text"
                        name="emergencyPhone"
                        placeholder="Emergency Contact Number"
                        className={inputStyle + " m-0"}
                        onChange={handleChange}
                        value={formData.emergencyPhone}
                      />
                    </div>

                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        onClick={() => { if (validateStep1()) nextStep(); }}
                        className="flex items-center justify-center gap-3 bg-black text-white p-3 cursor-pointer rounded hover:bg-gray-800 transition"
                      >
                        Next <FaArrowRight />
                      </button>
                    </div>
                  </>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <>
                    <select
                      name="role"
                      className={inputStyle}
                      onChange={handleChange}
                      value={formData.role}
                    >
                      <option value="">Select Role</option>
                      <option value="Manager">Manager</option>
                      <option value="Employee">Employee</option>
                    </select>

                    {formData.role && (
                      <input
                        type="text"
                        name="employeeId"
                        placeholder={`${formData.role} ID`}
                        className={inputStyle}
                        onChange={handleChange}
                        value={formData.employeeId}
                      />
                    )}

                    <select
                      name="department"
                      className={inputStyle}
                      onChange={handleChange}
                      value={formData.department}
                    >
                      <option value="">Select Department</option>
                      <option value="Software Development">Software Development</option>
                      <option value="Quality Assurance">Quality Assurance</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                      <option value="DevOps">DevOps</option>
                      <option value="Data Science">Data Science</option>
                    </select>

                    <select
                      name="designation"
                      className={inputStyle}
                      onChange={handleChange}
                      value={formData.designation}
                    >
                      <option value="">Select Designation</option>
                      <option value="Junior Developer">Junior Developer</option>
                      <option value="Senior Developer">Senior Developer</option>
                      <option value="Team Lead">Team Lead</option>
                      <option value="Project Manager">Project Manager</option>
                      <option value="HR Executive">HR Executive</option>
                      <option value="Intern">Intern</option>
                    </select>

                    <label className={`m-2 font-medium text-sm ${isDark ? "text-slate-200" : "text-gray-700"}`}>Date of Joining</label>
                    <input
                      type="date"
                      name="joiningDate"
                      className={`${inputStyle} hide-date-icon`}
                      onChange={handleChange}
                      value={formData.joiningDate}
                    />

                    <select
                      name="employmentType"
                      className={inputStyle}
                      onChange={handleChange}
                      value={formData.employmentType}
                    >
                      <option value="">Select Employment Type</option>
                      <option value="Full-Time">Full-Time</option>
                      <option value="Part-Time">Part-Time</option>
                      <option value="Intern">Intern</option>
                      <option value="Contract">Contract</option>
                    </select>

                    <input
                      type="email"
                      name="reportingManager"
                      placeholder="Reporting Manager Email"
                      className={inputStyle}
                      onChange={handleChange}
                      value={formData.reportingManager}
                    />
                    <input
                      type="email"
                      name="workEmail"
                      placeholder="Work Email (if provided)"
                      className={inputStyle}
                      onChange={handleChange}
                      value={formData.workEmail}
                    />

                    <select
                      name="workMode"
                      className={inputStyle}
                      onChange={handleChange}
                      value={formData.workMode}
                    >
                      <option value="">Select Work Mode</option>
                      <option value="Onsite">Onsite</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>

                    <div className="flex gap-3 mt-4">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex items-center gap-3 justify-center bg-gray-300 text-black w-1/2 p-3 rounded hover:bg-gray-400 transition"
                      >
                        <FaArrowLeft /> Back 
                      </button>
                      <button
                        type="button"
                        onClick={() => { if (validateStep2()) nextStep(); }}
                        className="flex items-center justify-center gap-3 bg-black text-white w-1/2 p-3 cursor-pointer rounded hover:bg-gray-800 transition"
                      >
                        Next <FaArrowRight />
                      </button>
                    </div>
                  </>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <>
                    <div className="flex flex-col md:flex-row gap-4 m-2">
                      {/* PHOTO UPLOAD */}
                      <div
                        className={`${uploadBase} ${isDark ? uploadDark(!!formData.photo) : uploadLight(!!formData.photo)}`}
                      >
                        {formData.photo ? (
                          <img
                            src={URL.createObjectURL(formData.photo)}
                            alt="Uploaded"
                            className="w-24 h-24 object-cover rounded-lg mb-2"
                          />
                        ) : (
                          <FaRegImage size={40} className="text-gray-500 mb-2" />
                        )}

                        <p className={`text-sm ${formData.photo ? "text-green-600" : isDark ? "text-slate-300" : "text-gray-600"}`}>
                          {formData.photo ? "✅ Photo uploaded successfully!" : "Upload a file or drag and drop PNG, JPG (max 1 MB)"}
                        </p>

                        <input
                          type="file"
                          name="photo"
                          accept="image/*"
                          onChange={handleChange}
                          className="mt-2 text-xs text-blue-700 font-bold cursor-pointer"
                        />

                        {formData.photo && <p className="text-xs text-gray-600 mt-1">📁 {formData.photo.name}</p>}
                      </div>

                      {/* SIGNATURE UPLOAD */}
                      <div
                        className={`${uploadBase} ${isDark ? uploadDark(!!formData.signature) : uploadLight(!!formData.signature)}`}
                      >
                        {formData.signature ? (
                          <img
                            src={URL.createObjectURL(formData.signature)}
                            alt="Signature"
                            className="w-24 h-16 object-contain rounded-lg mb-2"
                          />
                        ) : (
                          <FaRegImage size={40} className="text-gray-500 mb-2" />
                        )}

                        <p className={`text-sm ${formData.signature ? "text-green-600" : isDark ? "text-slate-300" : "text-gray-600"}`}>
                          {formData.signature ? "✅ Signature uploaded successfully!" : "Upload a file or drag and drop PNG, JPG (max 1 MB)"}
                        </p>

                        <input
                          type="file"
                          name="signature"
                          accept="image/*"
                          onChange={handleChange}
                          className="mt-2 text-xs text-blue-700 font-bold cursor-pointer"
                        />

                        {formData.signature && <p className="text-xs text-gray-600 mt-1">📁 {formData.signature.name}</p>}
                      </div>
                    </div>

                    <div className="relative m-2">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Create Password"
                        className={`border-2 border-transparent p-2 w-full outline-0 pr-10 hover:border-purple-500 focus:border-pink-500 rounded ${isDark ? "bg-slate-700 text-slate-100" : "bg-gray-200 text-slate-900"} focus:pl-4 transition-all ease-in-out duration-500`}
                        onChange={handleChange}
                        value={formData.password}
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

                    <input
                      type="password"
                      name="confirm_password"
                      placeholder="Confirm Password"
                      className={inputStyle}
                      onChange={handleChange}
                      value={formData.confirm_password}
                    />

                    <select
                      name="securityQuestion"
                      className={inputStyle}
                      onChange={handleChange}
                      value={formData.securityQuestion}
                    >
                      <option value="">Select Security Question</option>
                      <option value="Your first pet's name?">Your first pet's name?</option>
                      <option value="Your mother's maiden name?">Your mother's maiden name?</option>
                      <option value="Your favorite teacher's name?">Your favorite teacher's name?</option>
                      <option value="Your birth city?">Your birth city?</option>
                    </select>

                    <input
                      type="text"
                      name="securityAnswer"
                      placeholder="Security Answer"
                      className={inputStyle}
                      onChange={handleChange}
                      value={formData.securityAnswer}
                    />

                    <div className="flex items-center m-2">
                      <input
                        type="checkbox"
                        name="termsAccepted"
                        checked={formData.termsAccepted}
                        onChange={handleChange}
                        className="mr-2 mt-1"
                      />
                      <label className={`text-sm ${isDark ? "text-slate-200" : ""}`}>
                        I agree to the{" "}
                        <span className="text-blue-700 underline cursor-pointer">
                          Terms and Conditions
                        </span>
                      </label>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="bg-gray-300 text-black p-2 flex-1 rounded hover:bg-gray-400 transition"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="bg-black text-white p-2 flex-1 rounded hover:bg-gray-800 transition"
                      >
                        Submit
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </main>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Register;
