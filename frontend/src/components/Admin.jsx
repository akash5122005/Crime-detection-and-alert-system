import React, { useEffect, useState } from 'react';
import { Users, Shield } from 'lucide-react';

export default function Admin({ token }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if(Array.isArray(data)) setUsers(data);
    })
    .catch(console.error);
  }, [token]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Shield className="text-purple-500" size={32} />
        Admin Control Panel
      </h1>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users size={20} /> User Management
          </h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-900 border-b border-slate-700">
            <tr>
              <th className="p-4 text-slate-400 font-semibold">Name</th>
              <th className="p-4 text-slate-400 font-semibold">Email</th>
              <th className="p-4 text-slate-400 font-semibold">Role</th>
              <th className="p-4 text-slate-400 font-semibold">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                <td className="p-4 font-medium">{user.name}</td>
                <td className="p-4 text-slate-400">{user.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    user.role === 'Admin' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-slate-500">{new Date(user.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
