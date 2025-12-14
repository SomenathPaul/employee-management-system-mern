// client/src/user-pages/manager/employee_profiles/EmployeeDetailPage.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import Swal from "sweetalert2";
import { ThemeContext } from "../../../context/ThemeContext";

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useContext(ThemeContext);

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const normalize = (payload) => {
      const p = payload || {};
      return p.data || p.user || p;
    };

    const fetchEmployee = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/manager/employees/${id}`);
        const obj = normalize(res.data);
        if (!cancelled) {
          setEmployee(obj);
          setForm({
            name: obj.name || "",
            gender: obj.gender || "",
            dob: obj.dob ? new Date(obj.dob).toISOString().slice(0, 10) : "",
            email: obj.email || "",
            phone: obj.phone || "",
            address: obj.address || "",
            city: obj.city || "",
            state: obj.state || "",
            pincode: obj.pincode || "",
            country: obj.country || "",
            emergencyContactName: obj.emergencyContactName || "",
            emergencyPhone: obj.emergencyPhone || "",
            role: obj.role || "",
            employeeId: obj.employeeId || "",
            department: obj.department || "",
            designation: obj.designation || "",
            joiningDate: obj.joiningDate ? new Date(obj.joiningDate).toISOString().slice(0, 10) : "",
            employmentType: obj.employmentType || "",
            reportingManager: obj.reportingManager || "",
            workEmail: obj.workEmail || "",
            workMode: obj.workMode || "",
            photo: obj.photo || "",
            signature: obj.signature || "",
          });
        }
      } catch (err) {
        console.error("fetch employee error", err);
        Swal.fire("Error", err?.response?.data?.msg || "Unable to fetch employee", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEmployee();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      Swal.fire("Validation", "Name and Email are required.", "warning");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        gender: form.gender,
        dob: form.dob || null,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        country: form.country,
        emergencyContactName: form.emergencyContactName,
        emergencyPhone: form.emergencyPhone,
        role: form.role,
        employeeId: form.employeeId,
        department: form.department,
        designation: form.designation,
        joiningDate: form.joiningDate || null,
        employmentType: form.employmentType,
        reportingManager: form.reportingManager,
        workEmail: form.workEmail,
        workMode: form.workMode,
      };

      const res = await api.put(`/manager/employees/${id}`, payload);

      const updated = res.data?.data || res.data?.user || res.data || res;

      setEmployee(updated);
      setEditing(false);
      Swal.fire("Saved", "Employee updated successfully.", "success");
    } catch (err) {
      console.error("update error", err);
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err.message ||
        "Failed to update";
      Swal.fire("Error", msg, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading employee...</div>;

  if (!employee)
    return (
      <div className="p-6">
        <div className="text-red-600">Employee not found.</div>
        <button onClick={() => navigate(-1)} className="mt-4 px-3 py-1 bg-gray-200 rounded">
          Back
        </button>
      </div>
    );

  // Theme classes
  const outerBg = isDark
    ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
    : "bg-gradient-to-b from-[#0f172a] via-[#1e3a8a] to-[#7c3aed]";
  const panelBg = isDark ? "bg-slate-800/90 text-gray-100" : "bg-white/95 text-slate-900";
  const headingText = isDark ? "text-gray-100" : "text-slate-800";
  const labelText = isDark ? "text-gray-300" : "text-gray-500";
  const inputBase = isDark
    ? "w-full border p-2 rounded bg-slate-700 text-gray-100 border-slate-600"
    : "w-full border p-2 rounded bg-white text-gray-900 border-gray-300";
  const textareaBase = inputBase;
  const buttonPrimary = isDark
    ? "px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-500"
    : "px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700";
  const buttonSecondary = isDark
    ? "px-3 py-2 bg-slate-700 text-gray-200 rounded-md hover:bg-slate-600"
    : "px-3 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300";
  const metaText = isDark ? "text-gray-300" : "text-gray-600";

  return (
    <div className={`min-h-screen min-w-[99.5vw] w-full py-10 ${outerBg}`}>
      <div className="max-w-5xl mx-auto p-6 md:p-8 rounded-2xl">
        <div className={`${panelBg} rounded-2xl border-l-1 border-b-1 p-6 md:p-8`}>
          <div className="flex items-center justify-between mb-6">
            <h1 className={`text-2xl font-bold ${headingText}`}>Employee Profile</h1>
            <div className="flex items-center gap-3">
              {!editing ? (
                <button onClick={() => setEditing(true)} className="px-3 py-2 bg-blue-600 text-white rounded-md">
                  Edit
                </button>
              ) : (
                <>
                  <button onClick={handleSave} disabled={saving} className={buttonPrimary}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setForm({ ...form });
                    }}
                    className={buttonSecondary}
                  >
                    Cancel
                  </button>
                </>
              )}
              <button onClick={() => navigate(-1)} className={buttonSecondary}>
                Back
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: photo & basic info */}
            <div className="col-span-1 flex flex-col items-center gap-4">
              <div className="w-40 h-40 rounded-lg overflow-hidden bg-gray-100">
                {employee.photo ? (
                  <img
                    src={employee.photo.startsWith("http") ? employee.photo : `http://localhost:5000/uploads/${employee.photo}`}
                    alt={employee.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Photo</div>
                )}
              </div>

              <div className="text-center">
                <div className="text-lg font-semibold">{employee.name}</div>
                <div className={`text-sm ${metaText}`}>
                  {employee.role} {employee.employeeId ? `• ${employee.employeeId}` : ""}
                </div>
              </div>

              <div className="w-full">
                <div className={`text-sm ${labelText} mb-1`}>Contact</div>
                {editing ? (
                  <input name="phone" value={form.phone} onChange={handleChange} className={inputBase} />
                ) : (
                  <div className="text-sm">{employee.phone || "—"}</div>
                )}

                <div className={`text-sm ${labelText} mt-3 mb-1`}>Email</div>
                {editing ? (
                  <input name="email" value={form.email} onChange={handleChange} className={inputBase} />
                ) : (
                  <div className="text-sm">{employee.email || "—"}</div>
                )}
              </div>
            </div>

            {/* Middle: personal details */}
            <div className="col-span-1 md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs ${labelText}`}>Full Name</label>
                  {editing ? (
                    <input name="name" value={form.name} onChange={handleChange} className={inputBase} />
                  ) : (
                    <div className="py-2">{employee.name}</div>
                  )}
                </div>

                <div>
                  <label className={`text-xs ${labelText}`}>Gender</label>
                  {editing ? (
                    <select name="gender" value={form.gender} onChange={handleChange} className={inputBase}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div className="py-2">{employee.gender || "—"}</div>
                  )}
                </div>

                <div>
                  <label className={`text-xs ${labelText}`}>Date of Birth</label>
                  {editing ? (
                    <input type="date" name="dob" value={form.dob} onChange={handleChange} className={inputBase} />
                  ) : (
                    <div className="py-2">{employee.dob ? new Date(employee.dob).toLocaleDateString() : "—"}</div>
                  )}
                </div>

                <div>
                  <label className={`text-xs ${labelText}`}>Emergency Contact</label>
                  {editing ? (
                    <>
                      <input name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange} className={inputBase} />
                      <input name="emergencyPhone" value={form.emergencyPhone} onChange={handleChange} className={`${inputBase} mt-2`} />
                    </>
                  ) : (
                    <div className="py-2">
                      <div>{employee.emergencyContactName || "—"}</div>
                      <div className="text-xs text-gray-500 mt-1">{employee.emergencyPhone || ""}</div>
                    </div>
                  )}
                </div>

                <div>
                  <label className={`text-xs ${labelText}`}>Address</label>
                  {editing ? (
                    <textarea name="address" value={form.address} onChange={handleChange} className={textareaBase} rows={3} />
                  ) : (
                    <div className="py-2 text-xs text-gray-600">{employee.address || "—"}</div>
                  )}
                </div>

                <div>
                  <label className={`text-xs ${labelText}`}>City</label>
                  {editing ? (
                    <input name="city" value={form.city} onChange={handleChange} className={inputBase} />
                  ) : (
                    <div className="py-2">{employee.city || "—"}</div>
                  )}
                </div>

                <div>
                  <label className={`text-xs ${labelText}`}>State / Pincode</label>
                  <div className="flex gap-2">
                    {editing ? (
                      <>
                        <input name="state" value={form.state} onChange={handleChange} className={`${inputBase} w-1/2`} />
                        <input name="pincode" value={form.pincode} onChange={handleChange} className={`${inputBase} w-1/2`} />
                      </>
                    ) : (
                      <div className="py-2">
                        {(employee.state || "—") + (employee.pincode ? ` • ${employee.pincode}` : "")}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className={`text-xs ${labelText}`}>Country</label>
                  {editing ? (
                    <input name="country" value={form.country} onChange={handleChange} className={inputBase} />
                  ) : (
                    <div className="py-2">{employee.country || "—"}</div>
                  )}
                </div>

                <div>
                  <label className={`text-xs ${labelText}`}>Work Email</label>
                  {editing ? (
                    <input name="workEmail" value={form.workEmail} onChange={handleChange} className={inputBase} />
                  ) : (
                    <div className="py-2">{employee.workEmail || "—"}</div>
                  )}
                </div>
              </div>

              <div className="my-6 border-t" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs ${labelText}`}>Department</label>
                  {editing ? (
                    <input name="department" value={form.department} onChange={handleChange} className={inputBase} />
                  ) : (
                    <div className="py-2">{employee.department || "—"}</div>
                  )}
                </div>

                <div>
                  <label className={`text-xs ${labelText}`}>Designation</label>
                  {editing ? (
                    <input name="designation" value={form.designation} onChange={handleChange} className={inputBase} />
                  ) : (
                    <div className="py-2">{employee.designation || "—"}</div>
                  )}
                </div>

                <div>
                  <label className={`text-xs ${labelText}`}>Employee ID</label>
                  {editing ? (
                    <input name="employeeId" value={form.employeeId} onChange={handleChange} className={inputBase} />
                  ) : (
                    <div className="py-2">{employee.employeeId || "—"}</div>
                  )}
                </div>

                <div>
                  <label className={`text-xs ${labelText}`}>Joining Date</label>
                  {editing ? (
                    <input type="date" name="joiningDate" value={form.joiningDate} onChange={handleChange} className={inputBase} />
                  ) : (
                    <div className="py-2">{employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : "—"}</div>
                  )}
                </div>

                <div>
                  <label className={`text-xs ${labelText}`}>Employment Type</label>
                  {editing ? (
                    <input name="employmentType" value={form.employmentType} onChange={handleChange} className={inputBase} />
                  ) : (
                    <div className="py-2">{employee.employmentType || "—"}</div>
                  )}
                </div>

                <div>
                  <label className={`text-xs ${labelText}`}>Work Mode</label>
                  {editing ? (
                    <input name="workMode" value={form.workMode} onChange={handleChange} className={inputBase} />
                  ) : (
                    <div className="py-2">{employee.workMode || "—"}</div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className={`text-xs ${labelText}`}>Reporting Manager</label>
                  {editing ? (
                    <input name="reportingManager" value={form.reportingManager} onChange={handleChange} className={inputBase} />
                  ) : (
                    <div className="py-2">{employee.reportingManager || "—"}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="mt-6">
            <div className="text-sm font-medium mb-2">Signature</div>
            <div className="w-80 h-28 bg-gray-50 border rounded overflow-hidden">
              {employee.signature ? (
                <img
                  src={
                    employee.signature.startsWith("http")
                      ? employee.signature
                      : `http://localhost:5000/uploads/${employee.signature}`
                  }
                  alt="signature"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">No Signature</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
