import { logger } from "@/infrastructure/logger";

interface SendEmailParams {
    to: string;
    replyTo: string;
    subject: string;
    text: string;
}

export const EmailService = {
    /**
     * İletişim formundan gelen mesajı yöneticiye iletir
     */
    async sendContactEmail(data: { name: string; email: string; subject: string; message: string }) {
        const content = `
      Yeni İletişim Formu Mesajı
      --------------------------
      Gönderen: ${data.name}
      E-posta: ${data.email}
      Konu: ${data.subject}
      
      Mesaj:
      ${data.message}
    `;

        return this.send({
            to: "admin@ogretmenbusra.com", // Kendi yönetici e-posta adresiniz
            replyTo: data.email,
            subject: `İletişim Formu: ${data.subject}`,
            text: content,
        });
    },

    /**
     * Çekirdek gönderim fonksiyonu
     */
    async send(params: SendEmailParams) {
        try {
            // TODO: Canlı ortam (Production) için Resend, SendGrid veya Nodemailer entegrasyonu buraya gelecek.
            // Örnek Resend Entegrasyonu:
            // await resend.emails.send({ from: 'onboarding@resend.dev', ...params });

            // Geliştirme (Dev) ortamında logluyoruz
            logger.info({ emailTask: params }, "E-posta başarıyla gönderildi (Simülasyon)");
            return { success: true };
        } catch (error) {
            logger.error({ err: error, emailTask: params }, "E-posta gönderimi başarısız oldu");
            throw new Error("E-posta sunucusu yanıt vermiyor.");
        }
    }
};