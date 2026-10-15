const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')

const directory = path.resolve('release')
const label = `${process.platform}-${process.arch}`
const names = fs.readdirSync(directory).filter(name => process.platform === 'darwin'
  ? name.endsWith(`-mac-${process.arch}.dmg`) : name === 'HydroBuddy-Setup.exe').sort()
if (!names.length) throw new Error('No installer found for this platform. Package the app first.')
const rows = names.map(name => `${crypto.createHash('sha256').update(fs.readFileSync(path.join(directory,name))).digest('hex')}  ${name}`)
fs.writeFileSync(path.join(directory,`SHA256SUMS-${label}.txt`), rows.join('\n')+'\n')
console.log(rows.join('\n'))
