const puppeteer = require('puppeteer');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ── Load config ──────────────────────────────────────────────
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'), 'utf8'));
const { fps, duration, width, height, output, animation, content, theme } = config;
const totalFrames = fps * duration;

const FRAMES_DIR = path.join(__dirname, '../frames');
const OUTPUT_DIR = path.join(__dirname, '../output');
const ANIM_FILE = path.join(__dirname, `../animations/${animation}.html`);

// ── Inject config into HTML ───────────────────────────────────
function buildHTML() {
  let html = fs.readFileSync(ANIM_FILE, 'utf8');

    // Inject a global CONFIG object so the animation can read it
      const injection = `<script>
          window.RENDER_CONFIG = ${JSON.stringify({ content, theme })};
              window.RENDER_MODE = true;
                </script>`;

                  return html.replace('</head>', injection + '</head>');
                  }

                  // ── Main render ───────────────────────────────────────────────
                  (async () => {
                    // Clean up frames dir
                      if (fs.existsSync(FRAMES_DIR)) fs.rmSync(FRAMES_DIR, { recursive: true });
                        fs.mkdirSync(FRAMES_DIR, { recursive: true });
                          fs.mkdirSync(OUTPUT_DIR, { recursive: true });

                            console.log(`🎬 Starting render: ${totalFrames} frames @ ${fps}fps`);
                              console.log(`   Animation : ${animation}.html`);
                                console.log(`   Output    : ${output}`);
                                  console.log(`   Size      : ${width}x${height}`);

                                    // Write injected HTML to temp file
                                      const tempHTML = path.join(FRAMES_DIR, '_temp.html');
                                        fs.writeFileSync(tempHTML, buildHTML());

                                          const browser = await puppeteer.launch({
                                              headless: 'new',
                                                  args: [
                                                        '--no-sandbox',
                                                              '--disable-setuid-sandbox',
                                                                    '--disable-dev-shm-usage',
                                                                          '--disable-gpu',
                                                                                `--window-size=${width},${height}`
                                                                                    ]
                                                                                      });

                                                                                        const page = await browser.newPage();
                                                                                          await page.setViewport({ width, height, deviceScaleFactor: 1 });
                                                                                            await page.goto(`file://${tempHTML}`, { waitUntil: 'networkidle0' });

                                                                                              // Pause all CSS animations — we'll drive time manually
                                                                                                await page.evaluate(() => {
                                                                                                    document.getAnimations().forEach(a => {
                                                                                                          a.pause();
                                                                                                                a.currentTime = 0;
                                                                                                                    });
                                                                                                                      });

                                                                                                                        const animDurationMs = duration * 1000;

                                                                                                                          console.log(`\n📸 Capturing frames...`);

                                                                                                                            for (let frame = 0; frame < totalFrames; frame++) {
                                                                                                                                const timeMs = (frame / totalFrames) * animDurationMs;

                                                                                                                                    await page.evaluate((t) => {
                                                                                                                                          document.getAnimations().forEach(a => {
                                                                                                                                                  a.currentTime = t;
                                                                                                                                                        });
                                                                                                                                                            }, timeMs);

                                                                                                                                                                const framePath = path.join(FRAMES_DIR, `frame_${String(frame).padStart(5, '0')}.png`);
                                                                                                                                                                    await page.screenshot({ path: framePath, type: 'png' });

                                                                                                                                                                        if (frame % 30 === 0) {
                                                                                                                                                                              const pct = Math.round((frame / totalFrames) * 100);
                                                                                                                                                                                    process.stdout.write(`\r   Progress: ${pct}% (${frame}/${totalFrames})`);
                                                                                                                                                                                        }
                                                                                                                                                                                          }

                                                                                                                                                                                            await browser.close();
                                                                                                                                                                                              console.log(`\n✅ All frames captured\n`);

                                                                                                                                                                                                // ── FFmpeg: stitch frames → MP4 ──────────────────────────────
                                                                                                                                                                                                  const outputPath = path.join(OUTPUT_DIR, output);
                                                                                                                                                                                                    console.log(`🎞️  Encoding MP4 with FFmpeg...`);

                                                                                                                                                                                                      await new Promise((resolve, reject) => {
                                                                                                                                                                                                          const ffmpeg = spawn('ffmpeg', [
                                                                                                                                                                                                                '-y',
                                                                                                                                                                                                                      '-framerate', String(fps),
                                                                                                                                                                                                                            '-i', path.join(FRAMES_DIR, 'frame_%05d.png'),
                                                                                                                                                                                                                                  '-c:v', 'libx264',
                                                                                                                                                                                                                                        '-pix_fmt', 'yuv420p',
                                                                                                                                                                                                                                              '-crf', '18',
                                                                                                                                                                                                                                                    '-preset', 'fast',
                                                                                                                                                                                                                                                          outputPath
                                                                                                                                                                                                                                                              ]);

                                                                                                                                                                                                                                                                  ffmpeg.stderr.on('data', d => process.stdout.write(d));
                                                                                                                                                                                                                                                                      ffmpeg.on('close', code => code === 0 ? resolve() : reject(new Error(`FFmpeg exited ${code}`)));
                                                                                                                                                                                                                                                                        });

                                                                                                                                                                                                                                                                          // Clean up frames
                                                                                                                                                                                                                                                                            fs.rmSync(FRAMES_DIR, { recursive: true });

                                                                                                                                                                                                                                                                              console.log(`\n🚀 Done! Output → output/${output}`);
                                                                                                                                                                                                                                                                              })();