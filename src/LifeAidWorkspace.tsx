import AccessControlView from "./rbac/AccessControlView";
import { useLifeAidDemo } from "./hooks/useLifeAidDemo";
import { peso } from "./lib/format";
import OverviewView from "./features/workspace/OverviewView";
import ApplicationsView from "./features/workspace/ApplicationsView";
import ScholarshipProgramsView from "./features/workspace/ScholarshipProgramsView";
import AwardsView from "./features/workspace/AwardsView";
import WorkOpportunitiesView from "./features/workspace/WorkOpportunitiesView";
import TimeActivityView from "./features/workspace/TimeActivityView";
import MessagesView from "./features/workspace/MessagesView";
import StipendsView from "./features/workspace/StipendsView";
import {
  ArrowUpRight,
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  Layers3,
  Menu,
  MessageSquare,
  Plus,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import "./workspace.css";
import { stages, jobs } from "./data/demo";
import { Pill, Dialog, Field } from "./components/ui";
import RenewalsView from "./features/renewals/RenewalsView";

const nav = [
  {
    label: "FINANCIAL AID",
    items: [
      ["Overview", LayoutDashboard],
      ["Applications", Users],
      ["Scholarship cartridges", Layers3],
      ["Awards & matriculation", GraduationCap],
      ["Renewals", Clock3],
    ],
  },
  {
    label: "STUDENT WORK PROGRAM",
    items: [
      ["Work opportunities", BriefcaseBusiness],
      ["Time & activity", Clock3],
      ["Messages", MessageSquare],
      ["Stipends", Wallet],
    ],
  },
  { label: "ADMINISTRATION", items: [["Access control", ShieldCheck]] },
] as const;
export default function LifeAidWorkspace({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const state = useLifeAidDemo();
  const {
    page,
    setPage,
    role,
    access,
    can,
    canRecord,
    canPage,
    user,
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
  } = state;
  return (
    <div className="la-app">
      {mobile && (
        <button
          className="la-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={`la-sidebar ${mobile ? "open" : ""}`}>
        <a
          className="la-brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            go("Overview");
          }}
        >
          <img
            src="/brand/life-college-sidebar.png"
            alt="Life College International"
          />
          <span>
            <strong>
              LifeAid<span className="la-brand-dot">.</span>
            </strong>
            <small>LIFE COLLEGE</small>
          </span>
        </a>
        <div className="la-workspace-label">
          <span className="la-workspace-dot" /> Financial aid workspace
        </div>
        {nav
          .filter((group) => group.items.some(([label]) => canPage(label)))
          .map((group) => (
            <nav key={group.label} aria-label={group.label}>
              <p className="la-nav-label">{group.label}</p>
              {group.items
                .filter(([label]) => canPage(label))
                .map(([label, Icon]) => (
                  <button
                    key={label}
                    className={`la-nav-item ${page === label ? "active" : ""}`}
                    onClick={() => go(label)}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                    {label === "Applications" && (
                      <b>{cases.filter((c) => c.stage !== "Offered").length}</b>
                    )}
                    {label === "Messages" && <i />}
                  </button>
                ))}
            </nav>
          ))}
        <div className="la-sidebar-bottom">
          <div className="la-system-links">
            {can("settings.saml.view") && <a href="/saml-setup">SAML setup</a>}
            <button onClick={onLogout}>Sign out</button>
          </div>
          <div className="la-suite">
            <Layers3 size={19} />
            <div>
              <strong>Part of LifeOS</strong>
              <small>Shared identity & access</small>
            </div>
          </div>
          <button className="la-profile" onClick={() => setModal("roles")}>
            <span className="la-avatar">{isStudent ? "MS" : "AC"}</span>
            <span>
              <strong>{user.name}</strong>
              <small>{role} · Demo view</small>
            </span>
            <ChevronRight size={16} />
          </button>
        </div>
      </aside>
      <div className="la-workspace">
        <header className="la-topbar">
          <div className="la-breadcrumb">
            <button
              className="la-menu la-icon"
              aria-label="Open navigation"
              onClick={() => setMobile(true)}
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{page}</strong>
          </div>
          <div className="la-top-actions">
            <span className="la-term">
              AY 2026–2027 <span>·</span> 1st semester
            </span>
            <button
              className="la-icon"
              aria-label="View notifications"
              onClick={() => setModal("notifications")}
            >
              <Bell size={19} />
              <i />
            </button>
            <span className="la-avatar small">{isStudent ? "MS" : "AC"}</span>
          </div>
        </header>
        <div className="la-demo">
          <span>
            <span className="la-demo-dot" /> FRONTEND PREVIEW{" "}
            <span className="la-demo-detail">
              {" "}
              · Fictional data. Actions are simulated and reset on refresh.
            </span>
          </span>
          <label>
            Demo user{" "}
            <select
              aria-label="Demo user"
              value={access.userId}
              onChange={(e) => switchUser(e.target.value)}
            >
              {access.users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <main className="la-main">
          {!canPage(page) ? (
            <p>
              No access. Your assigned roles do not grant access to this page.
            </p>
          ) : (
            <>
              <div className="la-page-heading">
                <div>
                  <div className="la-eyebrow">
                    {page === "Overview" ? "FINANCIAL AID" : page.toUpperCase()}
                  </div>
                  <h1>{titles[page][0]}</h1>
                  <p>{titles[page][1]}</p>
                </div>
                {page === "Overview" && canPage("Applications") ? (
                  <button
                    className="la-button primary"
                    onClick={() => go("Applications")}
                  >
                    View applications <ArrowUpRight size={16} />
                  </button>
                ) : page === "Applications" &&
                  (can("applications.referral.create") ||
                    can("applications.submit.own")) ? (
                  <button
                    className="la-button primary"
                    onClick={() =>
                      setModal(
                        can("applications.referral.create")
                          ? "referral"
                          : "aid-form",
                      )
                    }
                  >
                    <Plus size={16} />
                    {can("applications.referral.create")
                      ? "Simulate referral"
                      : "Complete application"}
                  </button>
                ) : null}
              </div>
              {page === "Overview" && <OverviewView state={state} />}
              {page === "Applications" && <ApplicationsView state={state} />}
              {page === "Scholarship cartridges" && (
                <ScholarshipProgramsView state={state} />
              )}
              {page === "Awards & matriculation" && (
                <AwardsView state={state} />
              )}
              {page === "Work opportunities" && (
                <WorkOpportunitiesView state={state} />
              )}
              {page === "Time & activity" && <TimeActivityView state={state} />}
              {page === "Messages" && <MessagesView state={state} />}
              <div hidden={page !== "Renewals"}>
                <RenewalsView
                  access={access}
                  onNotify={notify}
                  onAward={(award) => setCases((old) => [...old, award])}
                />
              </div>
              {page === "Access control" && (
                <AccessControlView access={access} />
              )}
              {page === "Stipends" && <StipendsView state={state} />}
            </>
          )}
          <footer className="la-footer">
            <span>
              LifeAid <span> / </span> Financial Aid Module
            </span>
            <span>Life College · LifeOS ecosystem</span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="la-toast" role="status">
          <CheckCircle2 size={20} />
          <span>{toast}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {selectedCase && (
        <Dialog
          title={selectedCase.name}
          subtitle={`${selectedCase.id} · ${selectedCase.program}`}
          close={() => setSelected(null)}
        >
          <div className="la-detail-top">
            <Pill tone="sand">{selectedCase.stage}</Pill>
            <strong>{selectedCase.scholarship}</strong>
          </div>
          <div className="la-info compact">
            <ShieldCheck size={19} />
            <p>
              LifePortal referral · shared people_id · Admissions: pending. Aid
              review can proceed independently.
            </p>
          </div>
          <h4>Application checklist</h4>
          {[
            "Financial circumstances & personal statement",
            "Household supporting documents",
            selectedCase.scholarship === "Pitch to College"
              ? "Business summary & pitch deck"
              : "Supporting recommendation",
          ].map((s, i) => (
            <div className="la-check-item" key={s}>
              <CheckCircle2
                size={18}
                className={i < selectedCase.documents ? "complete" : ""}
              />
              <span>{s}</span>
              <small>
                {i < selectedCase.documents ? "Received" : "Awaiting"}
              </small>
              {i >= selectedCase.documents &&
                can("applications.documents.verify") && (
                  <button
                    className="la-link"
                    onClick={() =>
                      updateCase(selectedCase.id, {
                        documents: selectedCase.documents + 1,
                      })
                    }
                  >
                    Mark received
                  </button>
                )}
            </div>
          ))}
          <h4>Applicant statement</h4>
          <p className="la-muted">
            {selectedCase.statement ||
              "Sample statement: seeking support to pursue an entrepreneurship degree while contributing to the college community."}
          </p>
          {selectedCase.pitch && (
            <>
              <h4>Business idea</h4>
              <p className="la-muted">{selectedCase.pitch}</p>
            </>
          )}
          {selectedCase.income !== undefined && (
            <p className="la-muted">
              Reported sample household income: {peso(selectedCase.income)} /
              month
            </p>
          )}
          {can("applications.notes.view") && (
            <>
              <h4>Review notes</h4>
              <textarea
                aria-label="Review notes"
                readOnly={!can("applications.notes.edit")}
                value={selectedCase.note}
                onChange={(e) =>
                  updateCase(selectedCase.id, { note: e.target.value })
                }
              />
            </>
          )}
          <div className="la-field">
            <label htmlFor="award-percent">Proposed tuition benefit (%)</label>
            <input
              id="award-percent"
              disabled={!can("awards.terms.edit")}
              type="number"
              min="1"
              max="100"
              value={selectedCase.amount}
              onChange={(e) =>
                updateCase(selectedCase.id, {
                  amount: Math.min(100, Math.max(1, Number(e.target.value))),
                })
              }
            />
          </div>
          <p className="la-muted">
            Example award terms: one semester; tuition only; no stacking with
            another tuition award. Human approval is required in the proposed
            live workflow.
          </p>
          <div className="la-dialog-actions">
            <button
              className="la-button"
              onClick={() => {
                setSelected(null);
                notify("Review notes retained for this demo session.");
              }}
            >
              Close
            </button>
            {selectedCase.stage !== "Offered" &&
              can(
                selectedCase.stage === "For approval"
                  ? "applications.approve"
                  : "applications.assess",
              ) && (
                <button
                  className="la-button primary"
                  disabled={selectedCase.documents < 3}
                  title={
                    selectedCase.documents < 3
                      ? "Complete the document checklist before advancing"
                      : undefined
                  }
                  onClick={() => {
                    const next =
                      stages[
                        Math.min(stages.indexOf(selectedCase.stage) + 1, 4)
                      ];
                    updateCase(selectedCase.id, { stage: next });
                    notify(`Demo application moved to ${next.toLowerCase()}.`);
                  }}
                >
                  {selectedCase.stage === "For approval"
                    ? "Approve & issue demo offer"
                    : "Move to " +
                      stages[
                        Math.min(stages.indexOf(selectedCase.stage) + 1, 4)
                      ]}
                </button>
              )}
          </div>
        </Dialog>
      )}
      {modal && (
        <Dialog
          title={
            modal === "cartridge"
              ? cartridge
              : modal === "job"
                ? jobs.find((j) => j.id === jobId)!.title
                : modal === "log"
                  ? "New activity log"
                  : modal === "correct-log"
                    ? "Correct activity log"
                    : modal === "aid-form"
                      ? "Financial aid application"
                      : modal === "referral"
                        ? "Simulate a LifePortal referral"
                        : modal === "roles"
                          ? "Demo user"
                          : "Notifications"
          }
          subtitle="Frontend preview · hardcoded sample data"
          close={() => {
            setModal(null);
            if (modal === "correct-log") setSelected(null);
          }}
        >
          {modal === "notifications" && (
            <>
              <div className="la-notice">
                <FileCheck2 />
                <div>
                  <strong>
                    {cases.filter((c) => c.stage === "For approval").length}{" "}
                    application ready for approval
                  </strong>
                  <p>Open the review queue to see the proposed award.</p>
                </div>
              </div>
              <div className="la-notice">
                <Clock3 />
                <div>
                  <strong>
                    {pendingHours} work hours awaiting verification
                  </strong>
                  <p>Team lead verification unlocks stipend preparation.</p>
                </div>
              </div>
              <button
                className="la-button primary"
                onClick={() => {
                  setModal(null);
                  go("Applications");
                }}
              >
                Open applications
              </button>
            </>
          )}
          {modal === "roles" && (
            <div className="la-role-options">
              {access.users.map((u) => (
                <button
                  className="la-button"
                  key={u.id}
                  onClick={() => switchUser(u.id)}
                >
                  {u.name}
                </button>
              ))}
              <p className="la-muted">
                Perspective switching demonstrates workflows; it is not
                production access control.
              </p>
            </div>
          )}
          {modal === "cartridge" && (
            <>
              <Pill tone="sand">PROPOSED PROGRAM CONFIGURATION</Pill>
              <div className="la-field">
                <label>Degree connection</label>
                <select
                  aria-label="Degree connection"
                  value={
                    cartridge === "Pitch to College"
                      ? linked
                        ? "BS Entrepreneurship"
                        : "Unassigned"
                      : "All degree programs"
                  }
                  onChange={(e) =>
                    can("scholarships.configure") &&
                    setLinked(e.target.value === "BS Entrepreneurship")
                  }
                  disabled={
                    !can("scholarships.configure") ||
                    cartridge !== "Pitch to College"
                  }
                >
                  {cartridge === "Pitch to College" ? (
                    <>
                      <option>BS Entrepreneurship</option>
                      <option>Unassigned</option>
                    </>
                  ) : (
                    <option>All degree programs</option>
                  )}
                </select>
              </div>
              <h4>Required evidence</h4>
              {(cartridge === "Pitch to College"
                ? [
                    "Business summary and problem statement",
                    "Pitch deck and proposed business model",
                    "Panel interview and pitch presentation",
                  ]
                : [
                    "Financial circumstances statement",
                    "Household income evidence",
                    "Supporting recommendation",
                  ]
              ).map((s) => (
                <div className="la-check-item" key={s}>
                  <FileCheck2 size={18} />
                  {s}
                </div>
              ))}
              <h4>Review pathway</h4>
              <div className="la-mini-steps">
                {(cartridge === "Pitch to College"
                  ? [
                      "Completeness",
                      "Academic pitch panel",
                      "Aid committee",
                      "Award offer",
                    ]
                  : [
                      "Completeness",
                      "Financial assessment",
                      "Aid committee",
                      "Award offer",
                    ]
                ).map((s, i) => (
                  <div key={s}>
                    <b>0{i + 1}</b>
                    {s}
                  </div>
                ))}
              </div>
              <h4>Renewal & work</h4>
              <p>
                Renewal uses a fresh term assessment. Student work is managed
                through a separate placement; an award alone does not approve
                work hours or a stipend.
              </p>
              <button
                className="la-button primary"
                onClick={() => {
                  if (!requirePermission("scholarships.configure")) return;
                  setModal(null);
                  notify("Cartridge configuration saved in this demo session.");
                }}
              >
                {can("scholarships.configure")
                  ? "Save demo configuration"
                  : "Read-only configuration"}
              </button>
            </>
          )}
          {modal === "job" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!can("work.apply.own") || user.peopleId !== "DEMO-P-1001")
                  return;
                const details = new FormData(e.currentTarget);
                setWorkApps((old) => ({
                  ...old,
                  [jobId]: {
                    status: "Applied",
                    motivation: String(details.get("motivation")),
                    availability: String(details.get("availability")),
                  },
                }));
                setModal(null);
                notify("Demo work application submitted to the team lead.");
              }}
            >
              <p>{jobs.find((j) => j.id === jobId)!.description}</p>
              <div className="la-info compact">
                <Clock3 size={19} />
                <p>
                  {jobs.find((j) => j.id === jobId)!.hours} · Placement approval
                  is separate from scholarship approval.
                </p>
              </div>
              <Field
                label="Why would you like to join this team?"
                name="motivation"
                area
                required
              />
              <Field
                label="Weekly availability"
                name="availability"
                placeholder="e.g. Monday and Wednesday, 1–5 PM"
                required
              />
              <button
                className="la-button primary"
                disabled={
                  !!workApps[jobId] ||
                  !can("work.apply.own") ||
                  user.peopleId !== "DEMO-P-1001"
                }
              >
                {workApps[jobId]
                  ? "Application already submitted"
                  : "Submit demo work application"}
              </button>
            </form>
          )}
          {modal === "log" && (
            <form onSubmit={addLog}>
              <Field
                label="Work date"
                name="date"
                type="date"
                value="2026-09-07"
                required
              />
              <Field
                label="Hours worked"
                name="hours"
                type="number"
                value={elapsed ?? 4}
                min="0.01"
                max="12"
                step="0.01"
                required
              />
              <Field
                label="Activities and deliverables"
                name="task"
                area
                placeholder="What did you work on, and what was completed?"
                required
              />
              <p className="la-muted">
                Hours are submitted for verification. A team lead must approve
                them before they enter a stipend batch.
              </p>
              <button className="la-button primary">Submit activity</button>
            </form>
          )}
          {modal === "correct-log" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (
                  !can("time.correct.own") ||
                  logs.find((l) => l.id === Number(selected))?.peopleId !==
                    user.peopleId
                )
                  return;
                const d = new FormData(e.currentTarget);
                setLogs((old) =>
                  old.map((l) =>
                    l.id === Number(selected)
                      ? {
                          ...l,
                          task: String(d.get("task")),
                          hours: Number(d.get("hours")),
                          status: "Pending review",
                        }
                      : l,
                  ),
                );
                setModal(null);
                setSelected(null);
                notify("Corrected activity resubmitted for review.");
              }}
            >
              <Field
                label="Hours worked"
                name="hours"
                type="number"
                value={logs.find((l) => l.id === Number(selected))?.hours}
                min="0.01"
                max="12"
                step="0.01"
                required
              />
              <Field
                label="Corrected activity"
                name="task"
                area
                value={logs.find((l) => l.id === Number(selected))?.task}
                required
              />
              <button className="la-button primary">Resubmit for review</button>
            </form>
          )}
          {modal === "aid-form" && (
            <form onSubmit={submitAid}>
              <div className="la-info compact">
                <GraduationCap size={20} />
                <p>
                  Maya Santos · BS Entrepreneurship · Pitch to College. Identity
                  and program come from LifePortal.
                </p>
              </div>
              <Field
                label="Tell us about your need for support"
                name="statement"
                area
                required
              />
              <Field label="Business idea summary" name="pitch" area required />
              <Field
                label="Monthly household income (sample PHP amount)"
                name="income"
                type="number"
                min="0"
                required
              />
              <label className="la-consent">
                <input type="checkbox" required /> I confirm this is fictional
                demo information and mark the required documents as received for
                this walkthrough.
              </label>
              <button className="la-button primary">
                Submit demo aid application
              </button>
            </form>
          )}
          {modal === "referral" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const d = new FormData(e.currentTarget);
                if (!requirePermission("applications.referral.create")) return;
                const name = String(d.get("name")).trim();
                const id = `AID-0${266 + cases.length - 5}`;
                setCases((old) => [
                  ...old,
                  {
                    id,
                    peopleId: `DEMO-P-${Date.now()}`,
                    name,
                    program: "BS Entrepreneurship",
                    scholarship: String(d.get("program")),
                    stage: "Draft",
                    documents: 0,
                    amount: 25,
                    accepted: false,
                    posted: false,
                    note: "New simulated LifePortal referral. LifeAid access provisioned in the demo.",
                  },
                ]);
                setModal(null);
                notify(
                  "Demo referral created with a draft aid application. No real account was provisioned.",
                );
              }}
            >
              <Field label="Fictional applicant name" name="name" required />
              <div className="la-field">
                <label htmlFor="ref-program">
                  Initial LifeAid program (demo)
                </label>
                <select name="program" id="ref-program">
                  <option>Access Grant</option>
                  <option>Pitch to College</option>
                </select>
              </div>
              <p>
                In the proposed live workflow, LifePortal sends the aid opt-in,
                people_id, application reference, degree program, and intake.
                LifeAid reuses the shared identity and creates one application
                per referral.
              </p>
              <button className="la-button primary">
                Create demo referral
              </button>
            </form>
          )}
        </Dialog>
      )}
    </div>
  );
}
