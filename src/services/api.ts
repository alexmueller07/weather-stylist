import { UserSubmissionData } from '../types';
import { supabase } from '../config/supabase';

export const submitUserData = async (userData: UserSubmissionData): Promise<void> => {
  try {
    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userData.email)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (existingUser) {
      throw new Error('Email already registered. You can only sign up once per email address.');
    }

    // Insert new user
    const { error: insertError } = await supabase
      .from('users')
      .insert([{
        first_name: userData.firstName,
        email: userData.email,
        latitude: userData.latitude,
        longitude: userData.longitude,
        timezone: userData.timezone,
        city: userData.city, // <-- add this line
        is_active: true,
        created_at: new Date().toISOString(),
      }]);

    if (insertError) {
      throw insertError;
    }

    console.log('User data submitted successfully');

    // Send confirmation email via Supabase Edge Function
    try {
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          firstName: userData.firstName,
          email: userData.email,
        }
      });

      if (emailError) {
        console.error('Error calling email function:', emailError);
        throw emailError;
      }

      if (emailData && emailData.success) {
        console.log('Confirmation email sent successfully');
      } else {
        console.error('Email function returned error:', emailData);
        throw new Error(emailData?.error || 'Failed to send confirmation email');
      }
    } catch (emailError) {
      console.error('Failed to send confirmation email, but user was registered:', emailError);
      // Don't throw here - user registration was successful, email failure is secondary
    }

  } catch (error) {
    console.error('Error submitting user data:', error);
    throw error;
  }
};