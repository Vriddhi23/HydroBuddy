// Development-only pose guide for authoring the complete-body walking sheet.
const fs=require('node:fs'),sharp=require('sharp')
const rad=n=>n*Math.PI/180
function leg(p){
 p=(p+1)%1
 const swing=(p-.6)/.4
 const x=p<.6?-36+72*p/.6:36-72*(swing*swing*(3-2*swing))
 const y=p<.6?452:452-38*Math.sin(Math.PI*swing)
 const dy=y-254,d=Math.hypot(x,dy),a=Math.atan2(x,dy)-Math.acos((108*108+d*d-102*102)/(216*d))
 return {x,y,kx:108*Math.sin(a),ky:254+108*Math.cos(a)}
}
let parts=[]
for(let i=0;i<8;i++){
 const phase=i/8, near=leg(phase),far=leg(phase+.5),angle=-25*Math.cos(phase*2*Math.PI)
 const limb=(l,color)=>`<path d="M 192 254 L ${192+l.kx} ${l.ky} L ${192+l.x} ${l.y}" stroke="${color}"/><path d="M ${192+l.x+9} ${l.y+7} L ${192+l.x-26} ${l.y+7}" stroke="${color}"/>`
 const arm=(a,color,bottle)=>{const ex=192-Math.sin(rad(a))*58,ey=166+Math.cos(rad(a))*58,wx=ex-Math.sin(rad(a+10))*58,wy=ey+Math.cos(rad(a+10))*58;return `<path d="M 192 166 L ${ex} ${ey} L ${wx} ${wy}" stroke="${color}"/>${bottle?`<rect x="${wx-12}" y="${wy-8}" width="24" height="51" rx="7" fill="#58bad3" stroke="#28768d" stroke-width="3"/>`:''}`}
 parts.push(`<g transform="translate(${i%4*384} ${Math.floor(i/4)*512})"><text x="15" y="25" font-size="17" fill="#333">${i+1}</text><path d="M 48 467 H 336" stroke="#b7c6c4" stroke-width="2"/><g fill="none" stroke-width="19" stroke-linecap="round" stroke-linejoin="round">${limb(far,'#a0b9c5')}${arm(-angle,'#a0b9c5',false)}<path d="M 192 147 L 192 254" stroke="#343d43"/>${limb(near,'#343d43')}<circle cx="192" cy="86" r="58" stroke="#343d43" fill="#fff" stroke-width="4"/><path d="M 139 85 L 122 93 L 139 98" stroke="#343d43" stroke-width="4"/>${arm(angle,'#343d43',true)}</g></g>`)
}
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024"><rect width="100%" height="100%" fill="#f8faf9"/>${parts.join('')}</svg>`
fs.writeFileSync('docs/walk-pose-guide.svg',svg)
sharp(Buffer.from(svg)).png().toFile('docs/walk-pose-guide.png')
