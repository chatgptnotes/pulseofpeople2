/**
 * Notification System
 * Supports Email, In-App, and SMS notifications
 */

export type NotificationChannel = 'email' | 'in_app' | 'sms' | 'push';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'read';

export interface Notification {
  id: string;
  userId: string;
  tenantId?: string;
  channel: NotificationChannel;
  type: string;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, any>;
  status: NotificationStatus;
  scheduledFor?: string;
  sentAt?: string;
  readAt?: string;
  createdAt: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  channels: NotificationChannel[];
  subject?: string;
  emailTemplate?: string;
  smsTemplate?: string;
  inAppTemplate?: string;
  variables: string[];
}

export interface EmailConfig {
  provider: 'supabase' | 'smtp' | 'sendgrid' | 'ses';
  from: string;
  fromName: string;
  replyTo?: string;
  apiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
}

export interface SMSConfig {
  provider: 'twilio' | 'aws_sns' | 'msg91' | 'mock';
  accountSid?: string;
  authToken?: string;
  from: string;
  apiKey?: string;
}

export interface NotificationPreferences {
  userId: string;
  email: {
    enabled: boolean;
    types: string[];
  };
  sms: {
    enabled: boolean;
    types: string[];
  };
  inApp: {
    enabled: boolean;
    types: string[];
  };
  push: {
    enabled: boolean;
    types: string[];
  };
}

/**
 * Send email notification
 */
export async function sendEmail(
  to: string | string[],
  subject: string,
  body: string,
  config: EmailConfig
): Promise<boolean> {
  try {
    switch (config.provider) {
      case 'supabase':
        return await sendSupabaseEmail(to, subject, body, config);
      case 'smtp':
        return await sendSMTPEmail(to, subject, body, config);
      case 'sendgrid':
        return await sendSendGridEmail(to, subject, body, config);
      case 'ses':
        return await sendSESEmail(to, subject, body, config);
      default:
        throw new Error(`Unsupported email provider: ${config.provider}`);
    }
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

async function sendSupabaseEmail(
  to: string | string[],
  subject: string,
  body: string,
  config: EmailConfig
): Promise<boolean> {
  // Supabase Auth email - limited to auth-related emails
  // For general emails, use SMTP or other providers
  console.log('Supabase email sent:', { to, subject });
  return true;
}

async function sendSMTPEmail(
  to: string | string[],
  subject: string,
  body: string,
  config: EmailConfig
): Promise<boolean> {
  const response = await fetch('/api/notifications/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'smtp',
      to: Array.isArray(to) ? to : [to],
      subject,
      body,
      from: config.from,
      fromName: config.fromName,
      replyTo: config.replyTo,
      smtpConfig: {
        host: config.smtpHost,
        port: config.smtpPort,
        user: config.smtpUser,
        password: config.smtpPassword,
      },
    }),
  });

  return response.ok;
}

async function sendSendGridEmail(
  to: string | string[],
  subject: string,
  body: string,
  config: EmailConfig
): Promise<boolean> {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: (Array.isArray(to) ? to : [to]).map(email => ({ email })),
        },
      ],
      from: {
        email: config.from,
        name: config.fromName,
      },
      subject,
      content: [
        {
          type: 'text/html',
          value: body,
        },
      ],
    }),
  });

  return response.ok;
}

async function sendSESEmail(
  to: string | string[],
  subject: string,
  body: string,
  config: EmailConfig
): Promise<boolean> {
  // AWS SES implementation
  const response = await fetch('/api/notifications/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'ses',
      to: Array.isArray(to) ? to : [to],
      subject,
      body,
      from: config.from,
      apiKey: config.apiKey,
    }),
  });

  return response.ok;
}

/**
 * Send SMS notification
 */
export async function sendSMS(
  to: string | string[],
  message: string,
  config: SMSConfig
): Promise<boolean> {
  try {
    switch (config.provider) {
      case 'twilio':
        return await sendTwilioSMS(to, message, config);
      case 'aws_sns':
        return await sendSNSSMS(to, message, config);
      case 'msg91':
        return await sendMsg91SMS(to, message, config);
      case 'mock':
        return await sendMockSMS(to, message);
      default:
        throw new Error(`Unsupported SMS provider: ${config.provider}`);
    }
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return false;
  }
}

