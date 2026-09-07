# LifeAid React frontend preview

This is the application frontend in the existing LifeOS tenant boilerplate, not a separate visual artifact. The existing password login, local development login, session cookie, branding endpoint, SAML endpoints, and setup screen remain in place. No financial-aid backend, database, external messaging, or payment integrations were added.

## Implementation boundaries

- `src/App.tsx`: original authentication and SAML/settings entry points; authenticated product routes render LifeAidWorkspace.
- `src/LifeAidWorkspace.tsx`: application shell, shared dialogs, and feature composition.
- `src/data/demo.ts`: typed fictional applicants, work roles, and workflow stages.
- `src/hooks/useLifeAidDemo.ts`: React state and local transitions. Replace these operations with API hooks during backend implementation.
- `src/features/workspace/`: separate overview, applications, scholarship programs, awards, work opportunities, time/activity, messages, and stipends views.
- `src/features/renewals/RenewalsView.tsx`: renewal queue, application, checks, correction/non-renewal decisions, and new-term award creation.
- `src/components/`: reusable dialogs, fields, tables, status pills, and panel headings.
- `src/workspace.css`: responsive khaki/sand interface with crimson actions and existing college brand assets.

## Walkthrough

1. Sign in with the existing local account. Explore the overview and its connected LifePortal → LifeAid → LifeSIS journey.
2. Applications: search/filter, open a case, complete the document checklist, edit the proposed coverage and notes, advance review, and issue a demo offer. The simulated referral creates a draft only in React state.
3. Scholarship cartridges: inspect Pitch to College, its BS Entrepreneurship connection, required pitch evidence, and academic/aid review stages. Link/unlink the degree to preview configuration. Coverage and rules are illustrative, not adopted college policy.
4. Awards & matriculation: accept the offer and simulate enrollment/fee posting. Tuition is illustrated at PHP 40,000. Other fees are excluded. No real SIS is connected.
5. Renewals: submit Maya's renewal or review Noah's ready-for-approval record. Change next-term coverage, approve renewal, and find the resulting separate award in Awards & matriculation. The original award is not overwritten. Renewal state survives feature navigation during this session.
6. Work opportunities: apply to a team with motivation and availability, then approve the team match and confirm placement. A pre-existing sample library placement is separately supplied for the time/stipend walkthrough.
7. Time & activity: clock in/out or enter an activity; hours start pending. Approve, return for correction, and resubmit. Approved hours within September 1–15 feed the stipend preview.
8. Messages: type into the shared library-team conversation. Messages update locally only.
9. Stipends: approved hours × sample PHP 100/hour. Prepare a batch to freeze its total, then verify, authorize, and simulate release. No funds move.
10. Demo user switches between Maya Santos (Student) and Alex Cruz (Super admin). Access control edits permission grants and assigned roles. This is frontend RBAC with hardcoded data; backend enforcement is deferred.

All business data is hardcoded/in-memory and resets when the page reloads or the product workspace unmounts. Required-document receipt uses explicit demo controls; there is no document upload/storage service. Integration, rates, academic checks, and renewal conditions are proposed samples for product review. The future backend must supply identity-linked records, persistence, authorization, audit trails, document storage, program rules, and reliable external handoffs.

## Browser verification

- Authenticated workspace renders through the existing boilerplate.
- Application search narrows to the matching applicant; missing documents disable progression, and marking the missing item received enables review.
- Renewal approval with amended 40% coverage creates a separate second-term offer and retains the first-term award.
- Work application retains motivation and availability; team approval and placement confirmation advance the displayed status.
- Messages append to the local team conversation.
- Approving 4 pending work hours raises eligible hours from 7 to 11 and the sample stipend from PHP 700 to PHP 1,100. Batch processing advances through prepared, verified, authorized, and released (demo).
- Layout checked at desktop and 390px mobile width; mobile navigation opens and routes to scholarship cartridges.

## Frontend RBAC preview

Use **Demo user** to switch between Alex Cruz (Super admin) and Maya Santos (Student). This is an explicit testing harness; it does not change the boilerplate authenticated session. Refresh resets all role edits and assignments.

**Access control** supports custom roles, granular grant editing, multiple roles per user and a view-access matrix. There are 55 explicit permissions. Own-record scopes compare shared people IDs; all-record scopes are separate grants. Viewing a page does not grant its submit, review, approve, accept, post, verify, authorize or release actions. Unknown grants and unassigned roles deny access. The built-in super-admin role is protected against accidental lockout.

The model is in `src/rbac/model.ts`; the demo state adapter is `src/rbac/useAccess.ts`. Feature views check permissions and record scope. Work fixtures currently use Maya's single placement. Production must enforce equivalent authorization and ownership on every API request; all fixtures currently remain downloadable frontend data. No backend RBAC or real impersonation was implemented.

Run `pnpm test:rbac` for default-deny, ownership, role union, revocation and independent financial-action checks. Docker builds run these tests before compiling the frontend.

Favicon assets are copied from LifePortal's `web/public` directory, matching its active frontend rather than the artwork directory. Versioned URLs invalidate the prior tab-icon cache.
