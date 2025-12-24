import React, { useState, useEffect } from 'react';
import { createTrip, getAllTrips, deleteTrip, addMemberToTrip, removeMemberFromTrip } from '../services/tripService';

export const AdminPanel = ({ onBack }) => {
  const [trips, setTrips] = useState({});
  const [newTripName, setNewTripName] = useState('');
  const [selectedTripId, setSelectedTripId] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    const result = await getAllTrips();
    if (result.success) {
      setTrips(result.trips || {});
    }
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (!newTripName.trim()) {
      setMessage('❌ 請填寫旅遊名稱');
      setLoading(false);
      return;
    }

    const result = await createTrip(newTripName, 'Elmo');

    if (result.success) {
      setMessage(`✅ ${result.message}`);
      setNewTripName('');
      await loadTrips();
      setSelectedTripId(result.tripId);
    } else {
      setMessage(`❌ ${result.message}`);
    }

    setLoading(false);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMessage('');
    setGeneratedPassword('');
    setLoading(true);

    if (!selectedTripId) {
      setMessage('❌ 請先選擇旅遊');
      setLoading(false);
      return;
    }

    if (!newMemberName.trim()) {
      setMessage('❌ 請填寫團員名稱');
      setLoading(false);
      return;
    }

    const result = await addMemberToTrip(selectedTripId, newMemberName);

    if (result.success) {
      setMessage(`✅ ${result.message}`);
      setGeneratedPassword(result.password);
      setNewMemberName('');
      await loadTrips();
      
      setTimeout(() => {
        setGeneratedPassword('');
      }, 5000);
    } else {
      setMessage(`❌ ${result.message}`);
      setGeneratedPassword('');
    }

    setLoading(false);
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('確定要刪除這次旅遊及所有相關資料嗎？此操作無法復原。')) {
      return;
    }

    setLoading(true);
    const result = await deleteTrip(tripId);

    if (result.success) {
      setMessage(`✅ ${result.message}`);
      if (selectedTripId === tripId) {
        setSelectedTripId('');
        setGeneratedPassword('');
      }
      await loadTrips();
    } else {
      setMessage(`❌ ${result.message}`);
    }

    setLoading(false);
  };

  const handleRemoveMember = async (tripId, memberName) => {
    if (!window.confirm(`確定要移除 ${memberName} 嗎？`)) {
      return;
    }

    setLoading(true);
    const result = await removeMemberFromTrip(tripId, memberName);

    if (result.success) {
      setMessage(`✅ ${result.message}`);
      await loadTrips();
    } else {
      setMessage(`❌ ${result.message}`);
    }

    setLoading(false);
  };

  const currentTrip = trips[selectedTripId];

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-blue-500 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">⚙️ 管理者面板</h1>
          <button
            onClick={onBack}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            返回
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes('✅')
                ? 'bg-green-50 border-l-4 border-green-500 text-green-700'
                : 'bg-red-50 border-l-4 border-red-500 text-red-700'
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左側 - 旅遊列表 */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-6 h-fit sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🏖️ 旅遊列表</h2>

            {Object.keys(trips).length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">還沒有旅遊</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(trips).map(([tripId, tripData]) => (
                  <div
                    key={tripId}
                    onClick={() => setSelectedTripId(tripId)}
                    className={`p-3 rounded-lg cursor-pointer transition border-2 ${
                      selectedTripId === tripId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-800 text-sm">{tripData.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      👥 {Object.keys(tripData.members || {}).length} 位
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 右側 - 操作區 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 建立新旅遊 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">➕ 建立新旅遊</h2>

              <form onSubmit={handleCreateTrip} className="flex gap-3">
                <input
                  type="text"
                  value={newTripName}
                  onChange={(e) => setNewTripName(e.target.value)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="輸入旅遊名稱..."
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition"
                >
                  建立
                </button>
              </form>
            </div>

            {/* 新增團員 */}
            {selectedTripId && currentTrip ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">👥 新增團員</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      旅遊：<span className="font-semibold text-gray-700">{currentTrip.name}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteTrip(selectedTripId)}
                    disabled={loading}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-2 rounded text-sm transition"
                  >
                    🗑️ 刪除旅遊
                  </button>
                </div>

                <form onSubmit={handleAddMember} className="mb-6">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      disabled={loading}
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                      placeholder="輸入團員名稱..."
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition"
                    >
                      新增
                    </button>
                  </div>
                </form>

                {generatedPassword && (
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-6">
                    <p className="text-sm font-semibold text-green-800 mb-3">✅ 團員已新增</p>
                    <div className="space-y-2 bg-white p-3 rounded border border-green-300">
                      <p className="text-sm text-gray-700">
                        帳號：<span className="font-mono font-bold text-blue-600">{newMemberName}</span>
                      </p>
                      <p className="text-sm text-gray-700">
                        密碼：<span className="font-mono font-bold text-blue-600">{generatedPassword}</span>
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      💡 請將此帳密告知團員用於登入
                    </p>
                  </div>
                )}

                {/* 團員列表 */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    團員列表 ({Object.keys(currentTrip.members || {}).length})
                  </h3>

                  {Object.keys(currentTrip.members || {}).length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">還沒有團員</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700">名稱</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700">密碼</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(currentTrip.members || {}).map(([memberName, memberData]) => (
                            <tr key={memberName} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-2 font-semibold text-gray-800">{memberName}</td>
                              <td className="px-4 py-2 text-gray-600 font-mono text-xs">{memberData.password}</td>
                              <td className="px-4 py-2">
                                <button
                                  onClick={() => handleRemoveMember(selectedTripId, memberName)}
                                  disabled={loading}
                                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-2 py-1 rounded text-xs transition"
                                >
                                  移除
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg shadow-sm p-6 text-center">
                <p className="text-gray-600">👈 請在左邊選擇一個旅遊來管理團員</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
