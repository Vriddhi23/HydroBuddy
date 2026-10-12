# Whole-body walk frames — version 1.6

Created with the built-in image-generation tool from the supplied avatar and the user's boy-walking reference. The application loads only the finished local artwork; no generation API runs in the product.

Final asset: `src/renderer/public/buddy-walk-steps.png` (1536 × 1024 RGBA, twelve complete poses). Rows play in order at 90 ms per pose. The renderer crops and registers complete frames; it does not stretch individual limbs. Peek and response artwork remain in `buddy-motion-atlas.png`.

## Initial prompt

Create a complete-body walking animation SPRITE SHEET for HydroBuddy. Image 1 is the ONLY identity/art-style reference: preserve this same woman, face, long black hair, white tee, light-blue jeans, white shoes and blue bottle. Images 2–5 are key frames of a male walking reference. Use ONLY their whole-body gait: weight shifts through hips, torso subtly tilts/rotates, shoulders counter-rotate, knees bend and the feet pass; arms swing naturally opposite the legs. Do not copy his identity, clothes, green background, UI, or male anatomy. MIRROR his direction: woman must face LEFT in every frame.

OUTPUT: true TRANSPARENT alpha PNG; absolutely NO background, vignette, shadow, floor, grid or text. Exactly 12 complete women arranged in a precise FOUR-column THREE-row grid. Each cell contains ONE entire unbroken person including both shoes, with comfortable margins. Consistent scale, waist centered, same ground baseline per cell. This is full-body frame animation, not a cutout rig. All torso/hips/legs are connected and drawn together. Keep subtle natural body rise/fall and shoulder/hip rotation within each pose; do NOT freeze the upper body.

Reading order is one WALK cycle, 12 consecutive poses:
1 LEFT/near heel forward contact, right/far toe behind; near bottle arm back.
2 weight settles on near leg, far heel lifts.
3 far foot leaves ground and far knee folds.
4 far bent knee passes the planted near leg, far foot visibly elevated.
5 far knee moves forward; far lower leg unfolds ahead.
6 far heel reaches forward, near heel lifts.
7 FAR heel forward contact, near toe behind; near bottle arm forward.
8 weight settles on far leg, near heel lifts.
9 near foot leaves ground and near knee folds.
10 near bent knee passes the planted far leg, near foot visibly elevated.
11 near knee moves forward; near lower leg unfolds ahead.
12 near heel reaches forward ready to loop to1.

The nearer leg must be visibly in front of the farther leg at the crossing. Light blue near leg, subtly darker blue far leg; same jeans. In frames4 and10, visibly different knees are bent and elevated. No repeated static scissor legs. One supporting foot on the ground at all times. Do not squat: normal upright relaxed human walk, modest knee bend on support leg and clearly folded swing knee. Not marching, jumping, tiptoeing or running. Bottle arm swings around the hip, bottle held LOW beside thigh during walking, gently forward/back with same hand. NO stiff arm holding bottle against chest. Body has gentle natural weight shift as in reference footage. Hair softly follows shoulder movement, not separate bouncing pieces. Keep original woman's beautiful friendly proportions. Every pose must be an intact, polished complete character, matching the original illustration. True alpha outside every silhouette; no colored fringe.

## Final correction prompt

Edit this twelve-frame walking sprite sheet, preserving exact canvas/grid, same woman's identity, outfit, proportions, hair, left-facing direction and connected whole-body artwork. Make the walking cycle anatomically readable through NEAR/FAR LEG DEPTH and OPPOSING ARMS.

Rows1–2 first SIX poses: near leg (camera-side, lighter blue jeans) is the planted/supporting leg; the FAR leg is medium-dark blue jeans, passes BEHIND it and folds forward. Specifically frame4 (top-right) and frame5 (second row left): the bent lifted leg is BEHIND the straight planted light-blue near leg, not painted across its front. Then far leg reaches ahead in frame6.
Last SIX poses (frame7 onward): far/darker leg is the planted supporting leg; near/light-blue leg swings, bends and crosses IN FRONT of the planted darker leg in frames9–10. Same near/far leg colors maintained throughout all12 frames, no sudden swapping of pants colors.

BOTTLE ARM: it is the NEAR arm, same hand all frames. At frame1 (near foot forward) arm and bottle are low and BEHIND the hip. At frame4 bottle arm passes down beside the waist. At frame7 (far foot forward) bottle arm swings gently FORWARD and bottle is low in front of the hip. At frame10 the bottle arm passes DOWN beside the waist. Then returns behind by frame12. The other hand swings opposite. Bottle remains held naturally at all times. No stiff raised elbow or bottle held against chest. Do not let bottle jump between far and near hands. Make elbow bends gentle, and attach arms naturally to shoulders. Torso and hips turn subtly with weight transfer; keep same coherent whole-body silhouettes.

No other design change. Preserve each complete figure. EXACT 4 columns x3 rows,12 frames, same canvas size1536x1024. Keep actual transparent alpha outside characters; no visible background or gradient, floor, shadows, text or guides. Crisp dark outlines.