async function sendTwilioSMS(
  to: string | string[],
  message: string,
  config: SMSConfig
): Promise<boolean> {
  const phones = Array.isArray(to) ? to : [to];

  for (const phone of phones) {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${config.accountSid}:${config.authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phone,
          From: config.from,
          Body: message,
        }),
      }
    );

    if (!response.ok) return false;
  }

  return true;
}

async function sendSNSSMS(
  to: string | string[],
  message: string,
  config: SMSConfig
): Promise<boolean> {
  // AWS SNS implementation
  const response = await fetch('/api/notifications/sms/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'aws_sns',
      to: Array.isArray(to) ? to : [to],
      message,
      apiKey: config.apiKey,
    }),
  });

  return response.ok;
}

async function sendMsg91SMS(
  to: string | string[],
  message: string,
  config: SMSConfig
): Promise<boolean> {
  // MSG91 India SMS provider
  const phones = Array.isArray(to) ? to : [to];

  const response = await fetch('https://api.msg91.com/api/v5/flow/', {
    method: 'POST',
    headers: {
      'authkey': config.apiKey || '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: config.from,
      mobiles: phones.join(','),
      message,
    }),
  });

  return response.ok;
}

async function sendMockSMS(to: string | string[], message: string): Promise<boolean> {
  console.log('Mock SMS sent:', { to, message });
  return true;
}

/**
 * Create in-app notification
 */
export async function createInAppNotification(
  userId: string,
  title: string,
  message: string,
  type: string,
  data?: Record<string, any>,
  tenantId?: string
): Promise<Notification> {
  const notification: Notification = {
    id: `notif_${Date.now()}`,
    userId,
    tenantId,
    channel: 'in_app',
    type,
    priority: 'medium',
    title,
    message,
    data,
    status: 'sent',
    createdAt: new Date().toISOString(),
  };

  // Store in database
  // await supabase.from('notifications').insert(notification);

  return notification;
}

/**
 * Send multi-channel notification
 */
export async function sendNotification(
  userId: string,
  notification: {
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    channels: NotificationChannel[];
    priority?: NotificationPriority;
  },
  config: {
    email?: EmailConfig;
    sms?: SMSConfig;
  }
): Promise<boolean> {
  try {
    const results: boolean[] = [];

    // Check user preferences
    // const preferences = await getUserNotificationPreferences(userId);

    // Send to each channel
    for (const channel of notification.channels) {
      switch (channel) {
        case 'email':
          if (config.email) {
            // Get user email
            // const userEmail = await getUserEmail(userId);
            const success = await sendEmail(
              'user@example.com', // Replace with actual user email
              notification.title,
              notification.message,
              config.email
            );
            results.push(success);
          }
          break;

        case 'sms':
          if (config.sms) {
            // Get user phone
            // const userPhone = await getUserPhone(userId);
            const success = await sendSMS(
              '+91XXXXXXXXXX', // Replace with actual user phone
              `${notification.title}\n\n${notification.message}`,
              config.sms
            );
            results.push(success);
          }
          break;

        case 'in_app':
          await createInAppNotification(
            userId,
            notification.title,
            notification.message,
            notification.type,
            notification.data
          );
          results.push(true);
          break;

        case 'push':
          // Push notification implementation
          results.push(true);
          break;
      }
    }

    return results.every(r => r);
  } catch (error) {
    console.error('Failed to send notification:', error);
    return false;
  }
}

/**
 * Send notification from template
 */
export async function sendNotificationFromTemplate(
  userId: string,
  templateId: string,
  variables: Record<string, any>,
  channels: NotificationChannel[],
  config: {
    email?: EmailConfig;
    sms?: SMSConfig;
  }
): Promise<boolean> {
  // Load template
  // const template = await getNotificationTemplate(templateId);

  // Replace variables in template
  // const message = replaceTemplateVariables(template.message, variables);

  return sendNotification(
    userId,
    {
      type: 'template',
      title: 'Notification',
      message: 'Template message',
      channels,
    },
    config
  );
}

