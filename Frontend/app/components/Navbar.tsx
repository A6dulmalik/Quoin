"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Academy", href: "#academy" },
  { label: "AI Assistant", href: "#ai-assistant" },
  { label: "Community", href: "#community" },
  { label: "Trade", href: "#trade" },
  { label: "News", href: "#news" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Profile", href: "/profile" },
  { label: "ABI Admin", href: "/admin/abis" },
] as const;

function subscribeToHash(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);
  return () => window.removeEventListener("hashchange", onStoreChange);
}

function getHashSnapshot() {
  return window.location.hash;
}

function getServerHashSnapshot() {
  return "";
}

function isActiveHref(href: string, pathname: string, hash: string) {
  if (href.startsWith("#")) {
    return pathname === "/" && hash === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const hash = useSyncExternalStore(
    subscribeToHash,
    getHashSnapshot,
    getServerHashSnapshot,
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 sm:px-6 sm:pt-5">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full bg-primary px-6 py-3 sm:px-8 sm:py-4">
        <Link href="/" className="text-lg font-bold text-black sm:text-xl">
          Quoin
        </Link>

        <ul className="hidden items-center gap-6 md:flex lg:gap-8">
          {NAV_LINKS.map(({ label, href }) => {
            const active = isActiveHref(href, pathname, hash);

            return (
              <li key={label}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`relative text-sm font-medium transition-colors ${
                    active
                      ? "text-white after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-white"
                      : "text-white/75 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <Link
          href="#connect-wallet"
          className="hidden rounded-full border border-white/20 bg-[#333] px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 md:inline-block"
        >
          Connect Wallet
        </Link>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-black hover:text-black/70 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          )}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="mx-auto mt-2 max-w-6xl rounded-2xl bg-primary px-6 pb-4 md:hidden">
          <ul className="flex flex-col gap-2 py-4">
            {NAV_LINKS.map(({ label, href }) => {
              const active = isActiveHref(href, pathname, hash);

              return (
                <li key={label}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-white/20 text-white"
                        : "text-white/75 hover:bg-white/10 hover:text-white"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="#connect-wallet"
            className="inline-block rounded-full border border-white/20 bg-[#333] px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            onClick={() => setMobileMenuOpen(false)}
          >
            Connect Wallet
          </Link>
        </div>
      )}
    </header>
  );
}
