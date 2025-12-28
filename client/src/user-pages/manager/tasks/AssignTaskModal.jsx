// client/src/user-pages/manager/tasks/AssignTaskModal.jsx
import React, { useEffect, useState, useContext } from "react";
import api from "../../../utils/api";
import Swal from "sweetalert2";
import { AuthContext } from "../../../context/AuthContext";
import { ThemeContext } from "../../../context/ThemeContext";
import { FiX, FiSearch, FiUserPlus, FiCalendar, FiFlag, FiTag, FiCheck } from "react-icons/fi";

/**
 * AssignTaskModal Component
 * Purpose: A centralized modal for managers to create and delegate tasks to team members.
 * Includes real-time employee search with debouncing.
 */
export default function AssignTaskModal({ open, onClose, onCreated }) {
  const { user } = useContext(AuthContext);
  const { isDark } = useContext(ThemeContext);

  // --- FORM STATE ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [tags, setTags] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]); // Dynamic employee search results
  const [selected, setSelected] = useState([]); // Currently selected assignees
  const [loadingResults, setLoadingResults] = useState(false);

  // Reset form data when the modal is closed to ensure a clean state on re-open
  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("Medium");
      setTags("");
      setSearch("");
      setResults([]);
      setSelected([]);
    }
  }, [open]);

  // --- SEARCH LOGIC (WITH DEBOUNCE) ---
  useEffect(() => {
    if (!search || !search.trim()) {
      setResults([]);
      setLoadingResults(false);
      return;
    }

    setLoadingResults(true);
    // Prevents making an API call on every keystroke
    const debounceTimeout = setTimeout(async () => {
      try {
        const query = search.trim();
        const res = await api.get("/manager/employees", {
          params: { search: query, limit: 10 },
        });
        
        const list = (res.data?.data || []).map((u) => ({
          employeeId: u.employeeId,
          name: u.name,
        }));

        // Filter out employees who are already selected to avoid duplicates
        const filtered = list.filter(
          (l) => !selected.some((s) => s.employeeId === l.employeeId)
        );
        setResults(filtered);
      } catch (err) {
        console.error("searchEmployees error", err);
        setResults([]);
      } finally {
        setLoadingResults(false);
      }
    }, 400); // 400ms delay

    return () => clearTimeout(debounceTimeout);
  }, [search, selected]);

  const toggleSelect = (emp) => {
    const exists = selected.find((s) => s.employeeId === emp.employeeId);
    if (exists) {
      setSelected((sel) => sel.filter((s) => s.employeeId !== emp.employeeId));
    } else {
      setSelected((sel) => [...sel, emp]);
      setResults((r) => r.filter((x) => x.employeeId !== emp.employeeId));
    }
  };

  /**
   * Final validation and API submission
   */
  const handleCreate = async () => {
    if (!title.trim() || selected.length === 0) {
      Swal.fire("Incomplete Form", "Task title and at least one assignee are required.", "warning");
      return;
    }

    try {
      const payload = {
        title: title.trim(),
        description,
        assignedTo: selected.map((s) => ({
          employeeId: s.employeeId,
          name: s.name,
        })),
        dueDate: dueDate || null,
        priority,
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      };

      const res = await api.post("/manager/tasks", payload);
      Swal.fire("Task Assigned", "Team members have been notified.", "success");
      onCreated && onCreated(res.data);
      onClose && onClose();
    } catch (err) {
      Swal.fire("Error", "Could not create task. Check connection.", "error");
    }
  };

  if (!open) return null;

  // --- THEME DYNAMIC STYLES ---
  const panelBg = isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-gray-100 text-slate-900";
  const inputBase = isDark ? "bg-slate-800 border-slate-700 text-white focus:ring-blue-500/50" : "bg-gray-50 border-gray-200 text-slate-900 focus:ring-blue-500/20";
  const labelStyle = "text-[10px] font-black uppercase tracking-widest opacity-50 mb-1.5 flex items-center gap-1.5";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

      <div className={`relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 border ${panelBg}`}>
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-inherit">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <FiUserPlus size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">Assign New Task</h3>
              <p className="text-[10px] uppercase opacity-50 font-bold">Delegation Hub</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-500/10 transition-colors">
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
          
          {/* TITLE & DESCRIPTION */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className={labelStyle}><FiTag /> Task Title</label>
              <input
                className={`${inputBase} w-full p-3 rounded-xl border outline-none transition-all`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q4 Financial Audit"
              />
            </div>

            <div>
              <label className={labelStyle}><FiTag /> Description</label>
              <textarea
                className={`${inputBase} w-full p-3 rounded-xl border outline-none transition-all min-h-[100px] resize-none`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail the task objectives..."
              />
            </div>
          </div>

          {/* META: DATE & PRIORITY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}><FiCalendar /> Deadline</label>
              <input
                type="date"
                className={`${inputBase} w-full p-3 rounded-xl border outline-none`}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div>
              <label className={labelStyle}><FiFlag /> Priority Level</label>
              <select
                className={`${inputBase} w-full p-3 rounded-xl border outline-none appearance-none`}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Critical">Critical Priority</option>
              </select>
            </div>
          </div>

          {/* ASSIGNEE SEARCH SYSTEM */}
          <div>
            <label className={labelStyle}><FiSearch /> Assign Team Members</label>
            
            <div className="relative group">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-blue-500 transition-colors" />
              <input
                className={`${inputBase} w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or employee ID..."
              />
            </div>

            {/* Selection Tray */}
            <div className="mt-3 flex flex-wrap gap-2">
              {selected.map((s) => (
                <div key={s.employeeId} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold animate-in zoom-in-95">
                  <span>{s.name}</span>
                  <button onClick={() => toggleSelect(s)} className="hover:text-red-200 transition-colors"><FiX /></button>
                </div>
              ))}
              {selected.length === 0 && <p className="text-xs italic opacity-40 py-2">No one assigned yet.</p>}
            </div>

            {/* Dynamic Results Dropdown */}
            {search.trim() !== "" && (
              <div className={`mt-2 rounded-2xl border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"} shadow-xl max-h-40 overflow-y-auto`}>
                {loadingResults ? (
                  <div className="p-4 text-center text-xs opacity-50 animate-pulse">Syncing Directory...</div>
                ) : results.length > 0 ? (
                  results.map((r) => (
                    <button
                      key={r.employeeId}
                      onClick={() => toggleSelect(r)}
                      className="w-full flex items-center justify-between p-3 hover:bg-blue-500/10 transition-colors border-b border-inherit last:border-0"
                    >
                      <div className="text-left">
                        <p className="text-sm font-bold">{r.name}</p>
                        <p className="text-[10px] opacity-50 font-mono">{r.employeeId}</p>
                      </div>
                      <FiCheck className="text-blue-500 opacity-0 group-hover:opacity-100" />
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs opacity-50">No matching employees found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="p-6 bg-inherit border-t border-inherit flex flex-col sm:flex-row justify-end gap-3">
          <button 
            onClick={onClose} 
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Cancel
          </button>
          <button 
            onClick={handleCreate} 
            className="px-8 py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all"
          >
            Dispatch Task
          </button>
        </div>
      </div>
    </div>
  );
}