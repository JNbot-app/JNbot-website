"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { asset } from "@/lib/site";

const DISCORD_INVITE = "JNbGgypERe";

type Counts = { online: number; members: number };

const format = (n: number) => n.toLocaleString("en-US");

// The Discord invite with live member counts. Without the counts (offline,
// blocked request) the card still links to the server.
export default function CommunityCard() {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`https://discord.com/api/v10/invites/${DISCORD_INVITE}?with_counts=true`, {
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.approximate_member_count) {
          setCounts({ online: data.approximate_presence_count, members: data.approximate_member_count });
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return (
    <a
      className="community-card"
      href={`https://discord.gg/${DISCORD_INVITE}`}
      target="_blank"
      rel="noopener noreferrer"
      data-reveal="visual"
    >
      <span className="community-card-head">
        <img src={asset("/icon-192.png")} width={56} height={56} alt="" />
        <span>
          <strong>JNbot Community</strong>
          <small>Discord server</small>
        </span>
        <ArrowUpRight size={20} />
      </span>
      <span className="community-stats" aria-live="polite">
        <span>
          <b>
            <span className="mc-ping" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            {counts ? format(counts.online) : "—"}
          </b>
          online now
        </span>
        <span>
          <b>{counts ? format(counts.members) : "—"}</b>
          members
        </span>
      </span>
      <span className="community-topics">
        <span>Script help</span>
        <span>Plugin showcase</span>
        <span>Updates</span>
      </span>
    </a>
  );
}
