import { Resend } from 'resend';

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface TeamInvitationEmailParams {
  to: string;
  teamName: string;
  inviterName: string;
  invitationUrl: string;
  expiresAt: Date;
}

export async function sendTeamInvitationEmail(params: TeamInvitationEmailParams) {
  try {
    const { to, teamName, inviterName, invitationUrl, expiresAt } = params;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Team Invitation - TaskFlow</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .highlight { background: #e0f2fe; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">TaskFlow</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Collaborative Checklist Management</p>
            </div>
            
            <div class="content">
              <h2 style="color: #1f2937; margin-top: 0;">You're Invited to Join a Team!</h2>
              
              <p>Hi there! 👋</p>
              
              <div class="highlight">
                <strong>${inviterName}</strong> has invited you to join the team <strong>"${teamName}"</strong> on TaskFlow.
              </div>
              
              <p>TaskFlow helps teams create, manage, and track collaborative checklists. You'll be able to:</p>
              
              <ul>
                <li>Create and share checklist templates</li>
                <li>Track progress in real-time</li>
                <li>Collaborate with team members</li>
                <li>Manage complex workflows</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${invitationUrl}" class="button">Accept Invitation</a>
              </div>
              
              <p style="font-size: 14px; color: #666; text-align: center;">
                <strong>Important:</strong> This invitation expires on ${expiresAt.toLocaleDateString()} at ${expiresAt.toLocaleTimeString()}
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 14px; color: #666;">
                If you don't have a TaskFlow account yet, you'll be prompted to create one when you accept the invitation.
              </p>
            </div>
            
            <div class="footer">
              <p>This invitation was sent from TaskFlow</p>
              <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    if (!resend) {
      console.log('Resend not configured, using fallback email service');
      return sendTeamInvitationEmailFallback(params);
    }

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM_ADDRESS || 'TaskFlow <onboarding@resend.dev>',
      to: [to],
      subject: `You're invited to join ${teamName} on TaskFlow`,
      html: htmlContent,
    });

    console.log('Email sent successfully:', result);
    return { success: true, data: result, error: undefined };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error, data: undefined };
  }
}

// Fallback email service for development/testing
export async function sendTeamInvitationEmailFallback(params: TeamInvitationEmailParams) {
  console.log('=== EMAIL WOULD BE SENT ===');
  console.log('To:', params.to);
  console.log('Subject: You\'re invited to join ' + params.teamName + ' on TaskFlow');
  console.log('Invitation URL:', params.invitationUrl);
  console.log('Expires:', params.expiresAt);
  console.log('==========================');
  
  return { success: true, data: { id: 'mock-email-id' }, error: undefined };
} 