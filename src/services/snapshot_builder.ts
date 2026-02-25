import { exec as execCb } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { AppDataSource } from '../data/data_source.js'
import { Snapshot } from '../entities/snapshot.js'

dotenv.config()

const exec = promisify(execCb)

const SYSTEM1_REPOSITORY =
  process.env.SYSTEM1_REPOSITORY || 'https://github.com/tuliptrust/tulip.git'
const TEMPORARY_FOLDER = process.env.TEMPORARY_FOLDER || './data/temp'
const SNAPSHOTS_FOLDER = process.env.SNAPSHOTS_FOLDER || './data/snapshots'

const REPO_DIR = path.resolve(TEMPORARY_FOLDER, 'system1-repo')

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
  await ensureDir(TEMPORARY_FOLDER)

  if (!fs.existsSync(REPO_DIR)) {
    console.log('Cloning System 1 repository...')
    await run(`git clone ${SYSTEM1_REPOSITORY} "${REPO_DIR}"`)
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
  const distDir = path.join(REPO_DIR, 'dist') // Astro default
  if (!fs.existsSync(distDir)) {
    throw new Error(`Build output not found at: ${distDir}`)
  }

  await ensureDir(SNAPSHOTS_FOLDER)
  const targetFolderName = String(snapshotId)
  const targetPath = path.join(SNAPSHOTS_FOLDER, targetFolderName)

  await fs.promises.rm(targetPath, { recursive: true, force: true })
  // fs.cp is available in Node 16+
  await fs.promises.cp(distDir, targetPath, { recursive: true })

  return targetFolderName
}

export async function createSnapshot(options: {
  submitter: string
  label?: string
  gitRef?: string
}) {
  const { submitter, label, gitRef } = options
  const refToUse = gitRef && gitRef.trim().length > 0 ? gitRef.trim() : 'main'

  const snapshotRepo = AppDataSource.getRepository(Snapshot)

  // Step 1: build System 1 at given ref and obtain commit hash
  const commitHash = await prepareRepo(refToUse)

  // Step 2: create DB row to get ID
  let snapshot = snapshotRepo.create({
    submitter,
    label: label || null,
    gitRef: refToUse,
    commitHash,
    folder: '', // fill after copy
  })
  snapshot = await snapshotRepo.save(snapshot)

  // Step 3: copy built dist into its own folder
  const folderName = await copyDistToSnapshotFolder(snapshot.id)
  snapshot.folder = folderName

  // Step 4: save folder info
  snapshot = await snapshotRepo.save(snapshot)

  return snapshot
}