// Explicit grants. Unknown users, roles, permissions and unowned records fail closed.
export const permissionGroups = {
  Overview: [["overview.view", "View overview"]],
  Applications: [
    ["applications.view.own", "View own applications"],
    ["applications.view.all", "View all applications"],
    ["applications.submit.own", "Submit own application"],
    ["applications.referral.create", "Create referrals"],
    ["applications.documents.verify", "Verify documents"],
    ["applications.notes.view", "View internal review notes"],
    ["applications.notes.edit", "Edit internal review notes"],
    ["applications.assess", "Assess applications"],
    ["applications.approve", "Approve applications and issue offers"],
  ],
  Scholarships: [
    ["scholarships.view", "View scholarship programs"],
    ["scholarships.configure", "Configure degree links and program rules"],
  ],
  Awards: [
    ["awards.view.own", "View own awards"],
    ["awards.view.all", "View all awards"],
    ["awards.terms.edit", "Edit proposed award terms"],
    ["awards.accept.own", "Accept own award"],
    ["awards.accept.all", "Record acceptance for any award"],
    ["awards.post", "Post approved awards to LifeSIS"],
  ],
  Renewals: [
    ["renewals.view.own", "View own renewals"],
    ["renewals.view.all", "View all renewals"],
    ["renewals.submit.own", "Submit own renewal"],
    ["renewals.submit.all", "Submit renewal on behalf of a student"],
    ["renewals.cycle.manage", "Manage renewal cycles"],
    ["renewals.review", "Review renewal evidence and checks"],
    ["renewals.terms.edit", "Amend renewal coverage"],
    ["renewals.return", "Return renewals for correction"],
    ["renewals.approve", "Approve renewed awards"],
    ["renewals.decline", "Record non-renewal decisions"],
  ],
  Work: [
    ["work.positions.view", "View open positions"],
    ["work.apply.own", "Apply to work positions"],
    ["work.applications.view.own", "View own work applications"],
    ["work.applications.view.all", "View all work applications"],
    ["work.match.approve", "Approve team matches"],
    ["work.placement.confirm", "Confirm placements"],
  ],
  Attendance: [
    ["time.view.own", "View own time and activities"],
    ["time.view.all", "View all time and activities"],
    ["time.clock.own", "Clock own shifts"],
    ["time.log.own", "Submit own activity logs"],
    ["time.correct.own", "Correct own returned logs"],
    ["time.verify", "Approve work hours"],
    ["time.return", "Return work hours for correction"],
  ],
  Messages: [
    ["messages.view.own", "View conversations in own placement"],
    ["messages.view.all", "View all placement conversations"],
    ["messages.send", "Send placement messages"],
  ],
  Stipends: [
    ["stipends.view.own", "View own stipend records"],
    ["stipends.view.all", "View all stipend records"],
    ["stipends.prepare", "Prepare stipend batches"],
    ["stipends.verify", "Verify stipend batches"],
    ["stipends.authorize", "Authorize stipend batches"],
    ["stipends.release", "Record stipend release"],
  ],
  Administration: [
    ["access.view", "View users, roles and permission assignments"],
    ["roles.create", "Create roles"],
    ["roles.permissions.edit", "Edit role permissions"],
    ["users.roles.assign", "Assign roles to users"],
    ["settings.saml.view", "View SAML configuration"],
  ],
} as const;
export type Permission =
  (typeof permissionGroups)[keyof typeof permissionGroups][number][0];
export const permissions = Object.values(permissionGroups)
  .flat()
  .map(([key, label]) => ({ key, label }));
export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  system?: boolean;
};
export type DemoUser = {
  id: string;
  peopleId: string;
  name: string;
  email: string;
  roleIds: string[];
};
export const demoUsers: DemoUser[] = [
  {
    id: "user-super-admin",
    peopleId: "DEMO-P-ADMIN",
    name: "Alex Cruz",
    email: "admin@lifeaid.local",
    roleIds: ["super-admin"],
  },
  {
    id: "user-student",
    peopleId: "DEMO-P-1001",
    name: "Maya Santos",
    email: "maya.santos@student.lifeaid.local",
    roleIds: ["student"],
  },
];
export const demoRoles: Role[] = [
  {
    id: "super-admin",
    name: "Super admin",
    description: "All registered permissions. Protected system role.",
    system: true,
    permissions: permissions.map((p) => p.key),
  },
  {
    id: "student",
    name: "Student",
    description:
      "Own application, awards, renewals, work records and placement messages.",
    permissions: [
      "overview.view",
      "applications.view.own",
      "applications.submit.own",
      "scholarships.view",
      "awards.view.own",
      "awards.accept.own",
      "renewals.view.own",
      "renewals.submit.own",
      "work.positions.view",
      "work.apply.own",
      "work.applications.view.own",
      "time.view.own",
      "time.clock.own",
      "time.log.own",
      "time.correct.own",
      "messages.view.own",
      "messages.send",
      "stipends.view.own",
    ],
  },
];
export function effectivePermissions(
  user: DemoUser | undefined,
  roles: Role[],
): Set<Permission> {
  if (!user) return new Set();
  const known = new Set(permissions.map((p) => p.key));
  return new Set(
    roles
      .filter((r) => user.roleIds.includes(r.id))
      .flatMap((r) => r.permissions)
      .filter((p) => known.has(p)),
  );
}
export function hasPermission(
  user: DemoUser | undefined,
  roles: Role[],
  permission: Permission,
) {
  return effectivePermissions(user, roles).has(permission);
}
export function hasRecordPermission(
  user: DemoUser | undefined,
  roles: Role[],
  base: string,
  ownerId: string | undefined,
) {
  if (!user) return false;
  const grants = effectivePermissions(user, roles);
  return (
    grants.has(`${base}.all` as Permission) ||
    !!(
      ownerId &&
      user.peopleId === ownerId &&
      grants.has(`${base}.own` as Permission)
    )
  );
}
export const pagePermissions: Record<string, Permission[]> = {
  Overview: ["overview.view"],
  Applications: ["applications.view.own", "applications.view.all"],
  "Scholarship cartridges": ["scholarships.view"],
  "Awards & matriculation": ["awards.view.own", "awards.view.all"],
  Renewals: ["renewals.view.own", "renewals.view.all"],
  "Work opportunities": ["work.positions.view"],
  "Time & activity": ["time.view.own", "time.view.all"],
  Messages: ["messages.view.own", "messages.view.all"],
  Stipends: ["stipends.view.own", "stipends.view.all"],
  "Access control": ["access.view"],
};
export function canViewPage(
  user: DemoUser | undefined,
  roles: Role[],
  page: string,
) {
  return (pagePermissions[page] || []).some((p) =>
    hasPermission(user, roles, p),
  );
}
