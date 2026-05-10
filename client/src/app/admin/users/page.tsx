'use client';

import { useEffect, useState } from 'react';

type User = {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
  groupId: number | null;
  createdAt: string;
};

type Group = {
  id: number;
  name: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState('');
  const [newGroupName, setNewGroupName] = useState('');

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch Users
      const usersRes = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!usersRes.ok) throw new Error('사용자 목록을 불러오는데 실패했습니다.');
      const usersData = await usersRes.json();
      setUsers(usersData);

      // Fetch Groups
      const groupsRes = await fetch('http://localhost:5000/api/admin/groups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!groupsRes.ok) throw new Error('그룹 목록을 불러오는데 실패했습니다.');
      const groupsData = await groupsRes.json();
      setGroups(groupsData);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (userId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!res.ok) throw new Error('상태 업데이트 실패');
      
      alert('상태가 업데이트 되었습니다.');
      fetchData(); // 목록 새로고침
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResetPassword = async (userId: number, email: string) => {
    if (!confirm(`정말 ${email} 사용자의 비밀번호를 '123321!!'로 초기화하시겠습니까?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('비밀번호 초기화 실패');
      
      alert(`비밀번호가 '123321!!'로 성공적으로 초기화되었습니다.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newGroupName })
      });
      
      if (!res.ok) throw new Error('그룹 생성 실패');
      
      setNewGroupName('');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm('정말 이 그룹을 삭제하시겠습니까? 속한 사용자들의 그룹 지정이 해제됩니다.')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/groups/${groupId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('그룹 삭제 실패');
      
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAssignGroup = async (userId: number, groupId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/group`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ groupId: groupId ? Number(groupId) : null })
      });
      
      if (!res.ok) throw new Error('그룹 지정 실패');
      
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">그룹 관리</h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <form onSubmit={handleCreateGroup} className="flex gap-4 mb-6">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="새 그룹 이름"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              그룹 생성
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map(group => (
              <div key={group.id} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg flex justify-between items-center">
                <span className="font-medium text-gray-900 dark:text-white">{group.name}</span>
                <button 
                  onClick={() => handleDeleteGroup(group.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  삭제
                </button>
              </div>
            ))}
            {groups.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-sm">생성된 그룹이 없습니다.</p>}
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">사용자 관리</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">이름</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">이메일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">권한</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">그룹</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">가입일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">액션</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                      user.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <select
                    value={user.groupId || ''}
                    onChange={(e) => handleAssignGroup(user.id, e.target.value)}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    disabled={user.role === 'ADMIN'}
                  >
                    <option value="">그룹 없음</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {user.role !== 'ADMIN' && (
                    <div className="space-x-2">
                      <button 
                        onClick={() => handleStatusChange(user.id, 'APPROVED')}
                        className="text-green-600 hover:text-green-900"
                        disabled={user.status === 'APPROVED'}
                      >
                        승인
                      </button>
                      <button 
                        onClick={() => handleStatusChange(user.id, 'REJECTED')}
                        className="text-red-600 hover:text-red-900"
                        disabled={user.status === 'REJECTED'}
                      >
                        거부
                      </button>
                      <button 
                        onClick={() => handleResetPassword(user.id, user.email)}
                        className="text-blue-600 hover:text-blue-900 ml-2"
                      >
                        비밀번호 초기화
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}
