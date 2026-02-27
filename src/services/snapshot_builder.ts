import { exec as execCb } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import { AppDataSource } from '../data/data_source.js'
import { Snapshot } from '../entities/snapshot.js'
import { config, paths } from '../config.js'

const exec = promisify(execCb)

const REPO_DIR = path.resolve(paths.temp, 'system1-repo')

async function ensureDir(dir: string) {
  await fs.promises.mkdir(dir, { recursive: true })
}

async function run(cmd: string, cwd?: string) {
  const { stdout, stderr } = await exec(cmd, {
    cwd,
    maxBuffer: 10 * 1024 * 1024,
  })
  if (stdout.trim()) console.log(stdout)
  if (stderr.trim()) console.error(stderr)
}

async function prepareRepo(gitRef: string) {
  await ensureDir(paths.temp)

  if (!fs.existsSync(REPO_DIR)) {
    console.log('Cloning System 1 repository...')
    await run(`git clone ${config.system1Repository} "${REPO_DIR}"`)
  }

  console.log('Fetching latest changes...')
  await run('git fetch --all', REPO_DIR)

  console.log(`Checking out ${gitRef}...`)
  await run(`git checkout ${gitRef}`, REPO_DIR)
  await run(`git pull --ff-only origin ${gitRef}`, REPO_DIR)

  // Install deps only once (basic heuristic)
  const nodeModules = path.join(REPO_DIR, 'node_modules')
  if (!fs.existsSync(nodeModules)) {
    console.log('Installing dependencies...')
    await run('pnpm install', REPO_DIR)
  }

  console.log('Building System 1...')
  await run('pnpm run build', REPO_DIR)

  console.log('Getting commit hash...')
  const { stdout } = await exec('git rev-parse HEAD', { cwd: REPO_DIR })
  return stdout.trim()
}

async function copyDistToSnapshotFolder(snapshotId: number) {
  const distDir = path.join(REPO_DIR, 'dist')
  if (!fs.existsSync(distDir)) {
    throw new Error(`Build output not found at: ${distDir}`)
  }

  await ensureDir(paths.snapshots)
  const targetFolderName = String(snapshotId)
  const targetPath = path.join(paths.snapshots, targetFolderName)

  await fs.promises.rm(targetPath, { recursive: true, force: true })
  await fs.promises.cp(distDir, targetPath, { recursive: true })

  return targetFolderName
}

// Fix asset URLs that Astro generated as root-relative, e.g. "/relative/..."
// to be relative to the snapshot, e.g. "./relative/..."
async function fixSnapshotHtml(snapshotDir: string) {
  const indexPath = path.join(snapshotDir, 'index.html')

  if (!fs.existsSync(indexPath)) {
    console.warn(`No index.html found in snapshot dir: ${indexPath}`)
    return
  }

  let html = await fs.promises.readFile(indexPath, 'utf8')
  html = html.replace(/="\/relative\//g, '="./relative/')

  await fs.promises.writeFile(indexPath, html, 'utf8')
}

export async function createSnapshot(options: {
  submitter: string
  gitRef?: string
}) {
  const { submitter, gitRef } = options
  const refToUse = gitRef && gitRef.trim().length > 0 ? gitRef.trim() : 'main'

  const snapshotRepo = AppDataSource.getRepository(Snapshot)

  // Step 1: build System 1 at given ref and obtain commit hash
  const commitHash = await prepareRepo(refToUse)

  // Step 2: create DB row to get ID
  let snapshot = snapshotRepo.create({
    submitter,
    gitRef: refToUse,
    commitHash,
    folder: '', // fill after copy
  })
  snapshot = await snapshotRepo.save(snapshot)

  // Step 3: copy built dist into its own folder
  const folderName = await copyDistToSnapshotFolder(snapshot.id)
  snapshot.folder = folderName

  // Step 4: fix asset URLs inside the snapshot’s HTML
  const snapshotDir = path.join(paths.snapshots, folderName)
  await fixSnapshotHtml(snapshotDir)

  // Step 5: save folder info
  snapshot = await snapshotRepo.save(snapshot)

  return snapshot
}

export async function removeSnapshot(snapshotId: number) {
  const snapshotRepo = AppDataSource.getRepository(Snapshot)

  const snapshot = await snapshotRepo.findOne({ where: { id: snapshotId } })
  if (!snapshot) {
    throw new Error(`Snapshot ${snapshotId} not found`)
  }

  const snapshotDir = path.join(paths.snapshots, snapshot.folder)
  await fs.promises.rm(snapshotDir, { recursive: true, force: true })
  await snapshotRepo.remove(snapshot)
}