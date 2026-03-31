'use client'

import { useEffect, useMemo, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import {
  countActiveAdmins,
  getAdminSession,
  listManagedUsers,
  setUserRole,
  setUserStatus,
  subscribeToUsers,
  upsertAdminUser,
} from '@/lib/users-store'

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
  const [users, setUsers] = useState(() => listManagedUsers())
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'All' | 'Admin' | 'User'>('All')
  const [draft, setDraft] = useState<AdminDraft>(defaultDraft)

  useEffect(() => {
    const syncUsers = () => setUsers(listManagedUsers())
    syncUsers()
    return subscribeToUsers(syncUsers)
  }, [])

  const currentAdminId = getAdminSession()?.id ?? null

  const filtered = useMemo(() => {
    return users.filter((user) => {
      const byRole = roleFilter === 'All' || user.role === roleFilter
      const q = query.trim().toLowerCase()
      const byQuery =
        !q ||
        user.username.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.name.toLowerCase().includes(q)
      return byRole && byQuery
    })
  }, [query, roleFilter, users])

  const createAdmin = () => {
    if (!draft.email.trim() || !draft.password.trim()) {
      toast({ title: 'Missing details', description: 'Email and password are required for a new admin.' })
      return
    }

    const created = upsertAdminUser({
      name: draft.name,
      username: draft.username,
      email: draft.email,
      password: draft.password,
    })

    setDraft(defaultDraft)
    toast({
      title: 'Admin ready',
      description: `${created.email} can now sign in to /admin.`,
    })
  }

  const toggleStatus = (userId: string) => {
    const user = users.find((entry) => entry.id === userId)
    if (!user) return
    if (user.roleKey === 'admin' && user.statusKey === 'active' && countActiveAdmins() <= 1) {
      toast({ title: 'Action blocked', description: 'Keep at least one active admin account available.' })
      return
    }

    setUserStatus(userId, user.statusKey === 'active' ? 'blocked' : 'active')
    toast({
      title: user.statusKey === 'active' ? 'User blocked' : 'User activated',
      description: `${user.email} was ${user.statusKey === 'active' ? 'blocked' : 'activated'}.`,
    })
  }

  const toggleRole = (userId: string) => {
    const user = users.find((entry) => entry.id === userId)
    if (!user) return
    if (user.roleKey === 'admin' && user.statusKey === 'active' && countActiveAdmins() <= 1) {
      toast({ title: 'Action blocked', description: 'You need at least one active admin.' })
      return
    }

    setUserRole(userId, user.roleKey === 'admin' ? 'user' : 'admin')
    toast({
      title: user.roleKey === 'admin' ? 'Admin removed' : 'Admin granted',
      description: `${user.email} is now ${user.roleKey === 'admin' ? 'a user' : 'an admin'}.`,
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
              {users.filter((user) => user.roleKey === 'admin').length} admin account(s)
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
              onClick={createAdmin}
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
              {filtered.map((user) => (
                <tr key={user.id} className="border-t border-white/10">
                  <td className="px-4 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-black" style={{ background: 'linear-gradient(to bottom right, var(--admin-accent-a), var(--admin-accent-b))' }}>
                      {user.initials}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-white">
                    {user.name}
                    {user.id === currentAdminId ? <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-slate-300">You</span> : null}
                  </td>
                  <td className="px-4 py-3">{user.username}</td>
                  <td className="px-4 py-3 text-slate-300">{user.email}</td>
                  <td className="px-4 py-3 text-slate-300">{user.role}</td>
                  <td className="px-4 py-3 text-slate-400">{user.joinDate}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs ${user.statusKey === 'active' ? '' : 'bg-[#EF4444]/15 text-[#fca5a5]'}`}
                      style={user.statusKey === 'active' ? { background: 'color-mix(in oklab, var(--admin-accent-a) 15%, transparent)', color: 'var(--admin-accent-a)' } : undefined}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleRole(user.id)}
                        className="rounded-lg border px-2.5 py-1 text-xs"
                        style={{ borderColor: 'color-mix(in oklab, var(--admin-accent-a) 40%, transparent)', background: 'color-mix(in oklab, var(--admin-accent-a) 10%, transparent)', color: 'var(--admin-accent-a)' }}
                      >
                        Make {user.roleKey === 'admin' ? 'User' : 'Admin'}
                      </button>
                      <button onClick={() => toggleStatus(user.id)} className="rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 px-2.5 py-1 text-xs text-[#fca5a5]">
                        {user.statusKey === 'active' ? 'Block' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
