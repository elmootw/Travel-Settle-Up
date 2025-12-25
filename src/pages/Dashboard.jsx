import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { logoutUser } from '../config/firebase';
import { AdminPanel } from './AdminPanel';
import { getAllTrips } from '../services/tripService';
import { TripDetail } from './TripDetail';

export const Dashboard = () => {
  const { currentUsername, setCurrentUsername, isAdmin } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [trips, setTrips] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, currentUsername]);

  const loadTrips = async () => {
    setLoading(true);
    const result = await getAllTrips();
    if (result.success) {
      const allTrips = result.trips || {};
      
      if (isAdmin) {
        // 管理者可以看到所有旅遊
        setTrips(allTrips);
        console.log(`✅ 管理者可見所有旅遊: ${Object.keys(allTrips).length} 個`);
      } else {
        // 普通使用者只能看到自己是團員的旅遊
        const userTrips = {};
        for (const tripId in allTrips) {
          const members = allTrips[tripId].members || {};
          if (members[currentUsername]) {
            userTrips[tripId] = allTrips[tripId];
          }
        }
        setTrips(userTrips);
        console.log(`✅ 使用者 ${currentUsername} 可見 ${Object.keys(userTrips).length} 個旅遊`);
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      setCurrentUsername(null);
    }
  };

  // 管理者面板
  if (showAdminPanel && isAdmin) {
    return <AdminPanel onBack={() => setShowAdminPanel(false)} onTripsUpdated={loadTrips} />;
  }

  // 旅遊詳情頁
  if (selectedTripId && trips[selectedTripId]) {
    return (
      <TripDetail 
        tripId={selectedTripId} 
        trip={trips[selectedTripId]} 
        onBack={() => setSelectedTripId(null)}
        onTripsUpdated={loadTrips}
      />
    );
  }

  // 主儀表板 - 旅遊列表
  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col md:flex-row">
      {/* Header */}
      <header className="w-full md:hidden sticky top-0 z-40 bg-white border-b-2 border-blue-500 shadow-sm">
        <div className="flex justify-between items-center px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-600">✈️</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 text-2xl"
          >
            ☰
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white border-r-2 border-gray-200 p-6 z-30 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } md:w-72 overflow-y-auto`}
      >
        <div className="hidden md:block mb-8">
          <h1 className="text-3xl font-bold text-blue-600">✈️</h1>
          <p className="text-sm text-gray-500 mt-1">旅遊分帳系統</p>
        </div>

        {/* User Profile */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 mb-6">
          <p className="text-xs opacity-75">目前登入</p>
          <p className="text-xl font-bold">{currentUsername}</p>
          {isAdmin && <p className="text-xs mt-1 opacity-90">👑 管理者</p>}
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2 mb-8">
          {isAdmin && (
            <button
              onClick={() => {
                setShowAdminPanel(true);
                setSidebarOpen(false);
              }}
              className="w-full text-left px-4 py-3 bg-blue-50 text-blue-600 font-semibold rounded-lg border-l-4 border-blue-600 transition hover:bg-blue-100"
            >
              ⚙️ 管理者面板
            </button>
          )}
        </nav>

        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition text-sm"
          >
            登 出
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 w-full p-4 sm:p-6 md:p-8">
        <div className="hidden md:flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              {isAdmin ? '我的旅遊（管理者）' : '我的旅遊'}
            </h2>
            <p className="text-gray-500 mt-1">
              {isAdmin ? '管理和建立旅遊' : '選擇一個旅遊開始記帳'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            登 出
          </button>
        </div>

        {/* Trips Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">載入中...</p>
          </div>
        ) : Object.keys(trips).length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-5xl mb-4">🏖️</p>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {isAdmin ? '還沒有任何旅遊' : '還沒有參加任何旅遊'}
            </h3>
            <p className="text-gray-500 mb-6">
              {isAdmin ? '進入管理者面板建立新旅遊吧！' : '等待管理者新增您為團員'}
            </p>
            {isAdmin && (
              <button
                onClick={() => setShowAdminPanel(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                ⚙️ 進入管理者面板
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(trips).map(([tripId, tripData]) => (
              <div
                key={tripId}
                onClick={() => {
                  setSelectedTripId(tripId);
                  setSidebarOpen(false);
                }}
                className="bg-white rounded-lg shadow-sm hover:shadow-lg p-6 cursor-pointer transition transform hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">{tripData.name}</h3>
                  <span className="text-3xl">🏖️</span>
                </div>
                
                <div className="space-y-2 text-gray-600">
                  <p>👥 團員：{Object.keys(tripData.members || {}).length} 位</p>
                  <p>💰 支出：{Object.keys(tripData.expenses || {}).length} 筆</p>
                  <p>📅 建立：{new Date(tripData.createdAt).toLocaleDateString('zh-TW')}</p>
                </div>

                <button
                  className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTripId(tripId);
                    setSidebarOpen(false);
                  }}
                >
                  進入記帳
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedTripId && trips[selectedTripId] && (
          <TripDetail 
            tripId={selectedTripId} 
            trip={trips[selectedTripId]}
            onBack={() => setSelectedTripId('')}
            onTripsUpdated={loadTrips}
          />
        )}
      </main>
    </div>
  );
};
