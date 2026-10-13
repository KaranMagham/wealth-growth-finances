import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { sendPasswordResetEmail } from "@/lib/email";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Please define MONGODB_URI");
}

declare global {
  // Keep one MongoClient across hot reloads in development.
  var betterAuthMongoClient: MongoClient | undefined;
}

const client =
  global.betterAuthMongoClient ??
  new MongoClient(uri);

global.betterAuthMongoClient = client;
const db = client.db();

const trustedOrigins = [
  "http://localhost:3000",
  process.env.BETTER_AUTH_URL,
].filter(Boolean) as string[];

export const auth = betterAuth({
  baseURL:
    process.env.BETTER_AUTH_URL || "http://localhost:3000",

  trustedOrigins,

  database: mongodbAdapter(db),

  emailAndPassword: {
    enabled: true,

    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({
        user,
        url,
      });
    },
  },

  twoFactor: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: Boolean(
        process.env.GOOGLE_CLIENT_ID &&
        process.env.GOOGLE_CLIENT_SECRET
      ),
    },

    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      enabled: Boolean(
        process.env.GITHUB_CLIENT_ID &&
        process.env.GITHUB_CLIENT_SECRET
      ),
    },
  },
});