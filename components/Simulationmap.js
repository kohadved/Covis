// components/SimulationMap.js
import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet’s default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SimulationMap = ({
  people,
  lockdownAreas,
  hospitals,
  streetRoutes,
  mapCenter,
  mapZoom,
}) => {
  return (
    <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
{/* 
      Street routes
      {streetRoutes.map((route) => (
        <Polyline
          key={route.id}
          positions={route.path}
          pathOptions={{ color: 'white', weight: 3, opacity: 0.7 }}
        />
      ))} */}

      {/* Moving dots */}
      {people.map((person) => (
        <CircleMarker
          key={person.id}
          center={person.position}
          radius={3}
          pathOptions={{ color: person.infected ? 'red' : 'green' }}
        />
      ))}

      {/* Lockdown areas */}
      {lockdownAreas.map((area) => (
        <Circle
          key={area.id}
          center={area.center}
          radius={area.radius}
          pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.2 }}
        />
      ))}

      {/* Hospitals */}
      {hospitals.map((hosp) => (
        <Marker key={hosp.id} position={hosp.position}>
          <Popup>
            <div>
              <h4>{hosp.name}</h4>
              <p>ICU Shortage: {hosp.icuShortage}%</p>
              <p>Medicine Shortage: {hosp.medShortage}%</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default SimulationMap;
