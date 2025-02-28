import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
    adapter: DrizzleAdapter(db),
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await db.query.users.findFirst({
                    where: eq(users.email, credentials.email)
                });

                if (!user || !user.password) {
                    return null;
                }

                const passwordMatch = await bcrypt.compare(credentials.password, user.password);

                if (!passwordMatch) {
                    return null;
                }

                return {
                    id: user.id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            // Add custom user data to the session
            if (session?.user && token?.sub) {
                // Fetch additional user data from database
                const userData = await db.query.users.findFirst({
                    where: eq(users.id, token.sub),
                    columns: {
                        name: true,
                        email: true,
                        role: true,
                        position: true,
                        organization: true,
                        // Add any other fields you need
                    }
                });

                // Merge the data into the session
                session.user = {
                    ...session.user,
                    id: token.sub,
                    role: userData?.role || "citizen",
                    position: userData?.position || "",
                    organization: userData?.organization || ""
                };
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login",
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };