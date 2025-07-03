import React, { useState } from 'react';
import { supabase } from '../config/supabase';

const TestEmail: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleTestEmail = async () => {
    if (!email) {
      setMessage('Please enter an email address');
      return;
    }

    setStatus('sending');
    setMessage('Sending test email...');

    try {
      const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          firstName: 'Test User',
          email: email,
        }
      });

      if (error) {
        throw error;
      }

      if (data && data.success) {
        setStatus('success');
        setMessage('Test email sent successfully! Check your inbox.');
      } else {
        throw new Error(data?.error || 'Failed to send test email');
      }
    } catch (error) {
      setStatus('error');
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDirectTest = async () => {
    if (!email) {
      setMessage('Please enter an email address');
      return;
    }

    setStatus('sending');
    setMessage('Testing direct API call...');

    try {
      // Test direct Resend API call to verify the key works
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer re_e9BJ9KHh_Bp15Qe26BGXcAvuTuuEvtMns`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Daily Weather Stylist <onboarding@resend.dev>',
          to: [email],
          subject: '🧪 Direct API Test',
          html: '<h1>Direct API Test</h1><p>If you see this, the API key works!</p>',
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      setStatus('success');
      setMessage(`Direct API test successful! Email ID: ${result.id}`);
    } catch (error) {
      setStatus('error');
      setMessage(`Direct API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">🧪 Test Email System</h2>
      <div className="space-y-4">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <div className="space-y-2">
          <button
            onClick={handleTestEmail}
            disabled={status === 'sending'}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {status === 'sending' ? 'Sending...' : 'Test Edge Function'}
          </button>
          <button
            onClick={handleDirectTest}
            disabled={status === 'sending'}
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            {status === 'sending' ? 'Testing...' : 'Test Direct API'}
          </button>
        </div>
        {message && (
          <div className={`p-3 rounded ${
            status === 'success' ? 'bg-green-100 text-green-700' :
            status === 'error' ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestEmail; 