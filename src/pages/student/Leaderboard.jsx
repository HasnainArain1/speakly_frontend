import { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import { Trophy, Flame, Play, Target, Users } from 'lucide-react';

export default function Leaderboard() {
  const { user: currentUser } = useAuth();
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await studentAPI.getLeaderboard();
      // The backend returns a list of LeaderboardEntry objects directly
      const formatted = (res.data || []).map((entry) => ({
        id: entry.id,
        rank: entry.rank,
        name: `${entry.first_name} ${entry.last_name}`,
        points: entry.total_points,
        streak_days: entry.current_streak,
      }));
      setRankings(formatted);
    } catch (err) {
      toast.error('Failed to load leaderboard rankings');
    } finally {
      setLoading(false);
    }
  };

  // Find if current user is in the ranking list
  const userRank = rankings.find((r) => r.id === currentUser?.id);

  // Extract top 3 podium if we have at least 3, else take what we have
  const podium = rankings.slice(0, 3);
  const remaining = rankings.slice(3);

  // Helper to get placement order (2nd, 1st, 3rd) for podium layout
  const getPodiumOrder = () => {
    const order = [];
    if (podium[1]) order.push({ player: podium[1], position: 2 });
    if (podium[0]) order.push({ player: podium[0], position: 1 });
    if (podium[2]) order.push({ player: podium[2], position: 3 });
    return order;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 text-gray-900">
        {/* Header & Filter Row */}
        <section className="stagger-up flex flex-col md:flex-row md:items-end justify-between gap-6" style={{ animationDelay: '0.1s' }}>
          <div>
            <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-2">
              Community Rankings
            </span>
            <h2 className="text-2xl font-bold text-gray-900">Language Champions</h2>
            <p className="text-gray-650 mt-2 max-w-lg">
              Rise to the top of the Speakly Pakistan board. Practice grammar and voice sessions daily to gain points.
            </p>
          </div>
          <div className="bg-gray-100 border border-gray-200 p-1 rounded-2xl flex self-start md:self-auto">
            <button className="px-6 py-2 rounded-xl text-sm font-bold bg-primary text-white shadow-sm transition-all">
              Today
            </button>
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <>
            {/* Podium Hero Section */}
            {podium.length > 0 && (
              <section className="stagger-up grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-4xl mx-auto py-8 px-4" style={{ animationDelay: '0.2s' }}>
                {getPodiumOrder().map(({ player, position }) => {
                  const isFirst = position === 1;
                  const bgClass = isFirst
                    ? 'bg-white border-t-4 border-amber-500 shadow-md relative z-10 border border-gray-150'
                    : 'bg-white border border-gray-150 shadow-sm';

                  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${player.name}`;

                  return (
                    <div
                      key={player.id}
                      className={`flex flex-col items-center group ${isFirst ? 'md:order-2 md:-translate-y-4 scale-105' : position === 2 ? 'md:order-1' : 'md:order-3'}`}
                    >
                      <div className="relative mb-6">
                        {isFirst && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                            <Trophy size={32} className="fill-amber-500" />
                          </div>
                        )}
                        <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center font-extrabold border-4 border-white z-10 text-xs ${
                          isFirst ? 'bg-amber-500 text-white' : position === 2 ? 'bg-slate-500 text-white' : 'bg-orange-600 text-white'
                        }`}>
                          {position}
                        </div>
                        <img
                          src={avatarUrl}
                          alt={player.name}
                          className={`w-24 h-24 rounded-3xl object-cover border-4 border-gray-100 shadow-sm transition-transform group-hover:scale-105 duration-300 ${
                            isFirst ? 'border-amber-500/50 w-28 h-28' : ''
                          }`}
                        />
                      </div>

                      <div className={`text-center w-full rounded-t-[32px] pt-8 pb-10 px-4 flex flex-col items-center ${bgClass}`}>
                        <p className="font-bold text-lg text-gray-900 truncate max-w-full">
                          {player.name}
                        </p>
                        <p className="text-primary font-bold text-sm mt-1">{player.points} XP</p>
                        <div className="mt-3 inline-flex items-center text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full">
                          Streak: {player.streak_days || 0}d
                        </div>
                      </div>
                    </div>
                  );
                })}
              </section>
            )}

            {/* Rankings Table */}
            <section className="stagger-up bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm" style={{ animationDelay: '0.3s' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-gray-900">
                  <thead>
                    <tr className="border-b border-gray-150 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      <th className="px-8 py-5">Rank</th>
                      <th className="px-8 py-5">Learner</th>
                      <th className="px-8 py-5">Daily Streak</th>
                      <th className="px-8 py-5 text-right">XP Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm font-medium">
                    {/* Highlighted current user ranking row if they are not in list */}
                    {userRank && (
                      <tr className="bg-primary/5 border-y border-primary/10">
                        <td className="px-8 py-4">
                          <span className="font-bold text-primary">#{userRank.rank}</span>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${userRank.name}`}
                              alt={userRank.name}
                              className="w-8 h-8 rounded-xl object-cover border-2 border-primary"
                            />
                            <div>
                              <p className="font-bold text-gray-900">{userRank.name} (You)</p>
                              <p className="text-xs text-gray-500">Your Standing</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center text-primary font-bold gap-1">
                            <Flame size={16} className="fill-primary" />
                            {userRank.streak_days || 0} days
                          </div>
                        </td>
                        <td className="px-8 py-4 text-right font-bold text-primary">
                          {userRank.points}
                        </td>
                      </tr>
                    )}

                    {remaining.map((row) => {
                      const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${row.name}`;

                      return (
                        <tr key={row.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                          <td className="px-8 py-4 text-gray-500 font-bold">#{row.rank}</td>
                          <td className="px-8 py-4">
                            <div className="flex items-center space-x-3">
                              <img src={avatarUrl} alt={row.name} className="w-8 h-8 rounded-xl object-cover" />
                              <div>
                                <p className="font-bold text-gray-900">{row.name}</p>
                                <p className="text-xs text-gray-500">Active Learner</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                            <div className="flex items-center text-gray-650 gap-1">
                              <Flame size={16} />
                              {row.streak_days || 0} days
                            </div>
                          </td>
                          <td className="px-8 py-4 text-right font-bold text-gray-900">
                            {row.points}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Global Bento Cards */}
            <section className="stagger-up grid grid-cols-1 md:grid-cols-3 gap-6" style={{ animationDelay: '0.4s' }}>
              <div className="bg-primary p-6 rounded-2xl text-white flex flex-col justify-between shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                    <Users size={24} />
                  </div>
                  <span className="text-white/60 font-bold text-xs">COMMUNITY</span>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-extrabold mb-1">Active Now</p>
                  <p className="text-white/80 text-sm">Pakistan Grammar practice rooms are busy.</p>
                </div>
              </div>

              <div className="bg-white border border-gray-100 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Target size={24} />
                  </div>
                  <span className="text-gray-500 font-bold text-xs">CHALLENGE</span>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-gray-900 mb-1">Learn Daily</p>
                  <p className="text-gray-650 text-sm">Increase score stats by practicing vocabulary builders.</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-2xl text-white flex flex-col justify-between shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-2xl bg-white/30 flex items-center justify-center">
                    <Trophy size={24} />
                  </div>
                  <span className="text-white/60 font-bold text-xs">PRIZES</span>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-extrabold mb-1">Pro Tokens</p>
                  <p className="text-white/80 text-sm">Weekly top learners stand a chance to win extra coins.</p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
