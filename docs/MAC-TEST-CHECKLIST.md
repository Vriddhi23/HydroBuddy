# Mac beta test checklist — HydroBuddy 1.9.2

Run this on the actual downloaded DMG, not just a development build. You do not need Node.js or a terminal to use the app.

## Record the test machine

Open **Apple menu → About This Mac**. Record the macOS version and chip/processor. The app currently targets macOS 13 or newer.

```text
Tester:
Date:
Mac model:
Chip / processor:
macOS version:
Display resolution / scaling:
Installer filename:
GitHub release or Actions run URL:
Build commit:
```

## Download and install

- [ ] Apple M-series chip: download `HydroBuddy-1.9.2-mac-arm64.dmg`. Intel processor: download `HydroBuddy-1.9.2-mac-x64.dmg`.
- [ ] Download from your GitHub release's Assets, or your own successful Actions run before publishing. Keep the matching checksum file.
- [ ] Open the DMG, drag HydroBuddy to **Applications**, and wait for the copy to finish.
- [ ] Eject the DMG. Open HydroBuddy from **Applications**.
- [ ] Record any launch warning exactly, with a screenshot.

This beta is ad-hoc signed and not notarized by Apple. If your own verified download is blocked for an unidentified developer or missing notarization, Apple's guidance describes **System Settings → Privacy & Security → Open Anyway**, when offered after an attempted launch. Only proceed if you trust the source. Do not disable Gatekeeper or remove quarantine attributes to make the test appear to pass. If macOS reports malware or a damaged application, stop and save the warning for investigation. [Apple's app-opening guidance](https://support.apple.com/en-us/102445)

## First launch and appearance

- [ ] First launch shows character setup.
- [ ] Choose Female, change the T-shirt and jeans colors, preview, then save.
- [ ] All of the shirt changes color, including the sleeves while waving.
- [ ] Both jeans legs follow the chosen color; bottle, skin and hair remain correct.
- [ ] Switch to Male and repeat. The same complete walk and reaction sequence works.
- [ ] Edit the name and greeting, then save. The preview updates.
- [ ] Quit and reopen from Applications. Your choices are still there.

## Real desktop reminder

Open VS Code, Safari or another normal application. In HydroBuddy, choose **Test Reminder**, then return to that application.

- [ ] The avatar peeks from the right, retreats, walks in and displays the greeting.
- [ ] The question and buttons stay inside the screen, above the Dock.
- [ ] Clicking **Yes** produces a celebration and affirmation, then a wave and exit.
- [ ] Test again: **Not yet** produces the gentle sad reaction and an exit.
- [ ] Test again: the cross dismisses the reminder and both overlay windows disappear.
- [ ] Test again without answering: the question times out after about 45 seconds, then the buddy leaves.
- [ ] While typing in another app, a scheduled reminder does not move keyboard focus or stop typing.
- [ ] The avatar doesn't trap clicks on the underlying app. The speech-bubble buttons still work.

## Timer and tray/menu bar

- [ ] In **Your routine**, enter **1 minute**, leave **Avatar reminders** on and save.
- [ ] Close Settings with the red window button. The droplet stays in the menu bar.
- [ ] Wait a full minute. A visit appears without reopening Settings.
- [ ] Answer it; wait another full minute after the avatar leaves. A second visit appears.
- [ ] Select a 10- or 20-minute preset, save and reopen Settings. The chosen interval remains selected.
- [ ] Turn **Avatar reminders** off and save. The status says reminders are paused. No scheduled visit occurs.
- [ ] **Test Reminder** still works while paused.
- [ ] Pause/resume and Settings work from the droplet menu.
- [ ] **Command+,** opens Settings while HydroBuddy is active; **Command+Q** quits it completely.

## Login startup (test separately)

- [ ] Launch the installed copy from Applications. Turn on **Start when I log in**, save and record any error or approval instruction.
- [ ] If macOS requests Login Items approval, review it yourself in System Settings.
- [ ] Log out and back in, or restart. The droplet should appear quietly without setup reopening.
- [ ] With reminders enabled, verify a scheduled visit after login.
- [ ] Turn startup off, save and repeat the login test. HydroBuddy should stay closed.

Ad-hoc beta signing may prevent login registration. Record a blocked/failed result honestly; do not count it as a pass. Reliable Mac auto-start must also be tested on the final Developer ID signed and notarized app.

## Screen and sleep checks

- [ ] Change display scaling and check that the avatar and bubble fit.
- [ ] If available, connect/disconnect an external monitor. Check primary-display placement.
- [ ] Switch desktop Spaces during a visit. Record visibility and button behavior.
- [ ] Try an app in fullscreen. Record whether the buddy is visible and usable; don't assume normal-window results cover fullscreen.
- [ ] Put the Mac to sleep, wake it and wait a full interval. Missed reminders should not arrive in a burst.
- [ ] Enable Reduce Motion in macOS and check that movement is shortened. Restore your preference afterward if desired.

## Finish and report

- [ ] Restore your preferred interval (for example 60 minutes).
- [ ] Quit from the menu bar. Confirm the droplet and companion disappear.
- [ ] To test uninstall, quit first and move HydroBuddy from Applications to Trash. Preferences intentionally remain in Application Support.

For each failure, record **what you did, what you expected, what happened**, and attach a screenshot or recording. Mark each test **Pass / Fail / Not tested**. An Apple silicon pass does not establish Intel compatibility, and a CI smoke test does not establish real login/reboot or Gatekeeper behavior.
