const sharp = require('sharp')
const fs = require('node:fs')

async function run() {
  const parts = []
  for (const [kind, size] of [['icp4',16],['icp5',32],['icp6',64],['ic07',128],['ic08',256],['ic09',512],['ic10',1024]]) {
    const png = await sharp('resources/icon.svg').resize(size, size).png().toBuffer()
    const header = Buffer.alloc(8); header.write(kind); header.writeUInt32BE(png.length + 8, 4)
    parts.push(header, png)
  }
  const data = Buffer.concat(parts), header = Buffer.alloc(8)
  header.write('icns'); header.writeUInt32BE(data.length + 8, 4)
  fs.writeFileSync('resources/icon.icns', Buffer.concat([header, data]))
  const drop = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18"><path fill="black" d="M9 1C7 4 3 8 3 11a6 6 0 0 0 12 0c0-3-4-7-6-10Z"/></svg>')
  for (const [name, size] of [['trayTemplate.png',18],['trayTemplate@2x.png',36]]) await sharp(drop).resize(size,size).png().toFile('resources/'+name)
  console.log('Created Mac ICNS icon and light/dark menu-bar template icons.')
}
run().catch(error => { console.error(error); process.exitCode = 1 })
