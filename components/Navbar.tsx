"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LayoutDashboard, LogOut, Menu, Shield, UserRound, X } from "lucide-react";
import { Logo } from "./Logo";
import { RoleSwitch } from "./RoleSwitch";
import { Avatar, ButtonLink, Container } from "./ui";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/mentors", label: "Find a Mentor" },
  { href: "/become-a-mentor", label: "Become a Mentor" },
  { href: "/#how-it-works", label: "How it works" },
];

export function Navbar() {
  const { user, actions, ready } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    if (!menu) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const logout = () => {
    actions.logout();
    router.push("/");
  };

  const isActive = (href: string) => !href.includes("#") && pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm transition-colors",
                isActive(n.href) ? "bg-navy/5 font-medium text-navy" : "text-ink-muted hover:text-navy",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {!ready ? (
            <div className="h-9 w-40" />
          ) : user ? (
            <>
              {user.mentorStatus === "approved" && <RoleSwitch compact />}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenu((m) => !m)}
                  aria-expanded={menu}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-2.5 text-sm text-navy transition-colors hover:border-navy/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                >
                  <Avatar name={user.name} seed={user.id} size="sm" className="h-7 w-7 text-[10px]" />
                  <span className="max-w-[9rem] truncate font-medium">{user.name.split(" ")[0]}</span>
                  <ChevronDown className="h-4 w-4 text-ink-faint" aria-hidden />
                </button>
                {menu && (
                  <div role="menu" className="absolute right-0 mt-2 w-60 animate-fade-in rounded-2xl border border-line bg-white p-1.5 shadow-lift">
                    <div className="px-3 py-2">
                      <p className="truncate text-sm font-medium text-navy">{user.name}</p>
                      <p className="truncate text-xs text-ink-faint">{user.email}</p>
                    </div>
                    <div className="my-1 h-px bg-line" />
                    <MenuLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>Dashboard</MenuLink>
                    <MenuLink href="/dashboard/profile" icon={<UserRound className="h-4 w-4" />}>Profile settings</MenuLink>
                    {user.isAdmin && <MenuLink href="/admin" icon={<Shield className="h-4 w-4" />}>Admin</MenuLink>}
                    <div className="my-1 h-px bg-line" />
                    <button
                      role="menuitem"
                      onClick={logout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-ink-muted hover:bg-paper hover:text-navy"
                    >
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm">Log in</ButtonLink>
              <ButtonLink href="/signup" size="sm">Get started</ButtonLink>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-navy hover:bg-navy/5 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>

      {open && (
        <div className="animate-fade-in border-t border-line bg-paper md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-xl px-3 py-2.5 text-[15px] text-navy hover:bg-navy/5">
                {n.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-line" />
            {user ? (
              <>
                {user.mentorStatus === "approved" && (
                  <div className="px-3 py-2">
                    <RoleSwitch />
                  </div>
                )}
                <Link href="/dashboard" className="rounded-xl px-3 py-2.5 text-[15px] text-navy hover:bg-navy/5">Dashboard</Link>
                <Link href="/dashboard/profile" className="rounded-xl px-3 py-2.5 text-[15px] text-navy hover:bg-navy/5">Profile settings</Link>
                {user.isAdmin && <Link href="/admin" className="rounded-xl px-3 py-2.5 text-[15px] text-navy hover:bg-navy/5">Admin</Link>}
                <button onClick={logout} className="rounded-xl px-3 py-2.5 text-left text-[15px] text-ink-muted hover:bg-navy/5">
                  Log out ({user.name})
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-1">
                <ButtonLink href="/login" variant="outline" className="flex-1">Log in</ButtonLink>
                <ButtonLink href="/signup" className="flex-1">Get started</ButtonLink>
              </div>
            )}
          </Container>
        </div>
      )}
    </header>
  );
}

function MenuLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link role="menuitem" href={href} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-muted hover:bg-paper hover:text-navy">
      {icon}
      {children}
    </Link>
  );
}
