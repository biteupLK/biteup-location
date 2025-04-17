import {
    GoogleMap,
    Marker,
    useLoadScript,
    Autocomplete,
  } from '@react-google-maps/api';
  import { useRef, useState } from 'react';
  import axios from 'axios';
  
  const containerStyle = {
    width: '100%',
    height: '500px',
  };
  
  const defaultCenter = {
    lat: 6.9271,
    lng: 79.8612,
  };
  
  const libraries = ['places'] as ("places")[];
  
  const MapWithSearch = () => {
    const { isLoaded } = useLoadScript({
      googleMapsApiKey: 'AIzaSyCVIbSbVplABKuBC_NOIOILnLYZ4yrfGvc',
      libraries,
    });
  
    const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  
    const onPlaceChanged = () => {
      if (autocompleteRef.current !== null) {
        const place = autocompleteRef.current.getPlace();
        if (place.geometry) {
          const lat = place.geometry.location?.lat() ?? 0;
          const lng = place.geometry.location?.lng() ?? 0;
          setMapCenter({ lat, lng });
          setMarker({ lat, lng });
        }
      }
    };
  
    const handleSave = async () => {
      if (marker) {
        try {
          await axios.post('http://localhost:8080/api/locations', {
            lat: marker.lat,
            lng: marker.lng,
          });
          alert('Location saved!');
        } catch (error) {
          alert('Failed to save location.');
          console.error(error);
        }
      }
    };
  
    if (!isLoaded) return <div>Loading map...</div>;
  
    return (
      <div>
        <Autocomplete
          onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
          onPlaceChanged={onPlaceChanged}
        >
          <input
            type="text"
            placeholder="Search a location"
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          />
        </Autocomplete>
  
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={14}
        >
          {marker && <Marker position={marker} />}
        </GoogleMap>
  
        {marker && (
          <div style={{ marginTop: '10px' }}>
            <p>
              Selected Location: <strong>{marker.lat}, {marker.lng}</strong>
            </p>
            <button onClick={handleSave}>Save Location</button>
          </div>
        )}
      </div>
    );
  };
  
  export default MapWithSearch;