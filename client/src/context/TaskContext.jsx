import { createContext, useEffect, useState } from "react";
import api from "../utils/api";

export const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [pendingTasks, setPendingTasks] = useState(0);

  // const fetchPendingTasks = async () => {
  //   try {
  //     const res = await api.get("/manager/tasks");
  //     const list = res.data?.data || [];

  //     const pending = list.filter(
  //       (t) => t.status !== "Completed"
  //     );

  //     setPendingTasks(pending.length);
  //   } catch (err) {
  //     console.error("task count error", err);
  //     setPendingTasks(0);
  //   }
  // };

  const fetchPendingTasks = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user || !user.role || !token) return;

    let res;

    if (user.role === "Manager") {
      res = await api.get("/manager/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else if (user.role === "Employee") {
      res = await api.get("/employee/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      return;
    }

    const list = res.data?.data || [];
    const pending = list.filter(t => t.status !== "Completed");

    setPendingTasks(pending.length);
  } catch (err) {
    console.error("task count error", err);
    setPendingTasks(0);
  }
};




  // useEffect(() => {
  //   fetchPendingTasks();
  //   const interval = setInterval(fetchPendingTasks, 30000);
  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !user.role) return;

  fetchPendingTasks();

  const interval = setInterval(fetchPendingTasks, 30000);
  return () => clearInterval(interval);
}, []);


  return (
    <TaskContext.Provider
      value={{
        pendingTasks,
        refreshPendingTasks: fetchPendingTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}
