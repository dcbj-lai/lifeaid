import { Clock3, Plus } from "lucide-react";
import type { LifeAidDemoState } from "../../hooks/useLifeAidDemo";

import { Pill, PanelTitle } from "../../components/ui";
import CaseTable from "../../components/CaseTable";

export default function TimeActivityView({
  state,
}: {
  state: LifeAidDemoState;
}) {
  const {
    setSelected,
    setModal,
    logs,
    setLogs,
    clock,
    setClock,
    setElapsed,
    approvedHours,
    pendingHours,
    notify,
    can,
    user,
  } = state;
  return (
    <>
      <div className="la-time-summary">
        <div className="la-panel la-shift">
          <div>
            <Pill tone={clock ? "green" : "neutral"}>
              {clock
                ? "SHIFT IN PROGRESS"
                : "DEMO PLACEMENT · LIBRARY ASSISTANT"}
            </Pill>
            <h2>{clock ? "Active shift" : "Shift attendance"}</h2>
            <p>
              {clock
                ? `Started at ${new Date(clock).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. Clock out to complete your activity log.`
                : "Maya Santos · Learning Resource Center · Team lead: Rina Dela Cruz"}
            </p>
          </div>
          <button
            disabled={!can("time.clock.own") || user.peopleId !== "DEMO-P-1001"}
            className="la-button primary"
            onClick={() => {
              if (!can("time.clock.own") || user.peopleId !== "DEMO-P-1001")
                return;
              if (clock) {
                setElapsed(
                  Math.max(
                    0.01,
                    Math.round(((Date.now() - clock) / 3600000) * 100) / 100,
                  ),
                );
                setClock(null);
                setModal("log");
              } else {
                setClock(Date.now());
                notify("Demo shift started.");
              }
            }}
          >
            <Clock3 size={17} />
            {clock ? "Clock out & log" : "Clock in"}
          </button>
        </div>
        <div className="la-panel la-hours">
          <small>APPROVED HOURS</small>
          <strong>
            {approvedHours}
            <span>hrs</span>
          </strong>
          <p>{pendingHours} hrs awaiting verification</p>
        </div>
      </div>
      <section className="la-panel">
        <PanelTitle
          title="Activity logs"
          subtitle="September 1–15, 2026 · Sample attendance and activity records"
          action={
            <button
              disabled={!can("time.log.own") || user.peopleId !== "DEMO-P-1001"}
              className="la-button"
              onClick={() => setModal("log")}
            >
              <Plus size={16} /> Add activity
            </button>
          }
        />
        <div className="la-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date / student</th>
                <th>Activity & deliverables</th>
                <th>Hours</th>
                <th>Status</th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <strong>{log.date}</strong>
                    <small>Maya Santos</small>
                  </td>
                  <td className="la-task-cell">{log.task}</td>
                  <td>
                    <strong>{log.hours}h</strong>
                  </td>
                  <td>
                    <Pill tone={log.status === "Approved" ? "green" : "sand"}>
                      {log.status}
                    </Pill>
                  </td>
                  <td>
                    {log.status === "Pending review" &&
                    (can("time.verify") || can("time.return")) ? (
                      <div className="la-inline-actions">
                        <button
                          disabled={!can("time.verify")}
                          className="la-link"
                          onClick={() =>
                            can("time.verify") &&
                            setLogs((old) =>
                              old.map((l) =>
                                l.id === log.id
                                  ? { ...l, status: "Approved" }
                                  : l,
                              ),
                            )
                          }
                        >
                          Approve
                        </button>
                        <button
                          disabled={!can("time.return")}
                          className="la-link muted"
                          onClick={() => {
                            if (!can("time.return")) return;
                            setLogs((old) =>
                              old.map((l) =>
                                l.id === log.id
                                  ? { ...l, status: "Needs correction" }
                                  : l,
                              ),
                            );
                            notify(
                              "Correction requested. Use Messages to explain the required change.",
                            );
                          }}
                        >
                          Return
                        </button>
                      </div>
                    ) : log.status === "Needs correction" &&
                      can("time.correct.own") &&
                      log.peopleId === user.peopleId ? (
                      <button
                        className="la-link"
                        onClick={() => {
                          setModal("correct-log");
                          setSelected(String(log.id));
                        }}
                      >
                        Correct
                      </button>
                    ) : (
                      <span className="la-muted">
                        {log.status === "Approved"
                          ? "Verified by lead"
                          : "Awaiting lead"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
