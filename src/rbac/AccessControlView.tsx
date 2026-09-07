import { useState, type FormEvent } from "react";
import { ShieldCheck, Plus, Search } from "lucide-react";
import type { Access } from "./useAccess";
import {
  permissionGroups,
  effectivePermissions,
  hasPermission,
  pagePermissions,
} from "./model";
import { PanelTitle, Pill } from "../components/ui";
export default function AccessControlView({ access }: { access: Access }) {
  const [roleId, setRoleId] = useState("student");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const role = access.roles.find((r) => r.id === roleId)!;
  if (!access.can("access.view")) return <p>Access denied.</p>;
  function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (access.createRole(String(new FormData(form).get("name")))) {
      form.reset();
      setError("");
    } else setError("Enter a unique role name.");
  }
  return (
    <>
      <div className="la-info">
        <ShieldCheck size={22} />
        <div>
          <strong>Users → roles → permissions → views and actions</strong>
          <p>
            Multiple assigned roles combine their explicit grants. Own-record
            permissions use people_id. Unassigned permissions are denied. This
            editor changes frontend demo state only; backend authorization is
            deferred.
          </p>
        </div>
      </div>
      <section className="la-panel">
        <PanelTitle
          title="Demo users"
          subtitle="Roles are assigned to users. The demo identity selector is a test harness, not sign-in."
        />
        <div className="la-table-wrap">
          <table>
            <thead>
              <tr>
                <th>User / identity</th>
                <th>Assigned roles</th>
                <th>Effective permissions</th>
              </tr>
            </thead>
            <tbody>
              {access.users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                    <small>{user.peopleId}</small>
                  </td>
                  <td>
                    <div className="la-role-assignments">
                      {access.roles.map((r) => (
                        <label key={r.id}>
                          <input
                            type="checkbox"
                            checked={user.roleIds.includes(r.id)}
                            disabled={
                              !access.can("users.roles.assign") ||
                              (user.id === "user-super-admin" &&
                                r.id === "super-admin")
                            }
                            onChange={(e) =>
                              access.assignRole(user.id, r.id, e.target.checked)
                            }
                          />
                          {r.name}
                        </label>
                      ))}
                    </div>
                  </td>
                  <td>
                    <Pill>
                      {effectivePermissions(user, access.roles).size}{" "}
                      permissions
                    </Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="la-panel">
        <PanelTitle
          title="Roles & permissions"
          subtitle="View, submit, edit, approve and financial actions are granted independently."
        />
        {access.can("roles.create") && (
          <form className="la-toolbar" onSubmit={create}>
            <input
              aria-label="New role name"
              name="name"
              placeholder="New role name"
              required
              maxLength={60}
            />
            <button className="la-button">
              <Plus size={15} />
              Create role
            </button>
            {error && <span role="alert">{error}</span>}
          </form>
        )}
        <div className="la-toolbar">
          <label>
            Role{" "}
            <select
              aria-label="Role to edit"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
            >
              {access.roles.map((r) => (
                <option value={r.id} key={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <label className="la-search">
            <Search size={16} />
            <input
              aria-label="Search permissions"
              placeholder="Filter permissions"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <Pill>{role.permissions.length} granted</Pill>
        </div>
        <p className="la-rbac-note">
          {role.description}
          {role.system ? " System role grants cannot be edited." : ""}
        </p>
        <div className="la-permission-grid">
          {Object.entries(permissionGroups).map(([group, items]) => {
            const shown = items.filter(([key, label]) =>
              `${key} ${label}`.toLowerCase().includes(query.toLowerCase()),
            );
            return shown.length ? (
              <section key={group}>
                <h4>{group}</h4>
                {shown.map(([key, label]) => (
                  <label key={key} className="la-permission">
                    <input
                      type="checkbox"
                      aria-label={key}
                      checked={role.permissions.includes(key)}
                      disabled={
                        role.system || !access.can("roles.permissions.edit")
                      }
                      onChange={(e) =>
                        access.setGrant(role.id, key, e.target.checked)
                      }
                    />
                    <span>
                      {label}
                      <code>{key}</code>
                    </span>
                  </label>
                ))}
              </section>
            ) : null;
          })}
        </div>
      </section>
      <section className="la-panel">
        <PanelTitle
          title="View access by user"
          subtitle="Page access does not grant permission to perform every action on that page."
        />
        <div className="la-table-wrap">
          <table>
            <thead>
              <tr>
                <th>View</th>
                {access.users.map((u) => (
                  <th key={u.id}>{u.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(pagePermissions).map(([page, required]) => (
                <tr key={page}>
                  <td>{page}</td>
                  {access.users.map((u) => (
                    <td key={u.id}>
                      <Pill
                        tone={
                          required.some((p) =>
                            hasPermission(u, access.roles, p),
                          )
                            ? "green"
                            : "neutral"
                        }
                      >
                        {required.some((p) => hasPermission(u, access.roles, p))
                          ? "Allowed"
                          : "Denied"}
                      </Pill>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
