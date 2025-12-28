// client/src/context/MessageContext.jsx
import { createContext, useState } from "react";

export const MessageContext = createContext();

export function MessageProvider({ children }) {
  const [unreadMessages, setUnreadMessages] = useState(0);

  const incrementUnread = () => {
    setUnreadMessages((c) => c + 1);
  };

  const markAllMessagesRead = () => {
    setUnreadMessages(0);
  };

  return (
    <MessageContext.Provider
      value={{ unreadMessages, incrementUnread, markAllMessagesRead }}
    >
      {children}
    </MessageContext.Provider>
  );
}
