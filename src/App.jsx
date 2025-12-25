import React, { useContext } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AuthContext } from './context/AuthContext';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './pages/Dashboard';

const AppContent = () => {
  const { currentUsername, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-b-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">初始化中...</p>
        </div>
      </div>
    );
  }

  if (!currentUsername) {
    return <LoginForm />;
  }

  return <Dashboard />;
};

function App() {
  // 設置基礎路徑以支持 GitHub Pages 子目錄
  if (typeof window !== 'undefined') {
    const basePath = window.location.pathname.includes('/Travel-Settle-Up') ? '/Travel-Settle-Up' : '';
    window.__BASENAME__ = basePath;
  }

  return (
    <AuthProvider>
      <AppContent />
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-6 mt-12 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-sm">
            <span className="text-blue-400 font-semibold">Travel Settle Up</span> · 
            <span className="mx-2">旅遊分帳系統</span>
          </p>
          <p className="text-xs mt-2 opacity-75">
            Designed & Developed by <span className="text-gray-300">Elmo HSIAO</span>
          </p>
          <p className="text-xs mt-1 opacity-60">© 2024 All rights reserved</p>
        </div>
      </footer>
    </AuthProvider>
  );
}

export default App;
