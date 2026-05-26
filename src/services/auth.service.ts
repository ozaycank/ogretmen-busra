import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { User, Role } from "@prisma/client";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

export class AuthService {
    static async logAudit(action: any, ip: string, email: string, userId?: string) {
        await prisma.auditLog.create({
            data: {
                action,
                ipAddress: ip,
                details: `Target Email: ${email}`,
                userId: userId || null,
            }
        });
    }

    static async verifyCredentials(email: string, password: string, ip: string): Promise<User | null> {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            await this.logAudit("LOGIN_FAILED", ip, email);
            return null;
        }

        // Hesap kilitli mi kontrolü
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            await this.logAudit("LOGIN_FAILED", ip, email, user.id);
            throw new Error("Hesabınız çok fazla hatalı deneme nedeniyle geçici olarak kilitlendi.");
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            const newAttempts = user.failedLoginAttempts + 1;
            const updates: any = { failedLoginAttempts: newAttempts };

            if (newAttempts >= MAX_FAILED_ATTEMPTS) {
                updates.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60000);
                await this.logAudit("ACCOUNT_LOCKED", ip, email, user.id);
            }

            await prisma.user.update({ where: { id: user.id }, data: updates });
            await this.logAudit("LOGIN_FAILED", ip, email, user.id);
            throw new Error("E-posta veya şifre hatalı.");
        }

        // Başarılı giriş: Sayaçları sıfırla
        await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockedUntil: null }
        });

        await this.logAudit("LOGIN_SUCCESS", ip, email, user.id);

        return user;
    }
}