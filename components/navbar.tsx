"use client";

import { useState, type AnchorHTMLAttributes, type ReactNode } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { asset, GITHUB_ORG, mainSite } from "@/lib/site";

type NavItem = {
  name: string;
  href: string;
  external?: boolean;
  newTab?: boolean;
};

const DOCS_HREF = mainSite("/docs/");

const links: NavItem[] = [
  { name: "Scripts", href: "/#scripts" },
  { name: "Plugins", href: "/#plugins" },
  { name: "Docs", href: DOCS_HREF, external: true },
  { name: "FAQ", href: "/faq" },
  { name: "GitHub", href: GITHUB_ORG, external: true, newTab: true },
];

type NavLinkProps = {
  item: NavItem;
  children?: ReactNode;
} & Pick<AnchorHTMLAttributes<HTMLAnchorElement>, "aria-current" | "onClick">;

function NavLink({ item, children, ...props }: NavLinkProps) {
  const content = children ?? item.name;

  if (item.external) {
    return (
      <a
        href={item.href}
        {...(item.newTab && { target: "_blank", rel: "noopener noreferrer" })}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={item.href} {...props}>
      {content}
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === DOCS_HREF ? pathname.startsWith("/docs") : pathname === href;

  return (
    <header className="site-header">
      <div className="wrap nav-inner">
        <Link href="/" className="wordmark" aria-label="JNbot home">
          <img
            className="brand-icon"
            src={asset("/icon.png")}
            width={42}
            height={42}
            alt=""
          />
          JNbot
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <NavLink
              key={link.href}
              item={link}
              aria-current={isActive(link.href) ? "page" : undefined}
            />
          ))}
        </nav>
        <div className="desktop-actions">
          <Link href="/join" className="nav-connect">
            Connect
          </Link>
          <Link href="/download" className="btn btn-primary">
            Download <ArrowUpRight size={15} />
          </Link>
        </div>
        <button
          className="mobile-toggle"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-nav"
          className="mobile-nav"
          aria-label="Mobile navigation"
        >
          {[
            ...links,
            { name: "Connect to JNbot", href: "/join" },
            { name: "Download JNbot", href: "/download" },
          ].map((link) => (
            <NavLink
              key={link.href}
              item={link}
              aria-current={isActive(link.href) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.name}
              <ArrowUpRight size={16} />
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
