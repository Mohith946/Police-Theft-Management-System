import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateUtils';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  Package, ShieldAlert, Award,
  ArrowUpRight, AlertTriangle, Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStolen: 0,
    totalRecovered: 0,
    activeMatches: 0,
    totalComplaints: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // 1. Fetch complaints
        const compRes = await axios.get('/api/complaints');
        const complaints = compRes.data.data;
        setRecentComplaints(complaints.slice(0, 5));

        // 2. Fetch Stolen Items & calculate counts
        let stolenCount = 0;
        let recoveredCount = 0;

        // Categories counter map
        const categoriesMap = {};

        // Fetch Stolen/Recovered Items and active matches (unconditional for officers/admins)
        const stolenRes = await axios.get('/api/items/stolen');
        const recoveredRes = await axios.get('/api/items/recovered');

        stolenCount = stolenRes.data.data.length;
        recoveredCount = recoveredRes.data.data.length;

        // Combine to count categories
        const allItems = [...stolenRes.data.data, ...recoveredRes.data.data];
        allItems.forEach(item => {
          categoriesMap[item.category] = (categoriesMap[item.category] || 0) + 1;
        });

        // Fetch matches
        const matchRes = await axios.get('/api/matches?status=pending');
        setRecentAlerts(matchRes.data.data.slice(0, 4));
        setStats(prev => ({
          ...prev,
          totalStolen: stolenCount,
          totalRecovered: recoveredCount,
          activeMatches: matchRes.data.data.length,
          totalComplaints: complaints.length
        }));

        // Setup Category Chart Data
        const pieData = Object.keys(categoriesMap).map(key => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value: categoriesMap[key]
        }));
        setCategoryData(pieData.length > 0 ? pieData : [
          { name: 'Vehicle', value: 4 },
          { name: 'Electronics', value: 3 },
          { name: 'Jewelry', value: 2 },
          { name: 'Cash', value: 1 }
        ]);

        // Setup Complaints over time Data (Mock aggregates based on date)
        const dateAggregates = {};
        complaints.forEach(c => {
          const dateStr = new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          dateAggregates[dateStr] = (dateAggregates[dateStr] || 0) + 1;
        });

        const timelineData = Object.keys(dateAggregates).map(date => ({
          date,
          Complaints: dateAggregates[date]
        })).reverse();

        setChartData(timelineData.length > 0 ? timelineData : [
          { date: 'May 28', Complaints: 1 },
          { date: 'May 30', Complaints: 2 },
          { date: 'Jun 01', Complaints: 1 },
          { date: 'Jun 02', Complaints: 3 },
          { date: 'Jun 03', Complaints: 1 },
          { date: 'Jun 04', Complaints: 2 }
        ]);

      } catch (err) {
        console.error('Failed to load dashboard metrics:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const PIE_COLORS = ['var(--primary)', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const recoveryRate = stats.totalStolen + stats.totalRecovered > 0
    ? ((stats.totalRecovered / (stats.totalStolen + stats.totalRecovered)) * 100).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-500 text-sm">
        <p>Loading Dashboard Console...</p>
      </div>
    );
  }

  const isOfficer = user.role === 'officer' || user.role === 'admin';

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome banner */}
      <div className="glass-panel p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-100 border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 m-0">
            Welcome back, <span className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">{user.username}</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1 m-0">
            {isOfficer
              ? `Authorized session established. Badge: ${user.badgeNumber || 'N/A'}. Monitoring active matches.`
              : 'Citizen Portal. Monitor and file theft incidents.'
            }
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/complaints/add" className="btn btn-primary text-xs md:text-sm">
            <span>File New Theft</span>
          </Link>
          {isOfficer && (
            <Link to="/criminals/add" className="btn btn-secondary text-xs md:text-sm">
              <span>Add Suspect</span>
            </Link>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 flex items-center gap-5">
          <div className="bg-red-50 border border-red-200/50 p-3 rounded-xl flex items-center justify-center">
            <Package size={24} className="text-danger" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider m-0">Stolen Items</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5 m-0">{stats.totalStolen}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center gap-5">
          <div className="bg-emerald-50 border border-emerald-200/50 p-3 rounded-xl flex items-center justify-center">
            <Award size={24} className="text-success" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider m-0">Recovered Items</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5 m-0">{stats.totalRecovered}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center gap-5">
          <div className="bg-indigo-50 border border-indigo-200/50 p-3 rounded-xl flex items-center justify-center">
            <Compass size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider m-0">Recovery Rate</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5 m-0">{recoveryRate}%</h3>
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center gap-5">
          <div className="bg-purple-50 border border-purple-200/50 p-3 rounded-xl flex items-center justify-center">
            <ShieldAlert size={24} className="text-purple-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider m-0">Match Alarms</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5 m-0">{stats.activeMatches}</h3>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area timeline chart */}
        <div className="glass-panel p-6 lg:col-span-2 min-h-[340px]">
          <h3 className="text-sm font-bold text-slate-900 mb-5">
            Intake Load (Recent Complaints Logged)
          </h3>
          <div className="w-full h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }} />
                <Area type="monotone" dataKey="Complaints" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorComplaints)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie category chart */}
        <div className="glass-panel p-6 flex flex-col min-h-[340px]">
          <h3 className="text-sm font-bold text-slate-900 mb-5">
            Theft by Category
          </h3>
          <div className="w-full h-[170px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 justify-center text-[10px] text-slate-600 mt-4">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                <span>{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suspect alerts & complaints list preview */}
      <div className={`grid grid-cols-1 ${isOfficer ? 'lg:grid-cols-2' : ''} gap-6`}>
        {/* Recent unresolved complaints list */}
        <div className="glass-panel p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-900 m-0">Recent Complaints</h3>
            <Link to="/complaints" className="text-primary text-xs font-semibold flex items-center gap-1 hover:underline">
              <span>View All</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {recentComplaints.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-6">No complaints filed yet.</p>
            ) : (
              recentComplaints.map(comp => (
                <div key={comp._id} className="flex justify-between items-center bg-slate-50/50 border border-slate-100 hover:border-slate-200 hover:bg-slate-50 p-4 rounded-xl transition-all duration-200">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 m-0">{comp.title}</h4>
                    <div className="flex gap-2 text-xs text-slate-500 mt-1">
                      <span className="font-mono">{comp.complaintNumber}</span>
                      <span>•</span>
                      <span>{formatDate(comp.theftDate)}</span>
                    </div>
                  </div>
                  <span className={`status-badge status-${comp.status}`}>{comp.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Officer only: Recent suspect alerts preview */}
        {isOfficer && (
          <div className="glass-panel p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-900 m-0">Active Suspect Matches</h3>
              <Link to="/match-results" className="text-primary text-xs font-semibold flex items-center gap-1 hover:underline">
                <span>Alert Panel</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {recentAlerts.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-slate-400 gap-1.5">
                  <AlertTriangle size={24} />
                  <p className="text-xs">No suspect matching alarms currently trigger.</p>
                </div>
              ) : (
                recentAlerts.map(alert => (
                  <div key={alert._id} className="flex justify-between items-center bg-slate-50/50 border border-slate-100 hover:border-slate-200 hover:bg-slate-50 p-4 rounded-xl transition-all duration-200">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 m-0">
                        {alert.criminalId?.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 m-0">
                        Match on case: <strong className="text-slate-700">{alert.complaintId?.complaintNumber}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <div className={`text-lg font-extrabold ${alert.matchScore >= 80 ? 'text-red-500' : 'text-slate-950'}`}>
                        {Math.round(alert.matchScore)}%
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">score</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
