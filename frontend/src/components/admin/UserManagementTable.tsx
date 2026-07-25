import React from 'react';
import { User } from '../../types';
import { Ban, CheckCircle2, Trash2, Check, ShieldCheck, Eye } from 'lucide-react';

interface UserManagementTableProps {
  users: User[];
  onToggleSuspend: (userId: string) => void;
  onToggleVerify: (userId: string) => void;
  onUpdateRole: (userId: string, role: 'user' | 'admin') => void;
  onDeleteUser: (userId: string) => void;
  onInspectUser?: (userId: string) => void;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  onToggleSuspend,
  onToggleVerify,
  onUpdateRole,
  onDeleteUser,
  onInspectUser,
}) => {
  return (
    <div className="space-y-4">
      {/* Mobile User Cards Layout */}
      <div className="block md:hidden space-y-3">
        {users.map((user) => {
          const userId = user._id || user.id || '';
          const isSuspended = (user as any).isSuspended;

          return (
            <div
              key={userId}
              className="p-4 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 space-y-3"
            >
              {/* Top row: Avatar + Name/Email + Inspect */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-brand-600/30 border border-brand-500/30 text-brand-600 dark:text-brand-300 font-bold flex items-center justify-center text-sm flex-shrink-0">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>

                {onInspectUser && (
                  <button
                    onClick={() => onInspectUser(userId)}
                    className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold flex items-center space-x-1 flex-shrink-0"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                )}
              </div>

              {/* Status badges & Role selector */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-500">Role:</span>
                  <select
                    value={user.role}
                    onChange={(e) => onUpdateRole(userId, e.target.value as 'user' | 'admin')}
                    className="px-2.5 py-1 rounded-lg glass-input text-xs font-semibold cursor-pointer"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  {isSuspended ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 flex items-center space-x-1">
                      <Ban className="w-3 h-3" />
                      <span>Suspended</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <button
                  onClick={() => onToggleVerify(userId)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition-all ${
                    user.isVerified
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{user.isVerified ? 'Verified' : 'Verify'}</span>
                </button>

                <button
                  onClick={() => onToggleSuspend(userId)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition-all ${
                    isSuspended
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  }`}
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>{isSuspended ? 'Unsuspend' : 'Suspend'}</span>
                </button>

                <button
                  onClick={() => onDeleteUser(userId)}
                  className="py-1.5 px-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center space-x-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table Layout (hidden on mobile, visible on desktop) */}
      <div className="hidden md:block glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-100/80 dark:bg-slate-900/60 text-xs font-semibold text-slate-700 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Verification</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50 text-sm">
              {users.map((user) => {
                const userId = user._id || user.id || '';
                const isSuspended = (user as any).isSuspended;

                return (
                  <tr key={userId} className="hover:bg-slate-100/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-brand-600/30 border border-brand-500/30 text-brand-600 dark:text-brand-300 font-bold flex items-center justify-center text-xs">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <button
                            onClick={() => onInspectUser && onInspectUser(userId)}
                            className="font-semibold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 text-left transition-colors flex items-center space-x-1 group"
                            title="View user details & links"
                          >
                            <span>{user.name}</span>
                            <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-brand-500" />
                          </button>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <select
                        value={user.role}
                        onChange={(e) => onUpdateRole(userId, e.target.value as 'user' | 'admin')}
                        className="px-2.5 py-1 rounded-lg glass-input text-xs font-semibold cursor-pointer"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td className="py-4 px-4">
                      {isSuspended ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 flex items-center space-x-1 w-max">
                          <Ban className="w-3 h-3" />
                          <span>Suspended</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center space-x-1 w-max">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <button
                        onClick={() => onToggleVerify(userId)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                          user.isVerified
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                        }`}
                        title="Click to toggle user verification status"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{user.isVerified ? 'Verified' : 'Verify User'}</span>
                      </button>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {onInspectUser && (
                          <button
                            onClick={() => onInspectUser(userId)}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
                            title="Inspect User Details & Links"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => onToggleVerify(userId)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.isVerified
                              ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/10'
                              : 'text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/10'
                          }`}
                          title={user.isVerified ? 'Mark as Unverified' : 'Verify User'}
                        >
                          <Check className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onToggleSuspend(userId)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isSuspended
                              ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/10'
                              : 'text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/10'
                          }`}
                          title={isSuspended ? 'Activate User' : 'Suspend User'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDeleteUser(userId)}
                          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/10 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
