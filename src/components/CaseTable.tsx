import { ArrowUpRight, FileCheck2 } from "lucide-react";
import type { AidCase } from "../data/demo";
import { initials } from "../lib/format";
import { Pill } from "./ui";
export default function CaseTable({
  rows,
  onSelect,
}: {
  rows: AidCase[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="la-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Applicant</th>
            <th>Scholarship</th>
            <th>Stage</th>
            <th>Documents</th>
            <th>
              <span className="la-sr-only">Open application</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id}>
              <td>
                <button className="la-person" onClick={() => onSelect(c.id)}>
                  <span className="la-avatar">{initials(c.name)}</span>
                  <span>
                    <strong>{c.name}</strong>
                    <small>{c.id} · BS Entrepreneurship</small>
                  </span>
                </button>
              </td>
              <td>{c.scholarship}</td>
              <td>
                <Pill
                  tone={
                    c.stage === "Offered"
                      ? "green"
                      : c.stage === "For approval"
                        ? "red"
                        : "sand"
                  }
                >
                  {c.stage}
                </Pill>
              </td>
              <td>
                <span className="la-doc-count">
                  <FileCheck2 size={15} />
                  {c.documents} / 3
                </span>
              </td>
              <td>
                <button
                  className="la-icon"
                  aria-label={`Open ${c.name} application`}
                  onClick={() => onSelect(c.id)}
                >
                  <ArrowUpRight size={17} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
