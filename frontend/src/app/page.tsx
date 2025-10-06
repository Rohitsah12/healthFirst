import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Public Home Page</h1>
      <div className="mt-4 space-x-4">
        <Link href="/login" className="text-blue-500">Go to Login</Link>
        <Link href="/dashboard" className="text-blue-500">Go to Dashboard (will redirect if not logged in)</Link>
      </div>
    </div>
  );
}