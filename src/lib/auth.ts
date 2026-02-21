import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Faltan credenciales");
        }

        const userFound = await prisma.user.findUnique({
          where: { email: credentials?.email },
        });

        if (!userFound) throw new Error("Usuario no existe");

        const matchPassword = await bcrypt.compare(
          credentials!.password,
          userFound.password
        );

        if (!matchPassword) throw new Error("Credenciales equivocados");

        return {
          id: userFound.id.toString(),
          name: userFound.name,
          email: userFound.email,
          role: userFound.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        // Asignar el ID del usuario
        session.user.id = token.sub;
        session.user.role = token.role as string;

        // Consultar los datos más recientes del usuario en la base de datos
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        });

        if (user) {
          // Actualizar los datos de la sesión con los valores de la base de datos
          session.user.name = user.name;
          session.user.email = user.email;
          session.user.role = user.role;
        }
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      // Primera vez que se loguea (user existe)
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      } else if (trigger === "update") {
        // Si viene session.user, usamos esos datos
        if (session?.user) {
          token.name = session.user.name;
          token.lastName = session.user.lastName;
          token.phone = session.user.phone;
          token.email = session.user.email;
          token.role = session.user.role;
        } else {
          // Si no viene session, consultamos la BD (para refrescar datos)
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email! },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.name = dbUser.name;
            token.email = dbUser.email;
            token.role = dbUser.role;
          }
        }
      } else if (trigger === "signIn" || trigger === "signUp") {
        // En caso de que user no venga pero es un sign in, buscar en la BD
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.role = dbUser.role;
        }
      }

      return token;
    },
  },
};
