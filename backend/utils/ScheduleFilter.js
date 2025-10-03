function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
function endOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}
function addDays(d, days) {
  const res = new Date(d);
  res.setDate(res.getDate() + days);
  return res;
}
function startOfISOWeek(d) {
  // Monday as start of week
  const date = new Date(d);
  const day = date.getDay(); // 0 (Sun) .. 6 (Sat)
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  return startOfDay(new Date(date.getFullYear(), date.getMonth(), date.getDate() + diffToMonday));
}

export function getDateRangeFilter(tab, customStart, customEnd) {
  if (!tab || tab === "All" || tab === "All Deliveries") return null;

  const now = new Date();

  switch (tab) {
    case "Today": {
      const s = startOfDay(now);
      const e = endOfDay(now);
      return { $gte: s, $lte: e };
    }

    case "Tomorrow": {
      const t = addDays(now, 1);
      return { $gte: startOfDay(t), $lte: endOfDay(t) };
    }

    case "Yesterday": {
      const y = addDays(now, -1);
      return { $gte: startOfDay(y), $lte: endOfDay(y) };
    }

    case "This Week": {
      const s = startOfISOWeek(now);
      const e = endOfDay(addDays(s, 6));
      return { $gte: s, $lte: e };
    }

    case "Next Week": {
      const s = addDays(startOfISOWeek(now), 7);
      const e = endOfDay(addDays(s, 6));
      return { $gte: s, $lte: e };
    }

    case "Last Week": {
      const s = addDays(startOfISOWeek(now), -7);
      const e = endOfDay(addDays(s, 6));
      return { $gte: s, $lte: e };
    }

    case "This Month": {
      const s = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const e = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { $gte: s, $lte: e };
    }

    case "Next Month": {
      const s = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
      const e = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59, 999);
      return { $gte: s, $lte: e };
    }

    case "Last Month": {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      const e = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { $gte: s, $lte: e };
    }

    case "Last 7 Days": {
      // last 7 days including today (start = today - 6)
      const s = startOfDay(addDays(now, -6));
      const e = endOfDay(now);
      return { $gte: s, $lte: e };
    }

    case "Last 30 Days": {
      const s = startOfDay(addDays(now, -29));
      const e = endOfDay(now);
      return { $gte: s, $lte: e };
    }

    case "Custom": {
      if (!customStart || !customEnd) return null;
      const s = startOfDay(new Date(customStart));
      const e = endOfDay(new Date(customEnd));
      return { $gte: s, $lte: e };
    }

    // Non-date tabs — return null so controller handles them specially
    case "Delayed":
    case "Escalated":
      return null;

    default:
      return null;
  }
}

export default getDateRangeFilter;