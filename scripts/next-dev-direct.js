/* eslint-disable no-console */
/**
 * Workaround for environments where Node IPC (stdio: 'ipc') is blocked.
 * Next's `next dev` CLI uses `child_process.fork()` which requires IPC.
 * This runner starts the dev server in-process via `startServer()`.
 */

const { startServer } = require('next/dist/server/lib/start-server')
const net = require('node:net')

function parsePort() {
  const raw = process.env.PORT || '3000'
  const port = Number.parseInt(raw, 10)
  return Number.isFinite(port) ? port : 3000
}

async function probePort(hostname, port) {
  return await new Promise((resolve) => {
    const server = net.createServer()
    server.unref()
    server.once('error', (err) => resolve({ ok: false, err }))
    server.listen({ host: hostname, port }, () => {
      const address = server.address()
      const selectedPort = typeof address === 'object' && address ? address.port : port
      server.close(() => resolve({ ok: true, port: selectedPort }))
    })
  })
}

async function choosePort(hostname, requestedPort) {
  const candidates = [requestedPort, ...Array.from({ length: 10 }, (_, i) => requestedPort + i + 1), 0]
  for (const candidate of candidates) {
    const result = await probePort(hostname, candidate)
    if (result.ok) return result.port
  }
  return 0
}

async function main() {
  const dir = process.cwd()
  const hostname = process.env.HOSTNAME || '127.0.0.1'
  const requestedPort = parsePort()
  const port = await choosePort(hostname, requestedPort)

  process.env.NODE_ENV = 'development'
  process.env.TURBOPACK ??= 'auto'

  await startServer({
    dir,
    port,
    hostname,
    isDev: true,
    minimalMode: false,
    allowRetry: true,
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
