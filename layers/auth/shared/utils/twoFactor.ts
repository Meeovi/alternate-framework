import { betterAuth } from "better-auth"
import { twoFactor, username } from "better-auth/plugins"
import { prisma } from '@mframework/adapter-prisma'

export const twoFactorAuth = betterAuth({
    appName: process.env.APP_NAME, // provide your app name. It'll be used as an issuer.
    plugins: [
        twoFactor({
          	otpOptions: {
				async sendOTP({ user, otp }: any, ctx: any) {
                    await ctx.email.send({
                        to: user.email,
                        subject: 'Your OTP Code',
                        text: `Your OTP code is: ${otp}`
                    });
                },
                async verifyOTP({ user, otp }: any, ctx: any) {
                    return otp === user.twoFactorSecret;
                }
            },
            storage: {
                async getUser(userId: any) {
                    return await prisma.user.findUnique({ where: { id: userId } })
                },
                async updateUser(userId: any, data: any) {
                    return await prisma.user.update({ where: { id: userId }, data })
                }
            }
        })        
    ]
})