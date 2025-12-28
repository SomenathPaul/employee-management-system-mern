// client/src/user-pages/manager/employee_profiles/EmployeeDetailPage.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import Swal from "sweetalert2";
import { ThemeContext } from "../../../context/ThemeContext";
import { FiEdit2, FiSave, FiArrowLeft, FiUser, FiBriefcase, FiMapPin, FiPhone } from "react-icons/fi";

/**
 * EmployeeDetailPage Component
 * Renders a comprehensive view of an employee's data. 
 * Allows managers to toggle between 'View' and 'Edit' modes.
 */
export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useContext(ThemeContext);

  // --- State Management ---
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Normalizes backend responses (handles variations in data nesting)
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
          // Pre-fill form state for potential editing
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
        Swal.fire("Error", "Unable to load employee profile", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEmployee();
    return () => { cancelled = true; };
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  /**
   * Performs an API update and refreshes the local employee state
   */
  const handleSave = async () => {
    if (!form.name || !form.email) {
      Swal.fire("Validation", "Name and Email are required.", "warning");
      return;
    }

    setSaving(true);
    try {
      const res = await api.put(`/manager/employees/${id}`, form);
      const updated = res.data?.data || res.data?.user || res.data || res;
      setEmployee(updated);
      setEditing(false);
      Swal.fire("Saved", "Employee record updated.", "success");
    } catch (err) {
      Swal.fire("Error", "Failed to update employee.", "error");
    } finally {
      setSaving(false);
    }
  };

  // --- UI THEME CLASSES ---
  const outerBg = isDark ? "bg-slate-950" : "bg-slate-100";
  const panelBg = isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white text-slate-900 shadow-xl border-gray-100";
  const inputBase = isDark ? "bg-slate-800 border-slate-700 text-white focus:ring-indigo-500" : "bg-white border-gray-200 text-black focus:ring-blue-500";
  const labelText = "text-[10px] font-black uppercase tracking-widest opacity-50 mb-1.5 block";
  const lockedBg = isDark ? "bg-slate-950 opacity-50 cursor-not-allowed" : "bg-gray-100 opacity-60 cursor-not-allowed";

  if (loading) return <div className={`p-10 text-center ${outerBg} h-screen`}>Loading...</div>;

  return (
    <div className={`min-h-screen w-full py-8 md:py-12 px-4 transition-colors duration-300 ${outerBg}`}>
      <div className="max-w-6xl mx-auto">
        
        {/* --- ACTIONS BAR --- */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold opacity-60 hover:opacity-100 transition-opacity">
            <FiArrowLeft />  <p className="hidden sm:block">Back to Directory</p>
          </button>
          
          <div className="flex gap-3">
            {!editing ? (
              <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all">
                <FiEdit2 /> <p className="hidden sm:block">Edit Profile</p>
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50">
                   <FiSave /> {saving ? "Saving..." : "Save Changes"}
                </button>
                <button onClick={() => setEditing(false)} className="px-5 py-2 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600 transition-all">
                  Cancel 
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- MAIN PROFILE CARD --- */}
        <div className={`rounded-3xl border ${panelBg} overflow-hidden shadow-2xl`}>
          
          {/* Header Cover Style */}
          <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600" />

          <div className="px-6 md:px-12 pb-12 -mt-16">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              
              {/* LEFT COLUMN: Avatar & Quick Info */}
              <div className="w-full md:w-1/4 flex flex-col items-center">
                <div className="w-40 h-40 rounded-3xl border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden bg-slate-200">
                  {employee.photo ? (
                    <img src={employee.photo.startsWith("http") ? employee.photo : `http://localhost:5000/uploads/${employee.photo}`} alt="" className="w-full h-full object-cover" />
                  ) : <div className="w-full h-full flex items-center justify-center opacity-30"><FiUser size={48} /></div>}
                </div>
                
                <div className="mt-6 text-center">
                  <h2 className="text-2xl font-black leading-tight">{employee.name}</h2>
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mt-1">{employee.designation}</p>
                  <p className="text-xs opacity-50 mt-1">{employee.department}</p>
                </div>

                <div className="w-full mt-8 space-y-4">
                  <div>
                    <label className={labelText}>Official Email</label>
                    <p className="text-sm font-medium break-all">{employee.email}</p>
                  </div>
                  <div>
                    <label className={labelText}>Contact Number</label>
                    {editing ? <input name="phone" value={form.phone} onChange={handleChange} className={`${inputBase} p-2 rounded-lg text-sm`} /> 
                             : <p className="text-sm font-medium">{employee.phone || "—"}</p>}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Detailed Tabs/Sections */}
              <div className="flex-1 w-full space-y-10">
                
                {/* Section: Professional Details */}
                <section>
                  <div className="flex items-center gap-2 sm:mt-[100px] mt-3 mb-6 text-indigo-500">
                    <FiBriefcase /> <h3 className="text-sm font-black uppercase tracking-widest">Employment Details</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <DataField label="Employee ID" name="employeeId" value={form.employeeId} isEditing={editing} onChange={handleChange} locked={true} />
                    <DataField label="Joining Date" name="joiningDate" value={form.joiningDate} isEditing={editing} onChange={handleChange} type="date" locked={true} />
                    <DataField label="Department" name="department" value={form.department} isEditing={editing} onChange={handleChange} />
                    <DataField label="Work Mode" name="workMode" value={form.workMode} isEditing={editing} onChange={handleChange} />
                    <DataField label="Employment Type" name="employmentType" value={form.employmentType} isEditing={editing} onChange={handleChange} locked={true} />
                    <DataField label="Reporting Manager" name="reportingManager" value={form.reportingManager} isEditing={editing} onChange={handleChange} />
                  </div>
                </section>

                {/* Section: Personal & Address */}
                <section>
                  <div className="flex items-center gap-2 mb-6 text-emerald-500">
                    <FiMapPin /> <h3 className="text-sm font-black uppercase tracking-widest">Personal & Location</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <DataField label="Gender" name="gender" value={form.gender} locked={true} isEditing={editing} onChange={handleChange} type="select" options={["Male", "Female", "Other"]} />
                    <DataField label="Date of Birth" name="dob" value={form.dob} locked={true} isEditing={editing} onChange={handleChange} type="date" />
                    <div className="sm:col-span-2">
                       <label className={labelText}>Permanent Address</label>
                       {editing ? <textarea name="address" value={form.address} onChange={handleChange} className={`${inputBase} w-full p-3 rounded-xl`} rows={2} /> 
                                : <p className="text-sm opacity-80">{employee.address || "—"}</p>}
                    </div>
                    <DataField label="City" name="city" value={form.city} isEditing={editing} onChange={handleChange} />
                    <DataField label="State / Province" name="state" value={form.state} isEditing={editing} onChange={handleChange} />
                  </div>
                </section>

                {/* Section: Emergency */}
                <section>
                  <div className="flex items-center gap-2 mb-6 text-rose-500">
                    <FiPhone /> <h3 className="text-sm font-black uppercase tracking-widest">Emergency Contact</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded-2xl bg-slate-500/5 border border-slate-500/10">
                    <DataField label="Contact Name" name="emergencyContactName" value={form.emergencyContactName} isEditing={editing} onChange={handleChange} />
                    <DataField label="Emergency Phone" name="emergencyPhone" value={form.emergencyPhone} isEditing={editing} onChange={handleChange} />
                  </div>
                </section>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper Component for standardized data fields
 */
function DataField({ label, name, value, isEditing, onChange, type = "text", options = [], locked = false }) {
  const { isDark } = useContext(ThemeContext);
  const labelText = "text-[10px] font-black uppercase tracking-widest opacity-50 mb-1.5 block";
  const inputBase = isDark ? "w-full bg-slate-800 border-slate-700 text-white p-2.5 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none" 
                           : "w-full bg-white border-gray-200 text-black p-2.5 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none";
  const lockedStyle = isDark ? "bg-slate-950 opacity-40 cursor-not-allowed" : "bg-gray-100 opacity-60 cursor-not-allowed";

  if (!isEditing) {
    return (
      <div className="group">
        <label className={labelText}>{label}</label>
        <p className="text-sm font-semibold">{value || "—"}</p>
      </div>
    );
  }

  return (
    <div>
      <label className={labelText}>{label}</label>
      {type === "select" ? (
        <select name={name} value={value} onChange={onChange} className={`${inputBase} ${locked ? lockedStyle : ""}`} disabled={locked}>
          <option value="">Select</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} className={`${inputBase} ${locked ? lockedStyle : ""}`} disabled={locked} />
      )}
    </div>
  );
}