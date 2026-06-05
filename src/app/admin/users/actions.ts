"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/infrastructure/database/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";

// SADECE ADMIN'LER BU İŞLEMLERİ YAPABİLİR (Super Admin koruması)
async function verifySuperAdmin() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Bu işlem için Süper Admin yetkisi gereklidir.");
    }
    return session.user;
}

export async function createStaffMember(data: FormData) {
    try {
        await verifySuperAdmin();

        const name = data.get("name") as string;
        const email = data.get("email") as string;
        const password = data.get("password") as string;
        const role = data.get("role") as Role;

        if (!name || !email || !password || !role) throw new Error("Tüm alanlar zorunludur.");
        if (password.length < 8) throw new Error("Şifre en az 8 karakter olmalıdır.");

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) throw new Error("Bu e-posta adresi zaten kullanılıyor.");

        const passwordHash = await bcrypt.hash(password, 12);

        await prisma.user.create({
            data: { name, email, passwordHash, role }
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Personel eklenemedi." };
    }
}

export async function unlockUserAccount(userId: string) {
    try {
        await verifySuperAdmin();
        await prisma.user.update({
            where: { id: userId },
            data: { lockedUntil: null, failedLoginAttempts: 0 }
        });
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Hesap kilidi açılamadı." };
    }
}

export async function deleteStaffMember(userId: string) {
    try {
        const admin = await verifySuperAdmin();
        if (admin.id === userId) throw new Error("Kendi hesabınızı silemezsiniz.");

        await prisma.user.delete({ where: { id: userId } });
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Personel silinemedi." };
    }
}