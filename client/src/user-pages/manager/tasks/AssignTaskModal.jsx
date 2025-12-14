// client/src/user-pages/manager/tasks/AssignTaskModal.jsx
import React, { useEffect, useState, useContext } from "react";
import api from "../../../utils/api";
import Swal from "sweetalert2";
import { AuthContext } from "../../../context/AuthContext";
import { ThemeContext } from "../../../context/ThemeContext";

/**
  Props:
    open, onClose, onCreated (callback)
*/
export default function AssignTaskModal({ open, onClose, onCreated }) {
  const { user } = useContext(AuthContext);
  const { isDark } = useContext(ThemeContext);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [tags, setTags] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]); // search results for employees
  const [selected, setSelected] = useState([]); // array of { employeeId, name }
  const [loadingResults, setLoadingResults] = useState(false);

  // reset when closed
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

  // debounce search -> api call
  useEffect(() => {
    if (!search || !search.trim()) {
      setResults([]);
      setLoadingResults(false);
      return;
    }

    setLoadingResults(true);
    const t = setTimeout(async () => {
      try {
        const q = search.trim();
        const res = await api.get("/manager/employees", {
          params: { search: q, limit: 12 },
        });
        const list = (res.data?.data || []).map((u) => ({
          employeeId: u.employeeId,
          name: u.name,
        }));
        // filter out already selected
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
    }, 300);

    return () => clearTimeout(t);
  }, [search, selected]);

  const toggleSelect = (emp) => {
    const exists = selected.find((s) => s.employeeId === emp.employeeId);
    if (exists) {
      setSelected((sel) => sel.filter((s) => s.employeeId !== emp.employeeId));
      // put back to results so user can re-add quickly
      setResults((r) => [emp, ...r]);
    } else {
      setSelected((sel) => [...sel, emp]);
      // remove from results UI
      setResults((r) => r.filter((x) => x.employeeId !== emp.employeeId));
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || selected.length === 0) {
      Swal.fire(
        "Validation",
        "Please provide title and at least one assignee",
        "warning"
      );
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
        tags: tags
          ? tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      };

      const res = await api.post("/manager/tasks", payload);
      Swal.fire("Created", "Task created successfully", "success");
      onCreated && onCreated(res.data);
      onClose && onClose();
    } catch (err) {
      console.error("create task error", err);
      Swal.fire(
        "Error",
        err.response?.data?.msg || "Failed to create task",
        "error"
      );
    }
  };

  if (!open) return null;

  // theme classes
  const overlay = "fixed inset-0 z-50 flex items-center justify-center p-4";
  const backdrop = isDark ? "bg-black/70" : "bg-black/40";
  const panel = isDark
    ? "bg-slate-900 text-gray-200 border border-slate-700"
    : "bg-white text-gray-900 border border-gray-100";
  const inputBase = isDark
    ? "w-full border p-2 rounded bg-slate-800 border-slate-700 text-gray-100 placeholder:text-gray-400"
    : "w-full border p-2 rounded bg-white border-gray-300 text-gray-900 placeholder:text-gray-500";
  const labelBase = isDark ? "text-sm block text-gray-200" : "text-sm block text-gray-700";
  const chipBase = isDark
    ? "px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-gray-200 flex items-center gap-2"
    : "px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-800 flex items-center gap-2";
  const addBtn = isDark
    ? "px-2 py-1 text-xs rounded bg-green-700 text-white hover:bg-green-600"
    : "px-2 py-1 text-xs rounded bg-green-100 text-green-800 hover:bg-green-200";
  const removeBtn = isDark
    ? "ml-2 text-xs text-red-300 hover:text-red-100"
    : "ml-2 text-xs text-red-600 hover:text-red-800";
  const resultRow = isDark
    ? "flex items-center justify-between p-2 rounded hover:bg-slate-800/60 border border-slate-700"
    : "flex items-center justify-between p-2 rounded hover:bg-gray-50 border border-gray-100";

  return (
    <div className={`${overlay} ${backdrop}`}>
      <div className={`w-full max-w-2xl rounded-lg shadow-lg p-6 ${panel} overflow-auto max-h-[90vh]`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Assign Task</h3>
          <button onClick={onClose} className={isDark ? "text-gray-300 hover:text-gray-100" : "text-gray-600 hover:text-gray-900"}>
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelBase}>Title</label>
            <input
              className={inputBase}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelBase}>Description</label>
            <textarea
              className={`${inputBase} min-h-[90px]`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className={labelBase}>Due date</label>
            <input
              type="date"
              className={inputBase}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div>
            <label className={labelBase}>Priority</label>
            <select
              className={inputBase}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className={labelBase}>Tags (comma separated)</label>
            <input
              className={inputBase}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. frontend, urgent"
            />
          </div>

          {/* Employee search & selection */}
          <div className="md:col-span-2">
            <label className={labelBase}>Search employee to assign</label>

            {/* Search input + hint */}
            <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                className={`${inputBase} flex-1`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or ID"
                aria-label="Search employees"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    // quick clear
                    setSearch("");
                    setResults([]);
                  }}
                  className={isDark ? "px-3 py-2 cursor-pointer bg-slate-700 rounded text-gray-200" : "px-3 py-1 bg-gray-100 rounded text-gray-800"}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Selected chips */}
            <div className="mt-3 flex gap-2 flex-wrap">
              {selected.length === 0 ? (
                <div className={isDark ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>No assignees yet</div>
              ) : (
                selected.map((s) => (
                  <div key={s.employeeId} className={chipBase}>
                    <span className="text-sm truncate">{s.name} • {s.employeeId}</span>
                    <button onClick={() => toggleSelect(s)} className={removeBtn} aria-label={`Remove ${s.name}`}>
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Results dropdown */}
            <div className="mt-3">
              {loadingResults && (
                <div className={isDark ? "text-gray-300 text-sm" : "text-gray-600 text-sm"}>Searching…</div>
              )}

              {!loadingResults && results.length === 0 && search.trim() !== "" && (
                <div className={isDark ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>No matches</div>
              )}

              {!loadingResults && results.length > 0 && (
                <div className="mt-2 grid gap-2 max-h-48 overflow-auto">
                  {results.map((r) => (
                    <div key={r.employeeId} className={resultRow}>
                      <div>
                        <div className={isDark ? "font-medium text-gray-100" : "font-medium text-gray-900"}>{r.name}</div>
                        <div className={isDark ? "text-xs text-gray-400" : "text-xs text-gray-500"}>{r.employeeId}</div>
                      </div>
                      <div>
                        <button
                          onClick={() => toggleSelect(r)}
                          className={addBtn}
                          aria-label={`Add ${r.name}`}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onClose} className={isDark ? "px-3 py-1 bg-slate-700 rounded text-gray-200" : "px-3 py-1 bg-gray-200 rounded text-gray-800"}>
            Cancel
          </button>
          <button onClick={handleCreate} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}
