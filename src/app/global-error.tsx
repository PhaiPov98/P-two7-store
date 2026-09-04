'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="km">
      <body style={{ backgroundColor: '#080C16', color: '#F1F5F9', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', margin: 0 }}>
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>មានបញ្ហាបច្ចេកទេស</h2>
          <p style={{ fontSize: '0.875rem', color: '#94A3B8', marginBottom: '1.5rem' }}>សូមព្យាយាម Refresh ទំព័រឡើងវិញ។</p>
          <button
            onClick={() => reset()}
            style={{ padding: '0.6rem 1.2rem', backgroundColor: '#2563EB', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ព្យាយាមម្តងទៀត
          </button>
        </div>
      </body>
    </html>
  );
}
