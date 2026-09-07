import {
  ArrowUpRight,
  ArrowRight,
  BriefcaseBusiness,
  Clock3,
  FileCheck2,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { LifeAidDemoState } from "../../hooks/useLifeAidDemo";

import { Pill, PanelTitle } from "../../components/ui";
import CaseTable from "../../components/CaseTable";

export default function OverviewView({ state }: { state: LifeAidDemoState }) {
  const {
    filter,
    setFilter,
    cases,
    setSelected,
    workApps,
    cartridge,
    linked,
    pendingHours,
    go,
    can,
    canRecord,
  } = state;
  return (
    <>
      <div className="la-overview-grid">
        <section className="la-hero">
          <div className="la-hero-copy">
            <span className="la-kicker">
              <Sparkles size={14} /> SCHOLARSHIP PROGRAMS
            </span>
            <h2>Scholarship programs</h2>
            <p>
              Degree-linked scholarships and institutional financial aid grants.
            </p>
            <button onClick={() => go("Scholarship cartridges")}>
              View scholarship cartridges <ArrowRight size={17} />
            </button>
          </div>
        </section>
        {can("applications.approve") && (
          <section className="la-next-card">
            <div className="la-eyebrow">PENDING APPROVALS</div>
            <div className="la-next-icon">
              <FileCheck2 size={23} />
            </div>
            <h3>
              {cases.filter((c) => c.stage === "For approval").length} pending
              approvals
            </h3>
            <p>Applications awaiting committee approval.</p>
            <button
              className="la-link"
              onClick={() => {
                go("Applications");
                setFilter("For approval");
              }}
            >
              Open approval queue <ArrowUpRight size={16} />
            </button>
          </section>
        )}
      </div>
      <div className="la-stats">
        {[
          {
            label: "Active applications",
            value: cases.filter((c) => c.stage !== "Offered").length,
            sub: `${cases.length} referrals this intake`,
            icon: Users,
          },
          {
            label: "Scholarship programs",
            value: 2,
            sub: "1 degree-linked cartridge",
            icon: GraduationCap,
          },
          {
            label: "Work applications",
            value: canRecord("work.applications.view", "DEMO-P-1001")
              ? Object.keys(workApps).length
              : 0,
            sub: "6 opportunities across 3 teams",
            icon: BriefcaseBusiness,
          },
          {
            label: "Hours awaiting review",
            value: pendingHours,
            sub: "Student Work Program",
            icon: Clock3,
          },
        ].map((s) => (
          <section className="la-stat" key={s.label}>
            <div>
              <span>{s.label}</span>
              <s.icon size={18} />
            </div>
            <strong>{s.value.toString().padStart(2, "0")}</strong>
            <small>{s.sub}</small>
          </section>
        ))}
      </div>
      <section className="la-panel la-journey">
        <PanelTitle
          title="Application-to-matriculation workflow"
          subtitle="LifePortal referrals, LifeAid reviews and awards, and LifeSIS enrollment postings."
        />
        <div className="la-journey-steps">
          {[
            ["01", "LifePortal", "Aid opt-in", "Referral"],
            ["02", "LifeAid", "Apply & assess", "Review"],
            ["03", "LifeAid", "Offer & accept", "Award"],
            ["04", "LifeSIS", "Enroll & apply benefit", "Matriculation"],
          ].map(([n, system, title, tag]) => (
            <button
              key={n}
              onClick={() =>
                go(
                  n === "01" || n === "02"
                    ? "Applications"
                    : "Awards & matriculation",
                )
              }
            >
              <span className="la-step-number">{n}</span>
              <small>{system}</small>
              <strong>{title}</strong>
              <span>
                {tag} <ArrowRight size={14} />
              </span>
            </button>
          ))}
        </div>
        <div className="la-panel-foot">
          <ShieldCheck size={14} /> Connected by people_id · LifeAid owns the
          award; LifeSIS owns the fee posting.
          <Pill>Integration preview</Pill>
        </div>
      </section>
      <div className="la-bottom-grid">
        <section className="la-panel">
          <PanelTitle
            title="Recent applications"
            subtitle="Latest application records and review status."
            action={
              <button className="la-link" onClick={() => go("Applications")}>
                View all <ArrowUpRight size={15} />
              </button>
            }
          />
          <CaseTable rows={cases.slice(0, 3)} onSelect={setSelected} />
        </section>
        <section className="la-panel la-work-callout">
          <span className="la-kicker">
            <BriefcaseBusiness size={16} /> STUDENT WORK PROGRAM
          </span>
          <h3>Work placements</h3>
          <p>Open roles, team applications, and confirmed placements.</p>
          <button
            className="la-button"
            onClick={() => go("Work opportunities")}
          >
            View work opportunities <ArrowUpRight size={16} />
          </button>
        </section>
      </div>
    </>
  );
}
