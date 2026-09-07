import type { Access } from "../../rbac/useAccess";
import { useState, useEffect, type FormEvent } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  GraduationCap,
  Plus,
} from "lucide-react";
import { Dialog, Empty, Field, PanelTitle, Pill } from "../../components/ui";
import type { AidCase } from "../../data/demo";

type Renewal = {
  id: string;
  peopleId: string;
  name: string;
  award: string;
  program: string;
  state: string;
  documents: boolean;
  academic: boolean;
  enrollment: boolean;
  work: boolean;
  percent: number;
  note: string;
};
const initialRenewals: Renewal[] = [
  {
    id: "REN-0101",
    name: "Maya Santos",
    peopleId: "DEMO-P-1001",
    award: "AWD-2026-010",
    program: "Pitch to College",
    state: "Due for renewal",
    documents: false,
    academic: false,
    enrollment: false,
    work: false,
    percent: 50,
    note: "Next term renewal. Updated business milestone report is required.",
  },
  {
    id: "REN-0102",
    name: "Eli Navarro",
    peopleId: "DEMO-P-1002",
    award: "AWD-2026-011",
    program: "Access Grant",
    state: "Under review",
    documents: true,
    academic: true,
    enrollment: true,
    work: false,
    percent: 30,
    note: "Financial update received. Work requirement does not apply to this award.",
  },
  {
    id: "REN-0103",
    name: "Noah Cruz",
    peopleId: "DEMO-P-1004",
    award: "AWD-2026-012",
    program: "Pitch to College",
    state: "For approval",
    documents: true,
    academic: true,
    enrollment: true,
    work: true,
    percent: 50,
    note: "Panel reviewed business progress. Proposed continuation at the existing coverage.",
  },
];
export default function RenewalsView({
  access,
  onNotify,
  onAward,
}: {
  access: Access;
  onNotify: (message: string) => void;
  onAward: (award: AidCase) => void;
}) {
  const [rows, setRows] = useState(initialRenewals);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState("All renewals");
  const [started, setStarted] = useState(false);
  const { can, canRecord } = access;
  const isStudent = !can("renewals.view.all");
  const scoped = rows.filter((r) => canRecord("renewals.view", r.peopleId));
  const row = scoped.find((r) => r.id === selected);
  const visible = scoped.filter(
    (r) => filter === "All renewals" || r.state === filter,
  );
  useEffect(() => {
    setSelected(null);
    setFilter("All renewals");
  }, [access.userId]);
  function update(id: string, patch: Partial<Renewal>) {
    const target = scoped.find((r) => r.id === id);
    if (!target) return;
    if (patch.state === "Submitted") {
      if (!canRecord("renewals.submit", target.peopleId)) return;
    } else {
      if (patch.percent !== undefined && !can("renewals.terms.edit")) return;
      const permission =
        patch.state === "Renewed"
          ? "renewals.approve"
          : patch.state === "Needs correction"
            ? "renewals.return"
            : patch.state === "Not renewed"
              ? "renewals.decline"
              : "renewals.review";
      if (patch.percent === undefined && !can(permission)) return;
    }
    setRows((old) => old.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!row || !canRecord("renewals.submit", row.peopleId)) return;
    const d = new FormData(e.currentTarget);
    update(row.id, {
      state: "Submitted",
      documents: true,
      note: String(d.get("update")),
    });
    onNotify(
      "Renewal submitted with sample evidence. Awaiting a new term review.",
    );
    setSelected(null);
  }
  function approve() {
    if (!row || !can("renewals.approve") || row.state !== "For approval")
      return;
    update(row.id, { state: "Renewed" });
    onAward({
      id: `${row.id}-AWD`,
      name: row.name,
      peopleId: row.peopleId,
      program: "BS Entrepreneurship",
      scholarship: row.program,
      stage: "Offered",
      documents: 3,
      amount: row.percent,
      accepted: false,
      posted: false,
      note: row.note,
      period: "2nd semester, AY 2026–27",
      parentAward: row.award,
    });
    onNotify(
      "Renewed award issued for the next term. Acceptance and LifeSIS posting remain separate.",
    );
    setSelected(null);
  }
  if (!access.canPage("Renewals")) return null;
  return (
    <>
      <div className="la-info">
        <Clock3 size={22} />
        <div>
          <strong>Term renewal review</strong>
          <p>
            Keep the original award intact. Review updated financial
            circumstances, academic and enrollment standing, scholarship
            milestones, and work obligations where applicable. Sample checks are
            not live SIS records.
          </p>
        </div>
      </div>
      <div className="la-renewal-header">
        <div>
          <Pill tone="sand">NEXT CYCLE</Pill>
          <h2>2nd semester · AY 2026–2027</h2>
          <p>
            Proposed window: November 1–30, 2026 · Renewal does not
            automatically extend the current award.
          </p>
        </div>
        <button
          className="la-button primary"
          disabled={started || !can("renewals.cycle.manage")}
          onClick={() => {
            if (!can("renewals.cycle.manage")) return;
            setStarted(true);
            onNotify(
              "Renewal cycle opened in this preview. No reminders were sent.",
            );
          }}
        >
          <Plus size={16} />
          {started ? "Cycle opened" : "Open demo cycle"}
        </button>
      </div>
      <section className="la-panel">
        <PanelTitle
          title={isStudent ? "My scholarship renewal" : "Renewal queue"}
          subtitle="Continue, amend, request corrections, or decline with a recorded reason."
          action={
            <select
              aria-label="Filter renewals"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {[
                "All renewals",
                "Due for renewal",
                "Submitted",
                "Under review",
                "For approval",
                "Needs correction",
                "Renewed",
                "Not renewed",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          }
        />
        {visible.length ? (
          <div className="la-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Scholar / original award</th>
                  <th>Scholarship</th>
                  <th>New term benefit</th>
                  <th>Renewal status</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.name}</strong>
                      <small>{r.award}</small>
                    </td>
                    <td>{r.program}</td>
                    <td>{r.percent}% tuition</td>
                    <td>
                      <Pill tone={r.state === "Renewed" ? "green" : "sand"}>
                        {r.state}
                      </Pill>
                    </td>
                    <td>
                      <button
                        className="la-link"
                        onClick={() => setSelected(r.id)}
                        aria-label={`Review ${r.name} renewal`}
                      >
                        Open <ArrowUpRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>No renewals match this view.</Empty>
        )}
      </section>
      <section className="la-panel">
        <PanelTitle
          title="Renewal requirements"
          subtitle="Each cartridge can define its own recurring evidence and review responsibilities."
        />
        <div className="la-four-grid">
          {[
            [
              "Financial update",
              "Confirm changes in household circumstances and supporting evidence.",
            ],
            [
              "Academic & enrollment check",
              "Review the new term’s enrollment and academic standing from LifeSIS.",
            ],
            [
              "Cartridge milestones",
              "Pitch to College adds business progress and academic panel review.",
            ],
            [
              "Work obligations",
              "Review approved hours only when work is a condition of that award.",
            ],
          ].map(([title, text]) => (
            <div key={title}>
              <FileCheck2 color="#a28b6a" size={20} />
              <h4>{title}</h4>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
      {row && (
        <Dialog
          title={`${row.name} · Renewal`}
          subtitle={`${row.id} · Original award ${row.award}`}
          close={() => setSelected(null)}
        >
          <Pill tone="sand">{row.state}</Pill>
          <div className="la-info compact" style={{ marginTop: 20 }}>
            <GraduationCap size={20} />
            <p>
              {row.program} · BS Entrepreneurship · Next term: 2nd semester, AY
              2026–27.
            </p>
          </div>
          {canRecord("renewals.submit", row.peopleId) &&
          (row.state === "Due for renewal" ||
            row.state === "Needs correction") ? (
            <form onSubmit={submit}>
              <Field
                label="Changes in circumstances and scholarship progress"
                name="update"
                area
                required
                value={row.note}
              />
              <label className="la-consent">
                <input type="checkbox" required /> Mark updated evidence as
                received for this hardcoded-data walkthrough.
              </label>
              <button className="la-button primary">Submit renewal</button>
            </form>
          ) : (
            <>
              <h4>Review checklist</h4>
              {(
                [
                  "documents",
                  "academic",
                  "enrollment",
                  ...(row.program === "Pitch to College" ? ["work"] : []),
                ] as (keyof Renewal)[]
              ).map((key) => (
                <label className="la-renewal-check" key={key}>
                  <input
                    type="checkbox"
                    checked={Boolean(row[key])}
                    disabled={
                      !can("renewals.review") ||
                      ["Renewed", "Not renewed"].includes(row.state)
                    }
                    onChange={(e) =>
                      update(row.id, { [key]: e.target.checked })
                    }
                  />
                  <span>
                    {
                      (
                        {
                          documents: "Updated evidence & cartridge milestones",
                          academic:
                            "Academic standing reviewed (sample SIS data)",
                          enrollment:
                            "Enrollment eligibility confirmed (sample SIS data)",
                          work: "Work obligation reviewed (sample requirement)",
                        } as Record<string, string>
                      )[key]
                    }
                  </span>
                  <CheckCircle2 size={16} />
                </label>
              ))}
              {row.program === "Access Grant" && (
                <p className="la-muted">
                  Work obligation: not applicable to this sample award.
                </p>
              )}
              <p className="la-muted">
                Proposed next-term benefit: {row.percent}% of tuition.
              </p>
              <label className="la-field">
                <span>Decision notes / reason</span>
                <textarea
                  aria-label="Renewal decision notes"
                  value={row.note}
                  disabled={
                    !can("renewals.review") ||
                    ["Renewed", "Not renewed"].includes(row.state)
                  }
                  onChange={(e) => update(row.id, { note: e.target.value })}
                />
              </label>
              {(can("renewals.review") ||
                can("renewals.approve") ||
                can("renewals.return") ||
                can("renewals.decline") ||
                can("renewals.terms.edit")) &&
                !["Renewed", "Not renewed"].includes(row.state) && (
                  <>
                    <label className="la-field">
                      <span>Amend coverage</span>
                      <select
                        disabled={!can("renewals.terms.edit")}
                        aria-label="Amend renewal coverage"
                        value={row.percent}
                        onChange={(e) =>
                          update(row.id, { percent: Number(e.target.value) })
                        }
                      >
                        {[20, 25, 30, 40, 50, 75, 100].map((n) => (
                          <option value={n} key={n}>
                            {n}% tuition
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="la-dialog-actions">
                      <button
                        className="la-button"
                        disabled={!row.note.trim() || !can("renewals.return")}
                        onClick={() => {
                          update(row.id, { state: "Needs correction" });
                          setSelected(null);
                          onNotify(
                            "Renewal returned with the recorded correction notes.",
                          );
                        }}
                      >
                        Return
                      </button>
                      <button
                        className="la-button"
                        disabled={!row.note.trim() || !can("renewals.decline")}
                        onClick={() => {
                          update(row.id, { state: "Not renewed" });
                          setSelected(null);
                          onNotify(
                            "Non-renewal recorded for the next term. Existing award remains unchanged.",
                          );
                        }}
                      >
                        Do not renew
                      </button>
                      <button
                        className="la-button primary"
                        disabled={
                          !can(
                            row.state === "For approval"
                              ? "renewals.approve"
                              : "renewals.review",
                          ) ||
                          !row.documents ||
                          !row.academic ||
                          !row.enrollment ||
                          (row.program === "Pitch to College" && !row.work) ||
                          !row.note.trim()
                        }
                        onClick={() =>
                          row.state === "For approval"
                            ? approve()
                            : update(row.id, {
                                state:
                                  row.state === "Submitted"
                                    ? "Under review"
                                    : "For approval",
                              })
                        }
                      >
                        {row.state === "For approval"
                          ? "Approve renewal"
                          : "Advance review"}
                      </button>
                    </div>
                  </>
                )}
              {row.state === "Renewed" && (
                <p className="la-muted">
                  A new term award is available in Awards & matriculation. The
                  student accepts that offer before its benefit is posted.
                </p>
              )}
            </>
          )}
        </Dialog>
      )}
    </>
  );
}
