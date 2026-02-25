import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value || value.trim() === '') {
    throw new Error(`Environment variable ${name} is required but was not provided.`)
  }
  return value
}

function getRequiredPort(name: string): number {
  const raw = getRequiredEnv(name)
  const port = Number(raw)
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`Environment variable ${name} must be a valid port number, got "${raw}".`)
  }
  return port
}

export const config = {
  port: getRequiredPort('PORT'),
  system1Repository: getRequiredEnv('SYSTEM1_REPOSITORY'),
  dataFolder: path.resolve(getRequiredEnv('DATA_FOLDER')),
}

export const paths = {
  data: config.dataFolder,
  temp: path.resolve(config.dataFolder, 'temp'),
  snapshots: path.resolve(config.dataFolder, 'snapshots'),
  database: path.resolve(config.dataFolder, 'db.sqlite'),
}