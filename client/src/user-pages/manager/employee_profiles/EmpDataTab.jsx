// client/src/user-pages/manager/employee_profiles/EmpDataTab.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import { AuthContext } from "../../../context/AuthContext";
import { ThemeContext } from "../../../context/ThemeContext";

export default function EmpDataTab() {
  const { token } = useContext(AuthContext);
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 25, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("");
  const [showOnlyEmployees, setShowOnlyEmployees] = useState(true);

  const [selected, setSelected] = useState(null); // employee id for modal

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

      Object.keys(params).forEach(
        (k) => params[k] === undefined && delete params[k]
      );

      const res = await api.get("/manager/employees", { params });

      const resMeta = res.data?.meta || {
        page: params.page || 1,
        limit: params.limit || 25,
        total: (res.data?.data || []).length,
        pages: 1,
      };
      const resData = res.data?.data || [];

      setEmployees(resData);
      setMeta({
        page: resMeta.page || 1,
        limit: resMeta.limit || params.limit || 25,
        total: resMeta.total || resData.length,
        pages:
          resMeta.pages ||
          Math.max(
            1,
            Math.ceil(
              (resMeta.total || resData.length) /
                (resMeta.limit || params.limit || 25)
            )
          ),
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
    if (!token && localStorage.getItem("token")) {
      // api interceptor should already pick it up
    }
    fetchEmployees({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const displayed = useMemo(() => {
    if (!employees) return [];
    if (showOnlyEmployees)
      return employees.filter(
        (u) => (u.role || "").toLowerCase() === "employee"
      );
    if (!query) return employees;
    const q = query.toLowerCase();
    return employees.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.employeeId || "").toLowerCase().includes(q)
    );
  }, [employees, showOnlyEmployees, query]);

  // Theme classes
  const pageBg = isDark ? "bg-app text-gray-200" : "bg-white text-gray-800";
  const containerBg = isDark
    ? "bg-slate-800 border-slate-700"
    : "bg-white border-gray-100";
  const inputBase = isDark
    ? "border rounded p-2 bg-slate-700 text-gray-200 border-slate-600"
    : "border rounded p-2 bg-white text-gray-800 border-gray-300";
  const selectBase = inputBase;
  const checkboxBase = isDark
    ? "h-4 w-4 accent-indigo-500"
    : "h-4 w-4 accent-indigo-600";
  const btnPrimary = isDark
    ? "ml-auto bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-500"
    : "ml-auto bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700";
  const tableHeadBg = isDark
    ? "bg-slate-800 text-slate-100"
    : "bg-gray-100 text-gray-700";
  const rowBorder = isDark ? "border-slate-700" : "border-gray-200";
  const cellText = isDark ? "text-gray-200" : "text-gray-700";
  const emptyText = isDark ? "text-gray-400" : "text-gray-500";

  if (loading) return <div className={`p-6 ${pageBg}`}>Loading employees…</div>;
  if (error)
    return (
      <div className={`p-6 ${isDark ? "text-red-400" : "text-red-600"}`}>
        Error loading employees. {error.message || ""}
      </div>
    );

  return (
    <div className={`p-4 ${pageBg} h-full`}>
      <div className="mb-4 flex gap-3 items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email or ID"
          className={`${inputBase} w-72`}
        />

        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className={`${selectBase}`}
        >
          <option value="">All Departments</option>
          <option value="Software Development">Software Development</option>
          <option value="Quality Assurance">Quality Assurance</option>
          <option value="UI/UX Design">UI/UX Design</option>
          <option value="DevOps">DevOps</option>
          <option value="Data Science">Data Science</option>
        </select>

        <label className={`flex items-center gap-2 ${cellText}`}>
          <input
            type="checkbox"
            checked={showOnlyEmployees}
            onChange={() => setShowOnlyEmployees((v) => !v)}
            className={checkboxBase}
          />
          <span className={cellText}>Show only employees</span>
        </label>

        <button
          onClick={() => fetchEmployees({ page: 1, search: query, department })}
          className={btnPrimary}
        >
          Search / Refresh
        </button>
      </div>

      <div className={`${containerBg} rounded shadow overflow-hidden`}>
        <table className="w-full text-sm">
          <thead className={`${tableHeadBg}`}>
            <tr>
              <th className="p-3 text-left">Photo</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role / ID</th>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Designation</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td colSpan="7" className={`p-4 text-center ${emptyText}`}>
                  No employees found.
                </td>
              </tr>
            ) : (
              displayed.map((u) => (
                <tr
                  key={u._id || u.id || u.email}
                  className={`border-b ${rowBorder}`}
                >
                  <td className="p-3">
                    <div className="w-12 h-12 rounded overflow-hidden bg-gray-100">
                      {u.photo ? (
                        <img
                          src={
                            u.photo.startsWith("http")
                              ? u.photo
                              : `http://localhost:5000/uploads/${u.photo}`
                          }
                          alt={u.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          —
                        </div>
                      )}
                    </div>
                  </td>
                  <td className={`p-3 font-medium ${cellText}`}>{u.name}</td>
                  <td className={`p-3 ${cellText}`}>{u.email}</td>
                  <td className={`p-3 ${cellText}`}>
                    {u.role} {u.employeeId ? `• ${u.employeeId}` : ""}
                  </td>
                  <td className={`p-3 ${cellText}`}>{u.department}</td>
                  <td className={`p-3 ${cellText}`}>{u.designation}</td>
                  <td className="p-3">
                    <button
                      onClick={() =>
                        navigate(`/manager/employee-profiles/${u._id || u.id}`)
                      }
                      className={`text-sm ${
                        isDark
                          ? "text-indigo-300 hover:underline"
                          : "text-blue-600 hover:underline"
                      }`}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls (simple) */}
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={() => {
            if (meta.page > 1) {
              fetchEmployees({ page: meta.page - 1 });
            }
          }}
          className={`${inputBase} px-3 py-1`}
          disabled={meta.page <= 1}
        >
          Prev
        </button>

        <div className={cellText}>
          Page {meta.page} of {meta.pages}
        </div>

        <button
          onClick={() => {
            if (meta.page < meta.pages) fetchEmployees({ page: meta.page + 1 });
          }}
          className={`${inputBase} px-3 py-1`}
          disabled={meta.page >= meta.pages}
        >
          Next
        </button>
      </div>

      {/* Detail modal */}
      {selected && (
        <EmployeeDetailModal id={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
