import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNlMTI5MzQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJtOSAxMSA3LTEtNC03LTEgN3oiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIzIi8+PC9zdmc+',
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNlMTI5MzQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJtOSAxMSA3LTEtNC03LTEgN3oiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIzIi8+PC9zdmc+',
  shadowUrl: undefined,
  iconSize: [25, 25],
  iconAnchor: [12, 25],
});

interface LocationMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

const LocationMap: React.FC<LocationMapProps> = ({ onLocationSelect }) => {
  const [position, setPosition] = useState<LatLng | null>(null);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Component for handling map clicks
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setPosition(e.latlng);
        onLocationSelect(lat, lng);
      },
    });
    return null;
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPosition = new LatLng(latitude, longitude);
        setPosition(newPosition);
        setUserLocation(newPosition);
        onLocationSelect(latitude, longitude);
        setIsLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsLocating(false);
        alert('Unable to get your location. Please click on the map to select your location manually.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  useEffect(() => {
    // Auto-request location on component mount
    requestLocation();
  }, []);

  return (
    <div className="relative">
      {/* Location Controls */}
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        <button
          onClick={requestLocation}
          disabled={isLocating}
          className="bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors duration-200 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          title="Get my location"
        >
          <Navigation className={`h-5 w-5 text-indigo-600 ${isLocating ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
        </button>
      </div>

      {/* Instruction Panel */}
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-xs border border-gray-200">
        <div className="flex items-start space-x-3">
          <MapPin className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              {position ? 'Location Selected!' : 'Select Your Location'}
            </p>
            <p className="text-xs text-gray-600">
              {position 
                ? 'You can click elsewhere to change your location'
                : 'Click the navigation button or click anywhere on the map'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-96 rounded-xl overflow-hidden">
        <MapContainer
          center={userLocation || new LatLng(40.7128, -74.0060)} // Default to NYC
          zoom={userLocation ? 13 : 3}
          className="h-full w-full"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapClickHandler />
          
          {position && (
            <Marker position={position}>
              <Popup>
                <div className="text-center p-2">
                  <MapPin className="h-5 w-5 text-indigo-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Your Selected Location</p>
                  <p className="text-sm text-gray-600">
                    {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Daily weather updates will be sent for this location
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Status Messages */}
      {isLocating && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000]">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <Navigation className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Getting your location...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationMap;