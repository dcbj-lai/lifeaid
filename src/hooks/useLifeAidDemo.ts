import { useAccess } from "../rbac/useAccess";
import type { Permission } from "../rbac/model";
import { useState, useEffect, type FormEvent } from "react";
import { seedCases, type Page, type AidCase, type WorkLog } from "../data/demo";

// UI state and local transitions. This is the replacement boundary for future API hooks.
export function useLifeAidDemo() {
  const access = useAccess();
  const { can, canRecord, canPage, user } = access;
  const role =
    access.roles
      .filter((r) => user.roleIds.includes(r.id))
      .map((r) => r.name)
      .join(", ") || "No roles";
  const isStudent = !can("applications.view.all");
  const [page, setPage] = useState<Page>(() => {
    const saved = decodeURIComponent(window.location.hash.slice(1));
    return [
      "Access control",
      "Overview",
      "Applications",
      "Scholarship cartridges",
      "Awards & matriculation",
      "Renewals",
      "Work opportunities",
      "Time & activity",
      "Messages",
      "Stipends",
    ].includes(saved)
      ? (saved as Page)
      : "Overview";
  });

  const [mobile, setMobile] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All stages");
  const [allCases, setCases] = useState(seedCases);
  const cases = allCases.filter((c) =>
    canRecord("applications.view", c.peopleId),
  );
  const awardCases = allCases.filter((c) =>
    canRecord("awards.view", c.peopleId),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [modal, setModal] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [allLogs, setLogs] = useState<WorkLog[]>([
    {
      id: 1,
      peopleId: "DEMO-P-1001",
      date: "2026-09-07",
      task: "Catalogued 24 new books and assisted at the circulation desk.",
      hours: 4,
      status: "Pending review",
    },
    {
      id: 2,
      peopleId: "DEMO-P-1001",
      date: "2026-09-06",
      task: "Prepared reading materials for entrepreneurship classes.",
      hours: 3,
      status: "Approved",
    },
    {
      id: 3,
      peopleId: "DEMO-P-1001",
      date: "2026-09-05",
      task: "Shelved returned books and updated the resource inventory.",
      hours: 4,
      status: "Approved",
    },
  ]);
  const logs = allLogs.filter((l) => canRecord("time.view", l.peopleId));
  const stipendLogs = allLogs.filter((l) =>
    canRecord("stipends.view", l.peopleId),
  );
  const [workApps, setWorkApps] = useState<
    Record<number, { status: string; motivation: string; availability: string }>
  >({});
  const [jobId, setJobId] = useState(1);
  const [clock, setClock] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [chat, setChat] = useState([
    {
      who: "Rina · Team lead",
      text: "Hi Maya! Please include the number of books processed in your activity log so I can verify your shift.",
      time: "9:14 AM",
    },
    {
      who: "Maya · Student worker",
      text: "Updated the log for Monday. I also added the resource inventory task.",
      time: "9:18 AM",
    },
  ]);
  const [stipend, setStipend] = useState("Not prepared");
  const [frozenHours, setFrozenHours] = useState(0);
  const [cartridge, setCartridge] = useState("Pitch to College");
  const [linked, setLinked] = useState(true);
  const selectedCase = cases.find((c) => c.id === selected);
  const approvedHours = (canPage("Time & activity") ? logs : stipendLogs)
    .filter(
      (l) =>
        l.status === "Approved" &&
        l.date >= "2026-09-01" &&
        l.date <= "2026-09-15",
    )
    .reduce((a, l) => a + l.hours, 0);
  const pendingHours = (canPage("Time & activity") ? logs : stipendLogs)
    .filter(
      (l) =>
        l.status === "Pending review" &&
        l.date >= "2026-09-01" &&
        l.date <= "2026-09-15",
    )
    .reduce((a, l) => a + l.hours, 0);
  function notify(message: string) {
    setToast(message);
  }
  function go(next: Page) {
    if (!canPage(next)) {
      notify("You do not have permission to view this page.");
      return;
    }
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}#${encodeURIComponent(next)}`,
    );
    setPage(next);
    setQuery("");
    setFilter("All stages");
    setMobile(false);
    setSelected(null);
  }
  function updateCase(id: string, patch: Partial<AidCase>) {
    const record = allCases.find((c) => c.id === id);
    if (!record) return;
    if (patch.note !== undefined && !can("applications.notes.edit")) return;
    if (patch.documents !== undefined && !can("applications.documents.verify"))
      return;
    if (patch.amount !== undefined && !can("awards.terms.edit")) return;
    if (patch.posted !== undefined && !can("awards.post")) return;
    if (
      patch.accepted !== undefined &&
      !canRecord("awards.accept", record.peopleId)
    )
      return;
    if (
      patch.stage !== undefined &&
      !can(
        patch.stage === "Offered"
          ? "applications.approve"
          : "applications.assess",
      )
    )
      return;
    setCases((old) => old.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }
  function submitAid(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    if (!can("applications.submit.own")) return;
    const own = allCases.find((c) => c.peopleId === user.peopleId);
    if (!own) return;
    setCases((old) =>
      old.map((c) =>
        c.id === own.id
          ? {
              ...c,
              stage: "Submitted",
              documents: 3,
              note: "Application submitted for review.",
              statement: String(d.get("statement")),
              pitch: String(d.get("pitch")),
              income: Number(d.get("income")),
            }
          : c,
      ),
    );
    setModal(null);
    notify("Demo application submitted. It is now in the review queue.");
  }
  function addLog(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!can("time.log.own") || user.peopleId !== "DEMO-P-1001") return;
    const d = new FormData(e.currentTarget);
    setLogs((old) => [
      {
        id: Date.now(),
        peopleId: user.peopleId,
        date: String(d.get("date")),
        task: String(d.get("task")),
        hours: Number(d.get("hours")),
        status: "Pending review",
      },
      ...old,
    ]);
    setModal(null);
    setElapsed(null);
    notify("Activity submitted to your team lead for verification.");
  }
  function addMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const d = new FormData(f);
    if (!can("messages.send") || !canRecord("messages.view", "DEMO-P-1001"))
      return;
    const text = String(d.get("message")).trim();
    if (!text) return;
    setChat((old) => [
      ...old,
      {
        who: user.name,
        text,
        time: "Just now",
      },
    ]);
    f.reset();
  }
  const filtered = cases.filter(
    (c) =>
      (filter === "All stages" || c.stage === filter) &&
      `${c.name} ${c.id} ${c.scholarship}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );

  function switchUser(id: string) {
    setModal(null);
    setSelected(null);
    setToast("");
    setClock(null);
    setElapsed(null);
    setPage("Overview");
    setQuery("");
    setFilter("All stages");
    access.switchUser(id);
    window.history.replaceState({}, "", window.location.pathname + "#Overview");
  }
  useEffect(() => {
    if (!canPage(page)) {
      setPage("Overview");
      setModal(null);
      setSelected(null);
    }
  }, [access.userId, access.roles, access.users]);
  function requirePermission(permission: Permission) {
    if (can(permission)) return true;
    notify("Permission denied: " + permission);
    return false;
  }
  const titles: Record<Page, [string, string]> = {
    "Access control": [
      "Access control",
      "Users, assigned roles, permission grants, and view access.",
    ],
    Overview: [
      "Overview",
      "Applications, awards, renewals, and student work summary.",
    ],
    Applications: [
      isStudent ? "My aid applications" : "Aid applications",
      "Application records, documents, assessments, and approval status.",
    ],
    "Scholarship cartridges": [
      "Scholarship cartridges",
      "Degree assignments, eligibility requirements, review stages, and award rules.",
    ],
    "Awards & matriculation": [
      "Awards & matriculation",
      "Award coverage, acceptance status, and LifeSIS fee postings.",
    ],
    "Work opportunities": [
      "Work opportunities",
      "Open positions, team applications, and student placements.",
    ],
    "Time & activity": [
      "Time & activity",
      "Attendance, work hours, activity logs, and supervisor verification.",
    ],
    Messages: [
      "Messages",
      "Student, team lead, and SWP conversations by placement.",
    ],
    Renewals: [
      "Scholarship renewals",
      "Renewal applications, term requirements, decisions, and next-term awards.",
    ],
    Stipends: [
      "Stipends",
      "Approved hours, stipend batches, finance authorization, and release status.",
    ],
  };
  return {
    page,
    setPage,
    role,
    access,
    can,
    canRecord,
    canPage,
    user,
    awardCases,
    switchUser,
    requirePermission,
    mobile,
    setMobile,
    query,
    setQuery,
    filter,
    setFilter,
    cases,
    setCases,
    selected,
    setSelected,
    modal,
    setModal,
    toast,
    setToast,
    logs,
    setLogs,
    workApps,
    setWorkApps,
    jobId,
    setJobId,
    clock,
    setClock,
    elapsed,
    setElapsed,
    chat,
    setChat,
    stipend,
    setStipend,
    frozenHours,
    setFrozenHours,
    cartridge,
    setCartridge,
    linked,
    setLinked,
    selectedCase,
    approvedHours,
    pendingHours,
    notify,
    go,
    updateCase,
    submitAid,
    addLog,
    addMessage,
    filtered,
    isStudent,
    titles,
  };
}
export type LifeAidDemoState = ReturnType<typeof useLifeAidDemo>;
