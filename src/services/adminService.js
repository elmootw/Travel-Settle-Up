import { database } from '../config/firebase';
import { ref, set, get, update, remove, push } from 'firebase/database';

/**
 * 生成隨機密碼
 */
const generateRandomPassword = () => {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
};

/**
 * 新增使用者帳號（管理者功能）
 */
export const addUser = async (username, password) => {
  try {
    const userRef = ref(database, `users/${username}`);
    const userSnapshot = await get(userRef);

    if (userSnapshot.exists()) {
      return { success: false, message: '帳號已存在' };
    }

    await set(userRef, {
      username: username,
      password: String(password), // 確保為字符串
      email: process.env.REACT_APP_SHARED_EMAIL,
      createdAt: new Date().toISOString(),
      locked: true,
      expiresAt: null,
    });

    return { success: true, message: `成功建立帳號：${username}` };
  } catch (error) {
    console.error('新增帳號失敗:', error);
    return { success: false, message: '新增帳號失敗' };
  }
};

/**
 * 刪除使用者帳號（管理者功能）
 */
export const deleteUser = async (username) => {
  try {
    const userRef = ref(database, `users/${username}`);
    const userSnapshot = await get(userRef);

    if (!userSnapshot.exists()) {
      return { success: false, message: '帳號不存在' };
    }

    await remove(userRef);
    return { success: true, message: `成功刪除帳號：${username}` };
  } catch (error) {
    console.error('刪除帳號失敗:', error);
    return { success: false, message: '刪除帳號失敗' };
  }
};

/**
 * 編輯使用者密碼（管理者功能）
 */
export const updateUserPassword = async (username, newPassword) => {
  try {
    const userRef = ref(database, `users/${username}`);
    const userSnapshot = await get(userRef);

    if (!userSnapshot.exists()) {
      return { success: false, message: '帳號不存在' };
    }

    await update(userRef, {
      password: newPassword,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, message: `成功更新 ${username} 的密碼` };
  } catch (error) {
    console.error('更新密碼失敗:', error);
    return { success: false, message: '更新密碼失敗' };
  }
};

/**
 * 獲取所有使用者列表
 */
export const getAllUsers = async () => {
  try {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);

    if (snapshot.exists()) {
      return { success: true, users: snapshot.val() };
    }
    return { success: true, users: {} };
  } catch (error) {
    console.error('取得使用者列表失敗:', error);
    return { success: false, message: '取得使用者列表失敗' };
  }
};

/**
 * 批量建立使用者（管理者功能）
 */
export const batchCreateUsers = async (usersData) => {
  try {
    const results = [];
    
    for (const { username, password } of usersData) {
      const userRef = ref(database, `users/${username}`);
      const userSnapshot = await get(userRef);

      if (userSnapshot.exists()) {
        results.push({
          username,
          success: false,
          message: '帳號已存在',
        });
        continue;
      }

      await set(userRef, {
        username: username,
        password: String(password), // 確保為字符串
        email: process.env.REACT_APP_SHARED_EMAIL,
        createdAt: new Date().toISOString(),
        locked: true,
        expiresAt: null,
      });

      results.push({
        username,
        success: true,
        message: '建立成功',
      });
    }

    return { success: true, results };
  } catch (error) {
    console.error('批量建立使用者失敗:', error);
    return { success: false, message: '批量建立使用者失敗' };
  }
};
