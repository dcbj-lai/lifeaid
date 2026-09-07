import { CheckCircle2, CircleDollarSign, Wallet } from "lucide-react";
import type { LifeAidDemoState } from "../../hooks/useLifeAidDemo";

import { Pill, PanelTitle } from "../../components/ui";
import CaseTable from "../../components/CaseTable";
import { peso } from "../../lib/format";

export default function StipendsView({ state }: { state: LifeAidDemoState }) {
  const {
    role,
    stipend,
    setStipend,
    frozenHours,
    setFrozenHours,
    approvedHours,
    pendingHours,
    notify,
    isStudent,
    can,
  } = state;
  const nextPermission =
    stipend === "Not prepared"
      ? "stipends.prepare"
      : stipend === "Prepared"
        ? "stipends.verify"
        : stipend === "Verified"
          ? "stipends.authorize"
          : "stipends.release";
  return (
    <>
      <div className="la-info">
        <Wallet size={22} />
        <div>
          <strong>Stipend calculation</strong>
          <p>
            The sample rate is ₱100/hour. Only verified hours dated September
            1–15 are included; preparing a batch freezes its hours for finance
            review. No payment service is connected.
          </p>
        </div>
      </div>
      <div className="la-stats three">
        {[
          [
            "Eligible approved hours",
            `${approvedHours} hrs`,
            "Verified by the team lead",
          ],
          [
            "Pending verification",
            `${pendingHours} hrs`,
            "Excluded from this batch",
          ],
          [
            "Estimated stipend",
            peso(approvedHours * 100),
            "Sample rate: ₱100 per hour",
          ],
        ].map(([l, v, s]) => (
          <section className="la-stat" key={l}>
            <div>
              <span>{l}</span>
              <CircleDollarSign size={18} />
            </div>
            <strong>{v}</strong>
            <small>{s}</small>
          </section>
        ))}
      </div>
      <section className="la-panel">
        <PanelTitle
          title="September stipend batch"
          subtitle="September 1–15, 2026 · SWP-2026-09-A"
          action={
            <Pill tone={stipend === "Released (demo)" ? "green" : "sand"}>
              {stipend}
            </Pill>
          }
        />
        <div className="la-payroll-row">
          <span className="la-avatar">MS</span>
          <div>
            <strong>Maya Santos</strong>
            <small>Library assistant · Learning Resource Center</small>
          </div>
          <div>
            <strong>
              {stipend === "Not prepared" ? approvedHours : frozenHours} hours
            </strong>
            <small>× ₱100 / hour</small>
          </div>
          <strong className="la-money">
            {peso(
              (stipend === "Not prepared" ? approvedHours : frozenHours) * 100,
            )}
          </strong>
        </div>
        <div className="la-stipend-steps">
          {["Prepared", "Verified", "Authorized", "Released (demo)"].map(
            (s, i) => (
              <div
                key={s}
                className={
                  [
                    "Prepared",
                    "Verified",
                    "Authorized",
                    "Released (demo)",
                  ].indexOf(stipend) >= i
                    ? "done"
                    : ""
                }
              >
                <CheckCircle2 size={20} />
                <span>{s}</span>
              </div>
            ),
          )}
        </div>
        <div className="la-award-footer">
          <span>
            {stipend === "Released (demo)"
              ? "Demo reference: SWP-DEMO-0907. No funds have moved."
              : "Finance reviews the verified work, authorizes the batch, then records its release."}
          </span>
          <button
            className="la-button primary"
            disabled={
              approvedHours === 0 ||
              stipend === "Released (demo)" ||
              !can(nextPermission)
            }
            onClick={() => {
              if (!can(nextPermission)) return;
              const chain = [
                "Not prepared",
                "Prepared",
                "Verified",
                "Authorized",
                "Released (demo)",
              ];
              if (stipend === "Not prepared") setFrozenHours(approvedHours);
              setStipend(chain[chain.indexOf(stipend) + 1]);
              notify("Demo stipend batch updated. No funds moved.");
            }}
          >
            {stipend === "Not prepared"
              ? "Prepare batch"
              : stipend === "Prepared"
                ? "Verify batch"
                : stipend === "Verified"
                  ? "Authorize demo batch"
                  : stipend === "Authorized"
                    ? "Simulate funds release"
                    : "Release recorded"}
          </button>
        </div>
      </section>
    </>
  );
}
