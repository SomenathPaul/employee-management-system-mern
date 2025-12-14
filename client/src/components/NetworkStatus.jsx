// client/src/components/NetworkStatus.jsx
import React, { useEffect, useState } from "react";
import { FaWifi } from "react-icons/fa";

const NetworkIcon = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <FaWifi
      size={20}
      className={`transition-colors duration-300 ${
        isOnline ? "text-green-500" : "text-gray-400"
      }`}
      title={isOnline ? "Online" : "Offline"}
    />
  );
};

export default NetworkIcon;
