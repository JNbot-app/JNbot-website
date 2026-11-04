import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PageHero from "@/components/page-hero"
import Link from "next/link"
import { Plus } from "lucide-react"
import { DESKTOP_REPO, mainSite, MOBILE_REPO } from "@/lib/site"

const general = [
  {
    q: "What is JNbot?",
    a: (
      <>
        JNbot manages Minecraft bots and automates repetitive tasks. Record your actions, replay them with a
        bot, run scripts, and manage your accounts from one workspace.
      </>
    ),
  },
  {
    q: "Is JNbot open source?",
    a: (
      <>
        Yes. The source code for the <a href={DESKTOP_REPO}>desktop app</a> and the{" "}
        <a href={MOBILE_REPO}>mobile app</a> is on GitHub under the MIT license. Bug reports and pull requests
        are welcome.
      </>
    ),
  },
  {
    q: "Will using JNbot get me banned?",
    a: (
      <>
        Server rules vary. Check your server's automation rules before running a bot or plugin. A plugin being
        available in JNbot does not guarantee that a server permits it.
      </>
    ),
  },
  {
    q: "How do I install JNbot?",
    a: (
      <>
        Head to the <Link href="/download">download page</Link>, pick your OS (Windows, macOS, or Linux), and
        follow the installer. The site auto-detects your platform.
      </>
    ),
  },
  {
    q: "What features does JNbot offer?",
    a: (
      <>
        Gkit collector and upgrader, kit collector, book sorter, alt scanner, bot manager, and packet proxy,
        plus a full extension API. You can add your own logic with the plugin system or write a JavaScript
        plugin against the JNbot API.
      </>
    ),
  },
  {
    q: "Do I need Minecraft running to use JNbot?",
    a: (
      <>
        No. JNbot acts as a Minecraft client without the heavy UI, so it is lightweight and runs in the
        background. You do not need the game launched alongside it.
      </>
    ),
  },
  {
    q: "Can I run bots without my PC turned on?",
    a: (
      <>
        Yes. Use the CLI version on a VPS, a Raspberry Pi, or any machine with Node.js (18.0.0 or higher). It
        runs headlessly and keeps your bots online while your main PC is off.{" "}
        <Link href="/download">Get the CLI build</Link>.
      </>
    ),
  },
  {
    q: "My bot isn't working properly. How do I fix it?",
    a: (
      <>
        First check you are on the latest version. Then scan the{" "}
        <a href="#troubleshoot">troubleshooting section</a> below. If you are still stuck, join our{" "}
        <a href="https://discord.gg/JNbGgypERe" target="_blank" rel="noopener noreferrer">
          Discord
        </a>{" "}
        for hands-on help.
      </>
    ),
  },
  {
    q: "Is JNbot free?",
    a: (
      <>The desktop app is free. The mobile app may show ads and offer a one-time purchase to remove them.</>
    ),
  },
  {
    q: "Can I use JNbot on different servers?",
    a: (
      <>
        JNbot works on many Minecraft servers. Most of the scripts assume a fairly standard setup, so
        they may not behave the same everywhere. You can change the host in settings to use the underlying bot
        framework on other premium or cracked servers, but the script library may not work as expected.
      </>
    ),
  },
]

const troubleshoot = [
  {
    q: "The script is only joining with some of my alts.",
    a: (
      <>
        Some scripts (gkit collector, kit collector) have a setting like <code>skip alts with no gkits</code>.
        If that is enabled and an alt does not meet the requirement, it gets skipped. Toggle the option off in
        settings if you want every alt to join.
      </>
    ),
  },
  {
    q: "“Client timed out after 30000 milliseconds”",
    a: (
      <>
        The server stopped responding to the bot. This is usually a flaky internet connection. Try again, or
        switch networks if it keeps happening.
      </>
    ),
  },
  {
    q: "Disconnected with “read ECONNRESET”",
    a: (
      <>
        The connection was closed unexpectedly, which could be network or server side. Reconnect the bot. If
        it keeps happening, lengthen the delay between actions:{" "}
        <code>settings → script → delay between actions</code>.
      </>
    ),
  },
  {
    q: "My alt got kicked by anti-cheat.",
    a: (
      <>
        Report it in the{" "}
        <a href="https://discord.gg/JNbGgypERe" target="_blank" rel="noopener noreferrer">
          Discord
        </a>
        . False flags from anti-cheat are tracked there and patched as bugs.
      </>
    ),
  },
  {
    q: "My alts keep getting flagged when joining.",
    a: (
      <>
        This usually happens when too many alts join in too short a window. Either reduce the concurrent
        count, or increase the join delay: <code>settings → scripts → bot join delay</code>.
      </>
    ),
  },
]

function QA({ items }: { items: { q: string; a: React.ReactNode }[] }) {
  return (
    <div className="faq-list">
      {items.map((item) => (
        <details key={item.q}>
          <summary>
            {item.q}
            <Plus size={18} />
          </summary>
          <div className="faq-answer">{item.a}</div>
        </details>
      ))}
    </div>
  )
}
export default function FaqPage() {
  const recordings = [
    {
      q: "Can I automate a task without writing code?",
      a: (
        <>
          Yes. Create a Recording plugin, choose a connected Minecraft client, and perform your task. You can
          edit its actions and timing before replaying it with a bot.{" "}
          <a href={mainSite("/docs/plugins/recordings")}>Read the recording guide</a>.
        </>
      ),
    },
    {
      q: "Does a replay have to run in the same place?",
      a: (
        <>
          You choose. Replay at the original world coordinates, or use positions relative to the bot's
          starting point. Choose original coordinates for tasks tied to a specific location.
        </>
      ),
    },
  ]
  return (
    <>
      <Navbar />
      <main id="main-content">
        <PageHero
          eyebrow="Help"
          title={
            <>
              A few things <span className="text-gold">worth knowing.</span>
            </>
          }
        >
          Answers before your first bot, and help when a task does not go to plan.
        </PageHero>
        <div className="wrap faq-layout">
          <aside aria-label="Help topics">
            <a href="#general">Getting started</a>
            <a href="#recordings">Record & replay</a>
            <a href="#troubleshoot">Troubleshooting</a>
            <a href="#community">Ask the community</a>
          </aside>
          <div>
            <section id="general">
              <h2>Getting started</h2>
              <QA items={general} />
            </section>
            <section id="recordings">
              <h2>Record & replay</h2>
              <QA items={recordings} />
            </section>
            <section id="troubleshoot">
              <h2>Troubleshooting</h2>
              <QA items={troubleshoot} />
            </section>
            <section id="community">
              <h2>Still need a hand?</h2>
              <p className="mb-6 text-ink-muted">
                Tell us what you were running and what happened. Include the error message if you have one.
              </p>
              <a
                href="https://discord.gg/JNbGgypERe"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Ask on Discord
              </a>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
