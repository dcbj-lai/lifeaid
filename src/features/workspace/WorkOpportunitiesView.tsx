import { ArrowUpRight, BriefcaseBusiness } from "lucide-react";
import type { LifeAidDemoState } from "../../hooks/useLifeAidDemo";
import { jobs } from "../../data/demo";
import { Pill, Empty, PanelTitle } from "../../components/ui";
import CaseTable from "../../components/CaseTable";

export default function WorkOpportunitiesView({
  state,
}: {
  state: LifeAidDemoState;
}) {
  const {
    role,
    filter,
    setModal,
    workApps,
    setWorkApps,
    setJobId,
    notify,
    isStudent,
    can,
    canRecord,
  } = state;
  return (
    <>
      <div className="la-work-banner">
        <div>
          <Pill tone="green">STUDENT WORK PROGRAM</Pill>
          <h2>Open team positions</h2>
          <p>
            Apply to a role, share your availability, and meet your team lead.
          </p>
        </div>
        <BriefcaseBusiness size={66} strokeWidth={1} />
      </div>
      <div className="la-job-grid">
        {jobs.map((job) => (
          <section className="la-panel la-job" key={job.id}>
            <div className="la-job-icon">
              <BriefcaseBusiness size={22} />
            </div>
            <small>{job.team}</small>
            <h3>{job.title}</h3>
            <p>{job.description}</p>
            <div className="la-job-tags">
              <Pill>{job.kind}</Pill>
              <Pill>{job.hours}</Pill>
            </div>
            <div className="la-job-bottom">
              <span>{job.open} openings</span>
              <button
                className="la-link"
                onClick={() => {
                  setJobId(job.id);
                  setModal("job");
                }}
              >
                {workApps[job.id]?.status || "View & apply"}{" "}
                <ArrowUpRight size={15} />
              </button>
            </div>
          </section>
        ))}
      </div>
      <section className="la-panel">
        <PanelTitle
          title={
            !can("work.applications.view.all")
              ? "My work applications"
              : "Placement review"
          }
          subtitle="Team leads review availability; P&C / CL Head confirms the match."
        />
        {canRecord("work.applications.view", "DEMO-P-1001") &&
        Object.keys(workApps).length ? (
          jobs
            .filter((j) => workApps[j.id])
            .map((j) => (
              <div className="la-placement" key={j.id}>
                <span className="la-avatar">MS</span>
                <div>
                  <strong>Maya Santos · {j.title}</strong>
                  <p>{j.team} · BS Entrepreneurship</p>
                  <p>
                    <strong>Availability:</strong> {workApps[j.id].availability}
                  </p>
                  <p>
                    <strong>Motivation:</strong> {workApps[j.id].motivation}
                  </p>
                </div>
                <Pill tone="sand">{workApps[j.id].status}</Pill>
                {can(
                  workApps[j.id].status === "Applied"
                    ? "work.match.approve"
                    : "work.placement.confirm",
                ) &&
                  workApps[j.id].status !== "Placed" && (
                    <button
                      className="la-button"
                      onClick={() => {
                        if (
                          !can(
                            workApps[j.id].status === "Applied"
                              ? "work.match.approve"
                              : "work.placement.confirm",
                          )
                        )
                          return;
                        setWorkApps((old) => ({
                          ...old,
                          [j.id]: {
                            ...old[j.id],
                            status:
                              old[j.id].status === "Applied"
                                ? "Team approved"
                                : "Placed",
                          },
                        }));
                        notify("Demo placement status updated.");
                      }}
                    >
                      {workApps[j.id].status === "Applied"
                        ? "Approve team match"
                        : "Confirm placement"}
                    </button>
                  )}
              </div>
            ))
        ) : (
          <Empty>No new work applications. Try applying to an open role.</Empty>
        )}
      </section>
    </>
  );
}
