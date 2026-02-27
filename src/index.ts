import 'reflect-metadata'
import fs from 'fs'
import path from 'path'
import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { AppDataSource } from './data/data_source.js'
import { config, paths } from './config.js'
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
  '/assets/*',
  serveStatic({
    root: path.join(process.cwd(), 'public'),
    rewriteRequestPath: (requestPath) => requestPath.replace(/^\/assets/, ''),
  }),
)

// Snapshots
app.use(
  '/snapshots/*',
  serveStatic({
    root: snapshotsRoot,
    rewriteRequestPath: (requestPath) => requestPath.replace(/^\/snapshots/, ''),
  }),
)

console.log(`Serving snapshots from ${snapshotsRoot}`)

app.route("/", routes)

// Initialize database
if (!AppDataSource.isInitialized) {
  await AppDataSource.initialize().catch((err) => {
    console.error('Error during Data Source initialization', err)
    process.exit(1)
  })
  console.log('Database initialized')
}

export default app