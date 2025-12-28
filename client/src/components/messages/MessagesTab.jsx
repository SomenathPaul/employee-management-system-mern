// client/src/user-pages/employee/messages/MessagesTab.jsx
import React, { useEffect, useState, useContext, useRef } from "react";
import { FaPaperPlane, FaChevronLeft, FaSearch, FaCircle } from "react-icons/fa";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { MessageContext } from "../../context/MessageContext";
import io from "socket.io-client";
import axios from "axios";

/**
 * MessagesTab Component
 * Facilitates real-time peer-to-peer communication using Socket.io.
 * Features: Searchable user list, message persistence, and theme-adaptive UI.
 */
export default function MessagesTab() {
  const { isDark } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const { markAllMessagesRead } = useContext(MessageContext);

  const currentUserId = user?.id;

  // --- Refs & State ---
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [socketReady, setSocketReady] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // For mobile responsiveness

  // --- Auth Guard ---
  if (!user || !currentUserId) {
    return (
      <div className="flex h-full items-center justify-center animate-pulse">
        <p className="text-gray-500 font-medium">Authenticating chat session...</p>
      </div>
    );
  }

  // Initial Cleanup
  useEffect(() => {
    markAllMessagesRead();
  }, []);

  /* ================= SOCKET.IO LIFECYCLE ================= */
  useEffect(() => {
    // Initialize connection
    socketRef.current = io("http://localhost:5000", {
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      setSocketReady(true);
      socketRef.current.emit("join", currentUserId); // Link socket ID to User ID on server
    });

    socketRef.current.on("receiveMessage", (msg) => {
      const senderId = msg.senderId.toString();
      // Update local state when a new message arrives
      setMessages((prev) => ({
        ...prev,
        [senderId]: [...(prev[senderId] || []), msg],
      }));
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocketReady(false);
    };
  }, [currentUserId]);

  /* ================= DATA FETCHING ================= */
  // Load directory of users
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/users")
      .then((res) => {
        const filtered = res.data.filter((u) => u._id !== currentUserId);
        setUsers(filtered);
        // Default selection for desktop
        if (window.innerWidth > 768 && filtered.length > 0) setSelectedUser(filtered[0]);
      })
      .catch((err) => console.error("Load users failed:", err));
  }, [currentUserId]);

  // Load chat history when switching users
  useEffect(() => {
    if (!selectedUser) return;

    const otherId = selectedUser._id;

    // Fetch history from DB
    axios
      .get(`http://localhost:5000/api/messages/${currentUserId}/${otherId}`)
      .then((res) => {
        setMessages((prev) => ({ ...prev, [otherId]: res.data }));
      })
      .catch((err) => console.error("Load messages failed:", err));

    // Mark these messages as read in DB
    axios.post("http://localhost:5000/api/messages/read", {
      senderId: otherId,
      receiverId: currentUserId,
    });

    // On mobile, close sidebar when a user is picked
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, [selectedUser, currentUserId]);

  /* ================= UI LOGIC ================= */
  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUser]);

  const handleSend = () => {
    if (!socketReady || !socketRef.current || !newMessage.trim() || !selectedUser) return;

    const payload = {
      senderId: currentUserId,
      receiverId: selectedUser._id,
      text: newMessage,
      createdAt: new Date().toISOString()
    };

    socketRef.current.emit("sendMessage", payload);

    // Optimistic UI update
    setMessages((prev) => ({
      ...prev,
      [selectedUser._id]: [...(prev[selectedUser._id] || []), payload],
    }));

    setNewMessage("");
  };

  const getUnreadCount = (userId) =>
    (messages[userId] || []).filter((m) => !m.isRead && m.senderId?.toString() === userId).length;

  const getUserPhoto = (u) =>
    u.photo ? `http://localhost:5000/uploads/${u.photo}` : "/default-avatar.png";

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Dynamic Theme Classes ---
  const wrapperBg = isDark ? "bg-slate-900" : "bg-gray-50";
  const sidebarBg = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-r border-gray-200";
  const chatHeaderBg = isDark ? "bg-slate-800/50 backdrop-blur-md" : "bg-white/80 backdrop-blur-md shadow-sm";
  const incomingBubble = isDark ? "bg-slate-700 text-slate-100" : "bg-white text-slate-800 shadow-sm border border-gray-100";
  const outgoingBubble = "bg-blue-600 text-white shadow-md shadow-blue-500/20";
  const inputContainer = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-t border-gray-200";

  return (
    <div className={`flex h-full w-full transition-colors duration-300 ${wrapperBg}`}>
      {/* SIDEBAR - Users List */}
      <aside className={`
        ${isSidebarOpen ? 'flex' : 'hidden'} md:flex flex-col
        w-full md:w-80 lg:w-96 ${sidebarBg} transition-all duration-300
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-800"}`}>Messages</h3>
            <FaCircle className={socketReady ? "text-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "text-red-500"} size={10} />
          </div>
          
          <div className="relative group">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all
                ${isDark ? "bg-slate-900 border-slate-700 text-white focus:border-blue-500" : "bg-gray-100 border-transparent focus:bg-white focus:border-blue-400"}`}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {filteredUsers.map((u) => (
            <div
              key={u._id}
              onClick={() => setSelectedUser(u)}
              className={`group flex items-center p-3 rounded-2xl cursor-pointer transition-all
                ${selectedUser?._id === u._id 
                  ? (isDark ? "bg-blue-600/20" : "bg-blue-50") 
                  : (isDark ? "hover:bg-slate-700/50" : "hover:bg-gray-100")}`}
            >
              <div className="relative">
                <img src={getUserPhoto(u)} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-transparent group-hover:border-blue-400 transition-all" />
                {/* <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" /> */}
              </div>

              <div className="flex-1 ml-3 min-w-0">
                <p className={`font-bold truncate ${isDark ? "text-slate-100" : "text-slate-800"}`}>{u.name}</p>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{u.role}</p>
              </div>

              {getUnreadCount(u._id) > 0 && (
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                  {getUnreadCount(u._id)}
                </span>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${!isSidebarOpen ? 'flex' : 'hidden md:flex'}`}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <header className={`p-4 flex items-center gap-4 border-b ${chatHeaderBg}`}>
              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 hover:bg-black/5 rounded-full">
                <FaChevronLeft />
              </button>
              <img src={getUserPhoto(selectedUser)} className="w-10 h-10 rounded-full object-cover shadow-sm" />
              <div>
                <p className={`font-bold leading-none ${isDark ? "text-white" : "text-slate-800"}`}>{selectedUser.name}</p>
                <p className="text-xs text-slate-500 mt-1 font-semibold">{selectedUser.role}</p>
              </div>
            </header>

            {/* Messages Display */}
            <div className={`flex-1 p-6 space-y-4 overflow-y-auto no-scrollbar`}>
              {(messages[selectedUser._id] || []).map((m, i) => {
                const isMine = m.senderId?.toString() === currentUserId;
                return (
                  <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`px-4 py-2.5 max-w-[75%] md:max-w-md text-sm font-medium
                      ${isMine ? `rounded-2xl rounded-tr-none ${outgoingBubble}` 
                               : `rounded-2xl rounded-tl-none ${incomingBubble}`}`}>
                      {m.text}
                      <p className={`text-[10px] mt-1 text-right opacity-60`}>
                        {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <footer className={`p-4 border-t ${inputContainer}`}>
              <div className="max-w-4xl mx-auto flex items-center gap-3">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your message..."
                  className={`flex-1 px-5 py-3 rounded-2xl border outline-none transition-all
                    ${isDark ? "bg-slate-900 border-slate-700 text-white focus:border-blue-500" 
                             : "bg-gray-100 border-transparent focus:bg-white focus:border-blue-400"}`}
                />
                <button
                  onClick={handleSend}
                  disabled={!socketReady || !newMessage.trim()}
                  className={`p-3.5 bg-blue-600 text-white rounded-2xl transition-all active:scale-90 shadow-lg shadow-blue-500/30
                    ${(!socketReady || !newMessage.trim()) ? "opacity-50 grayscale cursor-not-allowed" : "hover:bg-blue-700"}`}
                >
                  <FaPaperPlane size={18} />
                </button>
              </div>
            </footer>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center opacity-40">
            <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <FaPaperPlane size={32} />
            </div>
            <p className="font-bold text-lg">Your messages will appear here</p>
            <p className="text-sm">Select a contact to start chatting</p>
          </div>
        )}
      </main>
    </div>
  );
}