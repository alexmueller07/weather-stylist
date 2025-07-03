import React, { useState, useEffect } from 'react';
import { MapPin, Mail, User, Cloud, Sun, CloudRain } from 'lucide-react';
import LocationMap from './LocationMap';
import UserForm from './UserForm';
import { submitUserData } from '../services/api';
import { UserData } from '../types';
import { getTimezoneFromCoordinates, formatTimeInTimezone } from '../utils/timezone';

const LandingPage: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedTimezone, setSelectedTimezone] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate the current time in the selected timezone
  const getCurrentLocationTime = () => {
    if (selectedTimezone) {
      try {
        return new Intl.DateTimeFormat('en-US', {
          timeZone: selectedTimezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(currentTime);
      } catch (error) {
        console.error('Error formatting time:', error);
        return currentTime.toLocaleTimeString();
      }
    }
    return currentTime.toLocaleTimeString();
  };

  const getCityFromCoords = async (lat: number, lng: number): Promise<string> => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'WeatherStylistApp/1.0 (test@example.com)'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch city name');
      const data = await response.json();
      return data.address.city || data.address.town || data.address.village || data.address.hamlet || data.address.state || '';
    } catch (error) {
      console.error('Error fetching city name:', error);
      return '';
    }
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    
    // Get timezone for the selected location
    try {
      const timezone = await getTimezoneFromCoordinates(lat, lng);
      setSelectedTimezone(timezone);
    } catch (error) {
      console.error('Error getting timezone:', error);
      setSelectedTimezone('UTC');
    }
    // Get city for the selected location
    try {
      const city = await getCityFromCoords(lat, lng);
      setSelectedCity(city);
    } catch (error) {
      setSelectedCity('');
    }
  };

  const handleFormSubmit = async (userData: UserData) => {
    if (!selectedLocation) {
      alert('Please select your location on the map first');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Use the selected location's timezone, not the user's system timezone
      const timezone = selectedTimezone || await getTimezoneFromCoordinates(selectedLocation.lat, selectedLocation.lng);
      
      await submitUserData({
        ...userData,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        timezone,
        city: selectedCity,
      });

      setSubmitStatus('success');
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center items-center mb-6">
              <div className="bg-white bg-opacity-20 rounded-full p-4 backdrop-blur-sm">
                <Cloud className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              Daily Weather Stylist
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-6 max-w-3xl mx-auto">
              Your personal weather assistant that delivers daily clothing recommendations 
              straight to your inbox every morning at 5am
            </p>
            <div className="flex justify-center items-center space-x-6 text-blue-100">
              <div className="flex items-center space-x-2">
                <Sun className="h-5 w-5" />
                <span>Weather Updates</span>
              </div>
              <div className="flex items-center space-x-2">
                <CloudRain className="h-5 w-5" />
                <span>Style Recommendations</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Daily Emails</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating weather icons */}
        <div className="absolute top-1/4 left-1/4 animate-float opacity-20">
          <Sun className="h-8 w-8 text-yellow-300" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float-delayed opacity-20">
          <CloudRain className="h-8 w-8 text-blue-300" />
        </div>
        <div className="absolute bottom-1/4 left-1/3 animate-float opacity-20">
          <Cloud className="h-8 w-8 text-gray-300" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Map Section */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center lg:justify-start">
                <MapPin className="h-8 w-8 text-indigo-600 mr-3" />
                Choose Your Location
              </h2>
              <p className="text-gray-600 text-lg">
                {selectedLocation 
                  ? `Selected: ${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`
                  : 'Click on the map or allow location access to set your daily weather location'
                }
              </p>
              {selectedCity && (
                <p className="text-sm text-blue-700 mt-1">City: {selectedCity}</p>
              )}
              {selectedTimezone && (
                <p className="text-sm text-gray-500 mt-1">
                  Timezone: {selectedTimezone}
                </p>
              )}
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <LocationMap onLocationSelect={handleLocationSelect} />
            </div>
            
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">How it works</h3>
              <div className="space-y-3 text-blue-100">
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 rounded-full p-1">
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <span>Share your location and contact info</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 rounded-full p-1">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <span>We analyze daily weather patterns</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 rounded-full p-1">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <span>Get personalized outfit suggestions at 5am</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center lg:justify-start">
                <User className="h-8 w-8 text-indigo-600 mr-3" />
                Get Started Today
              </h2>
              <p className="text-gray-600 text-lg">
                Join thousands who start their day with perfect outfit recommendations
              </p>
            </div>

            {submitStatus === 'success' ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-900 mb-2">Welcome aboard!</h3>
                <p className="text-green-700 text-lg">
                  You'll receive your first weather update and outfit recommendation tomorrow at 5am in {selectedTimezone || 'your selected location'}. 
                  Check your email for a confirmation message.
                </p>
              </div>
            ) : (
              <UserForm 
                onSubmit={handleFormSubmit} 
                isSubmitting={isSubmitting}
                hasLocationSelected={!!selectedLocation}
              />
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-red-700">
                  Oops! Something went wrong. Please try again.
                </p>
              </div>
            )}

            {/* Live Clock */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="text-center">
                <p className="text-gray-600 mb-2">
                  {selectedTimezone ? `Current time in ${selectedTimezone}` : 'Your current time'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {getCurrentLocationTime()}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Emails will be sent at 5:00 AM in this location's timezone
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <Cloud className="h-8 w-8 text-indigo-400 mr-2" />
              <span className="text-xl font-bold text-white">Daily Weather Stylist</span>
            </div>
            <p className="text-gray-400 mb-4">
              Never wonder what to wear again. Get personalized daily weather and style recommendations.
            </p>
            <p className="text-sm text-gray-500">
              © 2025 Daily Weather Stylist. Made with ❤️ for better mornings.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;