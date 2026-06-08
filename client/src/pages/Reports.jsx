import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { ShieldCheck } from 'lucide-react';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState([]);
  const [recoveryData, setRecoveryData] = useState([]);
  const [financialStats, setFinancialStats] = useState({
    stolenValue: 0,
    recoveredValue: 0
  });

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const stolenRes = await axios.get('/api/items/stolen');
        const recoveredRes = await axios.get('/api/items/recovered');

        const stolen = stolenRes.data.data;
        const recovered = recoveredRes.data.data;

        // 1. Financial stats
        const stolVal = stolen.reduce((sum, item) => sum + (item.estimatedValue || 0), 0);
        const recVal = recovered.reduce((sum, item) => sum + (item.estimatedValue || 0), 0);
        setFinancialStats({
          stolenValue: stolVal,
          recoveredValue: recVal
        });

        // 2. Categories distribution counter map
        const catMap = {};
        stolen.forEach(item => {
          catMap[item.category] = (catMap[item.category] || { stolen: 0, recovered: 0 });
          catMap[item.category].stolen += 1;
        });
        recovered.forEach(item => {
          catMap[item.category] = (catMap[item.category] || { stolen: 0, recovered: 0 });
          catMap[item.category].recovered += 1;
        });

        // Parse to Recharts format
        const pieData = Object.keys(catMap).map(cat => ({
          name: cat.charAt(0).toUpperCase() + cat.slice(1),
          value: catMap[cat].stolen + catMap[cat].recovered
        }));
        setCategoryData(pieData);

        const barData = Object.keys(catMap).map(cat => ({
          category: cat.charAt(0).toUpperCase() + cat.slice(1),
          Stolen: catMap[cat].stolen,
          Recovered: catMap[cat].recovered
        }));
        setRecoveryData(barData);

      } catch (err) {
        console.error('Failed to aggregate reports metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const COLORS = ['#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#ec4899'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-500 text-sm">
        <p>Running analytical data models...</p>
      </div>
    );
  }

  const successRate = ((financialStats.recoveredValue / (financialStats.stolenValue + financialStats.recoveredValue || 1)) * 100).toFixed(1);

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900 font-heading m-0">Caseload Trend Analysis</h2>
        <p className="text-slate-500 text-xs mt-0.5 m-0">System diagnostics, category breakdowns, recovery indicators, and financial statistics</p>
      </div>

      {/* Financial Valuation Summary Card */}
      <div className="glass-panel p-6 md:p-8 mb-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-br from-blue-50/50 to-emerald-50/50 border-blue-100">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Total Valued Stolen Property
          </span>
          <h3 className="text-3xl font-extrabold text-danger m-0 mt-1">
            ₹{financialStats.stolenValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-slate-400 m-0 mt-1">
            Aggregate valuation from open pending claims
          </p>
        </div>
        <div className="flex flex-col gap-1 border-t md:border-t-0 md:border-l border-slate-200/60 pt-6 md:pt-0 md:pl-8">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Total Value Recovered by Officers
          </span>
          <h3 className="text-3xl font-extrabold text-success m-0 mt-1">
            ₹{financialStats.recoveredValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-success font-semibold flex items-center gap-1 m-0 mt-1">
            <ShieldCheck size={14} />
            <span>Success rate logged: {successRate}%</span>
          </p>
        </div>
      </div>

      {/* Grid of charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recovery indicators chart */}
        <div className="glass-panel p-6 min-h-[340px]">
          <h3 className="text-sm font-bold text-slate-900 mb-5 font-heading m-0">
            Open vs Recovered Items by Category
          </h3>
          <div className="w-full h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recoveryData}>
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Stolen" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Recovered" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories pie chart */}
        <div className="glass-panel p-6 min-h-[340px] flex flex-col">
          <h3 className="text-sm font-bold text-slate-900 mb-5 font-heading m-0">
            Thefts Classification Spread
          </h3>
          <div className="w-full h-[220px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
