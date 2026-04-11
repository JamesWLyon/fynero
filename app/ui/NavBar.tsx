"use client";

import Link from "next/link";
import Image from 'next/image';
import { navItems } from "../config/nav";
import Button from "./Button";
import Icon from "@/app/ui/Icon";
import { logout } from "@/lib/auth/logout";
import { useRouter } from "next/navigation";


function renderNav(items: any[] = [], parentPath = "") {
  return items.map((item) => {
    if (!item.name) {
      return (
        <div key={item.label} className="mt-6">
          <p className="text-gray-400 uppercase mb-2">
            {item.label}
          </p>
          {item.children && (
            <div className="flex flex-col gap-2">
              {renderNav(item.children, parentPath)}
            </div>
          )}
        </div>
      );
    }

    const path =
      item.name === "home"
        ? "/"
        : `${parentPath}/${item.name}`;

    const Icon = item.icon;

    return (
      <div key={path}>
        <Link
            href={path}
            className="flex items-center gap-2 text-white hover:text-blue-400 mb-1"
        >
            {Icon && <Icon size={18} className="shrink-0" />}
            {item.label}
        </Link>

        {item.children && (
            <div className="ml-4 mt-1 flex flex-col gap-1">
                {renderNav(item.children, path)}
            </div>
        )}
      </div>
    );
  });
}


export default function Navbar() {
  const router = useRouter();

  {/* Logout Handler */}
  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  {/* Navbar */}
  return (
      <aside className="w-64 h-screen bg-accent/7.5 backdrop-blur-[2.5px] border-r border-accent/10 p-4 flex flex-col relative z-50 sticky top-0">
          <Link href="/" className="inline-flex">
              <Image 
                  src="/fynero-square-logo.png"
                  alt="Fynero Logo"
                  width={25}
                  height={20}
              />

              <span className="ml-2 text-lg font-bold">Fynero</span>
          </Link>

          {renderNav(navItems)}
          
          <div className="mt-auto">
              <Button variant="accentBorder" click={handleLogout}>
                  <Icon name="moveRight" />
                  Logout
              </Button>
          </div>
      </aside>
  );
}