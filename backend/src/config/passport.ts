import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { env } from "./env.js"
import { prisma } from "./db.js"
import { ensureCart } from "../modules/cart/cart.service.js"

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value

        if (!email) {
          return done(new Error("No email found in Google profile"))
        }

        // Find existing user or create a new one
        let user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName,
              passwordHash: "", // No password for OAuth users
              role: "user",
            },
          })
        }

        await ensureCart(user.id)

        done(null, user)
      } catch (err) {
        done(err as Error)
      }
    }
  )
)

export default passport
