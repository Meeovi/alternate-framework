export interface AlternateNotifyConfig {
  sendgrid?: {
    apiKey: string;
    fromEmail: string;
    fromName?: string;
  };
  twilio?: {
    accountSid: string;
    authToken: string;
    fromNumber: string;
  };
  fcm?: {
    serverKey: string;
  };
}

export function loadNotifyConfigFromEnv(): AlternateNotifyConfig {
  return {
    sendgrid: process.env.SENDGRID_API_KEY
      ? {
          apiKey: process.env.SENDGRID_API_KEY,
          fromEmail: process.env.SENDGRID_FROM_EMAIL ?? 'no-reply@example.com',
          fromName: process.env.SENDGRID_FROM_NAME ?? 'Notifications'
        }
      : undefined,
    twilio: process.env.TWILIO_SID
      ? {
          accountSid: process.env.TWILIO_SID,
          authToken: process.env.TWILIO_TOKEN ?? '',
          fromNumber: process.env.TWILIO_FROM ?? ''
        }
      : undefined,
    fcm: process.env.FCM_SERVER_KEY
      ? {
          serverKey: process.env.FCM_SERVER_KEY
        }
      : undefined
  };
}
