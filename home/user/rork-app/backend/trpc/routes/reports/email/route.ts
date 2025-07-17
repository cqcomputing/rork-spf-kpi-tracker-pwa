import { z } from "zod";
import { publicProcedure } from "../../../create-context";

// Email service configuration
const EMAIL_CONFIG = {
  // Set via environment variable or default to 'mock'
  provider: (process.env.EMAIL_PROVIDER || 'mock') as 'mock' | 'nodemailer' | 'sendgrid',
  
  // SMTP settings for nodemailer (when provider is 'nodemailer')
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  },
  
  // SendGrid API key (when provider is 'sendgrid')
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
  },
  
  // Default sender
  from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
};

// Log the current email provider on startup
console.log(`📧 Email service initialized with provider: ${EMAIL_CONFIG.provider}`);

interface ReportData {
  dateRange: string;
  totalEntries: number;
  totalPoints: number;
  actionBreakdown: Record<string, number>;
  userBreakdown: Record<string, { entries: number; points: number }>;
  filteredEntries: Array<{
    id: string;
    userId: string;
    actionId: string;
    date: string;
    notes?: string;
  }>;
}

// Generate CSV content
function generateCSV(data: ReportData): string {
  const lines = [];
  
  // Header
  lines.push('KPI Performance Report');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Date Range: ${data.dateRange}`);
  lines.push('');
  
  // Summary
  lines.push('SUMMARY');
  lines.push(`Total Actions,${data.totalEntries}`);
  lines.push(`Total Points,${data.totalPoints}`);
  lines.push(`Active Users,${Object.keys(data.userBreakdown).length}`);
  lines.push('');
  
  // Action Breakdown
  lines.push('ACTION BREAKDOWN');
  lines.push('Action ID,Count');
  Object.entries(data.actionBreakdown)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .forEach(([actionId, count]) => {
      lines.push(`${actionId},${count}`);
    });
  lines.push('');
  
  // User Performance
  lines.push('USER PERFORMANCE');
  lines.push('User ID,Actions,Points');
  Object.entries(data.userBreakdown)
    .sort(([,a], [,b]) => (b as any).points - (a as any).points)
    .forEach(([userId, stats]) => {
      lines.push(`${userId},${stats.entries},${stats.points}`);
    });
  lines.push('');
  
  // Detailed Entries
  lines.push('DETAILED ENTRIES');
  lines.push('Date,User ID,Action ID,Notes');
  data.filteredEntries.forEach(entry => {
    const notes = (entry.notes || '').replace(/,/g, ';'); // Escape commas
    lines.push(`${entry.date},${entry.userId},${entry.actionId},"${notes}"`);
  });
  
  return lines.join('\n');
}

// Generate HTML content for PDF/Email
function generateHTML(data: ReportData): string {
  const actionBreakdownRows = Object.entries(data.actionBreakdown)
    .sort(([,a], [,b]) => b - a)
    .map(([actionId, count]) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${actionId}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${count}</td>
      </tr>
    `).join('');
  
  const userBreakdownRows = Object.entries(data.userBreakdown)
    .sort(([,a], [,b]) => b.points - a.points)
    .map(([userId, stats]) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${userId}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${stats.entries}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${stats.points}</td>
      </tr>
    `).join('');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>KPI Performance Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center; }
        .summary-item { padding: 15px; background: white; border-radius: 6px; }
        .summary-value { font-size: 24px; font-weight: bold; color: #007bff; }
        .summary-label { font-size: 12px; color: #666; margin-top: 5px; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333; }
        table { width: 100%; border-collapse: collapse; background: white; }
        th { background: #f8f9fa; padding: 12px 8px; text-align: left; font-weight: bold; }
        td { padding: 8px; border-bottom: 1px solid #eee; }
        .text-right { text-align: right; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>KPI Performance Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p>Date Range: ${data.dateRange}</p>
      </div>
      
      <div class="summary">
        <h2>Summary</h2>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-value">${data.totalEntries}</div>
            <div class="summary-label">Total Actions</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${data.totalPoints}</div>
            <div class="summary-label">Total Points</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${Object.keys(data.userBreakdown).length}</div>
            <div class="summary-label">Active Users</div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2 class="section-title">Top Actions</h2>
        <table>
          <thead>
            <tr>
              <th>Action</th>
              <th class="text-right">Count</th>
            </tr>
          </thead>
          <tbody>
            ${actionBreakdownRows}
          </tbody>
        </table>
      </div>
      
      <div class="section">
        <h2 class="section-title">User Performance</h2>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th class="text-right">Actions</th>
              <th class="text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            ${userBreakdownRows}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;
}

// Mock email service (for testing)
async function sendMockEmail(to: string, subject: string, content: string, attachment?: { filename: string; content: string }) {
  console.log('=== MOCK EMAIL SERVICE ===');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Content Length: ${content.length} characters`);
  if (attachment) {
    console.log(`Attachment: ${attachment.filename} (${attachment.content.length} characters)`);
  }
  console.log('=========================');
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return { success: true, messageId: 'mock-' + Date.now() };
}

