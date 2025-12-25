import React, { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
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
      <footer className="fixed bottom-0 right-0 p-2 text-xs text-gray-400">
        Design by Elmo HSIAO
      </footer>
    </AuthProvider>
  );
}

export default App;
