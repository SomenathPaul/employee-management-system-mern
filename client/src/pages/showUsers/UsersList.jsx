// client/src/pages/showUsers/UsersList.jsx
import React, { useContext, useMemo, useState } from "react";
import { UserContext } from "../context/UserContext";

export default function UsersList() {
  const { users, loading, error, refreshUsers, getEmployees } =
    useContext(UserContext);
  const [query, setQuery] = useState("");
  const [showOnlyEmployees, setShowOnlyEmployees] = useState(true);

  // memoized list depending on toggle / query
  const displayed = useMemo(() => {
    if (showOnlyEmployees) return getEmployees(query || null);
    if (!query) return users;
    const q = query.toLowerCase();
    return users.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.employeeId || "").toLowerCase().includes(q)
    );
  }, [users, showOnlyEmployees, query, getEmployees]);

  if (loading) return <div className="p-4">Loading users…</div>;
  if (error)
    return <div className="p-4 text-red-600">Error loading users.</div>;

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-3 items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email or ID"
          className="border p-2 rounded w-72"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showOnlyEmployees}
            onChange={() => setShowOnlyEmployees((v) => !v)}
            className="h-4 w-4"
          />
          <span>Show only employees</span>
        </label>

        <button
          onClick={() => refreshUsers()}
          className="ml-auto bg-blue-600 text-white px-3 py-1 rounded"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-3">
        {displayed.length === 0 ? (
          <div className="text-gray-500">No users found.</div>
        ) : (
          displayed.map((u) => (
            <div
              key={u._id || u.id || u.email}
              className="p-3 border rounded flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                {u.photo ? (
                  <img
                    src={
                      u.photo.startsWith("http")
                        ? u.photo
                        : `${
                            process.env.REACT_APP_API_URL ||
                            "http://localhost:5000"
                          }/uploads/${u.photo}`
                    }
                    alt={u.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Photo
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="font-medium">{u.name || "—"}</div>
                <div className="text-sm text-gray-600">{u.email}</div>
                <div className="text-xs text-gray-500">
                  {u.role} {u.employeeId ? `• ${u.employeeId}` : ""}
                </div>
              </div>

              <div>
                <button className="text-sm text-blue-600 hover:underline">
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
