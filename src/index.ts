import 'reflect-metadata'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { shell } from './routes/shell.js'
import { admin } from './routes/admin.js'
import { AppDataSource } from './data/data_source.js'

dotenv.config()

function ensureDirSync(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

const app = new Hono()

// Resolve and ensure folders exist
const SNAPSHOTS_FOLDER = process.env.SNAPSHOTS_FOLDER || './data/snapshots'
const TEMPORARY_FOLDER = process.env.TEMPORARY_FOLDER || './data/temp'

const snapshotsRoot = path.resolve(SNAPSHOTS_FOLDER)
const tempRoot = path.resolve(TEMPORARY_FOLDER)

ensureDirSync(snapshotsRoot)
ensureDirSync(tempRoot)

// Serve built snapshots as static files
const dataDir = path.dirname(snapshotsRoot) // Get parent directory (./data)

console.log(`Serving snapshots from ${snapshotsRoot}`);
console.log(`Static root set to ${dataDir}`);

// Register the middleware with the app
app.use('/snapshots/*', serveStatic({
  root: dataDir,
}))

// Mount routes
app.route('/', shell)
app.route('/admin', admin)

const port = Number(process.env.PORT || 3000)

AppDataSource.initialize()
  .then(() => {
    serve(
      {
        fetch: app.fetch,
        port,
      },
      (info) => {
        console.log(`Server is running on http://localhost:${info.port}`)
      },
    )
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err)
    process.exit(1)
  })