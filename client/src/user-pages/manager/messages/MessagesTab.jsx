// client/src/user-pages/employee/messages/MessagesTab.jsx
import React, { useEffect, useState, useContext, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { ThemeContext } from "../../../context/ThemeContext";
import { AuthContext } from "../../../context/AuthContext";
import io from "socket.io-client";
import axios from "axios";

export default function MessagesTab() {
  const { isDark } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);

  const currentUserId = user?.id;

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [socketReady, setSocketReady] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  /* ================= AUTH GUARD ================= */
  if (!user || !currentUserId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Loading chat...</p>
      </div>
    );
  }

  /* ================= SOCKET ================= */
  useEffect(() => {
    socketRef.current = io("http://localhost:5000", {
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      setSocketReady(true);
      socketRef.current.emit("join", currentUserId);
    });

    socketRef.current.on("receiveMessage", (msg) => {
      const senderId = msg.senderId.toString();

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

  /* ================= LOAD USERS ================= */
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/users")
      .then((res) => {
        // 🔴 CHANGE 1: Remove logged-in user from list
        const filtered = res.data.filter(
          (u) => u._id !== currentUserId
        );

        setUsers(filtered);
        if (filtered.length > 0) setSelectedUser(filtered[0]);
      })
      .catch((err) => console.error("Load users failed:", err));
  }, [currentUserId]);

  /* ================= LOAD MESSAGES ================= */
  useEffect(() => {
    if (!selectedUser) return;

    const otherId = selectedUser._id;

    axios
      .get(`http://localhost:5000/api/messages/${currentUserId}/${otherId}`)
      .then((res) => {
        setMessages((prev) => ({
          ...prev,
          [otherId]: res.data,
        }));
      })
      .catch((err) => console.error("Load messages failed:", err));

    axios.post("http://localhost:5000/api/messages/read", {
      senderId: otherId,
      receiverId: currentUserId,
    });
  }, [selectedUser, currentUserId]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUser]);

  /* ================= SEND MESSAGE ================= */
  const handleSend = () => {
    if (!socketReady || !socketRef.current) return;
    if (!newMessage.trim() || !selectedUser) return;

    const payload = {
      senderId: currentUserId,
      receiverId: selectedUser._id,
      text: newMessage,
    };

    socketRef.current.emit("sendMessage", payload);

    setMessages((prev) => ({
      ...prev,
      [selectedUser._id]: [
        ...(prev[selectedUser._id] || []),
        payload,
      ],
    }));

    setNewMessage("");
  };

  /* ================= HELPERS ================= */
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUnreadCount = (userId) =>
    (messages[userId] || []).filter(
      (m) =>
        !m.isRead &&
        m.senderId?.toString() === userId
    ).length;

  // 🔴 CHANGE 2: Correct profile image source
  const getUserPhoto = (u) =>
    u.photo
      ? `http://localhost:5000/uploads/${u.photo}`
      : "/default-avatar.png";

  /* ================= THEME ================= */
  const wrapperBg = isDark ? "bg-slate-900 text-gray-200" : "bg-gray-50 text-gray-800";
  const sidebarBg = isDark ? "bg-slate-800" : "bg-white border-r";
  const chatAreaBg = isDark ? "bg-slate-900" : "bg-gray-100";
  const incomingBubble = isDark ? "bg-slate-800 text-gray-200" : "bg-white text-gray-800";
  const outgoingBubble = "bg-blue-500 text-white";
  const inputBg = isDark ? "bg-slate-700 text-gray-200" : "bg-black/10 text-gray-800";

  return (
    <div className={`flex h-full shadow-md overflow-hidden ${wrapperBg}`}>
      {/* SIDEBAR */}
      <div className={`w-1/3 ${sidebarBg} overflow-y-auto`}>
        <h3 className="text-xl font-semibold p-6">Messages</h3>

        <input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-[90%] mx-4 mb-3 px-4 py-2 rounded-full ${inputBg}`}
        />

        {filteredUsers.map((u) => (
          <div
            key={u._id}
            onClick={() => setSelectedUser(u)}
            className={`flex items-center p-3 cursor-pointer ${isDark ? "hover:bg-gray-900" : "hover:bg-gray-200"} `}
          >
            {/* 🔴 CHANGE 2 applied here */}
            <img
              src={getUserPhoto(u)}
              alt={u.name}
              className="w-10 h-10 rounded-full mr-3 object-cover"
            />

            <div className="flex-1">
              <p className="font-medium">{u.name}</p>
              <p className="text-sm text-gray-500">{u.role}</p>
            </div>

            {getUnreadCount(u._id) > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 rounded-full">
                {getUnreadCount(u._id)}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* CHAT */}
      {selectedUser && (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b flex gap-3">
            <img
              src={getUserPhoto(selectedUser)}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">{selectedUser.name}</p>
              <p className="text-sm text-gray-500">{selectedUser.role}</p>
            </div>
          </div>

          <div className={`flex-1 p-4 space-y-3 overflow-y-auto ${chatAreaBg}`}>
            {(messages[selectedUser._id] || []).map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.senderId?.toString() === currentUserId
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl max-w-xs ${
                    m.senderId?.toString() === currentUserId
                      ? outgoingBubble
                      : incomingBubble
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 flex items-center border-t">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              // 🔴 CHANGE 3: Send on Enter key
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message..."
              className={`flex-1 px-4 py-2 rounded-full ${inputBg}`}
            />

            <button
              onClick={handleSend}
              disabled={!socketReady}
              className={`ml-3 bg-blue-500 text-white p-2 rounded-full ${
                !socketReady ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
