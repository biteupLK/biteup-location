import React, { useEffect, useState } from 'react';
import { GoogleMap, useLoadScript, Polyline } from '@react-google-maps/api';
import axios from 'axios';
import { DeliveryData, RestaurantData } from '../sample-data/LocationData';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const center = {
  lat: (RestaurantData[0].lat + DeliveryData[0].lat) / 2,
  lng: (RestaurantData[0].lng + DeliveryData[0].lng) / 2,
};

const Distance: React.FC = () => {
  const [routePath, setRoutePath] = useState<google.maps.LatLngLiteral[]>([]);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyCVIbSbVplABKuBC_NOIOILnLYZ4yrfGvc',
    libraries: ['geometry'],
  });

  useEffect(() => {
    const fetchRoute = async () => {
      const apiKey = 'AIzaSyCVIbSbVplABKuBC_NOIOILnLYZ4yrfGvc';
      const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';

      const headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline',
      };

      const data = {
        origin: {
          location: {
            latLng: {
              latitude: RestaurantData[0].lat,
              longitude: RestaurantData[0].lng,
            },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: DeliveryData[0].lat,
              longitude: DeliveryData[0].lng,
            },
          },
        },
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_AWARE',
      };

      try {
        const response = await axios.post(url, data, { headers });
        const route = response.data.routes[0];

        const decodedPath = window.google.maps.geometry.encoding.decodePath(
          route.polyline.encodedPolyline
        );

        const latLngs = decodedPath.map((latlng: google.maps.LatLng) => ({
          lat: latlng.lat(),
          lng: latlng.lng(),
        }));

        setRoutePath(latLngs);
        setDistance((route.distanceMeters / 1000).toFixed(2) + ' km');
        setDuration(route.duration.replace('s', ' seconds'));
      } catch (error) {
        console.error('Failed to fetch route:', error);
      }
    };

    if (isLoaded) {
      fetchRoute();
    }
  }, [isLoaded]);

  return (
    <div>
      <h2>Route Preview</h2>
      <p>Distance: {distance}</p>
      <p>Duration: {duration}</p>

      {isLoaded && (
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={8}>
          {routePath.length > 0 && (
            <Polyline
              path={routePath}
              options={{ strokeColor: '#1976D2', strokeOpacity: 0.8, strokeWeight: 4 }}
            />
          )}
        </GoogleMap>
      )}
    </div>
  );
};

export default Distance;