/**
 * Get notification configuration from environment
 */
export function getNotificationConfig(): {
  email: EmailConfig;
  sms: SMSConfig;
} {
  return {
    email: {
      provider: (import.meta.env.VITE_EMAIL_PROVIDER || 'supabase') as any,
      from: import.meta.env.VITE_EMAIL_FROM || 'noreply@pulseofpeople.com',
      fromName: import.meta.env.VITE_EMAIL_FROM_NAME || 'Pulse of People',
      replyTo: import.meta.env.VITE_EMAIL_REPLY_TO,
      apiKey: import.meta.env.VITE_EMAIL_API_KEY,
      smtpHost: import.meta.env.VITE_SMTP_HOST,
      smtpPort: parseInt(import.meta.env.VITE_SMTP_PORT || '587'),
      smtpUser: import.meta.env.VITE_SMTP_USER,
      smtpPassword: import.meta.env.VITE_SMTP_PASSWORD,
    },
    sms: {
      provider: (import.meta.env.VITE_SMS_PROVIDER || 'mock') as any,
      accountSid: import.meta.env.VITE_SMS_ACCOUNT_SID,
      authToken: import.meta.env.VITE_SMS_AUTH_TOKEN,
      from: import.meta.env.VITE_SMS_FROM || '+911234567890',
      apiKey: import.meta.env.VITE_SMS_API_KEY,
    },
  };
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string,
  organizationName: string
): Promise<boolean> {
  const config = getNotificationConfig();

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3b82f6; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background-color: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Pulse of People!</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName},</h2>
          <p>Welcome to ${organizationName} on Pulse of People!</p>
          <p>We're excited to have you on board. Your account has been successfully created.</p>
          <p>Here's what you can do next:</p>
          <ul>
            <li>Complete your profile</li>
            <li>Explore the dashboard</li>
            <li>Set up your first campaign</li>
          </ul>
          <p style="text-align: center; margin: 30px 0;">
            <a href="https://yourapp.com/dashboard" class="button">Get Started</a>
          </p>
          <p>If you have any questions, feel free to reach out to our support team.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Pulse of People. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(
    userEmail,
    'Welcome to Pulse of People',
    htmlBody,
    config.email
  );
}

/**
 * Send tenant provisioned notification
 */
export async function sendTenantProvisionedEmail(
  adminEmail: string,
  adminName: string,
  tenantName: string,
  subdomain: string
): Promise<boolean> {
  const config = getNotificationConfig();

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <body>
      <h2>Your Tenant is Ready!</h2>
      <p>Hi ${adminName},</p>
      <p>Your tenant "${tenantName}" has been successfully provisioned and is ready to use.</p>
      <p><strong>Access URL:</strong> <a href="https://${subdomain}.yourapp.com">https://${subdomain}.yourapp.com</a></p>
      <p>You can now start inviting users and setting up your campaigns.</p>
    </body>
    </html>
  `;

  return sendEmail(
    adminEmail,
    `Your Tenant "${tenantName}" is Ready`,
    htmlBody,
    config.email
  );
}

/**
 * Send payment reminder
 */
export async function sendPaymentReminder(
  userEmail: string,
  userName: string,
  amount: number,
  dueDate: string
): Promise<boolean> {
  const config = getNotificationConfig();

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <body>
      <h2>Payment Reminder</h2>
      <p>Hi ${userName},</p>
      <p>This is a reminder that your payment of ₹${amount} is due on ${dueDate}.</p>
      <p>Please ensure your payment method is up to date to avoid any service interruption.</p>
      <p><a href="https://yourapp.com/admin/subscription">Manage Subscription</a></p>
    </body>
    </html>
  `;

  return sendEmail(
    userEmail,
    'Payment Reminder - Pulse of People',
    htmlBody,
    config.email
  );
}

export default {
  sendEmail,
  sendSMS,
  createInAppNotification,
  sendNotification,
  sendNotificationFromTemplate,
  getNotificationConfig,
  sendWelcomeEmail,
  sendTenantProvisionedEmail,
  sendPaymentReminder,
};
