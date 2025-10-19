import nodemailer from 'nodemailer';
import { emailConfig } from '../config/email.js';

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport(emailConfig);
    }

    async sendAppointmentConfirmation(to, appointmentDetails) {
        const mailOptions = {
            from: emailConfig.auth.user,
            to,
            subject: 'Appointment Confirmation',
            html: `<p>Your appointment is confirmed for ${appointmentDetails.date}</p>`
        };
        return await this.transporter.sendMail(mailOptions);
    }

    async sendAppointmentReminder(to, appointmentDetails) {
        const mailOptions = {
            from: emailConfig.auth.user,
            to,
            subject: 'Appointment Reminder',
            html: `<p>Reminder: Your appointment is scheduled for ${appointmentDetails.date}</p>`
        };
        return await this.transporter.sendMail(mailOptions);
    }
}

export default new EmailService();
