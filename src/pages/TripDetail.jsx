import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getExpenses, addExpense, updateExpense, deleteExpense } from '../services/expenseService';
import { calculateDebts } from '../services/expenseService';

export const TripDetail = ({ tripId, trip, onBack }) => {
  const { currentUsername, isAdmin } = useContext(AuthContext);
  const [expenses, setExpenses] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDebts, setShowDebts] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    paidBy: currentUsername,
    splitWith: [],
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const loadExpenses = async () => {
    const result = await getExpenses(tripId);
    if (result.success) {
      setExpenses(result.expenses || {});
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!formData.description || !formData.amount) {
      setMessage('❌ 請填寫項目名稱和金額');
      return;
    }

    if (editingId) {
      // 編輯支出
      const result = await updateExpense(tripId, editingId, {
        description: formData.description,
        amount: parseFloat(formData.amount),
        paidBy: formData.paidBy,
        splitWith: formData.splitWith,
      });

      if (result.success) {
        setMessage('✅ 支出已更新');
        setEditingId(null);
        setFormData({
          description: '',
          amount: '',
          paidBy: currentUsername,
          splitWith: [],
        });
        setShowAddForm(false);
        await loadExpenses();
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } else {
      // 新增支出
      const result = await addExpense(tripId, {
        description: formData.description,
        amount: parseFloat(formData.amount),
        paidBy: formData.paidBy,
        splitWith: formData.splitWith,
        createdBy: currentUsername,
      });

      if (result.success) {
        setMessage('✅ 支出已新增');
        setFormData({
          description: '',
          amount: '',
          paidBy: currentUsername,
          splitWith: [],
        });
        setShowAddForm(false);
        await loadExpenses();
      } else {
        setMessage(`❌ ${result.message}`);
      }
    }
  };

  const handleEditExpense = (expenseId) => {
    const expense = expenses[expenseId];
    
    // 檢查權限：建立者或管理者可以編輯
    if (expense.createdBy !== currentUsername && !isAdmin) {
      setMessage('❌ 只有支出建立者或管理者才能編輯此支出');
      return;
    }

    setEditingId(expenseId);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      paidBy: expense.paidBy,
      splitWith: expense.splitWith || [],
    });
    setShowAddForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      description: '',
      amount: '',
      paidBy: currentUsername,
      splitWith: [],
    });
    setShowAddForm(false);
  };

  const handleDeleteExpense = async (expenseId) => {
    const expense = expenses[expenseId];
    
    // 檢查權限：建立者或管理者可以刪除
    if (expense.createdBy !== currentUsername && !isAdmin) {
      setMessage('❌ 只有支出建立者或管理者才能刪除此支出');
      return;
    }

    if (!window.confirm('確定要刪除此支出嗎？')) {
      return;
    }

    const result = await deleteExpense(tripId, expenseId);
    if (result.success) {
      setMessage('✅ 支出已刪除');
      await loadExpenses();
    } else {
      setMessage(`❌ ${result.message}`);
    }
  };

  const members = Object.keys(trip.members || {});
  const debts = calculateDebts(expenses, trip.members || {});

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-blue-500 shadow-sm sticky top-0 z-40">
        <div className="w-full px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center gap-2">
          <h1 className="text-lg sm:text-2xl font-bold text-blue-600 truncate">🏖️ {trip.name}</h1>
          <button
            onClick={onBack}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 sm:py-2 px-3 sm:px-4 rounded-lg transition text-sm sm:text-base whitespace-nowrap"
          >
            返回
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-3 sm:px-4 md:px-8 py-4 sm:py-8">
        {message && (
          <div
            className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
              message.includes('✅')
                ? 'bg-green-50 border-l-4 border-green-500 text-green-700'
                : 'bg-red-50 border-l-4 border-red-500 text-red-700'
            }`}
          >
            {message}
          </div>
        )}

        {/* 結算卡片和快速按鈕 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* 結算卡片 */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <button
              onClick={() => setShowDebts(!showDebts)}
              className="w-full flex justify-between items-center mb-3 sm:mb-4 hover:opacity-80 transition"
            >
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">💰 結算概況</h2>
              <span className="text-xs sm:text-sm font-semibold text-blue-600 bg-blue-50 px-2 sm:px-3 py-1 rounded">
                {showDebts ? '收合' : '展開'}
              </span>
            </button>
            
            {showDebts && (
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {members.map(member => (
                  <div
                    key={member}
                    className={`p-2 sm:p-3 rounded-lg flex flex-col justify-between text-sm sm:text-base ${
                      debts[member] > 0
                        ? 'bg-green-50 border-l-4 border-green-500'
                        : debts[member] < 0
                        ? 'bg-red-50 border-l-4 border-red-500'
                        : 'bg-gray-50 border-l-4 border-gray-500'
                    }`}
                  >
                    <span className="font-semibold text-gray-800 truncate mb-1">{member}</span>
                    <span
                      className={`font-bold text-xs sm:text-sm ${
                        debts[member] > 0
                          ? 'text-green-600'
                          : debts[member] < 0
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {debts[member] > 0
                        ? `應收 $${debts[member].toFixed(0)}`
                        : debts[member] < 0
                        ? `應付 $${Math.abs(debts[member]).toFixed(0)}`
                        : '已結清'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 快速按鈕 */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-sm p-4 sm:p-6 flex flex-col justify-center">
            <h3 className="text-base sm:text-xl font-bold mb-3 sm:mb-4">快速操作</h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-full bg-white text-blue-600 font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-gray-100 transition text-sm sm:text-base"
            >
              💳 新增支出
            </button>
          </div>
        </div>

        {/* 新增支出表單 */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
              {editingId ? '編輯支出' : '新增支出'}
            </h2>

            <form onSubmit={handleAddExpense} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    項目名稱
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                    placeholder="例如：午餐"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    金額 (TWD)
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  誰付的
                </label>
                <select
                  value={formData.paidBy}
                  onChange={(e) => setFormData({...formData, paidBy: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                >
                  {members.map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  分帳人（多選）
                </label>
                <div className="space-y-2 bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto">
                  {members.map(member => (
                    <label key={member} className="flex items-center text-sm sm:text-base">
                      <input
                        type="checkbox"
                        checked={formData.splitWith.includes(member)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              splitWith: [...formData.splitWith, member]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              splitWith: formData.splitWith.filter(m => m !== member)
                            });
                          }
                        }}
                        className="mr-2 w-4 h-4"
                      />
                      <span className="text-gray-700">{member}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 sm:px-4 rounded-lg transition text-sm sm:text-base"
                >
                  {editingId ? '確認編輯' : '確認新增'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-3 sm:px-4 rounded-lg transition text-sm sm:text-base"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 支出列表 */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
            支出記錄 ({Object.keys(expenses).length})
          </h2>

          {Object.keys(expenses).length === 0 ? (
            <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">還沒有任何支出記錄</p>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-gray-50 border-b sticky top-0">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700">項目</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700">金額</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700 hidden sm:table-cell">誰付的</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700 hidden lg:table-cell">分帳</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700 hidden md:table-cell">建立者</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700 hidden md:table-cell">時間</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(expenses).map(([id, expense]) => (
                    <tr key={id} className="border-b hover:bg-gray-50">
                      <td className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-800 max-w-20 sm:max-w-none truncate">{expense.description}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-800 whitespace-nowrap">${expense.amount.toFixed(0)}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700 hidden sm:table-cell text-xs sm:text-sm">{expense.paidBy}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700 text-xs hidden lg:table-cell">{expense.splitWith?.join(', ') || '-'}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700 text-xs hidden md:table-cell">{expense.createdBy || '-'}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-600 text-xs hidden md:table-cell">{expense.createdAt ? new Date(expense.createdAt).toLocaleDateString('zh-TW') : '-'}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        {(expense.createdBy === currentUsername || isAdmin) && (
                          <div className="flex gap-1 sm:gap-2">
                            <button
                              onClick={() => handleEditExpense(id)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-2 sm:px-3 py-1 rounded text-xs transition"
                            >
                              編輯
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-1 rounded text-xs transition"
                            >
                              刪除
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
