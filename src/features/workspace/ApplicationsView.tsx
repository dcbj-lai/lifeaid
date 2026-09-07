import { BookOpen, Search } from "lucide-react";
import type { LifeAidDemoState } from "../../hooks/useLifeAidDemo";
import { stages } from "../../data/demo";
import { Empty } from "../../components/ui";
import CaseTable from "../../components/CaseTable";

export default function ApplicationsView({
  state,
}: {
  state: LifeAidDemoState;
}) {
  const {
    role,
    query,
    setQuery,
    filter,
    setFilter,
    cases,
    selected,
    setSelected,
    filtered,
    isStudent,
  } = state;
  return (
    <>
      {isStudent && (
        <div className="la-info">
          <BookOpen size={19} />
          <div>
            <strong>Applicant profile</strong>
            <p>
              Referred from LifePortal · BS Entrepreneurship · people_id:
              DEMO-P-1001. Complete your aid details here; your admissions
              decision is tracked separately.
            </p>
          </div>
        </div>
      )}
      <div className="la-stage-strip">
        {stages.map((stage) => (
          <button
            className={filter === stage ? "selected" : ""}
            key={stage}
            onClick={() => setFilter(filter === stage ? "All stages" : stage)}
          >
            <span>{stage}</span>
            <strong>
              {cases.filter((c) => c.stage === stage && true).length}
            </strong>
          </button>
        ))}
      </div>
      <section className="la-panel">
        <div className="la-toolbar">
          <label className="la-search">
            <Search size={17} />
            <input
              aria-label="Search applications"
              placeholder="Search name, application, or scholarship"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <select
            aria-label="Filter application stage"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All stages</option>
            {stages.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        {filtered.length ? (
          <CaseTable rows={filtered} onSelect={setSelected} />
        ) : (
          <Empty>No applications match your filters.</Empty>
        )}
      </section>
    </>
  );
}
