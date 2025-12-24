import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, get, update } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

const SHARED_EMAIL = process.env.REACT_APP_SHARED_EMAIL;
const SHARED_PASSWORD = process.env.REACT_APP_SHARED_PASSWORD;

/**
 * 驗證使用者名稱和密碼
 */
export const loginUser = async (username, password) => {
  try {
    const adminUsername = process.env.REACT_APP_ADMIN_USERNAME;
    const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD;

    // 優先檢查是否為管理者（使用管理者帳密）
    if (username === adminUsername && String(password) === String(adminPassword)) {
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          SHARED_EMAIL,
          SHARED_PASSWORD
        );

        return {
          success: true,
          user: userCredential.user,
          username: username,
          isAdmin: true,
        };
      } catch (firebaseError) {
        return {
          success: false,
          message: '帳號不存在或密碼錯誤',
        };
      }
    }

    // 檢查是否為旅遊團員（需要先認證才能讀取 trips）
    try {
      // 先用共用帳號認證以取得讀取權限
      const authCredential = await signInWithEmailAndPassword(
        auth,
        SHARED_EMAIL,
        SHARED_PASSWORD
      );

      // 認證成功後，再讀取 trips
      const tripsRef = ref(database, 'trips');
      const tripsSnapshot = await get(tripsRef);

      if (tripsSnapshot.exists()) {
        const trips = tripsSnapshot.val();

        for (const tripId in trips) {
          const members = trips[tripId].members || {};
          
          if (members[username]) {
            const memberData = members[username];
            const inputPassword = String(password).trim();
            const dbPassword = String(memberData.password).trim();

            if (inputPassword === dbPassword) {
              return {
                success: true,
                user: authCredential.user,
                username: username,
                tripId: tripId,
                isAdmin: false,
              };
            } else {
              await signOut(auth);
              return { success: false, message: '帳號不存在或密碼錯誤' };
            }
          }
        }
      }

      await signOut(auth);
      return { success: false, message: '帳號不存在或密碼錯誤' };

    } catch (dbError) {
      return {
        success: false,
        message: '帳號不存在或密碼錯誤',
      };
    }

  } catch (error) {
    return {
      success: false,
      message: '帳號不存在或密碼錯誤',
    };
  }
};

/**
 * 使用者登出
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('currentUsername');
    localStorage.removeItem('isAdmin');
    return { success: true };
  } catch (error) {
    console.error('登出失敗:', error);
    return { success: false, message: '登出失敗' };
  }
};

/**
 * 監聽認證狀態變化
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export default app;
