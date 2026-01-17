import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-6xl font-bold text-red-500">404</h1>
      <h2 className="text-2xl font-semibold mt-4">Page Not Found</h2>
      <p className="text-lg mt-2">Could not find the requested resource.</p>
      <Link href="/" className="mt-6 px-6 py-3 bg-mahogany-red-2 text-white rounded-md hover:bg-mahogany-red transition duration-300">
        Return Home
      </Link>
    </div>
  );
}