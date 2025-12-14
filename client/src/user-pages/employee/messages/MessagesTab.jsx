// client/src/user-pages/employee/messages/MessagesTab.jsx
import React, { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { useContext } from "react";
import { ThemeContext } from "../../../context/ThemeContext";

// Dummy data (you’ll replace this later with API calls)
const usersData = [
  {
    id: 1,
    name: "John Manager",
    role: "Manager",
    avatar: "https://i.pravatar.cc/150?img=3",
    lastMessage: "Please update me on your progress.",
  },
  {
    id: 2,
    name: "HR Priya",
    role: "HR",
    avatar: "https://i.pravatar.cc/150?img=5",
    lastMessage: "Don’t forget to mark your attendance today.",
  },
  {
    id: 3,
    name: "Dev Ankit",
    role: "Employee",
    avatar: "https://i.pravatar.cc/150?img=10",
    lastMessage: "Thanks! I’ll check the code now.",
  },
];

const initialMessages = {
  1: [
    { fromSelf: false, text: "Hey, how’s the dashboard task going?" },
    { fromSelf: true, text: "Almost done! Just finishing the charts." },
  ],
  2: [{ fromSelf: false, text: "Please submit your leave form ASAP." }],
  3: [
    { fromSelf: true, text: "Can you help with the API integration?" },
    { fromSelf: false, text: "Sure, share your code repo." },
  ],
};

export default function MessagesTab() {
  const { isDark } = useContext(ThemeContext);

  const [users, setUsers] = useState(usersData);
  const [selectedUser, setSelectedUser] = useState(usersData[0]);
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");

  // theme classes
  const wrapperBg = isDark
    ? "bg-slate-900 text-gray-200"
    : "bg-gray-50 text-gray-800";
  const sidebarBg = isDark
    ? "bg-slate-800 border-slate-700"
    : "bg-white border-r border-gray-200";
  const sidebarHeader = isDark
    ? "text-gray-100 border-b border-slate-700"
    : "text-gray-800 border-b border-gray-200";
  const userRowHover = isDark ? "hover:bg-slate-700" : "hover:bg-gray-100";
  const selectedRow = isDark ? "bg-slate-700" : "bg-gray-200";
  const chatHeaderBg = isDark
    ? "bg-slate-800 border-b border-slate-700"
    : "bg-white border-b border-gray-200";
  const chatAreaBg = isDark ? "bg-slate-900" : "bg-gray-100";
  const incomingBubble = isDark
    ? "bg-slate-800 text-gray-200"
    : "bg-white text-gray-800";
  const outgoingBubble = "bg-blue-500 text-white";
  const inputBg = isDark
    ? "bg-slate-800 text-gray-200 border-slate-700"
    : "bg-white text-gray-800 border-gray-300";
  const sendBtn =
    "ml-3 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full";

  // Send message (in future, connect to backend POST /api/messages)
  const handleSend = () => {
    if (newMessage.trim() === "") return;
    const userId = selectedUser.id;

    setMessages((prev) => ({
      ...prev,
      [userId]: [...(prev[userId] || []), { fromSelf: true, text: newMessage }],
    }));
    setNewMessage("");
  };

  return (
    <div className={`flex h-full shadow-md overflow-hidden ${wrapperBg}`}>
      {/* Sidebar - User List */}
      <div className={`w-1/3 ${sidebarBg} overflow-y-auto`}>
        <h3 className={`text-xl font-semibold p-6 ${sidebarHeader}`}>
          Messages
        </h3>
        {users.map((u) => (
          <div
            key={u.id}
            onClick={() => setSelectedUser(u)}
            className={`flex items-center p-3 cursor-pointer ${userRowHover} ${
              selectedUser?.id === u.id ? selectedRow : ""
            }`}
          >
            <img
              src={u.avatar}
              alt={u.name}
              className="w-10 h-10 rounded-full mr-3"
            />
            <div>
              <p
                className={`font-medium ${
                  isDark ? "text-gray-100" : "text-gray-800"
                }`}
              >
                {u.name}
              </p>
              <p
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-500"
                } truncate w-40`}
              >
                {u.lastMessage}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className={`flex items-center gap-3 p-4 ${chatHeaderBg}`}>
          <img
            src={selectedUser.avatar}
            alt={selectedUser.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p
              className={`font-semibold ${
                isDark ? "text-gray-100" : "text-gray-800"
              }`}
            >
              {selectedUser.name}
            </p>
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {selectedUser.role}
            </p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${chatAreaBg}`}>
          {messages[selectedUser.id]?.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.fromSelf ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-xs ${
                  msg.fromSelf
                    ? outgoingBubble + " rounded-br-none"
                    : incomingBubble + " rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div
          className={`p-3 ${
            isDark
              ? "bg-slate-800 border-t border-slate-700"
              : "bg-white border-t border-gray-200"
          } flex items-center`}
        >
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className={`flex-1 rounded-full px-4 py-2 outline-none focus:ring-2 ${inputBg}`}
          />
          <button onClick={handleSend} className={sendBtn}>
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
}
