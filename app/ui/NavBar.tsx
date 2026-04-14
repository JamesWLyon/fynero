"use client";

import Link from "next/link";
import Image from 'next/image';
import { navItems } from "../config/nav";
import Button from "./Button";
import Icon from "@/app/ui/Icon";
import { logout } from "@/lib/auth/logout";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

function renderNav(items: any[] = [], parentPath = "", onNavClick?: () => void) {
  return items.map((item) => {
    if (!item.name) {
      return (
        <div key={item.label} className="mt-6">
          <p className="text-gray-400 uppercase mb-2">
            {item.label}
          </p>
          {item.children && (
            <div className="flex flex-col gap-2">
              {renderNav(item.children, parentPath, onNavClick)}
            </div>
          )}
        </div>
      );
    }

    const path = item.name === "home" ? "/" : `${parentPath}/${item.name}`;
    const Icon = item.icon;

    return (
      <div key={path}>
        <Link
          href={path}
          onClick={onNavClick}
          className="flex items-center gap-2 text-white hover:text-blue-400 mb-1"
        >
          {Icon && <Icon size={18} className="shrink-0" />}
          {item.label}
        </Link>
        {item.children && (
          <div className="ml-4 mt-1 flex flex-col gap-1">
            {renderNav(item.children, path, onNavClick)}
          </div>
        )}
      </div>
    );
  });
}

// The actual sidebar content, shared between desktop and mobile
function NavContent({ onNavClick, onLogout }: { onNavClick?: () => void; onLogout: () => void }) {
  return (
    <>
      <Link href="/" className="inline-flex" onClick={onNavClick}>
        <Image
          src="/fynero-square-logo.png"
          alt="Fynero Logo"
          width={25}
          height={20}
        />
        <span className="ml-2 text-lg font-bold">Fynero</span>
      </Link>

      {renderNav(navItems, "", onNavClick)}

      <div className="mt-auto pt-4">
        <Button variant="accentBorder" click={onLogout}>
          <Icon name="moveRight" />
          Logout
        </Button>
      </div>
    </>
  );
}

export default function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* ── Desktop sidebar (unchanged, hidden on mobile) ── */}
      <aside className="hidden md:flex w-64 h-screen bg-accent/7.5 backdrop-blur-[2.5px] border-r border-accent/10 p-4 flex-col relative z-50 sticky top-0">
        <NavContent onLogout={handleLogout} />
      </aside>

      {/* ── Mobile: hamburger button (top-left, only on mobile) ── */}
      <button
        className="md:hidden fixed top-4 left-4 z-[100] p-2 rounded-md bg-primary/80 backdrop-blur-sm border border-accent/10 text-white"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      {/* ── Mobile: backdrop ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile: slide-in drawer ── */}
      <aside
        className={`
          md:hidden fixed top-0 left-0 z-[120] h-screen w-64
          bg-primary border-r border-accent/10 p-4 flex flex-col
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Close button inside drawer */}
        <button
          className="self-end mb-4 p-1 text-white hover:text-blue-400"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X size={22} />
        </button>

        <NavContent
          onNavClick={() => setMobileOpen(false)}
          onLogout={handleLogout}
        />
      </aside>
    </>
  );
}