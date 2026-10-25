# HydroBuddy release media

Captured locally from the Windows 1.9.2 packaged app on October 18, 2026.

- `choose-your-buddy.png`: the actual character settings screen.
- `reminder-settings.png`: the actual routine screen with 20 minutes selected and the custom minutes field visible.
- `walking-steps.png`: four actual rendered walking frames, arranged as a strip.
- `hydrobuddy-demo.gif`: a complete desktop reminder over Google in Chrome, for the project README.
- `hydrobuddy-linkedin-demo.mp4`: the same screen recording in H.264, 1920 × 1080, about 22 seconds, without audio. You can replace this with your own LinkedIn recording.

The recording uses the real transparent Electron windows and bundled artwork. The test driver clicks the real Yes button through Playwright input. It uses a separate local profile and Test Reminder; no one-hour wait is shown. The final exports crop the screen edges and taskbar, with no animation speed change, fabricated background, or added avatar overlays.

To recapture the screenshots and walking strip, first package the Windows app, then run `node scripts/capture-release-media.cjs`. The script requires the project's development dependencies and uses an isolated profile. It does not publish anything.

Optional desktop recording requires a local FFmpeg executable supplied through `HYDROBUDDY_FFMPEG`. On Windows, `HYDROBUDDY_DDA_OUTPUT` selects a verified Desktop Duplication display index; verify that this is the intended display before recording. Remove an old `.cache/start-demo.txt` before running the helper. Once it prints READY, arrange the background and create that file to begin. `HYDROBUDDY_DEMO_AUTO_YES=1` enables the test-driver button click. Otherwise, click Yes manually during the question. The raw recording is saved under `.cache/`.

Keep this folder beside the README when uploading to GitHub so its relative image links work.
