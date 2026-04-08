import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Layout, 
  Eye, 
  MessageSquare, 
  Plus, 
  ExternalLink, 
  Copy,
  Search,
  Zap,
  Calendar,
  Clock,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  MousePointer2,
  LogOut,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_URL } from '../config';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [myInvites, setMyInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyInvites = async () => {
      const token = localStorage.getItem('taklifnoma_token');
      try {
        const res = await fetch(`${API_URL}/api/my-invitations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setMyInvites(Array.isArray(data) ? data : []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    if (user) fetchMyInvites();
  }, [user]);

  if (!user) return null; // Protective redirect handled in App.jsx

  const totalViews = myInvites.reduce((acc, curr) => acc + (curr.views_count || 0), 0);
  const totalRSVPs = myInvites.reduce((acc, curr) => acc + (curr.rsvp_count || 0), 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pt-32 pb-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full uppercase tracking-widest border border-indigo-100">Overview</span>
            </div>
            <p className="text-slate-400 text-sm font-medium">{user.email}</p>
          </div>
          
          <div className="flex items-center gap-4">
             <button onClick={() => navigate('/create')} className="luxury-button !h-12 !px-8 flex items-center gap-2">
                <Plus size={18} /> Add Template
             </button>
          </div>
        </div>

        {/* Modern Admin Stats Grid Replica */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Invitations', value: myInvites.length, icon: <Layout size={20} />, color: 'bg-emerald-950 text-gold-500' },
            { label: 'Total Views', value: totalViews, icon: <Eye size={20} />, color: 'bg-emerald-50 text-emerald-900' },
            { label: 'Total RSVPs', value: totalRSVPs, icon: <Activity size={20} />, color: 'bg-emerald-50 text-emerald-900' },
            { label: 'Click Rate', value: totalViews ? Math.round((totalRSVPs / totalViews) * 100) + '%' : '0%', icon: <TrendingUp size={20} />, color: 'bg-gold-50 text-gold-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-indigo-500/20 transition-all">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border border-slate-50 ${stat.color} group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">{stat.label}</p>
                <p className="text-2xl font-extrabold text-slate-950 tracking-tighter">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Master Management Area */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex bg-slate-50/50 p-2 border-b border-slate-100">
            <button className="flex-1 py-4 text-[11px] font-extrabold uppercase tracking-widest rounded-2xl bg-white text-indigo-600 shadow-sm border border-slate-200">
              My Templates
            </button>
          </div>

          <div className="p-10">
            <div className="flex items-center bg-slate-100/50 rounded-2xl px-6 py-3 mb-8 border border-slate-200/50 w-full md:w-96 focus-within:border-indigo-500 transition-all">
               <Search size={18} className="text-slate-400 mr-3" />
               <input type="text" placeholder="Search my templates..." className="bg-transparent border-none focus:outline-none text-sm w-full font-medium" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="pb-6 text-[10px] uppercase tracking-[2px] text-slate-400 font-extrabold font-sans">Names</th>
                    <th className="pb-6 text-[10px] uppercase tracking-[2px] text-slate-400 font-extrabold text-center font-sans">Status</th>
                    <th className="pb-6 text-[10px] uppercase tracking-[2px] text-slate-400 font-extrabold text-center font-sans">Views</th>
                    <th className="pb-6 text-[10px] uppercase tracking-[2px] text-slate-400 font-extrabold text-center font-sans">RSVP</th>
                    <th className="pb-6 text-[10px] uppercase tracking-[2px] text-slate-400 font-extrabold text-right font-sans">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 uppercase tracking-widest text-[10px] font-bold">
                  {loading ? (
                    <tr><td colSpan="5" className="py-20 text-center text-slate-400 animate-pulse lowercase tracking-normal text-sm font-medium italic">Loading...</td></tr>
                  ) : myInvites.length === 0 ? (
                    <tr><td colSpan="5" className="py-20 text-center text-slate-400 lowercase tracking-normal text-sm font-medium italic">No templates found. <button onClick={() => navigate('/create')} className="text-indigo-600 underline ml-2">Create one now</button></td></tr>
                  ) : myInvites.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-6">
                        <div className="flex flex-col gap-1 lowercase tracking-normal text-sm font-medium">
                           <span className="text-slate-900 font-bold tracking-tight text-base capitalize">{item.groom_name} & {item.bride_name}</span>
                           <span className="text-[11px] text-emerald-600 font-mono tracking-tight font-bold">taklifnoma.vip/v/{item.invite_uuid}</span>
                        </div>
                      </td>
                      <td className="py-6 text-center">
                        <span className={`px-3 py-1 text-[9px] font-extrabold tracking-widest uppercase rounded-full border ${item.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{item.payment_status || 'free'}</span>
                      </td>
                      <td className="py-6 text-center">
                        <div className="flex items-center justify-center gap-2 group-hover:scale-110 transition-transform">
                           <Eye size={16} className="text-emerald-900" /><span className="text-sm font-extrabold text-slate-900 tracking-tighter">{item.views_count || 0}</span>
                        </div>
                      </td>
                      <td className="py-6 text-center">
                        <div className="flex items-center justify-center gap-2 group-hover:scale-110 transition-transform">
                           <MessageSquare size={16} className="text-emerald-500" /><span className="text-sm font-extrabold text-slate-900 tracking-tighter">{item.rsvp_count || 0}</span>
                        </div>
                      </td>
                      <td className="py-6 text-right w-32">
                        <div className="flex items-center justify-end gap-2">
                           <button onClick={() => { navigator.clipboard.writeText(`https://taklifnoma.vip/v/${item.invite_uuid}`); alert('Link copied!'); }} className="w-10 h-10 bg-emerald-50 text-emerald-600 hover:bg-emerald-950 hover:text-white rounded-xl transition-all inline-flex items-center justify-center" title="Copy Link"><Copy size={16} /></button>
                           <button onClick={() => window.open(`/v/${item.invite_uuid}`, '_blank')} className="w-10 h-10 bg-slate-50 text-slate-400 hover:bg-emerald-950 hover:text-white rounded-xl transition-all inline-flex items-center justify-center" title="Open Link"><ExternalLink size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
