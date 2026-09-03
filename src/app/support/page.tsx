'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Headphones,
  Send,
  MessageCircle,
  ShieldCheck,
  Zap,
  HelpCircle,
  ChevronDown,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const FAQS = [
  {
    question: 'តើ Product Key មានការធានាដែរឬទេ បើ Activate មិនកើត?',
    answer:
      'រាល់ Product Key ទាំងអស់ដែលបានជាវពី P-Two7 Digital Store គឺសុទ្ធតែជា Genuine License ស្របច្បាប់ 100%។ ប្រសិនបើជួបបញ្ហាក្នុងការ Activate ក្រុមការងារយើងធានាប្តូរជូន Key ថ្មីភ្លាមៗ ឬជួយ Activate តាមរយៈ TeamViewer/AnyDesk ដោយឥតគិតថ្លៃ។',
  },
  {
    question: 'តើឯកសារក្នុងទំព័រ «កម្មវិធី Free» មានសុវត្ថិភាពដែរឬទេ?',
    answer:
      'ឯកសារ Windows ISO, Office Installer និង Tools ទាំងអស់ត្រូវបានទាញយក និងត្រួតពិនិត្យផ្ទាល់ពី Microsoft Official Servers និងបាន Scan មេរោគយ៉ាងម៉ត់ចត់ ធានាថា Virus-Free និងគ្មាន Malware 100%។',
  },
  {
    question: 'តើខ្ញុំអាចទូទាត់ប្រាក់តាមវិធីណាខ្លះ?',
    answer:
      'យើងទទួលការទូទាត់តាមរយៈ Bakong KHQR (ស្កេនបានគ្រប់ធនាគារក្នុងប្រទេសកម្ពុជាដូចជា ABA, ACLEDA, Canadia, Wing, TrueMoney), ABA PAY, Wing Money និងកាត Credit/Debit Card។',
  },
  {
    question: 'តើខ្ញុំអាចស្នើសុំ Software ឬ Tools ផ្សេងទៀតដែលមិនមានលើ Web បានទេ?',
    answer:
      'បានយ៉ាងពិតប្រាកដ! លោកអ្នកអាចទាក់ទងមកកាន់ក្រុមការងារតាមរយៈ Telegram (@BozzPovvDev ឬ Group @povcoding) យើងខ្ញុំនឹងស្វែងរក និង Upload ជូនលោកអ្នកភ្លាមៗ។',
  },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      error('សូមបំពេញឈ្មោះ ព័ត៌មានទំនាក់ទំនង និងខ្លឹមសារសារឱ្យបានត្រឹមត្រូវ');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          contact: email.trim(),
          email: email.trim(),
          message: message.trim(),
          subject: 'សាកសួរព័ត៌មានពីទំព័រ Support',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'បរាជ័យក្នុងការផ្ញើសារ');
      }
      setName('');
      setEmail('');
      setMessage('');
      success('សាររបស់អ្នកត្រូវបានកត់ត្រាទុកក្នុងប្រព័ន្ធដោយជោគជ័យ! ក្រុមការងារយើងនឹងឆ្លើយតបយ៉ាងឆាប់រហ័ស។');
    } catch (err: any) {
      error(err.message || 'មានបញ្ហាក្នុងការផ្ញើសារ សូមព្យាយាមម្តងទៀត');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* 1. HERO HEADER */}
      <section className="relative rounded-3xl p-8 sm:p-12 overflow-hidden border border-blue-500/20 bg-gradient-to-b from-dark-900 via-dark-850 to-dark-950 shadow-2xl text-center space-y-4">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-blue-600/15 blur-[120px] pointer-events-none" />

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-snug">
          មជ្ឈមណ្ឌលជំនួយ និងសេវាបម្រើអតិថិជន
        </h1>
      </section>

      {/* 2. DIRECT CONTACT CHANNELS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Telegram Direct */}
        <a
          href="https://t.me/BozzPovvDev"
          target="_blank"
          rel="noreferrer"
          className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-blue-500/50 flex flex-col justify-between space-y-4 group transition-all duration-300"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white group-hover:text-blue-400 transition-colors">
                Telegram Direct (@BozzPovvDev)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                ឆាតផ្ទាល់ជាមួយក្រុមការងារ ឆ្លើយតបភ្លាមៗក្នុងរយៈពេល 1-3 នាទី។
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div className="btn-uiverse-telegram w-full justify-center">
              <div className="telegram-icon">
                <Send className="w-4 h-4" />
              </div>
              <span>@BozzPovvDev</span>
            </div>
          </div>
        </a>

        {/* Telegram Community */}
        <a
          href="https://t.me/povcoding"
          target="_blank"
          rel="noreferrer"
          className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-purple-500/50 flex flex-col justify-between space-y-4 group transition-all duration-300"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white group-hover:text-purple-400 transition-colors">
                Group Telegram (povcoding)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                ចូលរួម Group ដើម្បីទទួលការចែករំលែក ចំណេះដឹង និង Software Update។
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div className="btn-uiverse-telegram btn-uiverse-telegram-purple w-full justify-center">
              <div className="telegram-icon">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span>t.me/povcoding</span>
            </div>
          </div>
        </a>
      </section>

      {/* 3. FAQ ACCORDION SECTION */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-400" />
            <span>សំណួរដែលសួរញឹកញាប់ (FAQ)</span>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="glass-card rounded-2xl border border-slate-800 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-slate-800/30 transition-colors"
                >
                  <span className="font-semibold text-xs sm:text-sm text-white flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs flex-shrink-0">
                      ?
                    </span>
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-blue-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/50 bg-dark-900/40 animate-in fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. SEND MESSAGE FORM */}
      <section className="max-w-2xl mx-auto glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="space-y-1 text-center">
          <h3 className="text-lg font-bold text-white">ផ្ញើសារ ឬសាកសួរព័ត៌មាន</h3>
          <p className="text-xs text-slate-400">បំពេញទម្រង់ខាងក្រោម ក្រុមការងារយើងនឹងទាក់ទងត្រឡប់ទៅវិញ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">ឈ្មោះរបស់អ្នក</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ឧ. សុខ វិបុល"
                className="w-full bg-dark-850 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">អ៊ីមែល ឬលេខ Telegram</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ឧ. sok@example.com ឬ @username"
                className="w-full bg-dark-850 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">ខ្លឹមសារសារ</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="សូមរៀបរាប់ពីបញ្ហា ឬសំនួររបស់អ្នក..."
              className="w-full bg-dark-850 border border-slate-700/80 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-uiverse-split-curtain w-full py-3.5 rounded-xl text-xs font-bold disabled:opacity-50"
          >
            {submitting ? (
              <span>កំពុងផ្ញើ...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>ផ្ញើសារឥឡូវនេះ</span>
              </>
            )}
          </button>
        </form>
      </section>
    </div>
  );
}
