import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Shield, Settings, Server, Users, Award, AlertOctagon, 
  Activity, ToggleLeft, ToggleRight, Edit2, Trash2, 
  DollarSign, Sparkles, PlusCircle, CheckCircle2, TrendingUp 
} from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Organization State
  const [editingOrg, setEditingOrg] = useState(null);
  const [editSeats, setEditSeats] = useState(30);
  const [editPlan, setEditPlan] = useState('starter');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [dashRes, userRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getUsers(),
      ]);
      setData(dashRes.data);
      setUsers(userRes.data);
    } catch (err) {
      toast.error('Failed to load admin platform stats');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (orgId, currentStatus) => {
    try {
      await adminAPI.updateOrganization(orgId, { is_active: !currentStatus });
      toast.success('Organization status updated');
      loadDashboard();
    } catch (err) {
      toast.error('Could not toggle organization status');
    }
  };

  const handleDeleteOrg = async (orgId, orgName) => {
    if (!window.confirm(`⚠️ WARNING: Are you sure you want to DELETE "${orgName}" completely? This will delete all registered teachers, students, progress history, and whitelist data permanently. This action CANNOT be undone.`)) {
      return;
    }

    try {
      await adminAPI.deleteOrganization(orgId);
      toast.success('Organization deleted successfully');
      loadDashboard();
    } catch (err) {
      toast.error('Failed to delete organization');
    }
  };

  const handleUpdateOrg = async (e) => {
    e.preventDefault();
    if (!editingOrg) return;

    setUpdating(true);
    try {
      await adminAPI.updateOrganization(editingOrg.id, {
        max_seats: editSeats,
        plan: editPlan,
      });
      toast.success('Organization limits updated successfully');
      setEditingOrg(null);
      loadDashboard();
    } catch (err) {
      toast.error('Failed to update organization');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fafbfe]">
        <div className="w-12 h-12 border-4 border-[#0F0A2E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const {
    total_organizations = 0,
    total_users = 0,
    total_students = 0,
    active_organizations = 0,
    organizations = [],
  } = data || {};

  // Financial Revenue Calculations (Starter: $49/mo, Growth: $149/mo, Academy: $399/mo, Trial: $0)
  const getPlanPrice = (plan) => {
    const p = plan?.toLowerCase();
    if (p === 'starter') return 49;
    if (p === 'growth') return 149;
    if (p === 'academy') return 399;
    return 0; // trial / custom
  };

  const calculateMRR = () => {
    return organizations
      .filter(o => o.is_active)
      .reduce((sum, o) => sum + getPlanPrice(o.plan), 0);
  };

  return (
    <div className="min-h-screen bg-[#fafcfb] text-[#1e2229] antialiased">
      {/* Top Navbar */}
      <header className="h-20 flex justify-between items-center px-8 bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
            S
          </div>
          <div>
            <span className="text-xl font-black text-slate-900">Speakly</span>
            <span className="text-[10px] block font-bold text-red-600 tracking-wider uppercase">Super Admin Console</span>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/';
          }}
          className="px-4 py-2 border border-red-200 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 transition-all duration-200"
        >
          Sign Out
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight">Platform Global Dashboard</h2>
            <p className="text-gray-400 text-sm mt-1">
              Global B2B coaching center metrics, plan distributions, active student seat controls, and financial analytics.
            </p>
          </div>
          <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200">
            System Live
          </span>
        </div>

        {/* Global Platform KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active / Total Centers */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Centers</span>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Server size={18} />
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-800 mt-4">{active_organizations}</h3>
            <p className="text-xs text-gray-400 mt-2">of {total_organizations} coaching centers total</p>
          </div>

          {/* Platform Students */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Registered Students</span>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <Users size={18} />
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-800 mt-4">{total_students}</h3>
            <p className="text-xs text-gray-400 mt-2">out of {total_users} users registered</p>
          </div>

          {/* Finances / MRR */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden bg-gradient-to-br from-indigo-950 to-slate-900 text-white shadow-lg shadow-indigo-950/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[64px] opacity-20 pointer-events-none" />
            <div className="flex justify-between items-start relative z-10">
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Estimated Revenue</span>
              <div className="p-2.5 bg-white/10 text-emerald-400 rounded-xl">
                <DollarSign size={18} />
              </div>
            </div>
            <h3 className="text-3xl font-black mt-4 relative z-10">${calculateMRR()} <span className="text-xs text-gray-400 font-medium">/ mo</span></h3>
            <p className="text-xs text-indigo-300 mt-2 relative z-10 flex items-center gap-1">
              <TrendingUp size={12} /> Live Estimated MRR
            </p>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">AI API Health</span>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <Activity size={18} />
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-800 mt-4">Operational</h3>
            <p className="text-xs text-emerald-600 font-bold mt-3 flex items-center gap-1">
              <CheckCircle2 size={12} /> Groq Whisper / Llama 3
            </p>
          </div>
        </section>

        {/* Main Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Organization List */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
              <h3 className="text-lg font-bold text-slate-800">Coaching Centers Directory</h3>
              <p className="text-xs text-gray-400 mt-0.5">Edit seat counts, upgrade plans, suspend access, or delete centers.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                    <th className="px-6 py-4">Coaching Center</th>
                    <th className="px-6 py-4">Subscription & MRR</th>
                    <th className="px-6 py-4">Seat Allocation</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm font-medium">
                  {organizations.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-gray-400 py-12 italic">
                        No B2B organization accounts created yet.
                      </td>
                    </tr>
                  ) : (
                    organizations.map((org) => (
                      <tr key={org.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-extrabold text-slate-800 block">{org.name}</span>
                          <span className="text-[10px] text-gray-400 block font-mono">ID: {org.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100/30">
                              {org.plan}
                            </span>
                            <p className="text-xs text-slate-800 font-bold mt-1">
                              ${getPlanPrice(org.plan)}/month
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-700">{org.seats_used} / {org.max_seats}</span>
                            <span className="text-[10px] text-gray-400">({Math.round((org.seats_used / org.max_seats) * 100)}%)</span>
                          </div>
                          <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden mt-1">
                            <div 
                              className="h-full bg-indigo-600 rounded-full" 
                              style={{ width: `${Math.min(100, (org.seats_used / org.max_seats) * 100)}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleActive(org.id, org.is_active)}
                            className="flex items-center gap-1 hover:opacity-85 transition-opacity"
                          >
                            {org.is_active ? (
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-55 text-emerald-600 bg-emerald-50 text-xs font-bold border border-emerald-100/50 flex items-center gap-1">
                                <ToggleRight size={16} /> Active
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-bold border border-red-100/50 flex items-center gap-1">
                                <ToggleLeft size={16} /> Suspended
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setEditingOrg(org);
                                setEditSeats(org.max_seats);
                                setEditPlan(org.plan || 'starter');
                              }}
                              className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Edit limits"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteOrg(org.id, org.name)}
                              className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete permanently"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick overrides sidebar drawer */}
          <div className="lg:col-span-4 space-y-6">
            {/* Edit Org Box */}
            {editingOrg && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Settings className="text-indigo-600" size={18} /> Modify Coaching Center
                </h3>
                <p className="text-xs text-gray-400">Updating seat count & plan level for <span className="font-bold text-slate-700">{editingOrg.name}</span></p>

                <form onSubmit={handleUpdateOrg} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Max Seats Limit
                    </label>
                    <input
                      type="number"
                      value={editSeats}
                      onChange={(e) => setEditSeats(parseInt(e.target.value))}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 outline-none text-sm font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Subscription Plan
                    </label>
                    <select
                      value={editPlan}
                      onChange={(e) => setEditPlan(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 outline-none text-sm font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                    >
                      <option value="trial">Trial (Free)</option>
                      <option value="starter">Starter Plan ($49/mo)</option>
                      <option value="growth">Growth Plan ($149/mo)</option>
                      <option value="academy">Academy Plan ($399/mo)</option>
                    </select>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingOrg(null)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-slate-50 font-bold text-xs transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs transition-colors"
                    >
                      {updating ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Quick platform user summary list */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Registered Accounts</h3>
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {users.slice(0, 10).map((user) => (
                  <div key={user.id} className="flex justify-between items-center text-xs p-2.5 bg-slate-50/50 hover:bg-slate-50 rounded-xl border border-transparent hover:border-gray-100 transition-all">
                    <div>
                      <p className="font-extrabold text-slate-800">{user.first_name} {user.last_name || ''}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{user.email}</p>
                    </div>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                      user.role === 'super_admin'
                        ? 'bg-red-50 text-red-600 border-red-100/50'
                        : user.role === 'owner'
                        ? 'bg-amber-50 text-amber-600 border-amber-100/50'
                        : user.role === 'teacher'
                        ? 'bg-purple-50 text-purple-600 border-purple-100/50'
                        : 'bg-indigo-50 text-indigo-600 border-indigo-100/50'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
