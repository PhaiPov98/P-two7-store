import Link from 'next/link';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/10">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white">404</h1>
          <h2 className="text-lg font-bold text-slate-200">រកមិនឃើញទំព័រនេះទេ</h2>
          <p className="text-xs text-slate-400">
            ទំព័រដែលលោកអ្នកកំពុងស្វែងរក ប្រហែលជាត្រូវបានផ្លាស់ប្តូរទីតាំង ឬលុបចេញពីប្រព័ន្ធ។
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="btn-uiverse-primary w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>ត្រឡប់ទៅទំព័រដើម</span>
          </Link>
          <Link
            href="/products"
            className="btn-uiverse-secondary w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold"
          >
            <span>មើលផលិតផល</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
