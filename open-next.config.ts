import { defineCloudflareConfig } from '@opennextjs/cloudflare'

const config = defineCloudflareConfig({
  // Keep the adapter config minimal for now.
  // R2/KV/D1-backed caches can be added later once the bindings exist in Wrangler.
})

export default {
  ...config,
  buildCommand: 'npm run build:next',
}
