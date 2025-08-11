import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "./db";
import User from "@/models/user";
import bcrypt from "bcrypt"

const passwordMeetsPolicy = (pwd: string): boolean => {
  return /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd) && /[!@#$%^&*(),.?":{}|<>]/.test(pwd) && pwd.length >= 8
}

export const authOptions: NextAuthOptions = {

providers: [
   CredentialsProvider({

       name: "Credentials",
       credentials:{
           email: {label: "Email", type: "text"},
           password: {label:"password", type:"password"}
       },

       async authorize(credentials) {
        if(!credentials?.email || !credentials.password)
        {
            throw new Error("Email or password not validate")
        }
        try {
            await connectToDatabase()
            const user = await User.findOne({email: credentials.email})

            if(!user)
            {
                throw new Error("user not found with this email")
            }
            const isValid = await bcrypt.compare(credentials.password, user.password)
            if(!isValid)
            {
                throw new Error("password mismatch")
            }

            // Determine if password needs upgrade (legacy weak password)
            const needsPasswordReset = !passwordMeetsPolicy(credentials.password)

            if (needsPasswordReset && !user.passwordRequiresReset) {
              user.passwordRequiresReset = true
              await user.save()
            }

            return {
                id: user._id.toString(),
                email: user.email,
                name: user.name || undefined,
                image: user.avatarUrl || undefined,
                passwordRequiresReset: needsPasswordReset || !!user.passwordRequiresReset,
            } as any
        } catch (error) {
            console.error('authorization error ',error)
            throw error
        }
       }
   }) // ending of object 
],
    callbacks:{
        async jwt({ token, user }){
            if(user)
            {
                // @ts-ignore
                token.id = user.id
                // @ts-ignore
                token.passwordRequiresReset = user.passwordRequiresReset || false
                if ((user as any).name) token.name = (user as any).name
                if ((user as any).image) token.picture = (user as any).image
            }
            return token
        },
        async session({ session, token }) {
            if(session.user)
            {
                // @ts-ignore
                session.user.id = token.id as string
                // @ts-ignore
                session.user.passwordRequiresReset = token.passwordRequiresReset as boolean
                if (token.name) session.user.name = token.name as string
                if (token.picture) session.user.image = token.picture as string
            }
            return session
        },
    },
    pages:{
        signIn: '/login',
        error: '/login',
    },
    session:{
        strategy: "jwt",
        maxAge:30 * 24 * 60 * 60
    },
    secret: process.env.NEXTAUTH_SECRET
};       