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

  const PIE_COLORS = ['#3b82f6', '#6366f1', '#10b981', '#e1c29b', '#ba1a1a'];

  const recoveryRate = stats.totalStolen + stats.totalRecovered > 0
    ? ((stats.totalRecovered / (stats.totalStolen + stats.totalRecovered)) * 100).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text-secondary)' }}>
        <p>Loading Dashboard Console...</p>
      </div>
    );
  }

  const isOfficer = true;

  return (
    <div>
      {/* Welcome banner */}
      <div className="glass-panel" style={{
        padding: '1.75rem 2rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--bg-secondary)', // Civic Sentinel Container Fill
        borderColor: 'var(--border-color)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
            Welcome back, <span className="gradient-text">{user.username}</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {isOfficer
              //? `Authorized session established. Badge: ${user.badgeNumber}. Monitoring active alarms.`
              //: 'Citizen Portal. Monitor and file item recovery applications.'
            }
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/complaints/add" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
            <span>File New Theft</span>
          </Link>
          {isOfficer && (
            <Link to="/criminals/add" className="btn btn-secondary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
              <span>Add suspect</span>
            </Link>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(186, 26, 26, 0.08)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(186,26,26,0.15)' }}>
            <Package size={24} color="var(--danger)" />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Stolen Items</p>
            <h3 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginTop: '0.15rem' }}>{stats.totalStolen}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.15)' }}>
            <Award size={24} color="var(--success)" />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Recovered Items</p>
            <h3 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginTop: '0.15rem' }}>{stats.totalRecovered}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.15)' }}>
            <Compass size={24} color="#3b82f6" />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Recovery Rate</p>
            <h3 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginTop: '0.15rem' }}>{recoveryRate}%</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(225, 194, 155, 0.12)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(225,194,155,0.2)' }}>
            <ShieldAlert size={24} color="#c084fc" />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Match Alarms</p>
            <h3 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginTop: '0.15rem' }}>{stats.activeMatches}</h3>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Area timeline chart */}
        <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '320px' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>
            Intake Load (Recent Complaints Logged)
          </h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }} />
                <Area type="monotone" dataKey="Complaints" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorComplaints)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie category chart */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>
            Theft by Category
          </h3>
          <div style={{ width: '100%', height: '170px', flex: 1 }}>
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            {categoryData.map((item, index) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                <span>{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suspect alerts & complaints list preview */}
      <div style={{ display: 'grid', gridTemplateColumns: isOfficer ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        {/* Recent unresolved complaints list */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Recent Complaints</h3>
            <Link to="/complaints" style={{ color: '#3b82f6', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', textDecoration: 'none', marginLeft: 'auto' }}>
              <span>View All</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentComplaints.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem' }}>No complaints filed yet.</p>
            ) : (
              recentComplaints.map(comp => (
                <div key={comp._id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--bg-primary)',
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{comp.title}</h4>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      <span style={{ fontFamily: 'monospace' }}>{comp.complaintNumber}</span>
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
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Active Suspect Matches</h3>
              <Link to="/match-results" style={{ color: '#3b82f6', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', textDecoration: 'none', marginLeft: 'auto' }}>
                <span>Alert Panel</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentAlerts.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <AlertTriangle size={24} style={{ marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.85rem' }}>No suspect matching alarms currently trigger.</p>
                </div>
              ) : (
                recentAlerts.map(alert => (
                  <div key={alert._id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--bg-primary)',
                    padding: '0.75rem 1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {alert.criminalId?.name}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                        Match on case: <strong style={{ color: 'var(--text-primary)' }}>{alert.complaintId?.complaintNumber}</strong>
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        color: alert.matchScore >= 80 ? 'var(--danger)' : 'var(--text-primary)'
                      }}>
                        {Math.round(alert.matchScore)}%
                      </div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>score</span>
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
