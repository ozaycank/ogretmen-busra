import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hash = await bcrypt.hash('GuvenliSifre123!', 12);
    await prisma.user.upsert({
        where: { email: 'admin@busraogretmen.com' },
        update: {},
        create: {
            email: 'admin@busraogretmen.com',
            name: 'Sistem Yöneticisi',
            passwordHash: hash,
            role: Role.ADMIN,
        },
    });
}
main();