import 'reflect-metadata'
import fs from 'fs'
import path from 'path'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { AppDataSource } from './data/data_source.js'
import { paths } from './config.js'
import { routes } from './routes/index.js'

function ensureDirSync(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

const app = new Hono()

const snapshotsRoot = paths.snapshots
const tempRoot = paths.temp

ensureDirSync(snapshotsRoot)
ensureDirSync(tempRoot)

// Static assets
app.use(
  '/public/*',
  serveStatic({
    root: path.join(process.cwd(), 'public'),
    rewriteRequestPath: (requestPath) => requestPath.replace(/^\/public/, ''),
  }),
)

// Snapshots
app.use('/snapshots/*', serveStatic({
  root: paths.data,
}))

console.log(`Serving snapshots from ${snapshotsRoot}`)

app.route('/', routes)

// Initialize database
if (!AppDataSource.isInitialized) {
  await AppDataSource.initialize().catch((err) => {
    console.error('Error during Data Source initialization', err)
    process.exit(1)
  })
  console.log('Database initialized')
}

// Start HTTP server here
const port = Number(process.env.PORT || 3001)
console.log(`Hono server listening on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0',
})