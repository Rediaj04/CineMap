import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import { LatLngExpression, Icon, divIcon } from "leaflet";
import { Location } from "../types";
import "leaflet/dist/leaflet.css";
import "./Map.css";

interface MapProps {
  locations: Location[];
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
  userLocation: [number, number] | null;
  zoomToSelected?: boolean;
}

// Componente para centrar el mapa en la ubicación seleccionada
const MapCenter: React.FC<{ location: Location | null, userLocation: [number, number] | null, zoomToSelected?: boolean }> = ({ 
  location, 
  userLocation,
  zoomToSelected = false 
}) => {
  const map = useMap();
  
  useEffect(() => {
    console.log('MapCenter - Props actualizados:', {
      location,
      userLocation,
      zoomToSelected
    });

    if (location && location.position && zoomToSelected) {
      console.log('MapCenter - Centrando en ubicación seleccionada:', location.position);
      map.setView(location.position, 12);
    } else if (!location && userLocation && zoomToSelected) {
      console.log('MapCenter - Centrando en ubicación del usuario:', userLocation);
      map.setView(userLocation, 10);
    }
  }, [location, userLocation, map, zoomToSelected]);

  return null;
};

// Crear un icono personalizado para los marcadores de películas
const createMovieIcon = (location: Location, isSelected: boolean = false) => {
  if (location.posterUrl) {
    // Si tenemos un póster, crear un icono personalizado con la imagen
    return divIcon({
      className: 'custom-marker',
      html: `
        <div class="marker-container ${isSelected ? 'selected' : ''}">
          <img src="${location.posterUrl}" alt="${location.name}" class="marker-poster" />
        </div>
      `,
      iconSize: [40, 60],
      iconAnchor: [20, 60],
      popupAnchor: [0, -60]
    });
  } else {
    // Si no hay póster, usar un icono genérico
    return new Icon({
      iconUrl: isSelected 
        ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png"
        : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }
};

// Crear un icono para la ubicación del usuario
const createUserIcon = () => {
  return divIcon({
    className: 'user-marker',
    html: `
      <div class="user-marker-container">
        <div class="user-marker-pulse"></div>
        <div class="user-marker-dot"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const Map: React.FC<MapProps> = ({ 
  locations, 
  selectedLocation, 
  onLocationSelect, 
  userLocation,
  zoomToSelected = false 
}) => {
  const handleMarkerClick = (movie: Location) => {
    console.log('Map - Marcador clickeado:', movie);
    onLocationSelect(movie);
  };

  return (
    <div className="map-container">
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        style={{ height: "100%", width: "100%" }}
        className="map"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapCenter 
          location={selectedLocation} 
          userLocation={userLocation} 
          zoomToSelected={true}
        />
        
        {/* Mostrar la ubicación del usuario si está disponible */}
        {userLocation && (
          <>
            <Marker position={userLocation as LatLngExpression} icon={createUserIcon()} />
            <Circle 
              center={userLocation as LatLngExpression} 
              radius={50000} 
              pathOptions={{ color: 'rgba(255, 77, 77, 0.2)', fillColor: 'rgba(255, 77, 77, 0.1)' }} 
            />
          </>
        )}
        
        {locations.map((location, index) => {
          if (!location.position) return null;
          
          return (
            <Marker
              key={`${location.position[0]}-${location.position[1]}-${index}`}
              position={location.position}
              eventHandlers={{
                click: () => handleMarkerClick(location)
              }}
              icon={createMovieIcon(location, selectedLocation?.name === location.name)}
            >
              <Popup>
                <div className="popup-content">
                  <h3>{location.name}</h3>
                  <p>{location.description}</p>
                  <p>Año: {location.year}</p>
                  {'distance' in location && (
                    <p>Distancia: {Math.round(location.distance as number)} km</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default Map;
