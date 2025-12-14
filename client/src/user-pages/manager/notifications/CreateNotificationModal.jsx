// client/src/user-pages/manager/notifications/CreateNotificationModal.jsx
import React, { useState, useContext, useEffect } from "react";
import api from "../../../utils/api";
import Swal from "sweetalert2";
import { ThemeContext } from "../../../context/ThemeContext";

export default function CreateNotificationModal({ open, onClose }) {
  const { isDark } = useContext(ThemeContext);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("Announcement");
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // reset fields when modal opens/closes
  useEffect(() => {
    if (open) {
      setTitle("");
      setMessage("");
      setType("Announcement");
      setImage(null);
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) {
      return Swal.fire("Validation", "Title & message required", "warning");
    }

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("title", title);
      fd.append("message", message);
      fd.append("type", type);
      if (image) fd.append("image", image);

      const res = await api.post("/manager/notifications", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire("Created", "Notification created.", "success");
      onClose && onClose(res.data);
    } catch (err) {
      console.error("create notification error", err);
      Swal.fire("Error", err.response?.data?.msg || "Failed to create", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // theme classes
  const overlayBg = "fixed inset-0 z-50 flex items-center justify-center";
  const backdrop = isDark ? "bg-black/60" : "bg-black/40";
  const panelBg = isDark ? "bg-slate-800 text-gray-200 border border-slate-700" : "bg-white text-gray-900";
  const inputBase = isDark
    ? "w-full border p-2 rounded bg-slate-700 text-gray-100 border-slate-600"
    : "w-full border p-2 rounded bg-white text-gray-900 border-gray-300";
  const textareaBase = inputBase;
  const selectBase = inputBase;
  const fileText = isDark ? "text-sm text-gray-300" : "text-sm text-gray-700";
  const btnCancel = isDark ? "px-3 py-1 bg-slate-700 text-gray-200 rounded hover:bg-slate-600" : "px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300";
  const btnPrimary = isDark ? "px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-60" : "px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60";
  const closeBtn = isDark ? "text-gray-300 hover:text-gray-100" : "text-gray-600 hover:text-gray-800";

  return (
    <div className={`${overlayBg} ${backdrop} p-4`}>
      <div className={`w-full max-w-xl rounded-lg p-6 ${panelBg} shadow-lg`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">New Notification</h3>
          <button onClick={onClose} className={`text-sm ${closeBtn}`}>Close</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>Title</label>
            <input
              className={inputBase}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
            />
          </div>

          <div>
            <label className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>Message</label>
            <textarea
              className={textareaBase}
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the message..."
            />
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <label className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>Type</label>
              <select className={selectBase} value={type} onChange={(e) => setType(e.target.value)}>
                <option>Announcement</option>
                <option>Blog</option>
                <option>Notice</option>
                <option>Update</option>
              </select>
            </div>

            <div className="flex-1">
              <label className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>Image (optional)</label>
              <div className="flex items-center gap-3">
                <input
                  id="notification-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                  className={`text-xs p-2 rounded cursor-pointer ${isDark ? "bg-gray-900 " : "bg-gray-300 "}`}
                />
                <div className={fileText}>{image ? image.name : "No file selected"}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className={btnCancel} type="button">Cancel</button>
            <button onClick={handleSubmit} disabled={submitting} className={btnPrimary} type="button">
              {submitting ? "Saving..." : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
