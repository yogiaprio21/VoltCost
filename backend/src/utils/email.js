const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // Menggunakan service preset untuk Gmail agar lebih stabil
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendResetEmail = async (email, token) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;

    const mailOptions = {
        from: process.env.SMTP_FROM || '"VoltCost Support" <support@voltcost.com>',
        to: email,
        subject: '🔒 Reset Password VoltCost Anda',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #3182ce; text-align: center;">VoltCost</h2>
                <p>Halo,</p>
                <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun VoltCost Anda. Silakan klik tombol di bawah ini untuk melanjutkan:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password Sekarang</a>
                </div>
                <p style="color: #718096; font-size: 14px;">Tautan ini akan kadaluwarsa dalam 1 jam. Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini.</p>
                <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 20px 0;" />
                <p style="color: #a0aec0; font-size: 12px; text-align: center;">&copy; 2026 VoltCost - Solusi Estimasi Listrik Modern</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendResetEmail };
