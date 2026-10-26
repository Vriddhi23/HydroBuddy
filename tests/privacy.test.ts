import { describe, it, expect } from 'vitest'
import { allowedResource } from '../src/main/networkPolicy'

describe('offline network boundary', () => {
  it.each(['https://example.com/personal-data', 'http://127.0.0.1:9000', 'ws://localhost:5173', 'wss://example.com', 'ftp://example.com', 'file://server/share/avatar.png', 'file:////server/share/avatar.png', 'file:///%2fserver/share/avatar.png', 'javascript:alert(1)', 'not a URL'])('blocks %s in installed builds', url => {
    expect(allowedResource(url)).toBe(false)
  })
  it.each(['file:///C:/app/out/index.html', 'file:///Applications/HydroBuddy.app/Contents/index.html', 'data:image/png;base64,AAAA', 'blob:file:///123', 'about:blank'])('keeps local artwork/UI available: %s', url => {
    expect(allowedResource(url)).toBe(true)
  })
  it('only permits the exact loopback development server and its hot-reload socket', () => {
    const dev = 'http://localhost:5173'
    expect(allowedResource(`${dev}/src.tsx`, dev)).toBe(true)
    expect(allowedResource('ws://localhost:5173/', dev)).toBe(true)
    for (const url of ['http://localhost:5174', 'http://localhost.evil.test:5173', 'http://localhost:5173@evil.test', 'https://localhost:5173', 'http://127.0.0.1:5173', 'http://user:password@localhost:5173']) expect(allowedResource(url, dev)).toBe(false)
    expect(allowedResource('https://example.com', 'https://example.com')).toBe(false)
  })
})
