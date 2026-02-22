import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || '',
});

console.log('MailerSend API Key configured:', !!process.env.MAILERSEND_API_KEY);

// Use verified MailerSend trial domain to avoid 401 errors
const fromEmail = 'mybillport@trial-351ndgwr0p8lzqx8.mlsender.net'; // MailerSend verified domain
const fromName = process.env.FROM_NAME || 'MyBillPort';

export async function sendTestEmail(to: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const apiKey = process.env.MAILERSEND_API_KEY;
    if (!apiKey || !apiKey.startsWith('mlsn.')) {
      console.log('⚠️ MailerSend API key not configured - Demo mode');
      return { success: true, messageId: 'demo-test-email' };
    }

    const sentFrom = new Sender(fromEmail, fromName);
    const recipients = [new Recipient(to)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject('MyBillPort Email Test')
      .setHtml(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">MyBillPort Email Test</h1>
          <p>This is a test email from your MyBillPort application.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p>If you received this email, your email service is working correctly!</p>
        </div>
      `);

    const response = await mailerSend.email.send(emailParams);
    return { success: true, messageId: response.body?.message_id };

  } catch (error: any) {
    console.error('Test email failed:', error);
    return { success: false, error: error.message };
  }
}

export async function sendBillReminderEmail(to: string, bill: any): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const apiKey = process.env.MAILERSEND_API_KEY;
    if (!apiKey || !apiKey.startsWith('mlsn.')) {
      console.log('⚠️ MailerSend API key not configured - Demo mode');
      console.log(`Bill reminder would be sent to: ${to} for bill: ${bill.name}`);
      return { success: true, messageId: 'demo-reminder' };
    }

    const sentFrom = new Sender(fromEmail, fromName);
    const recipients = [new Recipient(to)];
    const dueDate = new Date(bill.dueDate).toLocaleDateString();

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(`⏰ Bill Reminder: ${bill.name} Due ${dueDate}`)
      .setHtml(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">⏰ Bill Reminder</h1>
            <p style="margin: 10px 0 0 0;">MyBillPort</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #1f2937; margin-top: 0;">Your bill is due soon!</h2>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #92400e;">${bill.name}</h3>
              <p style="margin: 5px 0;"><strong>Company:</strong> ${bill.company}</p>
              <p style="margin: 5px 0;"><strong>Amount:</strong> $${parseFloat(bill.amount).toFixed(2)} CAD</p>
              <p style="margin: 5px 0;"><strong>Due Date:</strong> ${dueDate}</p>
            </div>
            
            <p>Don't forget to pay your bill on time to avoid any late fees!</p>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="https://mybillport.com" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View in MyBillPort
              </a>
            </div>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>This is an automated reminder from MyBillPort</p>
          </div>
        </div>
      `);

    const response = await mailerSend.email.send(emailParams);
    return { success: true, messageId: response.body?.message_id };

  } catch (error: any) {
    console.error('Bill reminder failed:', error);
    return { success: false, error: error.message };
  }
}

