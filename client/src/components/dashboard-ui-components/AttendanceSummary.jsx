// client/src/components/dashboard-ui-components/AttendanceSummary.jsx
import React, { useEffect, useMemo, useState, useContext } from "react";
import api from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";

function monthKeyFromDateISO(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
}

function DATE_ISO(d) {
  if (!d) return null;
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return null;
  return dt.toISOString().split("T")[0];
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function buildMonthDates(ym) {
  if (!ym || typeof ym !== "string" || !/^\d{4}-\d{2}$/.test(ym)) return [];
  const [y, m] = ym.split("-").map((x) => parseInt(x, 10));
  if (!y || !m || m < 1 || m > 12) return [];
  const count = daysInMonth(y, m - 1);
  const arr = Array.from({ length: count }).map((_, idx) => {
    const dt = new Date(y, m - 1, idx + 1);
    return DATE_ISO(dt);
  });
  return arr.filter(Boolean);
}

export default function AttendanceSummary() {
  const { user } = useContext(AuthContext);
  const { isDark } = useContext(ThemeContext);

  const [records, setRecords] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const monthFilter = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  // fetch attendance + leaves
  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const [attRes, leaveRes] = await Promise.all([
          api.get("/attendance/get"),
          api.get("/leaves/show"),
        ]);

        const allAtt = Array.isArray(attRes.data) ? attRes.data : attRes.data?.data || [];
        const allLeaves = Array.isArray(leaveRes.data) ? leaveRes.data : leaveRes.data?.data || [];

        // filter attendance for current user (fallbacks included)
        const mineAtt = allAtt.filter(
          (r) =>
            (!!r.employeeId && !!user?.employeeId && String(r.employeeId) === String(user.employeeId)) ||
            (!!r._id && !!user?._id && String(r._id) === String(user._id)) ||
            (!!r.email && !!user?.email && r.email === user.email)
        );

        const mineLeaves = allLeaves.filter(
          (l) =>
            (!!l.employeeId && !!user?.employeeId && String(l.employeeId) === String(user.employeeId)) ||
            (!!l._id && !!user?._id && String(l._id) === String(user._id)) ||
            (!!l.email && !!user?.email && l.email === user.email)
        );

        if (!cancelled) {
          setRecords(mineAtt);
          setLeaves(mineLeaves);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setRecords([]);
          setLeaves([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // compute month date list (and clamp to today for current month)
  const monthDates = useMemo(() => {
    const dates = buildMonthDates(monthFilter);
    if (!dates.length) return [];
    // if current month, limit to today (so future days are not counted)
    const todayIso = DATE_ISO(new Date());
    const [currY, currM] = todayIso ? todayIso.split("-").map(Number) : [null, null];
    const [selY, selM] = monthFilter.split("-").map(Number);
    if (currY === selY && currM === selM) {
      // include days up to today
      return dates.filter((d) => d <= todayIso);
    }
    return dates;
  }, [monthFilter]);

  const stats = useMemo(() => {
    // build quick lookup for attendance by date (prefer Present over others if duplicates)
    const attMap = new Map();
    for (const r of records) {
      const d = DATE_ISO(r.date || r.recordedAt || r.attendanceDate);
      if (!d) continue;
      if (!d.startsWith(monthFilter)) continue;
      const existing = attMap.get(d);
      if (!existing) attMap.set(d, r);
      else {
        const score = (status) => {
          const s = (status || "").toString().toLowerCase();
          if (s.includes("present")) return 3;
          if (s.includes("leave")) return 2;
          if (s.includes("absent")) return 1;
          return 0;
        };
        if (score(r.status) > score(existing.status)) attMap.set(d, r);
      }
    }

    // build approved leave ranges for this user's leaves
    const approvedStatuses = ["approved", "verify", "verified", "accepted", "approved_by_manager", "approved_by_hr", "approved_by_admin", "approved_by_manager"];
    const leaveRanges = (leaves || [])
      .map((l) => {
        const from = DATE_ISO(l.fromDate || l.from || l.startDate || l.fromDate);
        const to = DATE_ISO(l.toDate || l.to || l.endDate || l.toDate);
        return { from, to, status: (l.status || "").toString().toLowerCase() };
      })
      .filter((r) => r.from && r.to && approvedStatuses.includes((r.status || "").toLowerCase()));

    const isInLeave = (dateIso) => {
      for (const r of leaveRanges) {
        if (!r.from || !r.to) continue;
        if (dateIso >= r.from && dateIso <= r.to) return true;
      }
      return false;
    };

    let present = 0;
    let absent = 0;
    let leave = 0;
    // total days to consider (monthDates already excludes future days when current month)
    const totalConsidered = monthDates.length;

    for (const d of monthDates) {
      const rec = attMap.get(d);
      if (rec) {
        const s = (rec.status || "").toString().toLowerCase();
        if (s.includes("present")) present++;
        else if (s.includes("leave")) leave++;
        else if (s.includes("absent")) absent++;
        else {
          // unknown status -> if leave inferred by leaveRanges, treat as leave; else treat as absent
          if (isInLeave(d)) leave++;
          else absent++;
        }
      } else {
        // no record for date -> infer leave if leaveRanges cover it else absent
        if (isInLeave(d)) leave++;
        else absent++;
      }
    }

    // percentage: present / (present + absent) * 100 (exclude approved leave days from denominator)
    const denom = present + absent;
    const pct = denom ? Math.round((present / denom) * 100) : 0;

    return {
      present,
      absent,
      leave,
      total: totalConsidered,
      pct,
    };
  }, [records, leaves, monthFilter, monthDates]);

  // theme classes
  const containerClass = isDark
    ? "bg-slate-800 border border-slate-700 text-slate-100"
    : "bg-white border border-gray-100 text-slate-900";

  const subtleClass = isDark ? "text-slate-300" : "text-gray-500";
  const highlightClass = isDark ? "text-green-300" : "text-green-700";
  const cardPadding = "rounded-lg p-4";

  // human-readable month label
  const monthLabel = useMemo(() => {
    const [y, m] = monthFilter.split("-");
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleString(undefined, { month: "long", year: "numeric" });
  }, [monthFilter]);

  return (
    <div className={`${cardPadding} ${containerClass}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-sm md:text-base">Attendance summary</h3>
          <div className={`text-xs ${subtleClass}`}>{monthLabel}</div>
        </div>

        <div className={`text-xs ${subtleClass} hidden sm:block`}>Tip: 80% or above is good</div>
      </div>

      {loading ? (
        <div className={`${subtleClass} py-6 text-sm`}>Loading...</div>
      ) : error ? (
        <div className="text-red-500 py-6 text-sm">Unable to load attendance.</div>
      ) : (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Percent + caption */}
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div
              className={`flex items-center justify-center rounded-full ${isDark ? "bg-slate-700/50" : "bg-gray-100"}`}
              style={{ width: 64, height: 64 }}
              aria-hidden
            >
              <span className={`${highlightClass} font-bold text-lg sm:text-xl`}>
                {stats.pct}%
              </span>
            </div>

            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-medium">Attendance percentage</div>
              <div className={`text-[11px] sm:text-xs mt-1 ${subtleClass}`}>
                Present / (Present + Absent) — based on {stats.total} day{stats.total !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-2 sm:mt-0 sm:ml-auto w-full sm:w-auto justify-between sm:justify-start">
            <div className="text-center w-1/3 sm:w-auto">
              <div className="text-lg sm:text-xl font-semibold">{stats.present}</div>
              <div className={`text-xs ${subtleClass}`}>Present</div>
            </div>

            <div className="text-center w-1/3 sm:w-auto">
              <div className="text-lg sm:text-xl font-semibold">{stats.leave}</div>
              <div className={`text-xs ${subtleClass}`}>Leave</div>
            </div>

            <div className="text-center w-1/3 sm:w-auto">
              <div className="text-lg sm:text-xl font-semibold">{stats.absent}</div>
              <div className={`text-xs ${subtleClass}`}>Absent</div>
            </div>
          </div>

          <div className={`mt-3 sm:mt-0 sm:ml-4 text-xs ${subtleClass} sm:hidden`}>Tip: 80% or above is good</div>
        </div>
      )}
    </div>
  );
}
