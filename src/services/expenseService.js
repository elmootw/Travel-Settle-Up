import { database } from '../config/firebase';
import { ref, set, get, update, remove, push } from 'firebase/database';

/**
 * 驗證和清理輸入
 */
const validateAndSanitize = (input) => {
  if (!input || typeof input !== 'string') {
    return null;
  }
  
  // 移除特殊符號，只保留中文、英文、數字和基本標點
  const sanitized = input.trim().replace(/[<>{}[\]"'`;:|\\?*]/g, '');
  
  // 驗證長度
  if (sanitized.length === 0 || sanitized.length > 100) {
    return null;
  }
  
  return sanitized;
};

/**
 * 驗證金額
 */
const validateAmount = (amount) => {
  const num = parseFloat(amount);
  
  // 檢查是否為有效數字
  if (isNaN(num) || num <= 0) {
    return null;
  }
  
  // 檢查金額上限（防止異常支出）
  if (num > 999999) {
    return null;
  }
  
  // 最多兩位小數
  if (num !== Math.round(num * 100) / 100) {
    return null;
  }
  
  return num;
};

/**
 * 新增支出
 */
export const addExpense = async (tripId, expenseData) => {
  try {
    // 驗證輸入
    const description = validateAndSanitize(expenseData.description);
    const amount = validateAmount(expenseData.amount);
    const paidBy = validateAndSanitize(expenseData.paidBy);
    const createdBy = validateAndSanitize(expenseData.createdBy);

    if (!description) {
      return { success: false, message: '項目名稱無效或包含不允許的字符' };
    }

    if (!amount) {
      return { success: false, message: '金額無效（應為 0 到 999,999 之間的數字）' };
    }

    if (!paidBy || !createdBy) {
      return { success: false, message: '支付人或建立者資訊無效' };
    }

    // 驗證分帳人
    let sanitizedSplitWith = [];
    if (expenseData.splitWith && Array.isArray(expenseData.splitWith)) {
      sanitizedSplitWith = expenseData.splitWith
        .map(name => validateAndSanitize(name))
        .filter(Boolean);
    }

    if (sanitizedSplitWith.length === 0) {
      return { success: false, message: '必須至少選擇一個分帳人' };
    }

    const expensesRef = ref(database, `trips/${tripId}/expenses`);
    const newExpenseRef = push(expensesRef);

    const expensePayload = {
      id: newExpenseRef.key,
      description: description,
      amount: amount,
      currency: 'TWD',
      paidBy: paidBy,
      splitWith: sanitizedSplitWith,
      createdBy: createdBy,
      createdAt: new Date().toISOString(),
    };

    await set(newExpenseRef, expensePayload);

    return { success: true, expenseId: newExpenseRef.key, message: '支出已新增' };
  } catch (error) {
    return { success: false, message: '新增支出失敗' };
  }
};

/**
 * 更新支出
 */
export const updateExpense = async (tripId, expenseId, updates) => {
  try {
    // 驗證輸入
    const sanitizedUpdates = {};
    
    if (updates.description !== undefined) {
      const description = validateAndSanitize(updates.description);
      if (!description) {
        return { success: false, message: '項目名稱無效' };
      }
      sanitizedUpdates.description = description;
    }

    if (updates.amount !== undefined) {
      const amount = validateAmount(updates.amount);
      if (!amount) {
        return { success: false, message: '金額無效' };
      }
      sanitizedUpdates.amount = amount;
    }

    if (updates.paidBy !== undefined) {
      const paidBy = validateAndSanitize(updates.paidBy);
      if (!paidBy) {
        return { success: false, message: '支付人無效' };
      }
      sanitizedUpdates.paidBy = paidBy;
    }

    if (updates.splitWith !== undefined) {
      if (!Array.isArray(updates.splitWith) || updates.splitWith.length === 0) {
        return { success: false, message: '必須至少選擇一個分帳人' };
      }
      sanitizedUpdates.splitWith = updates.splitWith
        .map(name => validateAndSanitize(name))
        .filter(Boolean);
    }

    sanitizedUpdates.updatedAt = new Date().toISOString();

    const expenseRef = ref(database, `trips/${tripId}/expenses/${expenseId}`);
    await update(expenseRef, sanitizedUpdates);

    return { success: true, message: '支出已更新' };
  } catch (error) {
    return { success: false, message: '更新支出失敗' };
  }
};

/**
 * 刪除支出
 */
export const deleteExpense = async (tripId, expenseId) => {
  try {
    const expenseRef = ref(database, `trips/${tripId}/expenses/${expenseId}`);
    await remove(expenseRef);

    console.log(`✅ 支出刪除成功: ${expenseId}`);
    return { success: true, message: '支出已刪除' };
  } catch (error) {
    console.error('❌ 刪除支出失敗:', error);
    return { success: false, message: '刪除支出失敗' };
  }
};

/**
 * 獲取旅遊的所有支出
 */
export const getExpenses = async (tripId) => {
  try {
    const expensesRef = ref(database, `trips/${tripId}/expenses`);
    const snapshot = await get(expensesRef);

    if (snapshot.exists()) {
      return { success: true, expenses: snapshot.val() };
    }
    return { success: true, expenses: {} };
  } catch (error) {
    console.error('❌ 取得支出失敗:', error);
    return { success: false, message: '取得支出失敗' };
  }
};

/**
 * 計算債務關係
 */
export const calculateDebts = (expenses, members) => {
  const balances = {};

  // 初始化所有成員
  Object.keys(members).forEach(name => {
    balances[name] = 0;
  });

  // 計算每筆支出的影響
  Object.values(expenses).forEach(expense => {
    const { paidBy, amount, splitWith } = expense;
    const numSplit = splitWith && splitWith.length > 0 ? splitWith.length : 1;
    const perPerson = amount / numSplit;

    // 支付者應收
    balances[paidBy] = (balances[paidBy] || 0) + amount;

    // 分帳人應付
    (splitWith || []).forEach(person => {
      balances[person] = (balances[person] || 0) - perPerson;
    });
  });

  return balances;
};
