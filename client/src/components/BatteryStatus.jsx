// client/src/components/BatteryStatus.jsx
import React, { useEffect, useState } from "react";
import { FaBatteryFull, FaBatteryHalf, FaBatteryQuarter } from "react-icons/fa";


import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const BatteryStatus = () => {
  const [batteryLevel, setBatteryLevel] = useState(null);
  const { isDark } = useContext(ThemeContext);

  useEffect(() => {
    const fetchBattery = async () => {
      if (navigator.getBattery) {
        const battery = await navigator.getBattery();
        setBatteryLevel(battery.level * 100);

        battery.addEventListener("levelchange", () =>
          setBatteryLevel(battery.level * 100)
        );
      }
    };

    fetchBattery();
  }, []);

  const getColor = () => {
    if (batteryLevel === null) return "text-gray-400";
    if (batteryLevel <= 30) return "text-red-500";
    if (batteryLevel > 30 && batteryLevel <= 50) return "text-yellow-400";
    return "text-green-500";
  };

  const getIcon = () => {
    if (batteryLevel <= 30) return <FaBatteryQuarter />;
    if (batteryLevel <= 70) return <FaBatteryHalf />;
    return <FaBatteryFull />;
  };

  return (
    <div className="flex items-center space-x-1">
      <span className={`text-lg ${getColor()}`}>{getIcon()}</span>
      <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-800"}`}>
        {batteryLevel !== null ? `${Math.round(batteryLevel)}%` : "…"}
      </span>
    </div>
  );
};

export default BatteryStatus;
