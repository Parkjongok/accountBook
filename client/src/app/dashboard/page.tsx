'use client';

import { useEffect, useState } from 'react';

type Category = {
  id: number;
  name: string;
  subCategories?: Category[];
};

type Transaction = {
  id: number;
  categoryId: number;
  category: { name: string };
  user?: { name: string; email: string };
  amount: number;
  type: string; // 'INCOME' | 'EXPENSE'
  date: string;
  memo: string | null;
};

export default function DashboardPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Form States
  const [type, setType] = useState('EXPENSE');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [memo, setMemo] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // View States
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch Categories
      const catRes = await fetch('http://localhost:5000/api/user/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }

      // Fetch Transactions
      const txRes = await fetch('http://localhost:5000/api/user/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData);
      }
    } catch (err) {
      console.error('Data fetching error', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!categoryId) {
      setError('카테고리를 선택해주세요.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingId 
        ? `http://localhost:5000/api/user/transactions/${editingId}`
        : 'http://localhost:5000/api/user/transactions';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type,
          categoryId: Number(categoryId),
          amount: Number(amount),
          date,
          memo
        })
      });

      if (!res.ok) throw new Error(editingId ? '내역 수정 실패' : '내역 추가 실패');
      
      // Reset Form
      setAmount('');
      setMemo('');
      setEditingId(null);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditClick = (tx: Transaction) => {
    setEditingId(tx.id);
    setType(tx.type);
    setCategoryId(tx.categoryId.toString());
    setAmount(tx.amount.toString());
    setDate(new Date(tx.date).toISOString().split('T')[0]);
    setMemo(tx.memo || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setType('EXPENSE');
    setCategoryId('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setMemo('');
    setError('');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/user/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('삭제 실패');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 통계 계산
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);

  // 달력 헬퍼 함수
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 min-h-[100px]"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      // UTC 이슈 방지를 위해 로컬 시간 기준으로 날짜 문자열 비교
      const dayTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        const tDateStr = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}-${String(tDate.getDate()).padStart(2, '0')}`;
        return tDateStr === dateStr;
      });
      
      const income = dayTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
      const expense = dayTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);

      days.push(
        <div key={day} className="p-2 border border-gray-200 dark:border-gray-700 min-h-[100px] flex flex-col bg-white dark:bg-gray-800">
          <span className={`text-sm font-medium ${
            (firstDay + day - 1) % 7 === 0 ? 'text-red-500' : 
            (firstDay + day - 1) % 7 === 6 ? 'text-blue-500' : 
            'text-gray-700 dark:text-gray-300'
          }`}>{day}</span>
          <div className="mt-auto space-y-1">
            {income > 0 && <div className="text-xs text-blue-600 dark:text-blue-400 text-right">+{income.toLocaleString()}</div>}
            {expense > 0 && <div className="text-xs text-red-600 dark:text-red-400 text-right">-{expense.toLocaleString()}</div>}
          </div>
        </div>
      );
    }

    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-4">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300">&lt;</button>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{year}년 {month + 1}월</h3>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300">&gt;</button>
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
            <div key={d} className={`p-2 text-center text-sm font-medium bg-gray-50 dark:bg-gray-900 ${
              i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {d}
            </div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">입출금 내역</h1>

      {/* 통계 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 dark:text-gray-400">총 수입</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalIncome.toLocaleString()}원</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-red-500">
          <p className="text-sm text-gray-500 dark:text-gray-400">총 지출</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{totalExpense.toLocaleString()}원</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-sm text-gray-500 dark:text-gray-400">잔액</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{(totalIncome - totalExpense).toLocaleString()}원</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 내역 추가/수정 폼 */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow h-fit">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            {editingId ? '내역 수정' : '새 내역 추가'}
          </h2>
          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">유형</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="EXPENSE">지출</option>
                <option value="INCOME">수입</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">카테고리</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="">카테고리 선택</option>
                {categories.map(cat => (
                  <optgroup key={cat.id} label={cat.name}>
                    <option value={cat.id}>{cat.name} (대분류)</option>
                    {cat.subCategories?.map(sub => (
                      <option key={sub.id} value={sub.id}>- {sub.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">금액 (원)</label>
              <input 
                type="number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">날짜</label>
              <input 
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">메모</label>
              <input 
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="간단한 메모 입력"
              />
            </div>

            <div className="flex space-x-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
                {editingId ? '수정하기' : '추가하기'}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  취소
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 내역 리스트 / 달력 */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">내역 조회</h2>
            <div className="flex space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                목록형
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'calendar' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                달력형
              </button>
            </div>
          </div>

          {viewMode === 'calendar' ? (
            renderCalendar()
          ) : transactions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">등록된 내역이 없습니다.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">날짜</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">작성자</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">분류</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">카테고리</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">메모</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">금액</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {tx.user?.name || (tx.user?.email ? tx.user.email.split('@')[0] : '-')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        tx.type === 'INCOME' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {tx.type === 'INCOME' ? '수입' : '지출'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {tx.category?.name || '미지정'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 max-w-[150px] truncate">
                      {tx.memo || '-'}
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm font-bold text-right ${
                      tx.type === 'INCOME' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{tx.amount.toLocaleString()}원
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center space-x-2">
                      <button 
                        onClick={() => handleEditClick(tx)}
                        className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                        title="수정"
                      >
                        ✎
                      </button>
                      <button 
                        onClick={() => handleDelete(tx.id)}
                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        title="삭제"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
