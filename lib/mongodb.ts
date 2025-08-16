import { MongoClient, type Db } from "mongodb"

let client: MongoClient | null = null
let database: Db | null = null

export async function getDatabase(): Promise<Db> {
  // Skip database operations during build time
  if (process.env.NODE_ENV === "production" && !process.env.MONGODB_URI) {
    throw new Error("Database not available during build time")
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set")
  }

  // Return cached database if available
  if (database) {
    return database
  }

  // Create new connection only when needed
  if (!client) {
    const uri = process.env.MONGODB_URI
    client = new MongoClient(uri)
    await client.connect()
  }

  database = client.db("salon_management")
  return database
}

export async function connectToDatabase(): Promise<{ client: MongoClient; database: Db }> {
  // Skip database operations during build time
  if (process.env.NODE_ENV === "production" && !process.env.MONGODB_URI) {
    throw new Error("Database not available during build time")
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set")
  }

  // Return cached connection if available
  if (client && database) {
    return { client, database }
  }

  // Create new connection only when needed
  if (!client) {
    const uri = process.env.MONGODB_URI
    client = new MongoClient(uri)
    await client.connect()
  }

  database = client.db("salon_management")
  return { client, database }
}

export async function closeConnection(): Promise<void> {
  if (client) {
    await client.close()
    client = null
    database = null
  }
}
