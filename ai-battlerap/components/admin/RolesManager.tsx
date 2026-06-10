'use client';

// Grant/revoke role chips per user. Self-admin revoke is blocked client-side
// (and enforced server-side).
import { useState } from 'react';

type UserRow = {
  id: string;
  email: string;
  created_at: string;
  roles: string[];
};

const ALL_ROLES = ['player', 'verified_battler', 'league_operator', 'admin'] as const;

const ROLE_LABELS: Record<string, string> = {
  player: 'Player',
  verified_battler: 'Verified',
  league_operator: 'League Op',
  admin: 'Admin',
};

const ROLE_ACTIVE_STYLES: Record<string, string> = {
  player: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/40',
  verified_battler: 'bg-[#ff8c42]/15 text-[#ff8c42] border-[#ff8c42]/40',
  league_operator: 'bg-blue-500/15 text-blue-400 border-blue-500/40',
  admin: 'bg-red-500/15 text-red-400 border-red-500/40',
};

export default function RolesManager({ users: initialUsers, selfId }: { users: UserRow[]; selfId: string }) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const toggleRole = async (user: UserRow, role: string) => {
    const has = user.roles.includes(role);
    if (has && role === 'admin' && user.id === selfId) {
      setError('You cannot revoke your own admin role.');
      return;
    }

    const key = `${user.id}:${role}`;
    setBusyKey(key);
    setError(null);
    try {
      const res = await fetch('/api/admin/roles', {
        method: has ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Failed to update role');
        return;
      }
      setUsers((list) =>
        list.map((u) =>
          u.id === user.id
            ? { ...u, roles: has ? u.roles.filter((r) => r !== role) : [...u.roles, role] }
            : u
        )
      );
    } finally {
      setBusyKey(null);
    }
  };

  const visible = users.filter((u) => u.email.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="space-y-4">
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter by email…"
        className="w-full max-w-sm px-3 py-2.5 bg-[#0a0a0a] border-2 border-[#3a3d44] text-zinc-100 text-sm placeholder-zinc-600 focus:border-[#ff8c42] focus:outline-none"
      />

      {error && (
        <div className="px-4 py-3 bg-red-500/10 border-2 border-red-500/30 text-red-400 text-sm font-bold">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {visible.map((u) => (
          <div
            key={u.id}
            className="flex flex-wrap items-center gap-4 bg-[#18191c] border-2 border-[#3a3d44] px-5 py-4"
          >
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-zinc-100 truncate">
                {u.email}
                {u.id === selfId && (
                  <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                    (you)
                  </span>
                )}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                Joined {new Date(u.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_ROLES.map((role) => {
                const active = u.roles.includes(role);
                const key = `${u.id}:${role}`;
                const lockedSelf = active && role === 'admin' && u.id === selfId;
                return (
                  <button
                    key={role}
                    type="button"
                    disabled={busyKey === key || lockedSelf}
                    onClick={() => toggleRole(u, role)}
                    title={
                      lockedSelf
                        ? 'You cannot revoke your own admin role'
                        : active
                          ? `Revoke ${ROLE_LABELS[role]}`
                          : `Grant ${ROLE_LABELS[role]}`
                    }
                    className={`px-3 py-1.5 border-2 font-mono text-[10px] uppercase tracking-widest transition disabled:cursor-not-allowed ${
                      active
                        ? ROLE_ACTIVE_STYLES[role]
                        : 'border-[#3a3d44] text-zinc-600 hover:border-zinc-500 hover:text-zinc-400'
                    } ${busyKey === key ? 'opacity-40' : ''}`}
                  >
                    {active ? '✓ ' : '+ '}
                    {ROLE_LABELS[role]}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="bg-[#18191c] border-2 border-[#3a3d44] p-10 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">No users match.</p>
          </div>
        )}
      </div>
    </div>
  );
}
