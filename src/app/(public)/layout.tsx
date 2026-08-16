import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-control bg-ink flex items-center justify-center text-bone text-sm font-semibold">
              V
            </span>
            <span className="font-medium text-[15px] tracking-tight">
              Veritas
            </span>
          </Link>

          <nav className="flex items-center gap-6 text-sm text-ink-soft">
            <Link href="/courses" className="hover:text-ink transition-colors">
              Courses
            </Link>
            <Link href="/contact" className="hover:text-ink transition-colors">
              Contact
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/login"
              className="btn-accent"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-ink-soft">
          <span>Veritas Education Management Portal</span>
          <div className="flex gap-6">
            <Link href="/contact" className="hover:text-ink transition-colors">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
