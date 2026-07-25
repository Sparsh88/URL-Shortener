import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/common/Navbar';
import { UserManagementTable } from '../components/admin/UserManagementTable';
import { UserDetailModal } from '../components/admin/UserDetailModal';
import { TableSkeleton, CardSkeleton } from '../components/common/LoadingSkeleton';
import { adminService } from '../services/adminService';
import { User, AdminStatsResponse } from '../types';
import { useToast } from '../components/common/Toast';
import { Shield, Users, Link2, MousePointerClick, Search } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [inspectUserId, setInspectUserId] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers({ search }),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) setUsers(usersRes.data);
    } catch (err) {
      showToast('Failed to load admin panel data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [search]);

  const handleToggleSuspend = async (userId: string) => {
    try {
      const res = await adminService.toggleSuspension(userId);
      if (res.success) {
        showToast(res.message || 'User status updated', 'success');
        fetchAdminData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Action failed', 'error');
    }
  };

  const handleToggleVerify = async (userId: string) => {
    try {
      const res = await adminService.toggleVerification(userId);
      if (res.success) {
        showToast(res.message || 'User verification updated', 'success');
        fetchAdminData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Action failed', 'error');
    }
  };

  const handleUpdateRole = async (userId: string, role: 'user' | 'admin') => {
    try {
      const res = await adminService.updateRole(userId, role);
      if (res.success) {
        showToast(`User role updated to ${role}`, 'success');
        fetchAdminData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update role', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user and all their links?')) return;
    try {
      const res = await adminService.deleteUser(userId);
      if (res.success) {
        showToast('User deleted', 'info');
        fetchAdminData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to delete user', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-black text-slate-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Admin Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass-panel p-6 rounded-3xl flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <Shield className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              <span>LinkForge Admin Control Center</span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
              Global platform oversight, user moderation, and systemic telemetry
            </p>
          </div>
        </motion.div>

        {/* System Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl glass-panel space-y-2 cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Registered Users</span>
                <Users className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats?.totalUsers || 0}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl glass-panel space-y-2 cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Global Platform Links</span>
                <Link2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats?.totalLinks || 0}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl glass-panel space-y-2 cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Clicks Tracked</span>
                <MousePointerClick className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats?.totalClicks || 0}</p>
            </motion.div>
          </div>
        )}

        {/* User Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">User Directory & Moderation</h2>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          {loading ? (
            <TableSkeleton />
          ) : (
            <UserManagementTable
              users={users}
              onToggleSuspend={handleToggleSuspend}
              onToggleVerify={handleToggleVerify}
              onUpdateRole={handleUpdateRole}
              onDeleteUser={handleDeleteUser}
              onInspectUser={(id) => setInspectUserId(id)}
            />
          )}
        </motion.div>
      </main>

      {/* User Details & Links Modal */}
      <UserDetailModal
        isOpen={Boolean(inspectUserId)}
        onClose={() => setInspectUserId(null)}
        userId={inspectUserId}
        onUserUpdated={fetchAdminData}
      />
    </div>
  );
};
