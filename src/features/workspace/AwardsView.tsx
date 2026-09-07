import { Check, ShieldCheck } from "lucide-react";
import type { LifeAidDemoState } from "../../hooks/useLifeAidDemo";

import { Pill, Empty } from "../../components/ui";
import CaseTable from "../../components/CaseTable";
import { peso, initials } from "../../lib/format";

export default function AwardsView({ state }: { state: LifeAidDemoState }) {
  const {
    filter,
    awardCases: cases,
    notify,
    updateCase,
    can,
    canRecord,
  } = state;
  return (
    <>
      <div className="la-info">
        <ShieldCheck size={22} />
        <div>
          <strong>Award and posting status</strong>
          <p>
            Offer → acceptance → enrollment confirmation → fee posting. All
            LifeSIS actions below are simulations; no student account or money
            is changed.
          </p>
        </div>
      </div>
      <div className="la-award-list">
        {cases
          .filter((c) => c.stage === "Offered")
          .map((c) => (
            <section className="la-panel la-award" key={c.id}>
              <div className="la-award-header">
                <span className="la-avatar">{initials(c.name)}</span>
                <div>
                  <h3>{c.name}</h3>
                  <p>
                    {c.id} · {c.scholarship}
                  </p>
                </div>
                <Pill tone={c.posted ? "green" : "sand"}>
                  {c.posted
                    ? "Applied in demo SIS"
                    : c.accepted
                      ? "Accepted · awaiting enrollment"
                      : "Offer awaiting acceptance"}
                </Pill>
              </div>
              <div className="la-award-details">
                <div>
                  <small>BENEFIT</small>
                  <strong>{c.amount}% of tuition</strong>
                </div>
                <div>
                  <small>PERIOD</small>
                  <strong>{c.period || "1st semester, AY 2026–27"}</strong>
                </div>
                <div>
                  <small>CONDITIONS</small>
                  <strong>Admitted + enrolled</strong>
                </div>
                <div>
                  <small>COMBINATION RULE</small>
                  <strong>Cannot stack tuition awards</strong>
                </div>
              </div>
              <div className="la-award-footer">
                <span>
                  {c.posted
                    ? `Demo posting ${c.id}-V1 · ${peso((40000 * c.amount) / 100)} against illustrative tuition of ₱40,000`
                    : c.parentAward
                      ? `Renewal of ${c.parentAward}. Original award retained.`
                      : "Other fees are excluded. An amendment requires a new award version."}
                </span>
                <button
                  className="la-button primary"
                  disabled={
                    c.posted ||
                    !(c.accepted
                      ? can("awards.post")
                      : canRecord("awards.accept", c.peopleId))
                  }
                  onClick={() => {
                    updateCase(
                      c.id,
                      c.accepted ? { posted: true } : { accepted: true },
                    );
                    notify(
                      c.accepted
                        ? "Simulated enrollment and fee posting confirmed."
                        : "Demo award accepted.",
                    );
                  }}
                >
                  {c.posted ? (
                    <>
                      <Check size={15} /> Posted
                    </>
                  ) : c.accepted ? (
                    "Simulate SIS posting"
                  ) : (
                    "Simulate acceptance"
                  )}
                </button>
              </div>
            </section>
          ))}
        {!cases.some((c) => c.stage === "Offered") && (
          <Empty>
            No awards yet. Complete review and issue an offer from Applications.
          </Empty>
        )}
      </div>
    </>
  );
}
