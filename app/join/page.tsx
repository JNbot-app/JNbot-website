"use client"

import { useEffect, useState, type FormEvent } from "react"
import { ArrowUpRight, Eye, EyeOff, Loader2 } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PageHero from "@/components/page-hero"
import { mainSite } from "@/lib/site"

export default function JoinPage() {
  const [room, setRoom] = useState("")
  const [device, setDevice] = useState("")
  const [password, setPassword] = useState("")
  const [visible, setVisible] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState("")
  useEffect(() => {
    try {
      setRoom(localStorage.getItem("jnbot_roomId") || "")
      setDevice(localStorage.getItem("jnbot_deviceId") || "")
      setPassword(localStorage.getItem("jnbot_password") || "")
    } catch {
      /* Storage is optional. */
    }
  }, [])
  function connect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!room.trim() || !device.trim() || !password.trim()) {
      setError("Enter your room ID, device ID, and password to connect.")
      return
    }
    setError("")
    try {
      localStorage.setItem("jnbot_roomId", room.trim())
      localStorage.setItem("jnbot_deviceId", device.trim())
      localStorage.setItem("jnbot_password", password)
    } catch {
      /* Continue when browser storage is unavailable. */
    }
    setConnecting(true)
    window.location.assign(
      `https://jnbot-app.netlify.app/?room=${encodeURIComponent(room.trim())}&id=${encodeURIComponent(device.trim())}&token=${encodeURIComponent(password)}&p2p=true`,
    )
  }
  return (
    <>
      <Navbar />
      <main id="main-content">
        <PageHero
          eyebrow="Remote access"
          title={
            <>
              Your bots.
              <br />
              <span className="text-gold">Within reach.</span>
            </>
          }
        >
          Connect this browser to your running JNbot instance. Your computer or server needs to stay online.
        </PageHero>
        <div className="wrap connection-layout">
          <form onSubmit={connect} className="connection-form">
            <h2>Connect to JNbot</h2>
            <label htmlFor="room">Room ID</label>
            <input
              id="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Your room ID"
              autoComplete="off"
              required
            />
            <label htmlFor="device">Device ID</label>
            <input
              id="device"
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              placeholder="Your device ID"
              autoComplete="off"
              required
            />
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={visible ? "text" : "password"}
                placeholder="Your connection password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setVisible(!visible)}
                aria-label={visible ? "Hide password" : "Show password"}
                aria-pressed={visible}
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button disabled={connecting} className="btn btn-primary">
              {connecting ? (
                <>
                  Opening JNbot <Loader2 size={17} className="animate-spin" />
                </>
              ) : (
                <>
                  Connect to your instance <ArrowUpRight size={17} />
                </>
              )}
            </button>
            <p className="form-note">
              Connection details are remembered in this browser. Use a device you trust.
            </p>
          </form>
          <div className="connection-help">
            <h2>
              Your connection starts
              <br />
              on the desktop.
            </h2>
            <ol>
              <li>
                <div>
                  <strong>Open JNbot Server</strong>
                  <p>Launch the desktop app or CLI. In JNbot, open JNbot Server from the sidebar.</p>
                </div>
              </li>
              <li>
                <div>
                  <strong>Register this device</strong>
                  <p>Select Add Device if you have not paired this browser before.</p>
                </div>
              </li>
              <li>
                <div>
                  <strong>Start a peer-to-peer server</strong>
                  <p>Select Peer-to-peer, then Start Server. Copy the Room ID.</p>
                </div>
              </li>
              <li>
                <div>
                  <strong>Copy your device credentials</strong>
                  <p>
                    Select your device to find its Device ID and Password. Enter all three values in the form.
                  </p>
                </div>
              </li>
            </ol>
            <a href={mainSite("/docs/")} className="text-link">
              Open the documentation <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
