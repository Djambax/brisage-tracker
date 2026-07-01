import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brisage Tracker",
  description: "Noter des brisages Dofus entre potes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-base-bg text-gray-200 antialiased">
        <header className="border-b border-base-border bg-base-card/60">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-bold tracking-tight">
              🔨 Brisage Tracker
            </Link>
            <Link
              href="/nouveau"
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
            >
              + Ajouter un brisage
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-gray-500">
          Outil entre potes — données stockées sur Upstash Redis.
        </footer>
      </body>
    </html>
  );
}
