# 🎬 CineMap - Mapa de Ubicaciones Cinematográficas

<div align="center">
  <img src="src/logo.svg" alt="CineMap Logo" width="200"/>
  
  <p>Visualiza películas en su ubicación real de filmación</p>
  
  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
  ![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)
  ![TMDB](https://img.shields.io/badge/TMDB-01D277?style=for-the-badge&logo=themoviedatabase&logoColor=white)
  ![OMDB](https://img.shields.io/badge/OMDB-000000?style=for-the-badge&logo=openstreetmap&logoColor=white)
</div>

## 📋 Índice
- [Descripción](#-descripción)
- [Características Implementadas](#-características-implementadas)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [APIs Utilizadas](#-apis-utilizadas)
- [Componentes](#-componentes)
- [Instalación y Uso](#-instalación-y-uso)
- [Configuración](#-configuración)

## 🎯 Descripción
CineMap es una aplicación web que muestra películas en un mapa mundial, indicando sus ubicaciones reales de filmación. La aplicación utiliza múltiples APIs para obtener y mostrar información precisa sobre dónde se filmaron las películas.

<div align="center">
  <img src="src/components/Map.css" alt="Mapa de ejemplo" width="600"/>
  <p><i>Visualización de películas en el mapa mundial</i></p>
</div>

## ✨ Características Implementadas

### 🔍 Búsqueda de Películas
- ✅ Búsqueda por título
- ✅ Visualización de resultados en el mapa
- ✅ Información detallada de cada película

### 🎲 Película Aleatoria
- ✅ Selección aleatoria de películas populares
- ✅ Visualización de su ubicación de filmación
- ✅ Detalles completos de la película

### 🗺 Visualización en Mapa
- ✅ Mapa interactivo con zoom y navegación
- ✅ Marcadores personalizados con pósters
- ✅ Popups informativos al hacer clic

## 📁 Estructura del Proyecto
```
src/
├── api/
│   ├── movies.ts              # Funciones principales de películas
│   ├── movieLocationsAPI.ts   # API de ubicaciones
│   ├── omdbAPI.ts             # Integración con OMDB
│   └── tmdbAPI.ts             # Integración con TMDB
├── components/
│   ├── Map.tsx                # Componente principal del mapa
│   ├── Map.css                # Estilos del mapa
│   ├── MovieInfo.tsx          # Información de película
│   ├── MovieInfo.css          # Estilos de información
│   └── MovieRecommendations.tsx # Recomendaciones
├── config/
│   ├── api.ts                 # Configuración de APIs
│   └── constants.ts           # Constantes de la aplicación
└── types.ts                   # Definiciones de tipos
```

## 🔌 APIs Utilizadas

### TMDB API
```typescript
// config/api.ts
export const API_CONFIG = {
  TMDB: {
    BASE_URL: "https://api.themoviedb.org/3",
    API_KEY: process.env.REACT_APP_TMDB_API_KEY,
    IMAGE_BASE_URL: "https://image.tmdb.org/t/p",
    DEFAULT_LANGUAGE: 'es-ES'
  }
};
```

### OMDB API
```typescript
// config/api.ts
export const API_CONFIG = {
  OMDB: {
    BASE_URL: "https://www.omdbapi.com",
    API_KEY: process.env.REACT_APP_OMDB_API_KEY
  }
};
```

## 🧩 Componentes Principales

### Map.tsx
Componente principal que maneja la visualización del mapa y los marcadores:
```typescript
const Map: React.FC<MapProps> = ({ 
  locations, 
  selectedLocation,
  onLocationSelect 
}) => {
  return (
    <MapContainer center={[20, 0]} zoom={2}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
      />
      {locations.map(location => (
        <Marker
          key={location.id}
          position={location.position}
          eventHandlers={{
            click: () => onLocationSelect(location)
          }}
        >
          <Popup>
            <MovieInfo movie={location} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
```

### MovieInfo.tsx
Componente que muestra la información detallada de una película:
```typescript
const MovieInfo: React.FC<MovieInfoProps> = ({ movie }) => {
  return (
    <div className="movie-info">
      <h3>{movie.name}</h3>
      <p>{movie.description}</p>
      <p>Año: {movie.year}</p>
      {movie.productionCountry && (
        <p>País de producción: {movie.productionCountry}</p>
      )}
    </div>
  );
};
```

## 🚀 Instalación y Uso

### Requisitos
- Node.js (v14 o superior)
- npm (v6 o superior)
- Claves API para TMDB y OMDB

### Instalación
```bash
# Clonar repositorio
git clone https://github.com/Rediaj04/cinemap.git
cd cinemap

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus claves API

# Iniciar desarrollo
npm start
```

## ⚙ Configuración

### Variables de Entorno
Crear un archivo `.env` en la raíz del proyecto:
```env
REACT_APP_TMDB_API_KEY=tu_clave_tmdb
REACT_APP_OMDB_API_KEY=tu_clave_omdb
```

### Dependencias Principales
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-leaflet": "^4.2.1",
    "leaflet": "^1.9.4"
  }
}
```

## 📝 Notas de Implementación

### Obtención de Ubicaciones
El sistema obtiene las ubicaciones reales de filmación siguiendo este proceso:
1. Obtiene la película de TMDB
2. Consulta OMDB para el país de filmación
3. Si no encuentra en OMDB, usa el país de producción de TMDB
4. Convierte el país en coordenadas usando geocodificación

### Manejo de Errores
- Validación de respuestas de API
- Mensajes de error claros para el usuario
- Fallback a datos alternativos cuando es posible

## 🔄 Flujo de Datos
1. Usuario realiza una acción (búsqueda, película aleatoria)
2. Se consulta TMDB para obtener datos básicos
3. Se consulta OMDB para obtener país de filmación
4. Se geocodifica el país para obtener coordenadas
5. Se muestra la información en el mapa

## 📊 Estadísticas de Implementación

### Tecnologías
- React: 100% ✅
- TypeScript: 100% ✅
- Leaflet: 100% ✅
- TMDB API: 100% ✅
- OMDB API: 100% ✅

### Funcionalidades
- Búsqueda: 100% ✅
- Mapa interactivo: 100% ✅
- Información detallada: 100% ✅
- Película aleatoria: 100% ✅
