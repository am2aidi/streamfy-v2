'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { patchStoredAuthUser } from '@/lib/auth-client'
import { useToast } from '@/hooks/use-toast'

type ManagedUser = {
  id: string
  initials: string
  name: string
  username: string
  email: string
  role: 'Admin' | 'User'
  roleKey: 'admin' | 'user'
  joinDate: string
  status: 'Active' | 'Blocked'
  statusKey: 'active' | 'blocked'
  provider: string
}

type AdminDraft = {
  name: string
  username: string
  email: string
  password: string
}

const defaultDraft: AdminDraft = {
  name: '',
  username: '',
  email: '',
  password: '',
}

export default function AdminUsersPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loaded, setLoaded] = useState(false)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'All' | 'Admin' | 'User'>('All')
  const [draft, setDraft] = useState<AdminDraft>(defaultDraft)

  const refreshUsers = async () => {
    const res = await fetch('/api/users', { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to load users')
    const data = (await res.json()) as { items: ManagedUser[] }
    setUsers(data.items)
  }

  useEffect(() => {
    void refreshUsers()
      .catch(() => {
        toast({ title: 'Users unavailable', description: 'Could not load users from the database.' })
      })
      .finally(() => setLoaded(true))
  }, [toast])

  const currentAdminId = user?.id ?? null

  const filtered = useMemo(() => {
    return users.filter((entry) => {
      const byRole = roleFilter === 'All' || entry.role === roleFilter
      const q = query.trim().toLowerCase()
      const byQuery =
        !q ||
        entry.username.toLowerCase().includes(q) ||
        entry.email.toLowerCase().includes(q) ||
        entry.name.toLowerCase().includes(q)
      return byRole && byQuery
    })
  }, [query, roleFilter, users])

  const activeAdminCount = users.filter((entry) => entry.roleKey === 'admin' && entry.statusKey === 'active').length

  const createAdmin = async () => {
    if (!draft.email.trim() || !draft.password.trim()) {
      toast({ title: 'Missing details', description: 'Email and password are required for a new admin.' })
      return
    }

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(draft),
    })

    if (!res.ok) {
      toast({ title: 'Save failed', description: 'Could not create the admin account.' })
      return
    }

    await refreshUsers()
    setDraft(defaultDraft)
    toast({
      title: 'Admin ready',
      description: `${draft.email.trim().toLowerCase()} can now sign in to /admin.`,
    })
  }

  const toggleStatus = async (userId: string) => {
    const entry = users.find((candidate) => candidate.id === userId)
    if (!entry) return
    if (entry.roleKey === 'admin' && entry.statusKey === 'active' && activeAdminCount <= 1) {
      toast({ title: 'Action blocked', description: 'Keep at least one active admin account available.' })
      return
    }

    const nextStatus = entry.statusKey === 'active' ? 'blocked' : 'active'
    const res = await fetch(`/api/users/${userId}/status`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })

    if (!res.ok) {
      toast({ title: 'Update failed', description: 'Could not update the user status.' })
      return
    }

    if (userId === currentAdminId) {
      patchStoredAuthUser({ status: nextStatus })
    }

    await refreshUsers()
    toast({
      title: nextStatus === 'blocked' ? 'User blocked' : 'User activated',
      description: `${entry.email} was ${nextStatus === 'blocked' ? 'blocked' : 'activated'}.`,
    })
  }

  const toggleRole = async (userId: string) => {
    const entry = users.find((candidate) => candidate.id === userId)
    if (!entry) return
    if (entry.roleKey === 'admin' && entry.statusKey === 'active' && activeAdminCount <= 1) {
      toast({ title: 'Action blocked', description: 'You need at least one active admin.' })
      return
    }

    const nextRole = entry.roleKey === 'admin' ? 'user' : 'admin'
    const res = await fetch(`/api/users/${userId}/role`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ role: nextRole }),
    })

    if (!res.ok) {
      toast({ title: 'Update failed', description: 'Could not update the user role.' })
      return
    }

    if (userId === currentAdminId) {
      patchStoredAuthUser({ role: nextRole })
    }

    await refreshUsers()
    toast({
      title: nextRole === 'admin' ? 'Admin granted' : 'Admin removed',
      description: `${entry.email} is now ${nextRole === 'admin' ? 'an admin' : 'a user'}.`,
    })
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <h2 className="text-xl font-bold">Users Control</h2>
          <p className="mt-1 text-sm text-slate-400">Manage access, block accounts, and promote trusted users to admin.</p>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search user"
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'All' | 'Admin' | 'User')}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm"
            >
              <option value="All">All roles</option>
              <option value="Admin">Admin</option>
              <option value="User">User</option>
            </select>
            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-slate-300">
              {users.filter((entry) => entry.roleKey === 'admin').length} admin account(s)
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <h3 className="text-lg font-semibold">Add Another Admin</h3>
          <p className="mt-1 text-sm text-slate-400">Create a new admin login directly from here.</p>

          <div className="mt-4 grid gap-3">
            <input
              value={draft.name}
              onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Admin name"
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm"
            />
            <input
              value={draft.username}
              onChange={(e) => setDraft((prev) => ({ ...prev, username: e.target.value }))}
              placeholder="Username"
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm"
            />
            <input
              value={draft.email}
              onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Admin email"
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm"
            />
            <input
              type="password"
              value={draft.password}
              onChange={(e) => setDraft((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Admin password"
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm"
            />
            <button
              onClick={() => void createAdmin()}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-black"
              style={{ background: 'linear-gradient(to right, var(--admin-accent-a), var(--admin-accent-b))' }}
            >
              Save admin
            </button>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-black/25 text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3">Profile</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Join Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loaded ? (
                <tr className="border-t border-white/10">
                  <td className="px-4 py-6 text-slate-400" colSpan={8}>
                    Loading users...
                  </td>
                </tr>
              ) : null}
              {loaded && filtered.map((entry) => (
                <tr key={entry.id} className="border-t border-white/10">
                  <td className="px-4 py-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-black"
                      style={{ background: 'linear-gradient(to bottom right, var(--admin-accent-a), var(--admin-accent-b))' }}
                    >
                      {entry.initials}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-white">
                    {entry.name}
                    {entry.id === currentAdminId ? (
                      <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-slate-300">
                        You
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{entry.username}</td>
                  <td className="px-4 py-3 text-slate-300">{entry.email}</td>
                  <td className="px-4 py-3 text-slate-300">{entry.role}</td>
                  <td className="px-4 py-3 text-slate-400">{entry.joinDate}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs ${entry.statusKey === 'active' ? '' : 'bg-[#EF4444]/15 text-[#fca5a5]'}`}
                      style={
                        entry.statusKey === 'active'
                          ? { background: 'color-mix(in oklab, var(--admin-accent-a) 15%, transparent)', color: 'var(--admin-accent-a)' }
                          : undefined
                      }
                    >
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => void toggleRole(entry.id)}
                        className="rounded-lg border px-2.5 py-1 text-xs"
                        style={{
                          borderColor: 'color-mix(in oklab, var(--admin-accent-a) 40%, transparent)',
                          background: 'color-mix(in oklab, var(--admin-accent-a) 10%, transparent)',
                          color: 'var(--admin-accent-a)',
                        }}
                      >
                        Make {entry.roleKey === 'admin' ? 'User' : 'Admin'}
                      </button>
                      <button
                        onClick={() => void toggleStatus(entry.id)}
                        className="rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 px-2.5 py-1 text-xs text-[#fca5a5]"
                      >
                        {entry.statusKey === 'active' ? 'Block' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {loaded && filtered.length === 0 ? (
                <tr className="border-t border-white/10">
                  <td className="px-4 py-6 text-slate-400" colSpan={8}>
                    No users match your filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
