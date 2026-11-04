import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import CommunityCard from "./community-card";
import { asset, DESKTOP_REPO, GITHUB_ORG, mainSite, MOBILE_REPO } from "@/lib/site";

const repos = [
  { name: "JNbot-desktop", line: "The desktop app · MIT license", href: DESKTOP_REPO },
  { name: "JNbot-mobile", line: "The mobile app · MIT license", href: MOBILE_REPO },
];

export default function HomeContent() {
  return (
    <>
      <section id="mobile" className="band phone-band">
        <div className="wrap phone-grid">
          <div className="band-copy">
            <h2>Check in from your phone.</h2>
            <p className="lede">Start scripts, read chat and watch your bots from anywhere.</p>
            <div className="actions">
              <a
                href="https://play.google.com/store/apps/details?id=com.jnbot.app"
                className="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get it on Google Play <ArrowUpRight size={16} />
              </a>
              <Link href="/join" className="btn btn-secondary">
                Connect in browser
              </Link>
            </div>
            <p className="fine">
              iOS via sideloading · <Link href="/download#mobile">More about the app</Link>
            </p>
          </div>
          <div className="phone-stage">
            <figure className="phone phone-back">
              <img src={asset("/mobile/scripts.webp")} width={540} height={1200} loading="lazy" alt="JNbot mobile scripts list" />
            </figure>
            <figure className="phone phone-front">
              <img
                src={asset("/mobile/overview.webp")}
                width={540}
                height={1200}
                loading="lazy"
                alt="JNbot mobile overview with playtime, quick actions, active bots and running scripts"
              />
            </figure>
          </div>
        </div>
      </section>

      <section id="community" className="band community-band">
        <div className="wrap community-grid">
          <div className="band-copy">
            <h2>Stuck? Ask the community.</h2>
            <p className="lede">Players sharing scripts and answering questions.</p>
            <a href={mainSite("/docs/")} className="text-link">
              Or read the docs <ArrowUpRight size={16} />
            </a>
          </div>
          <CommunityCard />
        </div>
      </section>

      <section id="open-source" className="band source-band">
        <div className="wrap community-grid">
          <div className="band-copy">
            <h2>See exactly what runs your accounts.</h2>
            <p className="lede">
              JNbot is open source. Read the code, report a bug or send a pull request.
            </p>
            <a href={GITHUB_ORG} className="text-link" target="_blank" rel="noopener noreferrer">
              View JNbot on GitHub <ArrowUpRight size={16} />
            </a>
          </div>
          <ul className="source-repos">
            {repos.map((repo) => (
              <li key={repo.name}>
                <a href={repo.href} target="_blank" rel="noopener noreferrer">
                  <span>
                    <strong>{repo.name}</strong>
                    <small>{repo.line}</small>
                  </span>
                  <ArrowUpRight size={18} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="close-band">
        <div className="wrap close-inner">
          <h2>Give the grind to a bot.</h2>
          <div className="close-actions">
            <Link href="/download" className="btn btn-ink btn-lg">
              Download JNbot <ArrowUpRight size={19} />
            </Link>
            <span>Free · Open source · Windows, macOS, Linux</span>
          </div>
        </div>
      </section>
    </>
  );
}
