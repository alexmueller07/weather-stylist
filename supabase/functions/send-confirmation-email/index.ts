import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
};

interface EmailRequest {
  firstName: string;
  email: string;
}

const sendConfirmationEmail = async (userData: EmailRequest) => {
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

    // Send email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Daily Weather Stylist <onboarding@resend.dev>',
        to: [userData.email],
        subject: `Welcome to Daily Weather Stylist, ${userData.firstName}! 🌤️`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      throw new Error(`Email service error: ${emailResponse.status} - ${errorData}`);
    }

    const emailResult = await emailResponse.json();
    console.log(`✅ Confirmation email sent successfully to ${userData.email}:`, emailResult.id);

    return { success: true, message: 'Email sent successfully', emailId: emailResult.id };
  } catch (error) {
    console.error(`❌ Error sending confirmation email to ${userData.email}:`, error);
    return { success: false, error: error.message };
  }
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { firstName, email } = await req.json();

    if (!firstName || !email) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing firstName or email' 
        }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          }
        }
      );
    }

    const result = await sendConfirmationEmail({ firstName, email });

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Error in send-confirmation-email function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    );
  }
}); 