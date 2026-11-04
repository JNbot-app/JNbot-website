import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { asset, GITHUB_ORG, mainSite } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-main">
          <div>
            <Link href="/" className="wordmark">
              <img
                className="brand-icon"
                src={asset("/icon.png")}
                width={42}
                height={42}
                alt=""
              />
              JNbot
            </Link>
            <p>More time for the part you play.</p>
          </div>
          <nav aria-label="Product links">
            <Link href="/download">Download</Link>
            <Link href="/join">Connect remotely</Link>
            <a href={mainSite("/docs/")}>Documentation</a>
            <Link href="/faq">Help & FAQ</Link>
            <a href={GITHUB_ORG} target="_blank" rel="noopener noreferrer">
              Source code
            </a>
          </nav>
          <div className="footer-community">
            <span>Built around the way you play.</span>
            <a
              href="https://discord.gg/JNbGgypERe"
              target="_blank"
              rel="noopener noreferrer"
            >
              Join the community <ArrowUpRight size={17} />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} JNbot</span>
          <p>
            Not an official Minecraft product. Not affiliated with Mojang,
            Microsoft, or CraftiGames.
          </p>
          <nav aria-label="Legal">
            <Link href="/eula">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/licenses">Licenses</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
