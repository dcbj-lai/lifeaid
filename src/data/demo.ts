// Fictional fixtures for the React frontend. Replace with typed API responses later.
export type Page =
  | "Overview"
  | "Applications"
  | "Scholarship cartridges"
  | "Awards & matriculation"
  | "Work opportunities"
  | "Time & activity"
  | "Messages"
  | "Stipends"
  | "Renewals"
  | "Access control";
export type AidCase = {
  peopleId: string;
  id: string;
  name: string;
  program: string;
  scholarship: string;
  stage: string;
  documents: number;
  amount: number;
  accepted: boolean;
  posted: boolean;
  note: string;
  period?: string;
  parentAward?: string;
  statement?: string;
  pitch?: string;
  income?: number;
};
export type WorkLog = {
  peopleId: string;
  id: number;
  date: string;
  task: string;
  hours: number;
  status: string;
};
export const stages = [
  "Draft",
  "Submitted",
  "Under review",
  "For approval",
  "Offered",
];
export const seedCases: AidCase[] = [
  {
    id: "AID-0261",
    name: "Maya Santos",
    peopleId: "DEMO-P-1001",
    program: "BS Entrepreneurship",
    scholarship: "Pitch to College",
    stage: "Under review",
    documents: 3,
    amount: 50,
    accepted: false,
    posted: false,
    note: "Business pitch and household documents received. Panel interview to be scheduled.",
  },
  {
    id: "AID-0262",
    name: "Eli Navarro",
    peopleId: "DEMO-P-1002",
    program: "BS Entrepreneurship",
    scholarship: "Access Grant",
    stage: "For approval",
    documents: 3,
    amount: 30,
    accepted: false,
    posted: false,
    note: "Assessment complete. Ready for the financial aid committee.",
  },
  {
    id: "AID-0263",
    name: "Sofia Reyes",
    peopleId: "DEMO-P-1003",
    program: "BS Entrepreneurship",
    scholarship: "Access Grant",
    stage: "Submitted",
    documents: 2,
    amount: 25,
    accepted: false,
    posted: false,
    note: "One supporting document remains to be verified.",
  },
  {
    id: "AID-0264",
    name: "Noah Cruz",
    peopleId: "DEMO-P-1004",
    program: "BS Entrepreneurship",
    scholarship: "Pitch to College",
    stage: "Offered",
    documents: 3,
    amount: 50,
    accepted: true,
    posted: false,
    note: "Offer accepted. Waiting for enrollment confirmation from LifeSIS.",
  },
  {
    id: "AID-0265",
    name: "Isabel Lim",
    peopleId: "DEMO-P-1005",
    program: "BS Entrepreneurship",
    scholarship: "Access Grant",
    stage: "Draft",
    documents: 1,
    amount: 20,
    accepted: false,
    posted: false,
    note: "Referred by LifePortal. Application in progress.",
  },
];
export const jobs = [
  {
    id: 1,
    title: "Library assistant",
    team: "Learning Resource Center",
    kind: "On campus",
    hours: "8–12 hrs / week",
    open: 2,
    description:
      "Support book circulation, organize resources, and help students find the materials they need.",
  },
  {
    id: 2,
    title: "Admissions ambassador",
    team: "Admissions & Community",
    kind: "On campus",
    hours: "6–8 hrs / week",
    open: 3,
    description:
      "Welcome campus visitors, support open-house events, and prepare applicant information packs.",
  },
  {
    id: 3,
    title: "Digital content assistant",
    team: "Communications",
    kind: "Hybrid",
    hours: "8–10 hrs / week",
    open: 1,
    description:
      "Help prepare campus stories, organize media, and create content with the communications team.",
  },
];
