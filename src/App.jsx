import React, { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './pages/Dashboard';

const AppContent = () => {
  const { user, loading } = useContext(AuthContext);

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

  if (!user) {
    return <LoginForm />;
  }

  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
