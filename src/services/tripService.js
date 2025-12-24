import { database } from '../config/firebase';
import { ref, set, get, remove, push } from 'firebase/database';

/**
 * 生成隨機密碼（字符串格式）
 */
const generateRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return String(password); // 確保為字符串
};

/**
 * 建立新旅遊
 */
export const createTrip = async (tripName, adminUsername) => {
  try {
    const tripsRef = ref(database, 'trips');
    const newTripRef = push(tripsRef);

    await set(newTripRef, {
      name: tripName,
      admin: adminUsername,
      createdAt: new Date().toISOString(),
      members: {},
      expenses: {},
    });

    console.log(`✅ 旅遊建立成功: ${newTripRef.key}`);
    return { success: true, tripId: newTripRef.key, message: `成功建立旅遊：${tripName}` };
  } catch (error) {
    console.error('❌ 建立旅遊失敗:', error);
    return { success: false, message: '建立旅遊失敗' };
  }
};

/**
 * 新增團員（自動產生隨機密碼 - 字符串格式）
 * 如果團員是管理者，使用管理者密碼而不是產生新密碼
 */
export const addMemberToTrip = async (tripId, memberName) => {
  try {
    const adminUsername = process.env.REACT_APP_ADMIN_USERNAME;
    const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD;

    let password;
    if (memberName === adminUsername) {
      password = String(adminPassword);
    } else {
      password = generateRandomPassword();
    }

    const memberRef = ref(database, `trips/${tripId}/members/${memberName}`);

    await set(memberRef, {
      password: String(password),
      joinedAt: new Date().toISOString(),
    });

    return { 
      success: true, 
      password: String(password), 
      message: `成功新增團員：${memberName}` 
    };
  } catch (error) {
    return { success: false, message: '新增團員失敗' };
  }
};

/**
 * 獲取所有旅遊
 */
export const getAllTrips = async () => {
  try {
    const tripsRef = ref(database, 'trips');
    const snapshot = await get(tripsRef);

    if (snapshot.exists()) {
      return { success: true, trips: snapshot.val() };
    }
    return { success: true, trips: {} };
  } catch (error) {
    console.error('❌ 取得旅遊列表失敗:', error);
    return { success: false, message: '取得旅遊列表失敗' };
  }
};

/**
 * 獲取指定旅遊詳情
 */
export const getTrip = async (tripId) => {
  try {
    const tripRef = ref(database, `trips/${tripId}`);
    const snapshot = await get(tripRef);

    if (snapshot.exists()) {
      return { success: true, trip: snapshot.val() };
    }
    return { success: false, message: '旅遊不存在' };
  } catch (error) {
    console.error('❌ 取得旅遊詳情失敗:', error);
    return { success: false, message: '取得旅遊詳情失敗' };
  }
};

/**
 * 刪除整次旅遊（包含所有成員和帳務）
 */
export const deleteTrip = async (tripId) => {
  try {
    const tripRef = ref(database, `trips/${tripId}`);
    await remove(tripRef);

    console.log(`✅ 旅遊刪除成功: ${tripId}`);
    return { success: true, message: '旅遊已刪除' };
  } catch (error) {
    console.error('❌ 刪除旅遊失敗:', error);
    return { success: false, message: '刪除旅遊失敗' };
  }
};

/**
 * 移除團員
 */
export const removeMemberFromTrip = async (tripId, memberName) => {
  try {
    const memberRef = ref(database, `trips/${tripId}/members/${memberName}`);
    await remove(memberRef);

    return { success: true, message: `已移除團員：${memberName}` };
  } catch (error) {
    console.error('❌ 移除團員失敗:', error);
    return { success: false, message: '移除團員失敗' };
  }
};
