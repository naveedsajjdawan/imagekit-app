import NextAuth,{DefaultSession} from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      passwordRequiresReset?: boolean
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    passwordRequiresReset?: boolean
  }
}