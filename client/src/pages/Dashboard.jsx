import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateUtils';
import {
  Package, ShieldAlert, Award, ArrowUpRight,
  AlertTriangle, Compass, Search, History,
  TrendingUp, Shield, Users, Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalStolen: 0,
      totalRecovered: 0,
      activeMatches: 0,
      totalComplaints: 0
    },
    activeInvestigationsCount: 0,
    unresolvedReportsCount: 0,
    recoveredAssetsCount: 0,
    avgResolutionTimeText: 'N/A',
    clearanceRate: 0,
    evidenceProcessingRate: 0,
    recentComplaints: []
  });

  const [stolenItems, setStolenItems] = useState([]);
  const [stolenSearch, setStolenSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchingStolen, setSearchingStolen] = useState(false);

  const isOfficer = user?.role === 'officer' || user?.role === 'admin';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/reports/dashboard-stats');
        if (res.data.success) {
          setDashboardData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Debounced server-side search for stolen items locker widget (staff only)
  useEffect(() => {
    if (!isOfficer) return;

    const fetchStolenSearch = async () => {
      try {
        setSearchingStolen(true);
        const res = await axios.get(`/api/items/stolen?search=${stolenSearch}&category=${selectedCategory}&limit=5`);
        if (res.data.success) {
          setStolenItems(res.data.data.docs || []);
        }
      } catch (err) {
        console.error('Failed to load filtered stolen items:', err.message);
      } finally {
        setSearchingStolen(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchStolenSearch();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [stolenSearch, selectedCategory, isOfficer]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-500 text-sm">
        <p>Querying database...</p>
      </div>
    );
  }

  const {
    activeInvestigationsCount,
    unresolvedReportsCount,
    recoveredAssetsCount,
    avgResolutionTimeText,
    clearanceRate,
    evidenceProcessingRate,
    recentComplaints
  } = dashboardData;

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome banner & title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 font-heading tracking-tight m-0">Theft Management Overview</h1>
      </div>

      {/* Active Cases Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Investigations */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col gap-2">
          <Link to='/complaints' className="font-body text-xs font-bold uppercase tracking-wider text-slate-500">Active Investigations</Link>
          <div className="flex items-end justify-between">
            <span className="font-headline text-4xl font-bold text-primary">{activeInvestigationsCount}</span>
            <span className="text-primary-light font-bold text-xs flex items-center gap-0.5">
            </span>
          </div>
        </div>

        {/* Unresolved Reports */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col gap-2">
          <span className="font-body text-xs font-bold uppercase tracking-wider text-slate-500">Unresolved Reports</span>
          <div className="flex items-end justify-between">
            <span className="font-headline text-4xl font-bold text-slate-900">{unresolvedReportsCount}</span>
            <span className="text-slate-400 font-bold text-xs">Awaiting Entry</span>
          </div>
        </div>

        {/* Recovered Assets */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col gap-2">
          <span className="font-body text-xs font-bold uppercase tracking-wider text-slate-500">Recovered Assets</span>
          <div className="flex items-end justify-between">
            <span className="font-headline text-4xl font-bold text-slate-900">{recoveredAssetsCount}</span>
            <span className="text-primary font-bold text-xs">Month-to-Date</span>
          </div>
        </div>

        {/* Avg Resolution Time */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col gap-2">
          <span className="font-body text-xs font-bold uppercase tracking-wider text-slate-500">Avg Resolution Time</span>
          <div className="flex items-end justify-between">
            <span className="font-headline text-4xl font-bold text-slate-900">{avgResolutionTimeText}</span>
            <span className="text-slate-500 font-bold text-xs">District Avg</span>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Recent Incidents & Hotspots (lg:col-span-2) */}
        <div className="lg:col-span-2 flex flex-col gap-8">

          {/* Recent Incident Reports Table Card */}
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-headline text-xl font-bold text-slate-900 m-0">Recent Incident Reports</h2>
              <Link to="/complaints" className="text-primary font-body text-sm font-bold hover:underline no-underline">
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Case ID</th>
                    <th className="px-6 py-4 font-semibold">Category</th>
                    <th className="px-6 py-4 font-semibold">Location</th>
                    <th className="px-6 py-4 font-semibold">Reported</th>
                    <th className="px-6 py-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {recentComplaints.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                        No incident reports found in precinct registry.
                      </td>
                    </tr>
                  ) : (
                    recentComplaints.map(comp => (
                      <tr key={comp._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-primary">{comp.complaintNumber}</td>
                        <td className="px-6 py-4 capitalize">{comp.category}</td>
                        <td className="px-6 py-4 text-slate-600 truncate max-w-[160px]">{comp.theftLocation}</td>
                        <td className="px-6 py-4 text-slate-600">{formatDate(comp.theftDate)}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`status-badge status-${comp.status}`}>{comp.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Hotspots Map Card */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-headline text-xl font-bold text-slate-900 m-0">Precinct Hotspots</h2>
              <div className="flex gap-3 text-slate-400">
                <Search size={16} className="cursor-pointer hover:text-slate-600" />
                <Layers size={16} className="cursor-pointer hover:text-slate-600" />
              </div>
            </div>
            <div className="h-64 bg-slate-100 relative">
              <iframe
                title="Interactive Precinct Map"
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
                src="https://maps.google.com/maps?q=Cityville&t=&z=13&ie=UTF8&iwloc=&output=embed"
              ></iframe>
              <div className="absolute top-3 left-3 pointer-events-none">
                <div className="bg-white/95 px-3 py-1.5 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                  <span className="font-body text-xs font-bold text-slate-800">
                    Interactive Precinct Map
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Widgets & Sidebar (lg:col-span-1) */}
        <div className="flex flex-col gap-8">

          {/* Quick Access: Stolen Item Database Search */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/50">
              <h2 className="font-headline text-xl font-bold text-slate-900 m-0">Stolen Item Database</h2>
            </div>
            <div className="p-6 flex flex-col gap-4">

              {!isOfficer ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <AlertTriangle size={24} className="text-[#c2652a] mb-2" />
                  <p className="text-xs font-bold text-slate-800 m-0">Restricted Registry Access</p>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] leading-relaxed m-0">
                    The global stolen item database is only visible to verified law enforcement officers.
                  </p>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm font-body focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                      placeholder="Serial Number, Brand, or ID..."
                      value={stolenSearch}
                      onChange={(e) => setStolenSearch(e.target.value)}
                      type="text"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedCategory(selectedCategory === 'electronics' ? '' : 'electronics')}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${selectedCategory === 'electronics' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      Electronics
                    </button>
                    <button
                      onClick={() => setSelectedCategory(selectedCategory === 'vehicle' ? '' : 'vehicle')}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${selectedCategory === 'vehicle' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      Vehicles
                    </button>
                    <button
                      onClick={() => setSelectedCategory(selectedCategory === 'jewelry' ? '' : 'jewelry')}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${selectedCategory === 'jewelry' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      Jewelry
                    </button>
                  </div>

                  <div className="flex flex-col gap-2.5 pt-2">
                    {searchingStolen ? (
                      <p className="text-xs text-slate-400 text-center py-4">Searching locker...</p>
                    ) : stolenItems.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No matching cataloged items.</p>
                    ) : (
                      stolenItems.map(item => (
                        <div
                          key={item._id}
                          className="flex items-center gap-3 p-3 mb-2 rounded-lg hover:bg-slate-50 hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all cursor-pointer"
                        >
                          <div className="w-10 h-10 bg-slate-100 flex items-center justify-center rounded">
                            <Package size={18} className="text-slate-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900">{item.itemName}</span>
                            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">
                              {item.serialNumber || 'No Serial'}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

            </div>
          </div>

          {/* Precinct Statistics Widget */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/50">
              <h2 className="font-headline text-xl font-bold text-slate-900 m-0">Precinct Statistics</h2>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span>Clearance Rate</span>
                  <span className="text-primary">{clearanceRate}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${clearanceRate}%` }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span>Evidence Processing</span>
                  <span className="text-primary">{evidenceProcessingRate}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${evidenceProcessingRate}%` }}></div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <Shield size={16} className="text-[#8c3c3c] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 m-0">Patrol Sector Alpha</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider m-0">Highest Recovery Month</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users size={16} className="text-slate-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 m-0">Investigative Unit B</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider m-0">Lead Team for Theft/Fraud</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Case Archives Widget */}
          <div className="bg-[#3a302a] text-[#faf5ee] p-6 rounded-2xl space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2.5">
              <History size={20} className="text-[#fbe8d8]" />
              <h3 className="font-headline text-lg text-[#faf5ee] m-0">Case Archives</h3>
            </div>
            <p className="font-body text-xs opacity-80 leading-relaxed m-0">
              Access historical records for theft and burglary cases dating back to 2018. Requires Supervisor Level-2 clearance.
            </p>
            <button className="w-full py-2 bg-transparent border border-[#fbe8d8] text-[#fbe8d8] rounded-lg font-body text-xs font-bold uppercase tracking-widest hover:bg-[#fbe8d8] hover:text-[#3a302a] transition-all cursor-pointer">
              Access Archive
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
