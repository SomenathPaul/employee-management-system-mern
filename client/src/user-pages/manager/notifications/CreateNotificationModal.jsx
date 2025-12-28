// client/src/user-pages/manager/notifications/CreateNotificationModal.jsx
import React, { useState, useContext, useEffect } from "react";
import api from "../../../utils/api";
import Swal from "sweetalert2";
import { ThemeContext } from "../../../context/ThemeContext";
import { FiX, FiBell, FiImage, FiType, FiSend } from "react-icons/fi";

/**
 * CreateNotificationModal Component
 * Purpose: Allows managers to create multi-type broadcasts (Announcements, Blogs, etc.) 
 * with optional image attachments.
 */
export default function CreateNotificationModal({ open, onClose }) {
  const { isDark } = useContext(ThemeContext);

  // --- FORM STATE ---
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("Announcement");
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Reset all state fields when the modal is triggered
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

  /* ================= SUBMISSION LOGIC ================= */
  const handleSubmit = async () => {
    // Basic frontend validation
    if (!title.trim() || !message.trim()) {
      return Swal.fire("Required Fields", "Please provide both a title and a message body.", "warning");
    }

    try {
      setSubmitting(true);
      
      // Use FormData to support multipart image uploads
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("message", message.trim());
      fd.append("type", type);
      if (image) fd.append("image", image);

      const res = await api.post("/manager/notifications", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        title: "Broadcasted",
        text: "Your notification is now visible to the team.",
        icon: "success",
        confirmButtonColor: "#3b82f6"
      });
      
      // Close and trigger parent refresh
      onClose && onClose(res.data);
    } catch (err) {
      console.error("Create notification error:", err);
      Swal.fire("System Error", err.response?.data?.msg || "Failed to publish notification", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= DYNAMIC STYLES ================= */
  const panelBg = isDark 
    ? "bg-slate-900 border-slate-800 text-slate-100 shadow-2xl" 
    : "bg-white text-slate-900 shadow-2xl";
    
  const inputBase = isDark
    ? "w-full border p-3 rounded-xl bg-slate-800 border-slate-700 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
    : "w-full border p-3 rounded-xl bg-gray-50 border-gray-200 text-slate-900 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all";
  
  const labelStyle = "text-[10px] font-black uppercase tracking-widest opacity-50 mb-1.5 flex items-center gap-1.5";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop blur for focus */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

      <div className={`relative w-full max-w-xl rounded-3xl overflow-hidden border transition-all duration-300 ${panelBg}`}>
        
        {/* MODAL HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-inherit">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <FiBell size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">Create Notification</h3>
              <p className="text-[10px] uppercase opacity-50 font-bold tracking-wider">Internal Broadcast</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-500/10 transition-colors">
            <FiX size={24} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 space-y-6">
          
          {/* Title Input */}
          <div>
            <label className={labelStyle}><FiType /> Headline</label>
            <input
              className={inputBase}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 Performance Reviews"
            />
          </div>

          {/* Message Area */}
          <div>
            <label className={labelStyle}><FiType /> Body Message</label>
            <textarea
              className={`${inputBase} min-h-[120px] resize-none`}
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide detailed information for the team..."
            />
          </div>

          {/* Type & Image Meta Row */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className={labelStyle}>Notification Type</label>
              <select className={`${inputBase} cursor-pointer appearance-none`} value={type} onChange={(e) => setType(e.target.value)}>
                <option>Announcement</option>
                <option>Blog</option>
                <option>Notice</option>
                <option>Update</option>
              </select>
            </div>

            <div className="flex-1">
              <label className={labelStyle}><FiImage /> Attach Image</label>
              <label className={`
                flex items-center gap-3 p-3 rounded-xl border-2 border-dashed cursor-pointer transition-all
                ${isDark ? "bg-slate-800/50 border-slate-700 hover:border-blue-500" : "bg-gray-50 border-gray-200 hover:border-blue-400"}
              `}>
                <FiImage className="text-blue-500 shrink-0" size={20} />
                <span className="text-xs font-bold truncate opacity-60">
                  {image ? image.name : "Select Media File"}
                </span>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-6 bg-inherit border-t border-inherit flex flex-col sm:flex-row justify-end gap-3">
          <button 
            onClick={onClose} 
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${isDark ? "bg-slate-800 text-slate-300" : "bg-gray-100 text-gray-600"}`}
            type="button"
          >
            Discard
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={submitting} 
            className="flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
            type="button"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><FiSend /> Publish Now</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}