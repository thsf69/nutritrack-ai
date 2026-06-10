'use client';

import React from 'react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-black text-white">404</h1>
      <p className="text-sm text-zinc-500 mt-2">Page Not Found</p>
      <button 
        onClick={() => window.location.href = '/'}
        className="text-xs text-emerald-400 hover:underline mt-6"
      >
        Go Back Home
      </button>
    </div>
  );
}
