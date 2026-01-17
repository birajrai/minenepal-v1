'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void; }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-6xl font-bold text-red-500">Error</h1>
      <h2 className="text-2xl font-semibold mt-4">Something went wrong!</h2>
      <p className="text-lg mt-2">We apologize for the inconvenience. Please try again later.</p>
      <button
        className="mt-6 px-6 py-3 bg-coffee text-white rounded-md hover:bg-coffee-dark transition duration-300"
        onClick={() => reset()}
      >
        Try again
      </button>
      <Link href="/" className="mt-4 px-6 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition duration-300">
        Return Home
      </Link>
    </div>
  );
}