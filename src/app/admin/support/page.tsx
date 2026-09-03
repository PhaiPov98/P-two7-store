'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Send,
  Mail,
  User,
  ShieldCheck,
  ExternalLink,
  RotateCcw,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface SupportTicketItem {
  id: string;
  userId?: string | null;
  name: string | null;
  contact: string | null;
  subject: string | null;
  message: string;
  status: string;
  reply: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  } | null;
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');
  const { success, error } = useToast();

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/support');
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch (e) {
      console.error(e);
      error('បរាជ័យក្នុងការទាញយកទិន្នន័យសារជំនួយ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleToggleStatus = async (ticket: SupportTicketItem) => {
    const nextStatus = ticket.status === 'OPEN' ? 'RESOLVED' : 'OPEN';
    try {
      const res = await fetch('/api/admin/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ticket.id, status: nextStatus }),
      });
      if (res.ok) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticket.id ? { ...t, status: nextStatus } : t))
        );
        success(nextStatus === 'RESOLVED' ? 'បានសម្គាល់ថាបានដោះស្រាយរួចរាល់' : 'បានប្តូរទៅស្ថានភាពកំពុងរង់ចាំ');
      } else {
        error('បរាជ័យក្នុងការកែប្រែស្ថានភាព');
      }
    } catch (e) {
      error('មានបញ្ហាក្នុងការកែប្រែ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('តើអ្នកពិតជាចង់លុបសារនេះមែនទេ?')) return;
    try {
      const res = await fetch(`/api/admin/support?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setTickets((prev) => prev.filter((t) => t.id !== id));
        success('បានលុបសារដោយជោគជ័យ');
      } else {
        error('បរាជ័យក្នុងការលុបសារ');
      }
    } catch (e) {
      error('មានបញ្ហាក្នុងការលុប');
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchStatus = filterStatus === 'ALL' || ticket.status === filterStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (ticket.name && ticket.name.toLowerCase().includes(q)) ||
        (ticket.contact && ticket.contact.toLowerCase().includes(q)) ||
        ticket.message.toLowerCase().includes(q) ||
        (ticket.user?.email && ticket.user.email.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [tickets, filterStatus, searchQuery]);

  const openCount = tickets.filter((t) => t.status === 'OPEN').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-blue-400" />
            <span>សារសាកសួរ & សំបុត្រជំនួយ (Support Inquiries)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            គ្រប់គ្រង និងឆ្លើយតបសារសាកសួរពីអតិថិជនលើទំព័រ Support
          </p>
        </div>

        <button
          onClick={fetchTickets}
          className="px-4 py-2 bg-dark-850 hover:bg-dark-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>ទាញយកទិន្នន័យឡើងវិញ</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 glass-card p-4 rounded-2xl border border-slate-800">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ស្វែងរកតាមឈ្មោះ, Telegram, Email, ឬខ្លឹមសារ..."
            className="w-full bg-dark-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2">
          {[
            { id: 'ALL', label: `ទាំងអស់ (${tickets.length})` },
            { id: 'OPEN', label: `កំពុងរង់ចាំ (${openCount})`, isAlert: openCount > 0 },
            { id: 'RESOLVED', label: 'បានដោះស្រាយ' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-dark-900 text-slate-300 hover:bg-dark-800 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">កំពុងផ្ទុកសារ...</div>
      ) : filteredTickets.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center text-slate-400 space-y-3 border border-slate-800">
          <MessageSquare className="w-12 h-12 mx-auto text-slate-600" />
          <p className="text-sm font-semibold text-slate-300">មិនមានសារសាកសួរនៅក្នុងប្រព័ន្ធឡើយ</p>
          <p className="text-xs text-slate-500">រាល់ពេលអតិថិជនផ្ញើសារពីទំព័រ Support វានឹងបង្ហាញនៅទីនេះ។</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTickets.map((ticket) => {
            const isTelegram = ticket.contact?.includes('@') || !ticket.contact?.includes('.');
            const telegramHandle = ticket.contact?.replace('@', '');

            return (
              <div
                key={ticket.id}
                className={`glass-card rounded-2xl p-5 border transition-all duration-200 space-y-4 ${
                  ticket.status === 'OPEN'
                    ? 'border-blue-500/40 bg-blue-950/10 shadow-lg shadow-blue-500/5'
                    : 'border-slate-800 bg-dark-900/60 opacity-90'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow">
                      {ticket.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{ticket.name || 'អតិថិជនទូទៅ'}</span>
                        {ticket.userId && (
                          <span className="text-[10px] bg-blue-500/20 text-blue-400 font-bold px-1.5 py-0.2 rounded border border-blue-500/30">
                            MEMBER
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>{ticket.contact || ticket.user?.email || 'គ្មាន Contact'}</span>
                        <span>•</span>
                        <span className="text-[11px] font-mono">
                          {new Date(ticket.createdAt).toLocaleString('km-KH')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(ticket)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                        ticket.status === 'OPEN'
                          ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                          : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                      }`}
                    >
                      {ticket.status === 'OPEN' ? (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>កំពុងរង់ចាំ (ចុចដើម្បីបញ្ចប់)</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>បានដោះស្រាយរួចរាល់</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(ticket.id)}
                      className="p-2 rounded-xl bg-dark-850 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-all"
                      title="លុបសារ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Message Body */}
                <div className="bg-dark-900/90 rounded-xl p-4 border border-slate-800/80 text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {ticket.message}
                </div>

                {/* Quick Reply & Contact Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                  <span className="text-slate-400 text-[11px]">
                    ប្រធានបទ: <strong className="text-slate-200">{ticket.subject || 'ទូទៅ'}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    {ticket.contact?.includes('@') || !ticket.contact?.includes('.') ? (
                      <a
                        href={`https://t.me/${telegramHandle}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>ឆាតឆ្លើយតបតាម Telegram</span>
                      </a>
                    ) : (
                      <a
                        href={`mailto:${ticket.contact}`}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>ផ្ញើ Email ឆ្លើយតប</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
