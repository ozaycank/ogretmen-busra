import { Resend } from "resend";
import { logger } from "@/infrastructure/logger";

// Vercel env'den API key'i alıp Resend client'ı başlatıyoruz
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
    replyTo: string;
    subject: string;
    text: string;
}

export const EmailService = {
    /**
     * İletişim formundan gelen mesajı merkeze iletir
     */
    async sendContactEmail(data: { name: string; email: string; subject: string; message: string }) {
        const content = `
        YENİ İLETİŞİM FORMU MESAJI
        --------------------------------------------------
        Gönderen : ${data.name}
        E-posta  : ${data.email}
        Tarih    : ${new Date().toLocaleString("tr-TR")}
        Konu     : ${data.subject}
        
        Mesaj:
        ${data.message}
        --------------------------------------------------
        Bu e-posta ogretmenbusra.com sisteminden otomatik yönlendirilmiştir.
        Yanıtla (Reply) tuşuna bastığınızda doğrudan kullanıcıya (${data.email}) yanıt vereceksiniz.
        `;

        return this.send({
            replyTo: data.email,
            subject: `[Web İletişim] ${data.subject}`,
            text: content,
        });
    },

    /**
     * Çekirdek gönderim fonksiyonu (Güvenli Header Handling)
     */
    async send(params: SendEmailParams) {
        // Fallback mekanizması: Env yoksa güvenli defaultları kullan
        const fromEmail = process.env.RESEND_FROM_EMAIL || "iletisim@ogretmenbusra.com";
        const toEmail = process.env.CONTACT_DESTINATION_EMAIL || "ozaycank10@gmail.com";

        try {
            const { data, error } = await resend.emails.send({
                from: `Büşra Öğretmen <${fromEmail}>`, // Sadece verified domain kullanılabilir!
                to: [toEmail], // Senin şahsi Gmail'in
                replyTo: params.replyTo,
                subject: params.subject,
                text: params.text,
            });

            if (error) {
                logger.error({ err: error, to: toEmail }, "Resend API e-posta gönderimini reddetti.");
                throw new Error("E-posta sunucusu geçici olarak meşgul.");
            }

            logger.info({ emailId: data?.id, replyTo: params.replyTo }, "E-posta başarıyla Resend ağına iletildi.");
            return { success: true, id: data?.id };

        } catch (error) {
            logger.error({ err: error, params }, "E-posta servisi kritik hata!");
            throw new Error("Sistem hatası: E-posta gönderilemedi.");
        }
    }
};