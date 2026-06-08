import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';
import { BarChart3, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#94a3b8' }}>
        <p>Running analytical data models...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#ffffff', fontFamily: 'Outfit' }}>Caseload Trend Analysis</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>System diagnostics, category breakdowns, recovery indicators, and financial statistics</p>
      </div>

      {/* Financial Valuation Summary Card */}
      <div className="glass-panel" style={{
        padding: '1.75rem 2rem',
        marginBottom: '2rem',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(16,185,129,0.05) 100%)',
        borderColor: 'rgba(59, 130, 246, 0.15)'
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Valued Stolen Property
          </span>
          <h3 style={{ fontSize: '2rem', color: '#ef4444', marginTop: '0.25rem' }}>
            ₹{financialStats.stolenValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
            Aggregate valuation from open pending claims
          </p>
        </div>
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '2rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Value Recovered by Officers
          </span>
          <h3 style={{ fontSize: '2rem', color: '#10b981', marginTop: '0.25rem' }}>
            ₹{financialStats.recoveredValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <ShieldCheck size={14} />
            <span>Success rate logged: {((financialStats.recoveredValue / (financialStats.stolenValue + financialStats.recoveredValue || 1)) * 100).toFixed(1)}%</span>
          </p>
        </div>
      </div>

      {/* Grid of charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Recovery indicators chart */}
        <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '340px' }}>
          <h3 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '1.25rem', fontFamily: 'Outfit' }}>
            Open vs Recovered Items by Category
          </h3>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recoveryData}>
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#111827', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff' }} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Stolen" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Recovered" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories pie chart */}
        <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '1.25rem', fontFamily: 'Outfit' }}>
            Thefts Classification Spread
          </h3>
          <div style={{ width: '100%', height: '220px', flex: 1 }}>
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
                <Tooltip contentStyle={{ background: '#111827', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
