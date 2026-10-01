import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const FinancialCharts = ({ expensesByCategory, monthlyComparison, expensesVsRevenue }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <div className="p-6 rounded-xl border bg-card shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Despesas por Categoria</h3>
        <div className="h-[300px] w-full">
          {expensesByCategory?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">Sem dados suficientes</div>
          )}
        </div>
      </div>

      {/* Line Chart */}
      <div className="p-6 rounded-xl border bg-card shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Receitas vs Despesas (6 Meses)</h3>
        <div className="h-[300px] w-full">
          {expensesVsRevenue?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={expensesVsRevenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `R$${val}`} />
                <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Receita" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="expenses" name="Despesas" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">Sem dados suficientes</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialCharts;