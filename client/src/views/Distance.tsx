import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DeliveryData, RestaurantData } from '../sample-data/LocationData';

const Distance: React.FC = () => {
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    const fetchDistance = async () => {
      const origin = `${RestaurantData[0].lat},${RestaurantData[0].lng}`;
      const destination = `${DeliveryData[0].lat},${DeliveryData[0].lng}`;
      const apiKey = 'AIzaSyCVIbSbVplABKuBC_NOIOILnLYZ4yrfGvc';

      const url = `http://localhost:3001/distance?origin=${origin}&destination=${destination}`;
      try {
        const response = await axios.get(url);
        console.log(response.data); // 👀 Debug log

        if (response.data.status === 'OK') {
          const result = response.data.rows[0].elements[0];
          setDistance(result.distance.text);
          setDuration(result.duration.text);
        } else {
          console.error('Distance Matrix error:', response.data.status);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };

    fetchDistance();
  }, []);

  return (
    <div>
      <h1>You have {distance}</h1>
      <h1>Your time is {duration}</h1>
    </div>
  );
};

export default Distance;
