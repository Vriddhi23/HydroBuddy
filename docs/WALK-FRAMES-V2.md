# HydroBuddy walking frames · version 1.7

Created with the built-in image-generation tool. The user's walking diagram supplied the movement reference; the reference image itself is not distributed. Generated sheets that repeated the same leading leg were rejected. Final poses were generated and corrected individually, then reviewed by following the visible pants seam and which thigh overlaps the other.

## Final assets and order

All files are 1024 × 1536 RGBA PNGs in `src/renderer/public/walk-v2/`. Both jeans legs use light blue. Render the complete body at 135 ms per frame (1.08 seconds per cycle), with a shared ground line and scale registration. No limb cutting or recoloring is done in the renderer.

| File | Support / swing |
|---|---|
| step-01.png | Near foot forward contact; far toe trailing |
| step-02.png | Near foot supports; far heel lifts behind |
| step-03.png | Near foot supports; far leg folds and passes behind |
| step-04.png | Near foot trails; far leg unfolds and reaches ahead |
| step-05.png | Far foot forward contact; near toe trailing |
| step-06.png | Far foot supports; near heel lifts behind |
| step-07.png | Far foot supports; near leg folds and passes in front |
| step-08.png | Far foot trails; near leg unfolds and reaches ahead |

Peek, response art, direction and travel duration are unchanged. Generation is a development step only; HydroBuddy loads these local files without an AI API or internet connection.

## Prompt set

### Base opposite-foot contact
Create ONE complete full-body animation key pose of the HydroBuddy woman from image2. Image1 is the exact skeleton pose to dress with her artwork. Turn her to LEFT-facing side profile. Long black wavy hair, same face, white tee, SAME LIGHT BLUE jeans on BOTH legs, white sneakers, blue bottle held LOW in the NEAR hand. Keep all body parts connected. The camera-side NEAR leg is the orange leg of the guide and is BEHIND the body, extending down and RIGHT to trailing toe. The FAR leg is the blue leg of the guide and reaches FORWARD to LEFT with heel on floor. Follow those exact joint positions and limb overlap. The near arm swings FORWARD DOWN LEFT, holding bottle around thigh height; far arm swings BACK DOWN RIGHT. Whole arm visible, bottle remains gripped, no raised chest-level bottle. No changing leg colors to indicate depth, both light blue #91bbd1. This is single pose 6: far foot forward, near foot behind, near hand forward. NOT near foot forward! Use the pose guide for geometry, portrait only for identity. Crisp clean friendly cartoon. Canvas portrait 1024x1536, whole character same scale as portrait, transparent padding 8% top and bottom and 12% sides, centered pelvis x50%, soles at y90%, head at y8%. Truly transparent background, no glow/shadows/gradients/marks/text.

### Base leg overlap correction
Edit this single LEFT-facing woman ONLY below the jeans waistband. Preserve her exact head, hair, face, torso, arms, bottle, illustration style, canvas and transparent background.
Her legs must be exchanged in DEPTH, not by color. The entire visible pants panel with the rear pocket and outer side seam must lead to the BACKWARD shoe on the RIGHT. Currently that large frontmost pants panel incorrectly leads to the left shoe. Redraw that frontmost thigh from the right hip diagonally DOWN-RIGHT, toward the right knee and the right trailing shoe. Its outer seam must slope like backslash \ (down-right), not slash / (down-left). The other thigh, BEHIND it, extends diagonally DOWN-LEFT to the LEFT forward shoe. At the crossing, the rightward thigh is on TOP, covering the leftward thigh. Both jeans legs stay identical pale/light blue. Keep the same two shoes and their positions on the floor. Do not move shoes, do not change hands, do not add any body parts. The near arm is forward while the near leg is backward. This is one exact depth correction at the hips and thighs, necessary for an alternating walk cycle.

### Base transparent cutout correction
Remove ALL background from this exact full-body character image. The current file has a semi-opaque dark gradient around the person: replace every background pixel with actual fully transparent alpha. Preserve the woman's EXACT silhouette, face, body, pose, clothes, light-blue jeans, bottle and scale. Critically preserve the large near pants panel going DOWN-RIGHT and OVER the far leg going DOWN-LEFT: do not reverse the thigh overlap. Do not change any character artwork. No dark backdrop, halo, glow, shadow, floor or checkerboard. Deliver a clean RGBA PNG transparent cutout, same1024x1536 canvas, fully transparent outside character.

### Source pose 1

Precise animation-frame edit. Change ONLY the legs to CONTACT: the near leg, continuous with the visible back-pocket panel, extends forward DOWN-LEFT to a heel on the ground at left x260 y1430. The far leg extends backward DOWN-RIGHT, to right toe on the ground x800 y1430. Both legs mostly straight, near thigh overlays far thigh at crossing. Preserve EXACT upper body, arms, hands, bottle and their positions from this image. Particularly keep the large visible near sleeve and arm extending down-right, holding the bottle at right. Only edit legs/shoes. Keep same canvas1024x1536, scale, face, hair, body and light blue color on BOTH jeans legs. No dark leg. Keep transparent alpha and no floor/background/shadows. The entire character remains intact.

### Source pose 2

