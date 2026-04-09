'use client';

import { useState, useEffect, useCallback } from 'react';

/* ─── Types ─── */
interface Submission {
  id: number;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  message: string | null;
  category: string;
  amount: number | null;
  createdAt: string;
}

type TabFilter = 'all' | 'early_access' | 'demo' | 'donate';

/* ─── Helpers ─── */
function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${mins}`;
}

function categoryLabel(category: string, amount: number | null): string {
  switch (category) {
    case 'early_access':
      return 'Early Access';
    case 'demo':
      return 'Demo';
    case 'donate':
      return amount != null ? `Donatie \u20AC${(amount / 100).toFixed(2)}` : 'Donatie';
    default:
      return category;
  }
}

function categoryBadgeClasses(category: string): string {
  switch (category) {
    case 'early_access':
      return 'bg-green/10 text-green border border-green/30';
    case 'demo':
      return 'bg-blue/10 text-blue border border-blue/30';
    case 'donate':
      return 'bg-amber/10 text-amber border border-amber/30';
    default:
      return 'bg-bg4 text-text2 border border-border';
  }
}

/* ─── Component ─── */
export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [search, setSearch] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  /* ─── Data fetching ─── */
  const fetchSubmissions = useCallback(async (category?: string) => {
    const url = category
      ? `/api/admin/submissions?category=${category}`
      : '/api/admin/submissions';
    try {
      const res = await fetch(url);
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }
      const data = await res.json();
      setSubmissions(data.submissions ?? []);
    } catch {
      // Network error — silently ignore
    }
  }, []);

  /* ─── Initial auth check ─── */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/submissions');
        if (res.ok) {
          const data = await res.json();
          setSubmissions(data.submissions ?? []);
          setAuthenticated(true);
        }
      } catch {
        // Not authenticated
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  /* ─── Refetch when tab changes ─── */
  useEffect(() => {
    if (!authenticated) return;
    const cat = activeTab === 'all' ? undefined : activeTab;
    fetchSubmissions(cat);
  }, [activeTab, authenticated, fetchSubmissions]);

  /* ─── Login handler ─── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        setAuthenticated(true);
        setUsername('');
        setPassword('');
        await fetchSubmissions();
      } else {
        const data = await res.json();
        setLoginError(data.error || 'Login mislukt');
      }
    } catch {
      setLoginError('Verbinding mislukt. Probeer opnieuw.');
    } finally {
      setLoginLoading(false);
    }
  };

  /* ─── Logout handler ─── */
  const handleLogout = () => {
    document.cookie = 'sf-admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setAuthenticated(false);
    setSubmissions([]);
    setActiveTab('all');
    setSearch('');
  };

  /* ─── Export handler ─── */
  const handleExport = () => {
    const category = activeTab !== 'all' ? activeTab : '';
    window.open(`/api/admin/export${category ? '?category=' + category : ''}`, '_blank');
  };

  /* ─── Computed data ─── */
  const filtered = submissions.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  const counts = {
    total: submissions.length,
    early_access: submissions.filter((s) => s.category === 'early_access').length,
    demo: submissions.filter((s) => s.category === 'demo').length,
    donate: submissions.filter((s) => s.category === 'donate').length,
  };

  /* ─── Loading state ─── */
  if (checking) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex items-center gap-3 text-text3">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="font-mono text-sm">Laden...</span>
        </div>
      </div>
    );
  }

  /* ─── Login screen ─── */
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-bg2 border border-border rounded-xl p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 rounded-full border-2 border-green flex items-center justify-center mb-4 bg-bg">
                <div className="w-4 h-4 rounded-full bg-green" />
              </div>
              <h1 className="font-display text-xl font-bold text-text tracking-tight">
                Admin Login
              </h1>
              <p className="text-text3 text-sm mt-1 font-mono">LAIKE / SurveyFlow</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-xs font-mono text-text3 mb-1.5 uppercase tracking-wider">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-text font-mono text-sm placeholder:text-text3 focus:outline-none focus:border-green focus:ring-1 focus:ring-green/30 transition-colors"
                  placeholder="admin"
                  autoComplete="username"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-xs font-mono text-text3 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-text font-mono text-sm placeholder:text-text3 focus:outline-none focus:border-green focus:ring-1 focus:ring-green/30 transition-colors"
                  placeholder="********"
                  autoComplete="current-password"
                  required
                />
              </div>

              {loginError && (
                <div className="bg-amber/10 border border-amber/30 rounded-lg px-3 py-2 text-amber text-sm font-mono">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-green text-bg font-display font-bold text-sm py-2.5 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginLoading ? 'Inloggen...' : 'Inloggen'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Dashboard ─── */
  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-border bg-bg2/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-green flex items-center justify-center bg-bg">
              <div className="w-2.5 h-2.5 rounded-full bg-green" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-text tracking-tight leading-none">
                LAIKE Admin
              </h1>
              <p className="text-text3 text-xs font-mono mt-0.5">Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="hidden sm:flex items-center gap-2 border border-green text-green text-sm font-mono px-4 py-2 rounded-lg hover:bg-green/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={handleLogout}
              className="text-text3 hover:text-text text-sm font-mono px-3 py-2 rounded-lg border border-border hover:border-border2 transition-colors"
            >
              Uitloggen
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Totaal', value: counts.total, color: 'text-text' },
            { label: 'Early Access', value: counts.early_access, color: 'text-green' },
            { label: 'Demo', value: counts.demo, color: 'text-blue' },
            { label: 'Donaties', value: counts.donate, color: 'text-amber' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-bg2 border border-border rounded-xl p-4 sm:p-5"
            >
              <div className={`font-display text-2xl sm:text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-text3 text-xs font-mono mt-1 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filter Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          {/* Tabs */}
          <div className="flex gap-1.5 bg-bg2 border border-border rounded-lg p-1">
            {([
              { key: 'all', label: 'Alle' },
              { key: 'early_access', label: 'Early Access' },
              { key: 'demo', label: 'Demo' },
              { key: 'donate', label: 'Donatie' },
            ] as { key: TabFilter; label: string }[]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${
                  activeTab === tab.key
                    ? 'bg-green/10 text-green border border-green/30'
                    : 'text-text3 hover:text-text border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text3 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zoek op naam of email..."
              className="w-full bg-bg2 border border-border rounded-lg pl-9 pr-3 py-2 text-text font-mono text-sm placeholder:text-text3 focus:outline-none focus:border-green focus:ring-1 focus:ring-green/30 transition-colors"
            />
          </div>

          {/* Mobile export */}
          <button
            onClick={handleExport}
            className="sm:hidden flex items-center justify-center gap-2 border border-green text-green text-sm font-mono px-4 py-2 rounded-lg hover:bg-green/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="bg-bg2 border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-text3 font-mono text-xs uppercase tracking-wider px-4 py-3 w-12">
                    #
                  </th>
                  <th className="text-left text-text3 font-mono text-xs uppercase tracking-wider px-4 py-3">
                    Naam
                  </th>
                  <th className="text-left text-text3 font-mono text-xs uppercase tracking-wider px-4 py-3">
                    Email
                  </th>
                  <th className="text-left text-text3 font-mono text-xs uppercase tracking-wider px-4 py-3">
                    Categorie
                  </th>
                  <th className="text-left text-text3 font-mono text-xs uppercase tracking-wider px-4 py-3">
                    Bedrijf
                  </th>
                  <th className="text-left text-text3 font-mono text-xs uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                    Datum
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-text3 font-mono text-sm py-12">
                      Geen submissions gevonden
                    </td>
                  </tr>
                ) : (
                  filtered.map((s, i) => (
                    <tr
                      key={s.id}
                      className={`border-b border-border/50 hover:bg-bg3/50 transition-colors ${
                        i % 2 === 0 ? 'bg-bg2' : 'bg-bg3/30'
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-text3 text-xs">
                        {s.id}
                      </td>
                      <td className="px-4 py-3 font-mono text-text whitespace-nowrap">
                        {s.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-text2 whitespace-nowrap">
                        {s.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block text-xs font-mono px-2 py-0.5 rounded-full whitespace-nowrap ${categoryBadgeClasses(s.category)}`}
                        >
                          {categoryLabel(s.category, s.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-text2 whitespace-nowrap">
                        {s.company || '\u2014'}
                      </td>
                      <td className="px-4 py-3 font-mono text-text3 text-xs whitespace-nowrap">
                        {formatDate(s.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {filtered.length > 0 && (
            <div className="border-t border-border px-4 py-3 flex items-center justify-between">
              <span className="text-text3 font-mono text-xs">
                Toont {filtered.length} van {submissions.length} submissions
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
