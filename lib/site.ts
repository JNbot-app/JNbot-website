export const GITHUB_ORG = "https://github.com/JNbot-app"
export const DESKTOP_REPO = `${GITHUB_ORG}/JNbot-desktop`
export const MOBILE_REPO = `${GITHUB_ORG}/JNbot-mobile`

const MAIN_SITE = "https://jnbot.netlify.app"

// Set when the site is built for a subpath, such as the GitHub Pages mirror.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

// next/link adds the base path by itself. Plain URLs to files in public/ need this.
export const asset = (path: string) => `${BASE_PATH}${path}`

// The docs and the Netlify redirects only exist on the main site, so mirrors link there.
export const mainSite = (path: string) => (BASE_PATH ? `${MAIN_SITE}${path}` : path)