Edit the reference woman into ONE complete walking pose 2. Preserve exactly head, hair, face, white tee, body proportions and 1024x1536 canvas. Crown y85, soles baseline y1430, hips x530 y745, same zoom and identity. Jeans BOTH the SAME PALE LIGHT BLUE, no dark leg. Strict LEFT-facing profile. NEAR leg supports the body, foot flat on floor slightly LEFT of pelvis, knee only slightly soft. FAR leg has just left ground behind on RIGHT: its thigh goes down-right, knee bends, shoe lifts backwards/upwards, foot stays behind support ankle. Do not put far knee ahead yet. NEAR arm holding bottle is swinging backward: from visible camera-side sleeve around x480 y535, upper arm angles DOWN-RIGHT to elbow x560 y700, forearm continues down-right to gripping hand x640 y850, bottle hangs at x685 y915. It is the FRONTMOST arm, drawn across side of torso. FAR empty arm behind torso angles down-left, empty hand x330 y850. Do not transfer bottle to the arm emerging behind hair. Continuous connected complete body. Use exact joint and layering descriptions. No duplicate limbs, no disappearing bottle. Transparent alpha outside figure; no shadows, text, gradient or background.

### Source pose 3

Edit the reference woman into ONE complete walking animation pose 3. Keep EXACT same identity, body proportions, white tee, hair silhouette, head placement, scale, full canvas 1024x1536 and pale LIGHT BLUE color on BOTH jeans legs. Same blue bottle in near hand in every frame. Whole body connected. Strict LEFT-facing profile. Do not change face or turn head. Sole baseline y1430, crown y85, pelvis around x530 y745. Feet can move horizontally around center; no clipping. Do not redraw at a different zoom. PASS B: NEAR leg is the planted support leg almost straight, under the pelvis, shoe on floor directly below hip. FAR knee folds FORWARD LEFT, far heel lifts BEHIND RIGHT, foot elevated 120px above floor, passing BEHIND the planted near leg. Near leg must occlude the folded far thigh at crossing. The far shoe is visible just behind right side of support shin. BOTH arms near vertical, near bottle hand slightly behind/right at thigh height. No lifting support foot. Follow this exact geometric description. Only limbs and subtle body weight shift change. No floating, marching or squat. True transparent alpha, no floor, shadows, gradient, text or props besides bottle.

### Source pose 4

Edit the reference woman into ONE complete walking pose 4. Preserve exactly head, hair, face, white tee, body proportions and 1024x1536 canvas. Crown y85, soles baseline y1430, hips x530 y745, same zoom and identity. Jeans BOTH the SAME PALE LIGHT BLUE, no dark leg. Strict LEFT-facing profile. FAR leg is reaching FORWARD LEFT, unfolding from its bent knee: far thigh down-left, far knee x370 y1000, far ankle x290 y1380, left shoe toe slightly up with heel 30px ABOVE floor. NEAR support leg (large panel from visible rear pocket) extends DOWN-RIGHT to trailing shoe x760 on floor y1430, heel lifting. At thigh crossing, this rightward near leg overlays the leftward far leg. Its main contour slopes DOWN-RIGHT. BOTH legs same pale light blue. NEAR hand holding bottle swings gently forward low left x350 y850. Far hand moves back right. One supporting foot stays on floor. Continuous connected complete body. Use exact joint and layering descriptions. No duplicate limbs, no disappearing bottle. Transparent alpha outside figure; no shadows, text, gradient or background.

### Source pose 7

Precise animation-frame edit. Change ONLY the DEPTH ORDER of the pants legs. The large frontmost pants panel attached to the visible BACK POCKET must lead DOWN-RIGHT to the RAISED RIGHT SHOE. That rightward thigh must cover the leftward supporting thigh at their overlap. Draw its continuous leading contour from crotch x440 y780 diagonally down-right to knee x600 y1030 then shin to raised right shoe. It must NOT lead to the planted left shoe. The supporting FAR leg is BEHIND it and reaches down to the LEFT planted shoe. Do not change either shoe's position. Preserve entire upper body and bottle exactly. This is same jeans color on both legs, only the seam/occlusion changes. Keep same canvas1024x1536, scale, face, hair, body and light blue color on BOTH jeans legs. No dark leg. Keep transparent alpha and no floor/background/shadows. The entire character remains intact.

### Source pose 8

Edit ONLY the arms and bottle in this walking frame. Keep the exact bent NEAR leg crossing IN FRONT of the straight planted far leg. Do not change legs, hips, face, hair, scale or canvas. This is the mid-swing arm position: the NEAR arm attached to the visible white sleeve should hang almost VERTICALLY downward, elbow x455 y720, gripping hand x455 y900; bottle hangs low beside hip at x425 y970. FAR empty arm also almost vertical just behind torso, hand x640 y900. Neither hand extends far forward or far backward. Same bottle remains in the near hand. Keep pale light blue on BOTH legs, preserve transparent alpha background and connected whole character. No shadows/gradient/text.

### Source pose 9

Precise animation-frame edit. Change ONLY the legs to REACH: the near leg, continuous with the visible back-pocket panel, unfolds forward DOWN-LEFT, leading left shoe x230 with heel 30px above the floor baseline y1430, toe pointing slightly up. The far supporting leg extends BACK DOWN-RIGHT to planted right shoe x800 on floor y1430, heel starts lifting. Near thigh overlays far thigh at crossing. This is the moment immediately BEFORE near-foot contact. Preserve EXACT upper body, arms, hands, bottle and their positions. Keep the large visible near sleeve and arm down-right holding bottle at right. Only edit legs/shoes. Keep same canvas1024x1536, scale, face, hair, body and light blue color on BOTH jeans legs. No dark leg. Keep transparent alpha and no floor/background/shadows. The entire character remains intact.

