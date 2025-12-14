// client/src/user-pages/manager/tasks/EditTaskPage.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import Swal from "sweetalert2";
import { ThemeContext } from "../../../context/ThemeContext";

export default function EditTaskPage() {
  const { id } = useParams(); // this is task _id
  const navigate = useNavigate();
  const { isDark } = useContext(ThemeContext);

  const [task, setTask] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    tags: "",
    assignedTo: [], // [{ employeeId, name }]
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchTask = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/manager/tasks/${id}`);
        if (!mounted) return;

        const data = res.data;
        setTask(data);
        setForm({
          title: data.title || "",
          description: data.description || "",
          dueDate: data.dueDate ? data.dueDate.slice(0, 10) : "",
          priority: data.priority || "Medium",
          tags: Array.isArray(data.tags)
            ? data.tags.join(", ")
            : data.tags || "",
          assignedTo: data.assignedTo || [],
        });
      } catch (err) {
        console.error("fetchTask", err);
        Swal.fire(
          "Error",
          err.response?.data?.msg || "Unable to fetch task",
          "error"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchTask();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      await Swal.fire("Validation", "Title required", "warning");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description,
        dueDate: form.dueDate || null,
        priority: form.priority,
        tags: form.tags
          ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        assignedTo: form.assignedTo, // keep as-is (no UI editing yet)
      };

      await api.put(`/manager/tasks/${id}`, payload);

      await Swal.fire({
        title: "Saved",
        text: "Task updated",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      navigate(-1);
    } catch (err) {
      console.error("update task", err);
      await Swal.fire(
        "Error",
        err.response?.data?.msg || "Failed to update",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // shared classes
  const pageBg = isDark
    ? "bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-gray-100"
    : "bg-gradient-to-b from-gray-50 to-gray-300 text-gray-900";

  const cardBg = isDark
    ? "bg-slate-900/80 border border-slate-700"
    : "bg-white shadow border border-gray-100";

  const inputBase = isDark
    ? "w-full border p-2 rounded bg-slate-800 border-slate-700 text-gray-100 placeholder:text-gray-400"
    : "w-full border p-2 rounded bg-white border-gray-300 text-gray-900 placeholder:text-gray-400";

  const labelClass = isDark ? "text-sm block text-gray-200" : "text-sm block text-gray-700";

  const secondaryBtn = isDark
    ? "px-3 py-1 bg-slate-700 text-gray-100 rounded hover:bg-slate-600"
    : "px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300";

  const primaryBtn = (disabled) =>
    disabled
      ? "px-3 py-1 bg-gray-400 text-gray-800 rounded cursor-not-allowed"
      : "px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700";

  if (loading) {
    return (
      <div className={`p-6 min-h-screen flex items-center justify-center ${pageBg}`}>
        <div className={isDark ? "text-gray-300" : "text-gray-600"}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen min-w-screen flex items-center justify-center p-4 md:p-6 ${pageBg}`}
    >
      <div className="w-full max-w-4xl flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <h1 className="text-2xl font-semibold">Edit Task</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className={secondaryBtn}
              type="button"
            >
              Back
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={primaryBtn(saving)}
              type="button"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* Card */}
        <div className={`${cardBg} rounded-lg p-6 grid gap-4`}>
          <div>
            <label className={labelClass}>Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className={inputBase}
              placeholder="Task title"
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className={`${inputBase} min-h-[100px]`}
              placeholder="Describe the task..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className={inputBase}
              />
            </div>

            <div>
              <label className={labelClass}>Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className={inputBase}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Tags (comma separated)</label>
            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              className={inputBase}
              placeholder="e.g. frontend, urgent"
            />
          </div>

          {/* Assignees (read-only for now) */}
          <div>
            <label className={labelClass}>Assignees</label>
            <div
              className={
                isDark
                  ? "border border-slate-700 p-2 rounded bg-slate-900/60"
                  : "border border-gray-300 p-2 rounded bg-gray-50"
              }
            >
              {form.assignedTo.length === 0 ? (
                <div className={isDark ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>
                  No assignees
                </div>
              ) : (
                form.assignedTo.map((a) => (
                  <div key={a.employeeId} className="text-sm">
                    {a.name} • {a.employeeId}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
