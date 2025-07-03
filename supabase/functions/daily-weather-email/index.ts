/*
  Daily Weather Email Function
  
  This edge function runs daily to send personalized weather and clothing 
  recommendations to all active users at 5am in their local timezone.
*/

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface User {
  id: string;
  first_name: string;
  email: string;
  latitude: number;
  longitude: number;
  timezone: string;
  city?: string;
}

interface WeatherData {
  hourly: {
    temperature_2m: number[];
    weathercode: number[];
    time: string[];
    relative_humidity_2m: number[];
    precipitation_probability: number[];
    windspeed_10m: number[];
  };
}

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const fetchWeatherData = async (latitude: number, longitude: number, timezone: string, date: string): Promise<WeatherData> => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode&timezone=${encodeURIComponent(timezone)}&start_date=${date}&end_date=${date}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }
  
  return await response.json();
};

const getClothingRecommendation = (highTemp: number, lowTemp: number, weatherCode: number): { outfit: string; reason: string } => {
  const isRainy = weatherCode >= 61 && weatherCode <= 67;
  const isSnowy = weatherCode >= 71 && weatherCode <= 77;
  const isCloudy = weatherCode >= 2 && weatherCode <= 3;
  let outfit = '';
  let reason = '';
  
  if (highTemp >= 90) {
    outfit = 'very light shorts, a tank top, and sandals';
    reason = "It's extremely hot today, so wear the coolest clothes you have";
  } else if (highTemp >= 80) {
    outfit = 'light shorts, a breathable t-shirt, and sneakers or sandals';
    reason = "It's hot today, so stay cool and comfortable";
  } else if (highTemp >= 70) {
    outfit = 'comfortable pants or shorts with a light shirt or blouse';
    reason = "Warm weather, dress for comfort";
    if (lowTemp < 60) outfit += ' (bring a light jacket for the evening)';
  } else if (highTemp >= 60) {
    outfit = 'jeans or pants with a sweater or light jacket';
    reason = "Mild temperatures, layers are a good idea";
    if (lowTemp < 50) outfit += ' (bring a medium jacket for later)';
  } else if (highTemp >= 45) {
    outfit = 'warm pants, a sweater, and a medium jacket';
    reason = "Chilly weather, bundle up a bit";
  } else if (highTemp >= 30) {
    outfit = 'warm layers, a heavy coat, scarf, and gloves';
    reason = "Cold weather ahead - stay warm and cozy";
  } else {
    outfit = 'your warmest winter gear, including thermal layers, heavy coat, hat, scarf, and insulated boots';
    reason = "It's freezing out there - dress for extreme cold";
  }
  
  if (isRainy && highTemp < 80) {
    outfit += ' with a waterproof jacket or umbrella';
    reason += ' with rain protection';
  } else if (isSnowy && highTemp < 40) {
    outfit += ' with waterproof boots and extra warm layers';
    reason += ' and snow gear';
  } else if (isCloudy) {
    outfit += ' (and maybe bring a light jacket just in case)';
    reason += ' with cloud cover';
  }
  
  return {
    outfit,
    reason
  };
};

const getWeatherDescription = (weatherCode: number): string => {
  const descriptions: { [key: number]: string } = {
    0: 'clear and sunny',
    1: 'mainly clear',
    2: 'partly cloudy',
    3: 'overcast',
    45: 'foggy',
    48: 'foggy with rime',
    51: 'light drizzle',
    53: 'moderate drizzle',
    55: 'dense drizzle',
    61: 'slight rain',
    63: 'moderate rain',
    65: 'heavy rain',
    71: 'slight snow',
    73: 'moderate snow',
    75: 'heavy snow',
    80: 'light rain showers',
    81: 'moderate rain showers',
    82: 'heavy rain showers',
    95: 'thunderstorm',
    96: 'thunderstorm with hail',
    99: 'severe thunderstorm with hail',
  };
  
  return descriptions[weatherCode] || 'mixed conditions';
};

