'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    
    const user = JSON.parse(userStr);
    if (user.role !== 'ADMIN') {
      alert('관리자 권한이 없습니다.');
      router.push('/');
      return;
    }
    
    setIsAdmin(true);
  }, [router]);

  if (!isAdmin) return <div className="p-8 text-center">Loading...</div>;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="flex flex-col md:flex-row h-screen transition-colors duration-200">
      {/* Sidebar / Topbar(Mobile) */}
      <aside className="w-full md:w-64 bg-white dark:bg-gray-800 shadow-md flex-shrink-0 flex flex-col transition-colors z-10">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center md:block">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">관리자 대시보드</h2>
            <p className="text-xs md:hidden text-gray-500 dark:text-gray-400 mt-1">좌우로 스와이프하여 메뉴 이동</p>
          </div>
        </div>
        <nav className="p-2 md:p-4 flex flex-row md:flex-col overflow-x-auto space-x-2 md:space-x-0 md:space-y-2 flex-1 md:flex-none">
          <div className="md:mb-4 md:pb-4 md:border-b dark:border-gray-700 whitespace-nowrap">
            <Link href="/dashboard" className="block px-3 md:px-4 py-2 text-sm md:text-base font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded">
              🏠 내 가계부
            </Link>
          </div>
          <Link href="/admin/users" className="block px-3 md:px-4 py-2 text-sm md:text-base whitespace-nowrap text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded">
            사용자 관리
          </Link>
          <Link href="/admin/categories" className="block px-3 md:px-4 py-2 text-sm md:text-base whitespace-nowrap text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded">
            카테고리 관리
          </Link>
          <Link href="/admin/transactions" className="block px-3 md:px-4 py-2 text-sm md:text-base whitespace-nowrap text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded">
            전체 내역 관리
          </Link>
          <Link href="/admin/settings" className="block px-3 md:px-4 py-2 text-sm md:text-base whitespace-nowrap text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded">
            설정
          </Link>
          <button 
            onClick={handleLogout}
            className="md:hidden block px-3 py-2 text-sm whitespace-nowrap text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
          >
            로그아웃
          </button>
        </nav>
        <div className="hidden md:block p-4 border-t dark:border-gray-700">
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
          >
            로그아웃
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
        {children}
      </main>
    </div>
  );
}
