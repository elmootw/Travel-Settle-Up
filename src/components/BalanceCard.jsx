import React, { useMemo } from 'react';

export const BalanceCard = ({ expenses, members }) => {
  const balances = useMemo(() => {
    const balanceMap = {};
    
    // 初始化所有成員
    Object.keys(members || {}).forEach((name) => {
      balanceMap[name] = 0;
    });

    // 計算餘額
    Object.values(expenses || {}).forEach((expense) => {
      const { paidBy, amount, splitWith } = expense;
      const numSplit = splitWith?.length || 1;
      const perPerson = amount / numSplit;

      balanceMap[paidBy] = (balanceMap[paidBy] || 0) + amount;
      
      splitWith?.forEach((person) => {
        balanceMap[person] = (balanceMap[person] || 0) - perPerson;
      });
    });

    return balanceMap;
  }, [expenses, members]);

  const getBalanceText = (name, balance) => {
    if (balance > 0) {
      return `${name} 應收 $${balance.toFixed(0)}`;
    } else if (balance < 0) {
      return `${name} 應付 $${Math.abs(balance).toFixed(0)}`;
    }
    return `${name} 已結清`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">結算概況</h2>
      
      <div className="space-y-2">
        {Object.entries(balances).map(([name, balance]) => (
          <div
            key={name}
            className={`flex justify-between items-center p-3 rounded-lg ${
              balance > 0
                ? 'bg-green-50 border-l-4 border-green-500'
                : balance < 0
                ? 'bg-red-50 border-l-4 border-red-500'
                : 'bg-gray-50 border-l-4 border-gray-500'
            }`}
          >
            <span className="font-medium text-gray-700">{name}</span>
            <span
              className={`font-semibold ${
                balance > 0
                  ? 'text-green-600'
                  : balance < 0
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}
            >
              {getBalanceText(name, balance)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