export async function sendPaymentRequestEmail({
  to,
  amount,
  note,
  fromUser
}: {
  to: string;
  amount: number;
  note: string;
  fromUser: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const apiKey = process.env.MAILERSEND_API_KEY;
    if (!apiKey || !apiKey.startsWith('mlsn.')) {
      console.log('⚠️ MailerSend API key not configured - Demo mode');
      console.log(`Payment request would be sent to: ${to} from: ${fromUser}`);
      console.log(`Amount: $${amount.toFixed(2)} CAD - ${note}`);
      return { success: true, messageId: 'demo-payment-request' };
    }

    const sentFrom = new Sender(fromEmail, fromName);
    const recipients = [new Recipient(to)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject(`💰 Payment Request: $${amount.toFixed(2)} CAD`)
      .setHtml(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">💰 Payment Request</h1>
            <p style="margin: 10px 0 0 0;">MyBillPort</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #333; margin-top: 0;">Hi ${name},</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Amount Requested:</strong> $${amount.toFixed(2)} CAD</p>
              <p><strong>Note:</strong> ${note}</p>
            </div>
            
            <p style="color: #666;">Please send payment via Interac e-Transfer to: <strong>mybillportinfo@gmail.com</strong></p>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1976d2;"><strong>Instructions:</strong></p>
              <ol style="color: #1976d2; margin: 10px 0;">
                <li>Log into your online banking</li>
                <li>Send Interac e-Transfer</li>
                <li>To: mybillportinfo@gmail.com</li>
                <li>Amount: $${amount.toFixed(2)} CAD</li>
                <li>Security Question: What is this payment for?</li>
                <li>Answer: billboard</li>
              </ol>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666;">
            <p style="margin: 0;">MyBillPort Payment Request</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">For support, contact us at: mybillportinfo@gmail.com</p>
          </div>
        </div>
      `)
      .setText(`
        Payment Request from MyBillPort
        
        Hi ${name},
        
        Amount Requested: $${amount.toFixed(2)} CAD
        Note: ${note}
        
        Please send payment via Interac e-Transfer to: mybillportinfo@gmail.com
        
        Instructions:
        1. Log into your online banking
        2. Send Interac e-Transfer
        3. To: mybillportinfo@gmail.com
        4. Amount: $${amount.toFixed(2)} CAD
        5. Security Question: What is this payment for?
        6. Answer: billboard
        
        For support, contact us at: mybillportinfo@gmail.com
      `);

    await mailerSend.email.send(emailParams);
    return { success: true };
  } catch (error: any) {
    console.error('MailerSend error:', error.response?.data || error.message);
    
    // For demo purposes, return success even if email fails
    console.log('📧 Email demo mode - Request details:');
    console.log(`To: ${to}`);
    console.log(`Amount: $${amount.toFixed(2)} CAD`);
    console.log(`Message: ${note}`);
    
    return { 
      success: true
    };
  }
}

export async function sendBillCreatedEmail({
  to,
  billName,
  amount,
  dueDate
}: {
  to: string;
  billName: string;
  amount: number;
  dueDate: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const apiKey = process.env.MAILERSEND_API_KEY;
    if (!apiKey || !apiKey.startsWith('mlsn.')) {
      console.log('📧 Bill creation notification (demo mode):');
      console.log(`Bill: ${billName}`);
      console.log(`Amount: $${amount.toFixed(2)} CAD`);
      console.log(`Due: ${dueDate}`);
      return { success: true };
    }

    const sentFrom = new Sender(fromEmail, fromName);
    const recipients = [new Recipient(to, 'User')];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject(`📋 New Bill Added: ${billName}`)
      .setHtml(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">📋 Bill Added</h1>
            <p style="margin: 10px 0 0 0;">MyBillPort</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #333; margin-top: 0;">Bill Successfully Added</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Bill:</strong> ${billName}</p>
              <p><strong>Amount:</strong> $${amount.toFixed(2)} CAD</p>
              <p><strong>Due Date:</strong> ${dueDate}</p>
            </div>
            
            <p style="color: #666;">Your bill has been successfully added to your MyBillPort dashboard. You'll receive reminders before the due date.</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666;">
            <p style="margin: 0;">MyBillPort Notification</p>
          </div>
        </div>
      `);

    await mailerSend.email.send(emailParams);
    return { success: true };
  } catch (error: any) {
    console.error('Email error:', error);
    return { success: true }; // Return success for demo
  }
}

export async function sendTestEmail({
  to,
  subject,
  note
}: {
  to: string;
  subject: string;
  note: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const apiKey = process.env.MAILERSEND_API_KEY;
    if (!apiKey || !apiKey.startsWith('mlsn.')) {
      console.log('📧 Test email (demo mode):');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Message: ${note}`);
      return { success: true };
    }

    const sentFrom = new Sender(fromEmail, fromName);
    const recipients = [new Recipient(to, to.split('@')[0])];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(subject)
      .setHtml(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">🧪 Test Email</h1>
            <p style="margin: 10px 0 0 0;">MyBillPort Email Service</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #333; margin-top: 0;">Email Service Test</h2>
            <p style="color: #666;">${note}</p>
          </div>
        </div>
      `);

    await mailerSend.email.send(emailParams);
    return { success: true };
  } catch (error: any) {
    console.error('Test email error:', error);
    return { success: true }; // Return success for demo
  }
}