const sendEmail = async (user: User, todayWeather: WeatherData, yesterdayWeather: WeatherData) => {
  try {
    const { temperature_2m: tToday, weathercode: wToday, time: timeToday } = todayWeather.hourly;
    const { temperature_2m: tYest, time: timeYest } = yesterdayWeather.hourly;
    
    const highTempC = Math.max(...tToday);
    const lowTempC = Math.min(...tToday);
    const highTempF = Math.round(highTempC * 9 / 5 + 32);
    const lowTempF = Math.round(lowTempC * 9 / 5 + 32);
    
    const highTempCYest = Math.max(...tYest);
    const highTempFYest = Math.round(highTempCYest * 9 / 5 + 32);
    
    const noonIdx = 12;
    const primaryWeatherCode = wToday[noonIdx] || wToday[0];
    
    let comparison = '';
    if (highTempF > highTempFYest + 2) comparison = 'Today will be warmer than yesterday.';
    else if (highTempF < highTempFYest - 2) comparison = 'Today will be colder than yesterday.';
    else comparison = 'Today will be about the same as yesterday.';
    
    const { outfit, reason } = getClothingRecommendation(highTempF, lowTempF, primaryWeatherCode);
    const weatherDescription = getWeatherDescription(primaryWeatherCode);
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .weather-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .temp-display { font-size: 2em; font-weight: bold; color: #667eea; text-align: center; margin: 10px 0; }
            .outfit-recommendation { background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌤️ Good Morning, ${user.first_name}!</h1>
            <p>Your daily weather & style update</p>
          </div>
          
          <div class="content">
            <div class="weather-card">
              <h2>Today's Weather</h2>
              <p>${comparison}</p>
              <p>It's looking like a <strong>${weatherDescription}</strong> day in ${user.city || 'your area'}!</p>
              <div class="temp-display">
                High: ${highTempF}°F | Low: ${lowTempF}°F
              </div>
            </div>
            
            <div class="outfit-recommendation">
              <h3>👔 Today's Outfit Recommendation</h3>
              <p><strong>Wear:</strong> ${outfit}</p>
              <p><em>${reason}!</em></p>
            </div>
            
            <p>Have a wonderful day, ${user.first_name}! ☀️</p>
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
        from: 'Daily Weather Stylist <hello@dailyweatherstylist.com>',
        to: [user.email],
        subject: `Good Morning, ${user.first_name}! ☀️`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      throw new Error(`Email service error: ${emailResponse.status} - ${errorData}`);
    }

    const emailResult = await emailResponse.json();
    console.log(`✅ Email sent successfully to ${user.email}:`, emailResult.id);

    return { success: true, message: 'Email sent successfully', emailId: emailResult.id };
  } catch (error) {
    console.error(`❌ Error sending email to ${user.email}:`, error);
    return { success: false, error: error.message };
  }
};

const processUsersForTimeSlot = async (targetHour: number) => {
  try {
    // Get users who should receive emails at this hour (5am in their timezone)
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching users:', error);
      return { processed: 0, errors: 1 };
    }

    if (!users || users.length === 0) {
      console.log('No active users found');
      return { processed: 0, errors: 0 };
    }

    let processed = 0;
    let errors = 0;

    for (const user of users) {
      try {
        // Calculate what time it is in the user's timezone
        const now = new Date();
        const userTime = new Intl.DateTimeFormat('en-US', {
          timeZone: user.timezone,
          hour: 'numeric',
          hour12: false
        }).format(now);
        const userHour = parseInt(userTime);

        console.log(`User ${user.email} timezone: ${user.timezone}, current hour: ${userHour}, target hour: ${targetHour}`);

        // Only send email if it's 5am in the user's timezone (or close to it for testing)
        if (userHour === targetHour) {
          const todayStr = now.toISOString().split('T')[0];
          const yesterday = new Date(now.getTime() - 86400000);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          const todayWeather = await fetchWeatherData(user.latitude, user.longitude, user.timezone, todayStr);
          const yesterdayWeather = await fetchWeatherData(user.latitude, user.longitude, user.timezone, yesterdayStr);
          const result = await sendEmail(user, todayWeather, yesterdayWeather);
          
          if (result.success) {
            processed++;
            console.log(`✅ Processed email for ${user.email}`);
          } else {
            errors++;
            console.error(`❌ Failed to process email for ${user.email}:`, result.error);
          }
        } else {
          console.log(`⏰ Skipping ${user.email} - it's ${userHour}:00 in their timezone, not ${targetHour}:00`);
        }
      } catch (error) {
        errors++;
        console.error(`❌ Error processing user ${user.email}:`, error);
      }
    }

    return { processed, errors, totalUsers: users.length };
  } catch (error) {
    console.error('Error in processUsersForTimeSlot:', error);
    return { processed: 0, errors: 1 };
  }
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Default to 5am for production, but allow override for testing
    const url = new URL(req.url);
    const targetHour = parseInt(url.searchParams.get('hour') || '5');
    
    console.log(`🌅 Starting daily weather email process for ${targetHour}:00 local time`);
    
    const result = await processUsersForTimeSlot(targetHour);
    
    const response = {
      success: true,
      message: `Daily weather email process completed`,
      data: result,
      timestamp: new Date().toISOString(),
    };

    console.log('📊 Process summary:', result);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Error in daily weather email function:', error);
    
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