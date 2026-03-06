'use client'

import { useMemo, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

type UserRow = {
  initials: string
  username: string
  email: string
  role: 'Admin' | 'User'
  joinDate: string
  status: 'Active' | 'Blocked'
}

const initialUsers: UserRow[] = [
  { initials: 'JD', username: 'joe_don', email: 'joe.don@example.com', role: 'User', joinDate: '2026-01-13', status: 'Active' },
  { initials: 'AM', username: 'admin_m', email: 'admin.m@streamfy.com', role: 'Admin', joinDate: '2025-10-10', status: 'Active' },
  { initials: 'BR', username: 'bryan_01', email: 'bryan@streamfy.com', role: 'User', joinDate: '2026-02-25', status: 'Blocked' },
]

export default function AdminUsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<UserRow[]>(initialUsers)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'All' | 'Admin' | 'User'>('All')

  const filtered = useMemo(() => {
    return users.filter((user) => {
      const byRole = roleFilter === 'All' || user.role === roleFilter
      const q = query.trim().toLowerCase()
      const byQuery = !q || user.username.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)
      return byRole && byQuery
    })
  }, [query, roleFilter, users])

  const toggleStatus = (idx: number) => {
    setUsers((prev) =>
      prev.map((u, i) => (i === idx ? { ...u, status: u.status === 'Active' ? 'Blocked' : 'Active' } : u))
    )
  }

  const toggleRole = (idx: number) => {
    setUsers((prev) =>
      prev.map((u, i) => (i === idx ? { ...u, role: u.role === 'Admin' ? 'User' : 'Admin' } : u))
    )
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">Users Control</h2>
      <section className="grid gap-3 md:grid-cols-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search User"
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as 'All' | 'Admin' | 'User')}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm"
        >
          <option value="All">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="User">User</option>
        </select>
        <button
          onClick={() => toast({ title: 'Bulk action', description: 'Select a user row then use Block/Activate in actions.' })}
          className="rounded-xl border border-[#EF4444]/35 bg-[#EF4444]/10 px-3 py-2.5 text-sm text-[#fca5a5]"
        >
          Block / Activate User
        </button>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-black/25 text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3">Profile</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Join Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const idx = users.findIndex((u) => u.email === user.email)
                return (
                  <tr key={user.email} className="border-t border-white/10">
                    <td className="px-4 py-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-black" style={{ background: 'linear-gradient(to bottom right, var(--admin-accent-a), var(--admin-accent-b))' }}>
                        {user.initials}
                      </div>
                    </td>
                    <td className="px-4 py-3">{user.username}</td>
                    <td className="px-4 py-3 text-slate-300">{user.email}</td>
                    <td className="px-4 py-3 text-slate-300">{user.role}</td>
                    <td className="px-4 py-3 text-slate-400">{user.joinDate}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${user.status === 'Active' ? '' : 'bg-[#EF4444]/15 text-[#fca5a5]'}`}
                        style={user.status === 'Active' ? { background: 'color-mix(in oklab, var(--admin-accent-a) 15%, transparent)', color: 'var(--admin-accent-a)' } : undefined}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleRole(idx)}
                          className="rounded-lg border px-2.5 py-1 text-xs"
                          style={{ borderColor: 'color-mix(in oklab, var(--admin-accent-a) 40%, transparent)', background: 'color-mix(in oklab, var(--admin-accent-a) 10%, transparent)', color: 'var(--admin-accent-a)' }}
                        >
                          Make {user.role === 'Admin' ? 'User' : 'Admin'}
                        </button>
                        <button onClick={() => toggleStatus(idx)} className="rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 px-2.5 py-1 text-xs text-[#fca5a5]">
                          {user.status === 'Active' ? 'Block' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
