// client/src/user-pages/manager/tasks/EditTaskPage.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import Swal from "sweetalert2";
import { ThemeContext } from "../../../context/ThemeContext";
import { FiArrowLeft, FiSave, FiClock, FiFlag, FiTag, FiUsers } from "react-icons/fi";

/**
 * EditTaskPage Component
 * Purpose: Allows managers to modify details of an existing task.
 * Features: Responsive grid, Priority-based visual coding, and Theme integration.
 */
export default function EditTaskPage() {
  const { id } = useParams(); // Task MongoDB _id
  const navigate = useNavigate();
  const { isDark } = useContext(ThemeContext);

  // --- STATE MANAGEMENT ---
  const [task, setTask] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    tags: "",
    assignedTo: [], 
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    let mounted = true;
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/manager/tasks/${id}`);
        if (!mounted) return;

        const data = res.data;
        setTask(data);
        // Map backend data to form state, ensuring safe fallbacks
        setForm({
          title: data.title || "",
          description: data.description || "",
          dueDate: data.dueDate ? data.dueDate.slice(0, 10) : "",
          priority: data.priority || "Medium",
          tags: Array.isArray(data.tags) ? data.tags.join(", ") : data.tags || "",
          assignedTo: data.assignedTo || [],
        });
      } catch (err) {
        console.error("fetchTask Error:", err);
        Swal.fire("Error", "Unable to load task details", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchTaskDetails();
    return () => { mounted = false; };
  }, [id]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      await Swal.fire("Validation", "Task title is mandatory", "warning");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description,
        dueDate: form.dueDate || null,
        priority: form.priority,
        // Convert comma-separated string back to a cleaned array
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        assignedTo: form.assignedTo, 
      };

      await api.put(`/manager/tasks/${id}`, payload);

      Swal.fire({
        title: "Updated",
        text: "Changes saved successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate(-1);
    } catch (err) {
      console.error("Update Task Error:", err);
      Swal.fire("Error", err.response?.data?.msg || "Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ================= DYNAMIC STYLES ================= */
  const pageBg = isDark
    ? "bg-slate-950 text-slate-100"
    : "bg-gray-100 text-slate-900";

  const cardBg = isDark
    ? "bg-slate-900/50 backdrop-blur-md border border-slate-800 shadow-2xl"
    : "bg-white shadow-xl border border-gray-200";

  const inputStyle = isDark
    ? "w-full border p-3 rounded-xl bg-slate-800 border-slate-700 text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
    : "w-full border p-3 rounded-xl bg-gray-50 border-gray-300 text-slate-900 focus:ring-2 focus:ring-blue-400 outline-none transition-all";

  const labelStyle = "text-[10px] font-black uppercase tracking-widest opacity-50 mb-1.5 flex items-center gap-2";

  // Priority indicator color
  const priorityBorder = {
    Low: "border-l-blue-500",
    Medium: "border-l-amber-500",
    High: "border-l-orange-600",
    Critical: "border-l-red-600",
  }[form.priority] || "border-l-slate-500";

  if (loading) {
    return (
      <div className={`h-screen w-full flex flex-col items-center justify-center ${pageBg}`}>
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold opacity-50 uppercase tracking-widest">Loading Task Data</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full p-4 md:p-8 flex flex-col items-center transition-colors duration-300 ${pageBg}`}>
      <div className="w-full max-w-4xl">
        
        {/* --- TOP NAV BAR --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2.5 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 transition-all">
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Edit Task</h1>
              <p className="text-xs opacity-50 font-medium italic">Task ID: {id}</p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg
              ${saving ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"}`}
          >
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave />}
            {saving ? "Updating..." : "Save Changes"}
          </button>
        </div>

        {/* --- MAIN FORM CARD --- */}
        <div className={`${cardBg} rounded-3xl p-6 md:p-10 border-l-[6px] ${priorityBorder} transition-all duration-500 space-y-8`}>
          
          {/* Section: Core Info */}
          <div className="grid gap-6">
            <div>
              <label className={labelStyle}><FiTag /> Task Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className={inputStyle}
                placeholder="Title of the assignment..."
              />
            </div>

            <div>
              <label className={labelStyle}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className={`${inputStyle} min-h-[120px] resize-none`}
                placeholder="Provide detailed instructions..."
              />
            </div>
          </div>

          {/* Section: Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className={labelStyle}><FiClock /> Deadline</label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>

            <div>
              <label className={labelStyle}><FiFlag /> Priority Level</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className={inputStyle}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className={labelStyle}><FiTag /> Tags</label>
              <input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                className={inputStyle}
                placeholder="e.g. backend, urgent, review"
              />
            </div>

            {/* Read-Only Assignees Section */}
            <div>
              <label className={labelStyle}><FiUsers /> Assigned Team Members</label>
              <div className={`p-3 rounded-xl border min-h-[50px] flex flex-wrap gap-2 ${isDark ? "bg-slate-950/40 border-slate-700" : "bg-gray-50 border-gray-200"}`}>
                {form.assignedTo.length === 0 ? (
                  <span className="text-xs opacity-40 italic">No team members assigned</span>
                ) : (
                  form.assignedTo.map((a) => (
                    <div key={a.employeeId} className={`px-3 py-1 rounded-lg text-xs font-bold border ${isDark ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-blue-100 border-blue-200 text-blue-700"}`}>
                      {a.name} <span className="opacity-50 ml-1">• {a.employeeId}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Footer info for mobile */}
        <div className="mt-6 text-center lg:hidden">
          <p className="text-[10px] uppercase font-bold opacity-30 tracking-widest">End of Task Configuration</p>
        </div>
      </div>
    </div>
  );
}