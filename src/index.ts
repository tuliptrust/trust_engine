import 'reflect-metadata'
import fs from 'fs'
import { serve } from '@hono/node-server'
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

app.use(
  '/snapshots/*',
  serveStatic({
    root: snapshotsRoot,
    rewriteRequestPath: (path) => path.replace(/^\/snapshots/, ''),
  }),
)

console.log(`Serving snapshots from ${snapshotsRoot}`)

app.route("/", routes);

const port = config.port

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