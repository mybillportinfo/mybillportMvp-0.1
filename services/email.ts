import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || '',
});

console.log('MailerSend API Key configured:', !!process.env.MAILERSEND_API_KEY);

const fromEmail = 'mybillport@trial-351ndgwr0p8lzqx8.mlsender.net'; // Default MailerSend domain
const fromName = 'MyBillPort';

export async function sendPaymentRequestEmail({
  to,
  name,
  amount,
  note
}: {
  to: string;
  name: string;
  amount: number;
  note: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const sentFrom = new Sender(fromEmail, fromName);
    const recipients = [new Recipient(to, name)];

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
  } catch (error) {
    console.error('Email sending error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown email error' 
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
            <p style="margin: 0;">MyBillPort - Never Miss a Bill</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">For support, contact us at: mybillportinfo@gmail.com</p>
          </div>
        </div>
      `)
      .setText(`
        Bill Added - MyBillPort
        
        Bill Successfully Added:
        Bill: ${billName}
        Amount: $${amount.toFixed(2)} CAD
        Due Date: ${dueDate}
        
        Your bill has been successfully added to your MyBillPort dashboard. You'll receive reminders before the due date.
        
        For support, contact us at: mybillportinfo@gmail.com
      `);

    await mailerSend.email.send(emailParams);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown email error' 
    };
  }
}

export async function sendBillReminderEmail({
  to,
  name,
  amount,
  dueDate
}: {
  to: string;
  name: string;
  amount: number;
  dueDate: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const sentFrom = new Sender(fromEmail, fromName);
    const recipients = [new Recipient(to, 'User')];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject(`🔔 Bill Reminder: ${name} - $${amount.toFixed(2)}`)
      .setHtml(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">🔔 Bill Reminder</h1>
            <p style="margin: 10px 0 0 0;">MyBillPort</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #333; margin-top: 0;">Bill Due Soon</h2>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p><strong>Bill:</strong> ${name}</p>
              <p><strong>Amount:</strong> $${amount.toFixed(2)} CAD</p>
              <p><strong>Due Date:</strong> ${dueDate}</p>
            </div>
            
            <p style="color: #666;">This is a friendly reminder that your bill is due soon. Don't forget to make your payment on time to avoid any late fees.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://mybillport.com" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Dashboard</a>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666;">
            <p style="margin: 0;">MyBillPort - Never Miss a Bill</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">For support, contact us at: mybillportinfo@gmail.com</p>
          </div>
        </div>
      `)
      .setText(`
        Bill Reminder - MyBillPort
        
        Bill Due Soon:
        Bill: ${name}
        Amount: $${amount.toFixed(2)} CAD
        Due Date: ${dueDate}
        
        This is a friendly reminder that your bill is due soon. Don't forget to make your payment on time to avoid any late fees.
        
        Visit https://mybillport.com to view your dashboard.
        
        For support, contact us at: mybillportinfo@gmail.com
      `);

    await mailerSend.email.send(emailParams);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown email error' 
    };
  }
}