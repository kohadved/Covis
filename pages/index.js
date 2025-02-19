// pages/index.js
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '../components/Sidebar';
import styles from '../styles/Home.module.css';

// Dynamically import the map so it only renders on the client.
const SimulationMap = dynamic(() => import('../components/SimulationMap'), { ssr: false });

/* ----- Define Street Routes (simulate roads in a small downtown area) ----- */
const streetRoutes = [
  {
    id: 1,
    name: 'Main Street',
    path: [
      [34.0522, -118.2600],
      [34.0522, -118.2400],
    ],
  },
  {
    id: 2,
    name: 'Central Avenue',
    path: [
      [34.0600, -118.2500],
      [34.0400, -118.2500],
    ],
  },
  {
    id: 3,
    name: 'Diagonal Road',
    path: [
      [34.0550, -118.2650],
      [34.0500, -118.2450],
      [34.0450, -118.2300],
    ],
  },
];

/* ----- Define Lockdown Areas as Circles ----- */
const lockdownAreas = [
  {
    id: 1,
    name: 'Downtown Lockdown',
    center: [34.0522, -118.2500],
    radius: 500, // in meters
  },
  {
    id: 2,
    name: 'Central Lockdown',
    center: [34.048, -118.240],
    radius: 300,
  },
];

/* ----- Define Hospital Data ----- */
const hospitals = [
  {
    id: 1,
    name: 'Saint Mary Hospital',
    position: [34.0525, -118.2520],
    icuShortage: 40, // percentage shortage
    medShortage: 55,
  },
  {
    id: 2,
    name: 'City Health Center',
    position: [34.0490, -118.2450],
    icuShortage: 60,
    medShortage: 70,
  },
];

/* ----- Helper Functions ----- */

// Haversine distance (in meters)
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = Math.PI / 180;
  const φ1 = lat1 * toRad;
  const φ2 = lat2 * toRad;
  const Δφ = (lat2 - lat1) * toRad;
  const Δλ = (lon2 - lon1) * toRad;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Given a route (array of coordinates) and a progress value (0 to 1),
// compute the current position along the route.
function getPositionAlongRoute(routePath, progress) {
  let segments = [];
  let totalLength = 0;
  for (let i = 0; i < routePath.length - 1; i++) {
    const [lat1, lon1] = routePath[i];
    const [lat2, lon2] = routePath[i + 1];
    const segLength = haversineDistance(lat1, lon1, lat2, lon2);
    segments.push(segLength);
    totalLength += segLength;
  }
  let distanceAlong = progress * totalLength;
  let accumulated = 0;
  for (let i = 0; i < segments.length; i++) {
    if (accumulated + segments[i] >= distanceAlong) {
      const segmentProgress = (distanceAlong - accumulated) / segments[i];
      const [lat1, lon1] = routePath[i];
      const [lat2, lon2] = routePath[i + 1];
      const lat = lat1 + (lat2 - lat1) * segmentProgress;
      const lon = lon1 + (lon2 - lon1) * segmentProgress;
      return [lat, lon];
    }
    accumulated += segments[i];
  }
  return routePath[routePath.length - 1];
}

export default function Home() {
  const [people, setPeople] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    infected: 0,
    locked: 0,
    virality: 1.5,
  });

  /* ----- Initialize People on a Route ----- */
  useEffect(() => {
    const totalPeople = 200; // denser simulation
    const newPeople = [];
    for (let i = 0; i < totalPeople; i++) {
      const routeIndex = Math.floor(Math.random() * streetRoutes.length);
      const route = streetRoutes[routeIndex];
      const progress = Math.random();
      const speed = 0.0005 + Math.random() * 0.001; // fraction per tick
      const position = getPositionAlongRoute(route.path, progress);
      newPeople.push({
        id: i,
        routeIndex,
        progress,
        speed,
        infected: Math.random() < 0.1, // 10% chance to be infected
        locked: false,
        position,
      });
    }
    setPeople(newPeople);
  }, []);

  /* ----- Simulation Update (every 100ms for smooth animation) ----- */
  useEffect(() => {
    const interval = setInterval(() => {
      setPeople(oldPeople =>
        oldPeople.map(person => {
          if (person.locked) return person; // Do not move locked dots
          let newProgress = person.progress + person.speed;
          let newSpeed = person.speed;
          // Bounce off ends of the route.
          if (newProgress >= 1) {
            newProgress = 1;
            newSpeed = -person.speed;
          } else if (newProgress <= 0) {
            newProgress = 0;
            newSpeed = -person.speed;
          }
          const route = streetRoutes[person.routeIndex];
          const newPosition = getPositionAlongRoute(route.path, newProgress);
          // Check against each lockdown area.
          let isLocked = false;
          for (const area of lockdownAreas) {
            const distance = haversineDistance(
              newPosition[0],
              newPosition[1],
              area.center[0],
              area.center[1]
            );
            if (distance <= area.radius) {
              isLocked = true;
              break;
            }
          }
          return {
            ...person,
            progress: isLocked ? person.progress : newProgress,
            speed: isLocked ? 0 : newSpeed,
            locked: isLocked,
            position: newPosition,
          };
        })
      );
    }, 100);
    return () => clearInterval(interval);
  }, []);

  /* ----- Update Statistics ----- */
  useEffect(() => {
    setStats({
      total: people.length,
      infected: people.filter(p => p.infected).length,
      locked: people.filter(p => p.locked).length,
      virality: (1.5 + Math.random()).toFixed(2),
    });
  }, [people]);

  return (
    <div className={styles.container}>
      <div className={styles.mapContainer}>
        <SimulationMap
          people={people}
          lockdownAreas={lockdownAreas}
          hospitals={hospitals}
          streetRoutes={streetRoutes}
        />
      </div>
      <div className={styles.sidebar}>
        <Sidebar stats={stats} hospitals={hospitals} />
      </div>
    </div>
  );
}
