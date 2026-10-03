import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-primary mb-4 shadow-sm">
        <span className="material-symbols-outlined text-4xl">search_off</span>
      </div>
      <h1 className="font-display-hero text-2xl font-bold tracking-tight mb-2">
        Page Not Found
      </h1>
      <p className="text-on-surface-variant text-sm max-w-md mb-6">
        The page you are looking for doesn&apos;t exist or has been relocated within Nivora.
      </p>
      <Link
        href="/home"
        className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-fixed transition-colors shadow-sm"
      >
        Return to Home
      </Link>
    </div>
  );
}
