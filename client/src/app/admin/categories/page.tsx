'use client';

import { useEffect, useState } from 'react';

type Category = {
  id: number;
  name: string;
  parentId: number | null;
  subCategories?: Category[];
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<number | ''>('');
  const [error, setError] = useState('');

  // Edit states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editParentId, setEditParentId] = useState<number | ''>('');

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('카테고리 목록을 불러오는데 실패했습니다.');
      const data = await res.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newCategoryName,
          parentId: selectedParentId === '' ? null : Number(selectedParentId)
        })
      });

      if (!res.ok) throw new Error('카테고리 생성 실패');
      
      setNewCategoryName('');
      setSelectedParentId('');
      fetchCategories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까? (하위 카테고리도 함께 삭제될 수 있습니다)')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('카테고리 삭제 실패');
      
      fetchCategories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditClick = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditParentId(cat.parentId === null ? '' : cat.parentId);
  };

  const handleUpdateCategory = async (id: number) => {
    if (!editName.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName,
          parentId: editParentId === '' ? null : Number(editParentId)
        })
      });

      if (!res.ok) throw new Error('카테고리 수정 실패');
      
      setEditingId(null);
      fetchCategories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900">카테고리 관리</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      {/* 카테고리 추가 폼 */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">새 카테고리 추가</h2>
        <form onSubmit={handleCreateCategory} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">상위 카테고리 (1단계)</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <option value="">-- 없음 (1단계 카테고리로 생성) --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리 이름</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="예: 식비, 교통비..."
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            추가
          </button>
        </form>
      </div>

      {/* 카테고리 목록 (계층 트리 구조) */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">카테고리 목록</h2>
        {categories.length === 0 ? (
          <p className="text-gray-500 text-sm">등록된 카테고리가 없습니다.</p>
        ) : (
          <ul className="space-y-4">
            {categories.map(cat => (
              <li key={cat.id} className="border border-gray-200 p-4 rounded bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  {editingId === cat.id ? (
                    <div className="flex items-center gap-2 flex-1 mr-4">
                      <input 
                        type="text" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)} 
                        className="px-2 py-1 border rounded text-sm w-full max-w-xs"
                      />
                      <button onClick={() => handleUpdateCategory(cat.id)} className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600">저장</button>
                      <button onClick={() => setEditingId(null)} className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500">취소</button>
                    </div>
                  ) : (
                    <span className="font-bold text-gray-800 flex-1">{cat.name}</span>
                  )}
                  
                  {editingId !== cat.id && (
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleEditClick(cat)} className="text-blue-500 hover:text-blue-700 text-sm">
                        수정
                      </button>
                      <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:text-red-700 text-sm">
                        삭제
                      </button>
                    </div>
                  )}
                </div>

                {/* 2단계 카테고리 렌더링 */}
                {cat.subCategories && cat.subCategories.length > 0 && (
                  <ul className="pl-6 mt-2 space-y-2 border-l-2 border-gray-200">
                    {cat.subCategories.map(subCat => (
                      <li key={subCat.id} className="flex justify-between items-center text-sm text-gray-600">
                        {editingId === subCat.id ? (
                          <div className="flex items-center gap-2 flex-1 mr-4">
                            <select
                              value={editParentId}
                              onChange={(e) => setEditParentId(e.target.value === '' ? '' : Number(e.target.value))}
                              className="px-2 py-1 border rounded text-xs"
                            >
                              {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                            <input 
                              type="text" 
                              value={editName} 
                              onChange={(e) => setEditName(e.target.value)} 
                              className="px-2 py-1 border rounded text-sm w-full max-w-[150px]"
                            />
                            <button onClick={() => handleUpdateCategory(subCat.id)} className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600">저장</button>
                            <button onClick={() => setEditingId(null)} className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500">취소</button>
                          </div>
                        ) : (
                          <span className="flex-1">- {subCat.name}</span>
                        )}

                        {editingId !== subCat.id && (
                          <div className="flex items-center gap-3">
                            <button onClick={() => handleEditClick(subCat)} className="text-blue-400 hover:text-blue-600 text-xs">
                              수정
                            </button>
                            <button onClick={() => handleDeleteCategory(subCat.id)} className="text-red-400 hover:text-red-600 text-xs">
                              삭제
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
