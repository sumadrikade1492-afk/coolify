// Gmail Integration for NRIChristianMatrimony
// Uses Replit Gmail connector for sending emails

import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-mail',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Gmail not connected');
  }
  return accessToken;
}

async function getGmailClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

function createEmailMessage(to: string, subject: string, body: string): string {
  const email = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    body
  ].join('\r\n');

  return Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sendEmail(to: string, subject: string, htmlBody: string): Promise<boolean> {
  try {
    const gmail = await getGmailClient();
    const encodedMessage = createEmailMessage(to, subject, htmlBody);

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export async function sendProfileNotification(
  action: 'created' | 'updated',
  profileId: number,
  profileData: {
    firstName: string;
    lastName: string;
    gender: string;
    city: string;
    country: string;
    denomination: string;
  }
): Promise<void> {
  const subject = `Profile ${action === 'created' ? 'Created' : 'Updated'}: Profile #${profileId}`;
  
  const htmlBody = `
    <h2>Profile ${action === 'created' ? 'Created' : 'Updated'}</h2>
    <p><strong>Profile ID:</strong> ${profileId}</p>
    <p><strong>Name:</strong> ${profileData.firstName} ${profileData.lastName}</p>
    <p><strong>Gender:</strong> ${profileData.gender}</p>
    <p><strong>Location:</strong> ${profileData.city}, ${profileData.country}</p>
    <p><strong>Denomination:</strong> ${profileData.denomination}</p>
    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    <hr>
    <p><em>This is an automated notification from NRIChristianMatrimony.</em></p>
  `;

  await sendEmail('opsauto3@gmail.com', subject, htmlBody);
}

export async function sendDailyLoginReport(logins: Array<{
  userId: string;
  username: string;
  loginTime: Date;
}>): Promise<void> {
  const today = new Date().toLocaleDateString();
  const subject = `Daily Login Report - ${today}`;
  
  let tableRows = '';
  if (logins.length === 0) {
    tableRows = '<tr><td colspan="3" style="text-align: center;">No logins recorded today</td></tr>';
  } else {
    tableRows = logins.map((login, index) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${index + 1}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${login.username}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${new Date(login.loginTime).toLocaleString()}</td>
      </tr>
    `).join('');
  }

  const htmlBody = `
    <h2>Daily Login Report - ${today}</h2>
    <p><strong>Total Logins:</strong> ${logins.length}</p>
    <table style="border-collapse: collapse; width: 100%; margin-top: 20px;">
      <thead>
        <tr style="background-color: #1e3a5f; color: white;">
          <th style="padding: 10px; border: 1px solid #ddd;">#</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Username</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Login Time</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
    <hr>
    <p><em>This is an automated daily report from NRIChristianMatrimony.</em></p>
  `;

  await sendEmail('opsauto3@gmail.com', subject, htmlBody);
}
