// client/src/user-pages/manager/employee_profiles/EmpDataTab.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import { AuthContext } from "../../../context/AuthContext";
import { ThemeContext } from "../../../context/ThemeContext";
import { FiSearch, FiFilter, FiUser, FiChevronLeft, FiChevronRight, FiRefreshCw } from "react-icons/fi";

/**
 * EmpDataTab Component
 * * Purpose: Provides a searchable, filterable directory of all employees for Manager roles.
 * Features:
 * 1. Server-side pagination & filtering.
 * 2. Theme-aware UI (Glassmorphism for Dark Mode).
 * 3. Mobile-responsive layout (Table for Desktop, Cards for Mobile).
 */
export default function EmpDataTab() {
  const { token } = useContext(AuthContext);
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [employees, setEmployees] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("");
  const [showOnlyEmployees, setShowOnlyEmployees] = useState(true);

  /**
   * Primary data fetching function
   * Handles server-side pagination and search params.
   */
  const fetchEmployees = async (opts = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: opts.page ?? meta.page,
        limit: opts.limit ?? meta.limit,
        search: opts.search ?? query ?? undefined,
        department: opts.department ?? department ?? undefined,
      };

      // Clean undefined params
      Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);

      const res = await api.get("/manager/employees", { params });
      
      const resData = res.data?.data || [];
      const resMeta = res.data?.meta || {
        page: params.page || 1,
        limit: params.limit || 10,
        total: resData.length,
        pages: 1,
      };

      setEmployees(resData);
      setMeta({
        page: resMeta.page,
        limit: resMeta.limit,
        total: resMeta.total,
        pages: resMeta.pages || Math.ceil(resMeta.total / resMeta.limit),
      });
    } catch (err) {
      console.error("fetchEmployees error", err);
      setError(err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees({ page: 1 });
  }, [token]);

  /**
   * Memoized filtering for local-side refinements 
   * (e.g. "Show only employees" toggle)
   */
  const displayed = useMemo(() => {
    if (!employees) return [];
    let list = [...employees];
    
    if (showOnlyEmployees) {
      list = list.filter(u => (u.role || "").toLowerCase() === "employee");
    }
    return list;
  }, [employees, showOnlyEmployees]);

  // --- STYLING HELPERS ---
  const pageBg = isDark ? "bg-slate-900 text-slate-100" : "bg-gray-50 text-slate-900";
  const cardBg = isDark ? "bg-slate-800/50 backdrop-blur-md border-slate-700" : "bg-white border-gray-100 shadow-sm";
  const inputBase = isDark 
    ? "bg-slate-800 border-slate-700 text-white focus:ring-2 focus:ring-indigo-500/50" 
    : "bg-white border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500/20";

  if (loading && employees.length === 0) {
    return (
      <div className={`p-10 h-full flex flex-col items-center justify-center ${pageBg}`}>
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-medium opacity-60">Loading Directory...</p>
      </div>
    );
  }

  return (
    <div className={`p-4 md:p-8 h-full overflow-y-auto transition-colors duration-300 ${pageBg}`}>
      
      {/* --- TOP ACTION BAR --- */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchEmployees({ page: 1 })}
            placeholder="Search by name, email or ID..."
            className={`${inputBase} w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className={`${inputBase} pl-10 pr-8 py-2.5 rounded-xl border outline-none appearance-none cursor-pointer`}
            >
              <option value="">All Departments</option>
              {["Software Development", "Quality Assurance", "UI/UX Design", "DevOps", "Data Science"].map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => fetchEmployees({ page: 1 })}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> 
            <span className="hidden sm:inline">Apply</span>
          </button>
        </div>
      </div>

      {/* --- DATA DISPLAY --- */}
      <div className={`${cardBg} rounded-3xl overflow-hidden border transition-all`}>
        
        {/* DESKTOP TABLE VIEW */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`${isDark ? "bg-slate-800/80" : "bg-gray-50/80"} text-[11px] font-black uppercase tracking-widest opacity-60`}>
                <th className="p-5">Profile</th>
                <th className="p-5">Email Address</th>
                <th className="p-5">Identifier</th>
                <th className="p-5">Department</th>
                <th className="p-5">Designation</th>
                <th className="p-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-slate-700/50" : "divide-gray-100"}`}>
              {displayed.map((u) => (
                <tr key={u._id} className="group hover:bg-indigo-500/5 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-indigo-500/10 border border-indigo-500/20">
                        {u.photo ? (
                          <img 
                            src={u.photo.startsWith("http") ? u.photo : `http://localhost:5000/uploads/${u.photo}`} 
                            alt="" 
                            className="w-full h-full object-cover" 
                          />
                        ) : <FiUser className="w-full h-full p-2 opacity-40" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{u.name}</p>
                        <p className="text-[10px] uppercase tracking-tighter opacity-50">{u.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-sm font-medium opacity-80">{u.email}</td>
                  <td className="p-5 font-mono text-xs opacity-60">{u.employeeId || "N/A"}</td>
                  <td className="p-5 text-sm">
                    <span className="px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-500 font-bold text-[10px]">{u.department}</span>
                  </td>
                  <td className="p-5 text-sm opacity-80">{u.designation}</td>
                  <td className="p-5 text-right">
                    <button
                      onClick={() => navigate(`/manager/employee-profiles/${u._id}`)}
                      className="text-xs font-bold text-indigo-500 hover:text-indigo-400 p-2 rounded-lg hover:bg-indigo-500/10 transition-all"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="lg:hidden divide-y divide-inherit">
          {displayed.map((u) => (
            <div key={u._id} className="p-5 flex items-center justify-between gap-4">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-700">
                    <img src={u.photo.startsWith("http") ? u.photo : `http://localhost:5000/uploads/${u.photo}`} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold">{u.name}</h4>
                    <p className="text-xs opacity-50">{u.designation}</p>
                  </div>
               </div>
               <button 
                onClick={() => navigate(`/manager/employee-profiles/${u._id}`)}
                className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20"
               >
                 <FiChevronRight size={20} />
               </button>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {displayed.length === 0 && (
          <div className="p-20 text-center opacity-40 flex flex-col items-center">
            <FiUser size={48} className="mb-4" />
            <p className="text-sm font-medium">No results match your criteria.</p>
          </div>
        )}
      </div>

      {/* --- PAGINATION FOOTER --- */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <p className="text-xs font-bold uppercase tracking-widest opacity-40">
          Showing {displayed.length} of {meta.total} Records
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => meta.page > 1 && fetchEmployees({ page: meta.page - 1 })}
            disabled={meta.page <= 1}
            className={`p-2 rounded-xl border ${inputBase} disabled:opacity-20 transition-all`}
          >
            <FiChevronLeft size={20} />
          </button>
          
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold px-3 py-1 rounded-lg bg-indigo-600 text-white">{meta.page}</span>
            <span className="text-xs opacity-40 px-1 font-bold">/</span>
            <span className="text-sm font-bold opacity-60 px-2">{meta.pages}</span>
          </div>

          <button
            onClick={() => meta.page < meta.pages && fetchEmployees({ page: meta.page + 1 })}
            disabled={meta.page >= meta.pages}
            className={`p-2 rounded-xl border ${inputBase} disabled:opacity-20 transition-all`}
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}