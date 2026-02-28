🎬 zero-motions
Automated motion graphics renderer. Edit a config file → push → get an MP4.
How it works
Edit config.json (change text, colors, duration)
Commit & push (from phone or desktop)
GitHub Actions renders the animation automatically
Download your MP4 from the Actions tab
Editing from your phone
Open the GitHub mobile app
Go to this repo → tap config.json
Tap the pencil icon to edit
Change whatever you want (title, colors, duration, etc.)
Tap Commit changes
Wait ~2–3 minutes
Go to Actions tab → latest run → Artifacts → download your MP4 ✅
config.json reference
{
  "animation": "new-grid",        // which HTML file in /animations to render
  "output": "new-grid.mp4",       // output filename
  "duration": 4,                  // length in seconds
  "fps": 60,                      // frames per second
  "width": 1080,                  // pixel width
  "height": 1350,                 // pixel height (1080x1350 = Instagram portrait)

  "content": {
    "topLabel": "Instagram's\nNew Grid Cheatsheet",
    "titleLine1": "Introducing",
    "titleHighlight": "New",       // the italic gradient word
    "titleLine2Before": "The",
    "titleLine2After": "Grid",
    "subtitle": "Aka the 3:4 grid...",
    "tagline": "Let's break it down...",
    "author": "Your Name",
    "year": "2025",
    "month": "January"
  },

  "theme": {
    "background": "#f4f5f0",
    "textDark": "#1a3a32",
    "accentFrom": "#2e7d32",       // gradient start color
    "accentTo": "#8bc34a",         // gradient end color
    "gridColor": "rgba(0,120,100,0.09)",
    "dotColor": "#1a7a6e",
    "subtitleColor": "#999",
    "labelColor": "#666"
  }
}
Adding new animations
Create a new HTML file in /animations/
Use window.RENDER_CONFIG to read injected content/theme (see new-grid.html as reference)
Change "animation" in config.json to the new filename (without .html)
Push → renders automatically
Running locally
npm install
npm run render
Requires Node.js 18+ and FFmpeg installed.
Free tier limits
GitHub Actions gives you 2,000 minutes/month free.
Each render ≈ 2–3 minutes → ~650–1000 renders/month for free.