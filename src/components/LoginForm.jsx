import React, { useState, useContext } from 'react';
import { loginUser } from '../config/firebase';
import { AuthContext } from '../context/AuthContext';

export const LoginForm = () => {
  const { setCurrentUsername, setIsAdmin } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('請填寫帳號和密碼');
      setLoading(false);
      return;
    }

    const result = await loginUser(username, password);

    console.log('🔐 登入結果:', result);

    if (result.success) {
      console.log(`✅ 登入成功, isAdmin: ${result.isAdmin}`);
      localStorage.setItem('currentUsername', username);
      localStorage.setItem('isAdmin', result.isAdmin ? 'true' : 'false');
      setCurrentUsername(username);
      setIsAdmin(result.isAdmin || false);
      console.log('📝 已設置 isAdmin 為:', result.isAdmin);
    } else {
      setError(result.message || '登入失敗，請重試');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white">
      {/* Left Side - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-400 via-blue-300 to-cyan-200 flex-col justify-center items-center p-8 text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">✈️</div>
          <h1 className="text-5xl font-bold mb-2">旅遊分帳</h1>
          <p className="text-xl opacity-90 mb-8">多人共享記帳系統</p>
          <div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-sm">
            <p className="text-lg">
              簡單快速地分配旅遊費用
              <br />
              記錄每筆支出，自動計算債務
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-sm">
          {/* Mobile Header */}
          <div className="md:hidden text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">✈️ 旅遊分帳</h1>
            <p className="text-gray-500">多人共享記帳系統</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                帳號
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50 transition text-base"
                placeholder="輸入帳號"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                密碼
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50 transition text-base"
                placeholder="輸入密碼"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 text-base"
            >
              {loading ? '登入中...' : '登 入'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
