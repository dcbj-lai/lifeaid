import {
  Bell,
  ChartColumnIncreasing,
  ChevronRight,
  Database,
  LayoutDashboard,
  LockKeyhole,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Users,
  Workflow,
  X,
} from 'lucide-react';
import type { ComponentType, CSSProperties, FormEvent, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';

interface Branding {
  appName: string;
  brandName: string;
  organization: string;
  accent: string;
  lifeosUrl: string;
  tenantId: string;
  appId: string;
  spEntityId: string;
  acsUrl: string;
  sloUrl: string;
  idpMetadataUrl: string;
}

interface AppSession {
  authenticated: boolean;
  user: {
    name: string;
    email: string;
    initials: string;
    roles: string[];
    appEntitlements: string[];
  } | null;
  tenant: {
    id: string;
    name: string;
    appId: string;
  } | null;
  auth?: {
    provider: string;
  } | null;
}

interface NavigationSection {
  label: string;
  items: NavigationItem[];
}

interface NavigationItem {
  label: string;
  path: string;
  icon: keyof typeof icons;
}

interface DashboardPayload {
  summary: Array<{ label: string; value: string; detail: string }>;
  activity: Array<{ title: string; detail: string }>;
}

const icons = {
  ChartColumnIncreasing,
  Database,
  LayoutDashboard,
  Settings,
  Users,
  Workflow,
};

const fallbackBranding: Branding = {
  appName: 'Tenant Boilerplate',
  brandName: 'Tenant App',
  organization: 'LifeOS Tenant',
  accent: '#9e1d20',
  lifeosUrl: 'http://127.0.0.1:5174',
  tenantId: 'tenant-boilerplate',
  appId: 'tenant-boilerplate',
  spEntityId: 'urn:lifeos:tenant-boilerplate:sp',
  acsUrl: 'http://127.0.0.1:8002/saml/acs',
  sloUrl: 'http://127.0.0.1:8002/saml/slo',
  idpMetadataUrl: 'http://127.0.0.1:5174/saml/idp/metadata?tenant_id=tenant-boilerplate',
};

const signedOutSession: AppSession = {
  authenticated: false,
  user: null,
  tenant: null,
};

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/records': 'Records',
  '/workflow': 'Workflow',
  '/people': 'People',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export default function App() {
  const [branding, setBranding] = useState<Branding>(fallbackBranding);
  const [session, setSession] = useState<AppSession>(signedOutSession);
  const [navigation, setNavigation] = useState<NavigationSection[]>([]);
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [activePath, setActivePath] = useState(() => normalizePath(window.location.pathname));
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeItem = useMemo(
    () => navigation.flatMap((section) => section.items).find((item) => item.path === activePath),
    [activePath, navigation],
  );

  useEffect(() => {
    fetchJson<Branding>('/api/branding').then(setBranding).catch(() => null);
    refreshSession().catch(() => null);
  }, []);

  useEffect(() => {
    if (!session.authenticated) return;
    Promise.all([
      fetchJson<{ navigation: NavigationSection[] }>('/api/navigation'),
      fetchJson<DashboardPayload>('/api/dashboard'),
    ])
      .then(([nav, dash]) => {
        setNavigation(nav.navigation);
        setDashboard(dash);
      })
      .catch(() => {
        setNavigation([]);
        setDashboard(null);
      });
  }, [session.authenticated]);

  useEffect(() => {
    const onPopState = () => setActivePath(normalizePath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  async function refreshSession() {
    const nextSession = await fetchJson<AppSession>('/api/auth/session');
    setSession(nextSession);
  }

  async function handleDevLogin() {
    const response = await fetch('/api/auth/dev-login', { method: 'POST', credentials: 'include' });
    if (!response.ok) return;
    setSession(await response.json());
    navigate('/dashboard');
  }

  async function handlePasswordLogin(credentials: { email: string; password: string; remember: boolean }) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Invalid email or password.');
    setSession(await response.json());
    navigate('/dashboard');
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => null);
    setSession(signedOutSession);
    setNavigation([]);
    setDashboard(null);
    window.history.replaceState({}, '', '/login');
    setActivePath('/login');
  }

  function navigate(path: string) {
    const nextPath = normalizePath(path);
    window.history.pushState({}, '', nextPath);
    setActivePath(nextPath);
    setMobileMenuOpen(false);
  }

  if (!session.authenticated) {
    return (
      <LoginScreen
        branding={branding}
        onPasswordLogin={handlePasswordLogin}
        onDevLogin={handleDevLogin}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((current) => !current)}
      />
    );
  }

  return (
    <div className={`app shell ${darkMode ? 'dark' : ''}`} style={{ '--brand-accent': branding.accent } as CSSProperties}>
      <Sidebar branding={branding} navigation={navigation} activePath={activePath} onNavigate={navigate} />

      <div className="workspace">
        <header className="topbar">
          <button className="icon-button mobile-only" type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation">
            <Menu size={20} />
          </button>
          <div>
            <h1>{activeItem?.label ?? routeTitles[activePath] ?? 'Workspace'}</h1>
            <p>{session.tenant?.name ?? branding.organization}</p>
          </div>
          <div className="topbar-actions">
            <label className="search-box">
              <Search size={17} aria-hidden="true" />
              <input type="search" aria-label="Search tenant app" placeholder="Search" />
            </label>
            <button className="icon-button" type="button" aria-label="Notifications" title="Notifications">
              <Bell size={19} />
            </button>
            <button className="icon-button" type="button" onClick={() => setDarkMode((current) => !current)} aria-label="Toggle dark mode">
              {darkMode ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <UserChip name={session.user?.name ?? 'LifeOS User'} initials={session.user?.initials ?? 'LO'} />
            <button className="icon-button" type="button" onClick={handleLogout} aria-label="Log out">
              <LogOut size={19} />
            </button>
          </div>
        </header>

        <main className="content">
          {activePath === '/dashboard' ? (
            <DashboardView branding={branding} session={session} dashboard={dashboard} />
          ) : activePath === '/settings' ? (
            <SettingsView branding={branding} />
          ) : (
            <PlaceholderView title={activeItem?.label ?? routeTitles[activePath] ?? 'Placeholder'} path={activePath} />
          )}
        </main>
      </div>

      {mobileMenuOpen ? (
        <div className="mobile-drawer" role="dialog" aria-modal="true">
          <div className="mobile-drawer-header">
            <BrandLockup branding={branding} compact />
            <button className="icon-button" type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Close navigation">
              <X size={20} />
            </button>
          </div>
          <Sidebar branding={branding} navigation={navigation} activePath={activePath} onNavigate={navigate} compact />
        </div>
      ) : null}
    </div>
  );
}

function Sidebar({
  branding,
  navigation,
  activePath,
  compact = false,
  onNavigate,
}: {
  branding: Branding;
  navigation: NavigationSection[];
  activePath: string;
  compact?: boolean;
  onNavigate: (path: string) => void;
}) {
  return (
    <aside className={`sidebar ${compact ? 'compact' : ''}`} aria-label="Tenant navigation">
      {!compact ? (
        <div className="sidebar-header">
          <BrandLockup branding={branding} />
        </div>
      ) : null}
      <nav className="nav-list">
        {navigation.map((section) => (
          <div className="nav-section" key={section.label}>
            <div className="nav-section-label">{section.label}</div>
            {section.items.map((item) => (
              <button
                className={`nav-item ${activePath === item.path ? 'active' : ''}`}
                key={item.path}
                type="button"
                onClick={() => onNavigate(item.path)}
              >
                <NavIcon name={item.icon} />
                <span>{item.label}</span>
                <ChevronRight className="nav-chevron" size={15} />
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <ShieldCheck size={17} />
        <span>Tenant access enabled</span>
      </div>
    </aside>
  );
}

function BrandLockup({ branding, compact = false }: { branding: Branding; compact?: boolean }) {
  return (
    <div className="brand-lockup">
      <span className="brand-mark">
        <img src="/lifeos-platform-crest.svg" alt="" />
      </span>
      <span>
        <strong>{branding.brandName}</strong>
        <span>{compact ? 'Navigation' : branding.organization}</span>
      </span>
    </div>
  );
}

function LoginScreen({
  branding,
  darkMode,
  onToggleDarkMode,
  onPasswordLogin,
  onDevLogin,
}: {
  branding: Branding;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onPasswordLogin: (credentials: { email: string; password: string; remember: boolean }) => Promise<void>;
  onDevLogin: () => void;
}) {
  const [email, setEmail] = useState('admin@tenant.local');
  const [password, setPassword] = useState('password');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await onPasswordLogin({ email, password, remember });
    } catch {
      setError('Unable to sign in with those credentials.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={`signed-out ${darkMode ? 'dark' : ''}`} style={{ '--brand-accent': branding.accent } as CSSProperties}>
      <section className="login-panel" aria-label="Tenant sign in">
        <div className="login-intro">
          <BrandLockup branding={branding} />
          <button className="icon-button" type="button" onClick={onToggleDarkMode} aria-label="Toggle dark mode">
            {darkMode ? <Sun size={19} /> : <Moon size={19} />}
          </button>
        </div>
        <div className="login-copy">
          <span className="eyebrow">Tenant application</span>
          <h1>{branding.appName}</h1>
          <p>Sign in to continue.</p>
        </div>
        <form className="login-form" onSubmit={submit}>
          <label>
            Email
            <input value={email} type="email" autoComplete="email" onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            Password
            <input value={password} type="password" autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} />
          </label>
          <label className="check-row">
            <input checked={remember} type="checkbox" onChange={(event) => setRemember(event.target.checked)} />
            Keep me signed in
          </label>
          {error ? <div className="login-error">{error}</div> : null}
          <button className="primary-button" type="submit" disabled={submitting}>
            <LogIn size={18} />
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div className="login-divider">
          <span>or</span>
        </div>
        <div className="login-actions">
          <a className="secondary-button" href="/api/auth/saml/login?RelayState=/dashboard">
            <LockKeyhole size={18} />
            Continue with LifeOS
          </a>
          <button className="text-button" type="button" onClick={onDevLogin}>
            <LogIn size={18} />
            Local dev sign in
          </button>
        </div>
      </section>
    </main>
  );
}

function DashboardView({ branding, session, dashboard }: { branding: Branding; session: AppSession; dashboard: DashboardPayload | null }) {
  return (
    <div className="dashboard-grid">
      <section className="report-hero">
        <div>
          <span className="eyebrow">Tenant starter</span>
          <h2>{branding.brandName}</h2>
          <p>This is a clone-ready LifeOS tenant shell. Replace the sample metrics, placeholder routes, and API handlers with the tenant product surface.</p>
        </div>
        <div className="report-status">
          <span>Signed in as</span>
          <strong>{session.user?.name}</strong>
          <small>{session.user?.email}</small>
        </div>
      </section>

      {(dashboard?.summary ?? []).map((metric) => (
        <section className="metric-card" key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          <small>{metric.detail}</small>
        </section>
      ))}

      <Panel title="Recent Activity" icon={Workflow}>
        <div className="activity-list">
          {(dashboard?.activity ?? []).map((item) => (
            <div className="activity-row" key={item.title}>
              <span />
              <div>
                <strong>{item.title}</strong>
                <small>{item.detail}</small>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Implementation Notes" icon={Database}>
        <div className="notes-grid">
          <code>/saml/metadata</code>
          <code>/saml/acs</code>
          <code>/saml/slo</code>
          <code>/api/auth/session</code>
          <code>/api/auth/login</code>
        </div>
      </Panel>
    </div>
  );
}

function PlaceholderView({ title, path }: { title: string; path: string }) {
  return (
    <section className="placeholder-panel">
      <span className="eyebrow">{path}</span>
      <h2>{title}</h2>
      <p>Replace this placeholder with tenant-specific screens, data loading, and permissions. The shell, authentication, and branding hooks are already wired.</p>
      <div className="placeholder-actions">
        <button className="secondary-button" type="button">
          Configure Module
        </button>
        <button className="primary-button" type="button">
          Add Workflow
        </button>
      </div>
    </section>
  );
}

function SettingsView({ branding }: { branding: Branding }) {
  return (
    <div className="settings-grid">
      <Panel title="LifeOS SAML" icon={ShieldCheck}>
        <Definition label="SP Entity ID" value={branding.spEntityId} />
        <Definition label="ACS URL" value={branding.acsUrl} />
        <Definition label="SLO URL" value={branding.sloUrl} />
        <Definition label="IdP Metadata" value={branding.idpMetadataUrl} />
      </Panel>
      <Panel title="Branding" icon={Settings}>
        <Definition label="App Name" value={branding.appName} />
        <Definition label="Brand" value={branding.brandName} />
        <Definition label="Organization" value={branding.organization} />
        <Definition label="Accent" value={branding.accent} />
      </Panel>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: ComponentType<{ size?: number }>; children: ReactNode }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <Icon size={18} />
          <h3>{title}</h3>
        </div>
      </div>
      {children}
    </section>
  );
}

function Definition({ label, value }: { label: string; value: string }) {
  return (
    <div className="definition-row">
      <span>{label}</span>
      <code>{value}</code>
    </div>
  );
}

function UserChip({ name, initials }: { name: string; initials: string }) {
  return (
    <div className="user-chip" aria-label="Current user">
      <span className="user-chip-avatar">{initials}</span>
      <span className="user-chip-name">{name}</span>
    </div>
  );
}

function NavIcon({ name }: { name: keyof typeof icons }) {
  const Icon = icons[name] ?? LayoutDashboard;
  return <Icon size={18} />;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: 'include', headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Request failed: ${url}`);
  return response.json() as Promise<T>;
}

function normalizePath(path: string): string {
  if (!path || path === '/' || path === '/login') return '/dashboard';
  return path.startsWith('/') ? path : `/${path}`;
}
