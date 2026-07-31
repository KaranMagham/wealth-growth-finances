// lib/auth.ts
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
if (!uri) {
  throw new Error("Please define MONGODB_URI");
}

const client = new MongoClient(uri);
const dbPromise = client.connect().then((c) => c.db());

export const auth = betterAuth({
  database: mongodbAdapter(await dbPromise), // Node 22: top-level await OK
  emailAndPassword: {
    enabled: true,
  },
  twoFactor: {
    enabled: true,
  },
  // providers: [...] for Google/GitHub later
});