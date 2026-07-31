import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB()
        const user = await User.findOne({ email: credentials.email })
        if (!user) return null
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )
        if (!valid) return null
        return { id: user._id.toString(), email: user.email, name: user.name }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const publicPaths = ["/", "/login", "/signin", "/about", "/contact", "/faq", "/terms", "/privacy"]
      if (publicPaths.includes(nextUrl.pathname)) return true
      return !!auth?.user
    },
  },
})