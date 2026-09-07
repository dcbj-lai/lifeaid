import {
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  Layers3,
  Sparkles,
} from "lucide-react";
import type { LifeAidDemoState } from "../../hooks/useLifeAidDemo";
import { stages } from "../../data/demo";
import { Pill, PanelTitle } from "../../components/ui";
import CaseTable from "../../components/CaseTable";

export default function ScholarshipProgramsView({
  state,
}: {
  state: LifeAidDemoState;
}) {
  const { setModal, cartridge, setCartridge, linked } = state;
  return (
    <>
      <div className="la-info">
        <Layers3 size={21} />
        <div>
          <strong>Cartridge configuration</strong>
          <p>
            Attach a scholarship to a degree, then define its evidence,
            reviewers, milestones, and award conditions. These are proposed
            rules for discussion.
          </p>
        </div>
      </div>
      <div className="la-program-grid">
        <section className="la-program featured">
          <div className="la-program-top">
            <span className="la-program-icon">
              <Sparkles size={28} />
            </span>
            <Pill tone="sand">DEGREE-LINKED</Pill>
          </div>
          <div className="la-eyebrow">ENTREPRENEURSHIP PATHWAY</div>
          <h2>Pitch to College</h2>
          <p>
            Degree-linked scholarship for BS Entrepreneurship, assessed through
            a business proposal and pitch panel.
          </p>
          <div className="la-degree">
            <GraduationCap size={17} />
            {linked ? "BS Entrepreneurship" : "No degree attached"}
          </div>
          <div className="la-program-meta">
            <span>
              <small>PROPOSED COVERAGE</small>
              <strong>Up to 50% tuition</strong>
            </span>
            <span>
              <small>REVIEW PATHWAY</small>
              <strong>Pitch + panel</strong>
            </span>
          </div>
          <button
            className="la-button primary"
            onClick={() => {
              setCartridge("Pitch to College");
              setModal("cartridge");
            }}
          >
            View cartridge <ArrowUpRight size={16} />
          </button>
        </section>
        <section className="la-program">
          <div className="la-program-top">
            <span className="la-program-icon green">
              <BookOpen size={28} />
            </span>
            <Pill tone="green">INSTITUTIONAL</Pill>
          </div>
          <div className="la-eyebrow">NEED-BASED SUPPORT</div>
          <h2>Access Grant</h2>
          <p>
            Need-based grant assessed using the applicant’s financial
            circumstances and supporting evidence.
          </p>
          <div className="la-degree">
            <GraduationCap size={17} />
            All eligible degree programs
          </div>
          <div className="la-program-meta">
            <span>
              <small>PROPOSED COVERAGE</small>
              <strong>Individual award</strong>
            </span>
            <span>
              <small>REVIEW PATHWAY</small>
              <strong>Financial assessment</strong>
            </span>
          </div>
          <button
            className="la-button"
            onClick={() => {
              setCartridge("Access Grant");
              setModal("cartridge");
            }}
          >
            View program <ArrowUpRight size={16} />
          </button>
        </section>
      </div>
      <section className="la-panel">
        <PanelTitle
          title="Cartridge fields"
          subtitle="A reusable scholarship definition, connected to the academic catalog."
        />
        <div className="la-four-grid">
          {[
            [
              "Degree connection",
              "Link to the program ID shared by LifePortal and LifeSIS.",
            ],
            [
              "Own requirements",
              "Pitch deck, business summary, interview, or supporting evidence.",
            ],
            [
              "Own review stages",
              "Assign academic panel and aid committee responsibilities.",
            ],
            [
              "Clear award contract",
              "Specify coverage, term, cap, combination rules, and renewal.",
            ],
          ].map(([title, text], i) => (
            <div key={title}>
              <span className="la-step-number">0{i + 1}</span>
              <h4>{title}</h4>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
