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
    sendResetPassword: async ({ user, url }) => {
      console.info(`[auth] Password reset requested for ${user.email}`);
      console.info(`[auth] Reset link: ${url}`);
    },
  },
  twoFactor: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      enabled: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    },
  },
});