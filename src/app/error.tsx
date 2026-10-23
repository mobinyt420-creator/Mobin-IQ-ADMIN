'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin Panel Unhandled Exception:', error);
  }, [error]);

  const handleClearCacheAndReset = () => {
    try {
      localStorage.removeItem('mobiniq_admin_courses_v1');
      localStorage.removeItem('mobiniq_admin_products_v1');
      localStorage.removeItem('mobiniq_admin_hero_slides_v1');
    } catch {}
    reset();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#060913] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-[#0B1224] border border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.2)] text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-white">অ্যাডমিন সিস্টেম লোডিং সতর্কতা</h2>
          <p className="text-xs text-slate-400">
            ক্লায়েন্ট-সাইড ডেটা লোড করার সময় সামান্য সমস্যা হয়েছে। নিচের বাটনে ক্লিক করে রিকভার করুন।
          </p>
        </div>

        {error?.message && (
          <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-left font-mono text-[11px] text-rose-300 max-h-24 overflow-y-auto">
            {error.message}
          </div>
        )}

        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={() => reset()}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>পুনরায় চেষ্টা করুন (Retry)</span>
          </button>

          <button
            onClick={handleClearCacheAndReset}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <Trash2 className="w-4 h-4 text-amber-400" />
            <span>ক্যাশ ক্লিয়ার করে ফ্রেশ রিলোড করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
}
