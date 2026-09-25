import { BrevoClient } from "@getbrevo/brevo";
import { env } from "../config/index.js";
import { Registration } from "../types/index.js";
import { updateEmailStatus } from "../repositories/index.js";

// Initialize Brevo API
const apiInstance = new BrevoClient({ apiKey: env.BREVO_API_KEY || "" });

export const sendRegistrationConfirmationEmail = async (registration: Registration, eventTitle: string) => {
  try {
    if (!env.BREVO_API_KEY) {
      console.warn("BREVO_API_KEY is not set. Skipping email sending.");
      return;
    }

    const payload = {
      subject: `Registration Confirmed: ${eventTitle}`,
      to: [{ email: registration.email, name: registration.name }],
      sender: { name: "CS-CLUB", email: "samavenky654@gmail.com" }, // Change to your verified sender
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f9; padding: 20px; color: #333; margin: 0; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            .header { background-color: #6366f1; padding: 30px 20px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
            .content { padding: 30px; }
            .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #0f172a; }
            .info-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 25px; }
            .info-row { margin-bottom: 12px; font-size: 14px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; }
            .info-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
            .info-label { font-weight: 600; color: #64748b; display: inline-block; width: 40%; }
            .info-value { font-weight: 700; color: #0f172a; display: inline-block; width: 55%; text-align: right; float: right; }
            .team-section { margin-top: 30px; }
            .team-title { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 15px; border-bottom: 2px solid #6366f1; padding-bottom: 5px; display: inline-block; }
            .member-card { background: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid #6366f1; border-radius: 6px; padding: 15px; margin-bottom: 10px; }
            .member-name { font-weight: 700; font-size: 15px; color: #0f172a; margin: 0 0 5px 0; }
            .member-details { font-size: 13px; color: #64748b; margin: 0; line-height: 1.5; }
            .footer { text-align: center; padding: 20px; font-size: 13px; color: #94a3b8; background-color: #f8fafc; border-top: 1px solid #e2e8f0; }
            .success-badge { display: inline-block; background-color: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 700; }
            .clear { clear: both; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Registration Confirmed</h1>
            </div>
            <div class="content">
              <div class="greeting">Hello ${registration.name},</div>
              <p style="color: #475569; line-height: 1.6; margin-bottom: 25px;">
                Thank you for registering for <strong>${eventTitle}</strong>. We are thrilled to have you! Here are your registration details.
              </p>

              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Registration ID</span>
                  <span class="info-value" style="font-family: monospace; color: #6366f1;">${registration.registrationId}</span>
                  <div class="clear"></div>
                </div>
                <div class="info-row">
                  <span class="info-label">Event</span>
                  <span class="info-value">${eventTitle}</span>
                  <div class="clear"></div>
                </div>
                <div class="info-row">
                  <span class="info-label">Payment Status</span>
                  <span class="info-value"><span class="success-badge">${registration.paymentStatus || 'FREE'}</span></span>
                  <div class="clear"></div>
                </div>
                ${registration.transactionId ? `
                <div class="info-row">
                  <span class="info-label">Transaction ID</span>
                  <span class="info-value" style="font-family: monospace; font-size: 12px;">${registration.transactionId}</span>
                  <div class="clear"></div>
                </div>
                ` : ""}
                <div class="info-row">
                  <span class="info-label">Team Size</span>
                  <span class="info-value">${registration.teamSize} ${registration.teamSize > 1 ? "Members" : "Member"}</span>
                  <div class="clear"></div>
                </div>
              </div>

              ${registration.teamMembers && registration.teamMembers.length > 0 ? `
              <div class="team-section">
                <div class="team-title">Team Members</div>
                ${registration.teamMembers.map((member, index) => `
                  <div class="member-card">
                    <p class="member-name">${index + 1}. ${member.name}</p>
                    <p class="member-details">
                      <strong>Roll No:</strong> ${member.rollNumber} &nbsp;|&nbsp; <strong>Branch:</strong> ${member.branch} (${member.section})<br/>
                      <strong>Phone:</strong> ${member.phone} &nbsp;|&nbsp; <strong>Email:</strong> ${member.email}
                    </p>
                  </div>
                `).join('')}
              </div>
              ` : ""}


              <p style="color: #0f172a; font-weight: 600; margin-top: 25px;">
                Best Regards,<br/>
                CS-CLUB Team
              </p>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} CS-CLUB. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `
    };

    await apiInstance.transactionalEmails.sendTransacEmail(payload);
    console.log(`Confirmation email sent to ${registration.email}.`);
    await updateEmailStatus(registration.registrationId, "SENT").catch(e => console.error("Could not update emailStatus:", e));
  } catch (error) {
    console.error("Failed to send Brevo email:", error);
    await updateEmailStatus(registration.registrationId, "FAILED").catch(e => console.error("Could not update emailStatus:", e));
  }
};
