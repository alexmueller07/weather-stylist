import { Resend } from 'resend';

// Initialize Resend (you'll need to add VITE_RESEND_API_KEY to your environment variables)
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export const sendConfirmationEmail = async (userData: {
  firstName: string;
  email: string;
}) => {
  try {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
              background-color: #f8f9fa;
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 10px 10px 0 0; 
            }
            .content { 
              background: white; 
              padding: 30px; 
              border-radius: 0 0 10px 10px; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .welcome-message { 
              font-size: 1.2em; 
              margin: 20px 0; 
              color: #667eea;
            }
            .next-steps { 
              background: #e3f2fd; 
              padding: 20px; 
              border-radius: 8px; 
              border-left: 4px solid #2196f3; 
              margin: 20px 0;
            }
            .footer { 
              text-align: center; 
              padding: 20px; 
              color: #666; 
              font-size: 0.9em; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌤️ Welcome to Daily Weather Stylist!</h1>
            <p>You're all set up for daily weather & style updates</p>
          </div>
          
          <div class="content">
            <div class="welcome-message">
              <h2>Hi ${userData.firstName}! 👋</h2>
              <p>Welcome to Daily Weather Stylist! We're excited to help you start each day with the perfect outfit.</p>
            </div>
            
            <div class="next-steps">
              <h3>🎯 What happens next?</h3>
              <ul>
                <li><strong>Tomorrow at 5:00 AM</strong> - You'll receive your first weather update and outfit recommendation</li>
                <li><strong>Daily emails</strong> - Personalized weather forecasts and clothing suggestions</li>
                <li><strong>Smart recommendations</strong> - Based on real-time weather data in your area</li>
              </ul>
            </div>
            
            <p>We'll analyze the weather in your area and send you personalized outfit recommendations to help you dress perfectly for the day ahead!</p>
            
            <p>Have a great day, ${userData.firstName}! ☀️</p>
          </div>
          
          <div class="footer">
            <p>Daily Weather Stylist | Your personal weather & style assistant</p>
            <p><small>To unsubscribe or update your preferences, please contact support.</small></p>
          </div>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Daily Weather Stylist <hello@dailyweatherstylist.com>',
      to: [userData.email],
      subject: `Welcome to Daily Weather Stylist, ${userData.firstName}! 🌤️`,
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending confirmation email:', error);
      throw error;
    }

    console.log('Confirmation email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    throw error;
  }
};

// Test function to verify email system is working
export const sendTestEmail = async (email: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Daily Weather Stylist <hello@dailyweatherstylist.com>',
      to: [email],
      subject: '🧪 Test Email - Daily Weather Stylist',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #667eea;">🧪 Email System Test</h1>
          <p>This is a test email to verify that the Daily Weather Stylist email system is working correctly.</p>
          <p>If you received this email, congratulations! The email system is properly configured.</p>
          <p>Time sent: ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending test email:', error);
      throw error;
    }

    console.log('Test email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send test email:', error);
    throw error;
  }
}; 