// Real email service (you can implement this with your preferred provider)
async function sendRealEmail(to: string, subject: string, content: string, attachment?: { filename: string; content: string }) {
  // TODO: Implement with your preferred email service
  // Example implementations:
  
  /*
  // Nodemailer example:
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransporter(EMAIL_CONFIG.smtp);
  
  const mailOptions = {
    from: EMAIL_CONFIG.from,
    to,
    subject,
    html: content,
    attachments: attachment ? [{
      filename: attachment.filename,
      content: attachment.content,
    }] : [],
  };
  
  return await transporter.sendMail(mailOptions);
  */
  
  /*
  // SendGrid example:
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(EMAIL_CONFIG.sendgrid.apiKey);
  
  const msg = {
    to,
    from: EMAIL_CONFIG.from,
    subject,
    html: content,
    attachments: attachment ? [{
      content: Buffer.from(attachment.content).toString('base64'),
      filename: attachment.filename,
      type: attachment.filename.endsWith('.csv') ? 'text/csv' : 'application/pdf',
      disposition: 'attachment',
    }] : [],
  };
  
  return await sgMail.send(msg);
  */
  
  throw new Error('Real email service not configured. Please implement sendRealEmail function.');
}

export default publicProcedure
  .input(z.object({
    to: z.string().email(),
    format: z.enum(['pdf', 'csv']),
    reportData: z.object({
      dateRange: z.string(),
      totalEntries: z.number(),
      totalPoints: z.number(),
      actionBreakdown: z.record(z.string(), z.number()),
      userBreakdown: z.record(z.string(), z.object({
        entries: z.number(),
        points: z.number(),
      })),
      filteredEntries: z.array(z.object({
        id: z.string(),
        userId: z.string(),
        actionId: z.string(),
        date: z.string(),
        notes: z.string().optional(),
      })),
    }),
  }))
  .mutation(async ({ input }: { input: { to: string; format: 'pdf' | 'csv'; reportData: ReportData } }) => {
    const { to, format, reportData } = input;
    
    try {
      let attachment: { filename: string; content: string } | undefined;
      let emailContent: string;
      
      if (format === 'csv') {
        // Generate CSV attachment
        const csvContent = generateCSV(reportData);
        attachment = {
          filename: `kpi-report-${new Date().toISOString().split('T')[0]}.csv`,
          content: csvContent,
        };
        
        // Simple HTML email for CSV
        emailContent = `
          <h2>KPI Performance Report</h2>
          <p>Please find your KPI performance report attached as a CSV file.</p>
          <p><strong>Report Summary:</strong></p>
          <ul>
            <li>Date Range: ${reportData.dateRange}</li>
            <li>Total Actions: ${reportData.totalEntries}</li>
            <li>Total Points: ${reportData.totalPoints}</li>
            <li>Active Users: ${Object.keys(reportData.userBreakdown).length}</li>
          </ul>
          <p>Best regards,<br>Your KPI Team</p>
        `;
      } else {
        // Generate HTML content for PDF (or rich HTML email)
        emailContent = generateHTML(reportData);
        
        // For PDF, you could generate actual PDF here using puppeteer or similar
        // For now, we'll send the rich HTML email
      }
      
      const subject = `KPI Performance Report - ${reportData.dateRange}`;
      
      // Send email based on configured provider
      let result;
      if (EMAIL_CONFIG.provider === 'mock') {
        result = await sendMockEmail(to, subject, emailContent, attachment);
      } else {
        result = await sendRealEmail(to, subject, emailContent, attachment);
      }
      
      return {
        success: true,
        messageId: result?.messageId || 'unknown',
        message: `Report sent successfully to ${to}`,
      };
      
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });