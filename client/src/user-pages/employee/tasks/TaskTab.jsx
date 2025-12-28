import React, { useEffect, useState, useContext } from "react";
import api from "../../../utils/api";
import { AuthContext } from "../../../context/AuthContext";
import { ThemeContext } from "../../../context/ThemeContext";
import { TaskContext } from "../../../context/TaskContext";
import Swal from "sweetalert2";
import { FiClock, FiFileText, FiCheckCircle, FiInfo, FiUploadCloud, FiX } from "react-icons/fi";

/**
 * TaskTab Component
 * Manages the lifecycle of employee tasks including viewing, status updates, 
 * and document submission for completion.
 */
export default function TaskTab() {
  const { user } = useContext(AuthContext);
  const { isDark } = useContext(ThemeContext);
  const { refreshPendingTasks } = useContext(TaskContext);

  // --- STATE MANAGEMENT ---
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({}); // Tracking loading per task ID
  const [selectedFile, setSelectedFile] = useState({});
  const [showSubmit, setShowSubmit] = useState({});
  const [viewTask, setViewTask] = useState(null);

  /**
   * Fetches assigned tasks from the manager API
   */
  const fetchMyTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/manager/tasks/employee/me");
      setTasks(res.data?.data || []);
    } catch {
      Swal.fire("Error", "Unable to fetch tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
    refreshPendingTasks(); // Sync unread task counts in sidebar/nav
  }, []);

  /**
   * Handles multi-part file upload and marks task as Completed
   * @param {string} taskId 
   */
  const uploadAndCompleteTask = async (taskId) => {
    if (!selectedFile[taskId]) {
      Swal.fire("File required", "Please upload PDF or Document", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile[taskId]);

    setActionLoading((s) => ({ ...s, [taskId]: true }));

    try {
      await api.post(`/employee/tasks/${taskId}/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire("Great Job!", "Task submitted successfully", "success");
      fetchMyTasks();
      refreshPendingTasks();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.msg || "Submission failed", "error");
    } finally {
      setActionLoading((s) => ({ ...s, [taskId]: false }));
    }
  };

  // --- THEME-BASED STYLING ---
  const pageBg = isDark ? "bg-slate-900 text-slate-100" : "bg-gray-50 text-slate-900";
  const cardBg = isDark ? "bg-slate-800/50 backdrop-blur-md border border-slate-700" : "bg-white border-gray-100 shadow-sm";
  const modalBg = isDark ? "bg-slate-800 border border-slate-700" : "bg-white shadow-2xl";
  const inputBase = isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-300 text-black";

  // Logic to separate active work from history
  const sortedTasks = [...tasks].sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));
  const activeTasks = sortedTasks.filter((t) => t.status !== "Completed");
  const completedTasks = sortedTasks.filter((t) => t.status === "Completed");

  if (loading) {
    return (
      <div className={`p-8 h-full flex flex-col items-center justify-center ${pageBg}`}>
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium opacity-60">Synchronizing Tasks...</p>
      </div>
    );
  }

  /**
   * Helper component to render individual Task Cards
   */
  const renderTaskCard = (t) => {
    const tid = t._id;
    const busy = actionLoading[tid];

    const statusStyle =
      t.status === "Pending" ? "bg-amber-500/20 text-amber-500 border-amber-500/30" :
      t.status === "In Progress" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
      "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";

    return (
      <article key={tid} className={`${cardBg} rounded-2xl p-6 transition-all duration-300 hover:shadow-xl flex flex-col`}>
        {/* Card Header */}
        <div className="flex justify-between items-start mb-4">
          <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-lg border ${statusStyle}`}>
            {t.status}
          </span>
          <button onClick={() => setViewTask(t)} className="p-2 hover:bg-blue-500/10 rounded-full text-blue-500 transition-colors">
            <FiInfo size={18} />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1">
          <h3 className="text-lg font-bold tracking-tight mb-1">{t.title}</h3>
          <div className="flex items-center gap-2 text-xs opacity-60 mb-3 font-medium">
            <FiClock /> Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No Deadline"}
          </div>
          <p className="text-sm opacity-70 line-clamp-2 leading-relaxed mb-6">
            {t.description || "Project details not provided."}
          </p>
        </div>

        {/* Action Buttons based on Status */}
        <div className="mt-auto pt-4 border-t border-slate-700/20">
          {t.status === "Pending" && (
            <button
              onClick={() => api.put(`/employee/tasks/${tid}/progress`, { status: "In Progress" }).then(fetchMyTasks)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Start Work
            </button>
          )}

          {t.status === "In Progress" && !showSubmit[tid] && (
            <button
              onClick={() => setShowSubmit((s) => ({ ...s, [tid]: true }))}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Ready to Submit
            </button>
          )}

          {showSubmit[tid] && t.status === "In Progress" && (
            <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
              <label className={`group flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${isDark ? "border-slate-600 hover:border-blue-500 bg-slate-700/30" : "border-gray-200 hover:border-blue-400 bg-gray-50"}`}>
                <div className="flex flex-col items-center justify-center py-4">
                  <FiUploadCloud className="text-blue-500 mb-1" size={20} />
                  <p className="text-[10px] font-bold uppercase opacity-60">
                    {selectedFile[tid] ? selectedFile[tid].name : "Upload File"}
                  </p>
                </div>
                <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => setSelectedFile((s) => ({ ...s, [tid]: e.target.files[0] }))} />
              </label>

              <button
                onClick={() => uploadAndCompleteTask(tid)}
                disabled={busy}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold disabled:opacity-50"
              >
                {busy ? "Uploading..." : "Finish Task"}
              </button>
            </div>
          )}

          {t.status === "Completed" && (
            <div className="w-full text-center py-2.5 text-emerald-500 font-bold flex items-center justify-center gap-2">
              <FiCheckCircle /> Archived
            </div>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className={`p-4 md:p-8 h-full overflow-y-auto transition-colors duration-300 ${pageBg}`}>
      <div className="max-w-7xl mx-auto">
        {/* --- ACTIVE TASKS SECTION --- */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-blue-600 rounded-full" />
            <h2 className="text-2xl font-black tracking-tight uppercase">Assigned Tasks</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTasks.length ? activeTasks.map(renderTaskCard) : (
              <div className="col-span-full py-16 text-center opacity-40 italic">No tasks currently require your attention.</div>
            )}
          </div>
        </section>

        {/* --- COMPLETED TASKS SECTION --- */}
        <section>
          <div className="flex items-center gap-3 mb-6 opacity-60">
            <div className="w-2 h-8 bg-emerald-600 rounded-full" />
            <h2 className="text-2xl font-black tracking-tight uppercase">History</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedTasks.length ? completedTasks.map(renderTaskCard) : (
              <div className="col-span-full py-10 text-center opacity-40 italic">No historical data available.</div>
            )}
          </div>
        </section>
      </div>

      {/* --- TASK DETAIL MODAL --- */}
      {viewTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${modalBg} w-full max-w-xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300`}>
            <div className="relative p-8">
              <button onClick={() => setViewTask(null)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors">
                <FiX size={24} />
              </button>

              <h3 className="text-2xl font-black mb-4">{viewTask.title}</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-[10px] font-bold uppercase text-blue-400 mb-1">Status</p>
                  <p className="text-sm font-bold">{viewTask.status}</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-[10px] font-bold uppercase text-amber-400 mb-1">Priority</p>
                  <p className="text-sm font-bold">{viewTask.priority || "Standard"}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase opacity-50 mb-1 block tracking-widest">Project Description</label>
                  <p className="text-sm leading-relaxed opacity-80">{viewTask.description || "No specific instructions provided."}</p>
                </div>
                
                <div className="pt-4 border-t border-slate-700/20 flex items-center gap-2">
                  <FiFileText className="text-blue-500" />
                  <span className="text-xs font-medium">Assigned to: {viewTask.assignedTo?.map((a) => a.name).join(", ")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}