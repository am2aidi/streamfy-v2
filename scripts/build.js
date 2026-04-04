const { spawnSync } = require('node:child_process')

const isWindows = process.platform === 'win32'
const npmCommand = isWindows ? 'npm.cmd' : 'npm'

const targetScript = process.env.VERCEL === '1' ? 'build:next' : 'build:cloudflare'

const result = spawnSync(npmCommand, ['run', targetScript], {
  stdio: 'inherit',
  env: process.env,
  shell: isWindows,
})

if (result.error) {
  throw result.error
}

process.exit(result.status ?? 1)
