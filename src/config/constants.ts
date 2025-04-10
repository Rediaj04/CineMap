export const APP_CONSTANTS = {
  VIEW_MODES: {
    ALL: 'all',
    RANDOM: 'random',
    NEARBY: 'nearby',
    SEARCH: 'search'
  } as const,
  ERROR_MESSAGES: {
    LOADING_LOCATIONS: 'Error al cargar las ubicaciones de películas',
    SEARCH_RESULTS: 'Error al buscar películas',
    MOVIE_DETAILS: 'No se pudieron cargar los detalles de la película',
    MOVIE_LOCATIONS: 'Error al obtener ubicaciones de la película',
    ALL_LOCATIONS: 'No se pudieron cargar las ubicaciones de películas',
    GEOLOCATION: 'No se pudo obtener tu ubicación. Por favor, permite el acceso a la ubicación.',
    GEOLOCATION_NOT_SUPPORTED: 'Tu navegador no soporta geolocalización',
    LOCATION_ACCESS: 'No se pudo obtener tu ubicación. Por favor, permite el acceso a la ubicación.',
    SEARCHING_MOVIES: 'Error al buscar películas. Por favor, inténtalo de nuevo.',
    NO_VALID_LOCATIONS: 'No se encontraron ubicaciones válidas para esta película.',
    NO_LOCATIONS_FOUND: 'No se encontraron ubicaciones para esta película',
    MOVIE_LOCATIONS_ERROR: 'Error al obtener ubicaciones de la película',
    PERMISSION_DENIED: 'Por favor, permite el acceso a tu ubicación para usar esta función',
    POSITION_UNAVAILABLE: 'No se pudo obtener tu ubicación. Por favor, verifica tu conexión GPS',
    TIMEOUT: 'La solicitud de ubicación tardó demasiado. Por favor, intenta de nuevo',
    NO_COUNTRY_FOUND: 'No se pudo determinar el país de filmación de esta película',
    GEOCODING_ERROR: 'Error al obtener las coordenadas del país de filmación',
    API_ERROR: 'Error al comunicarse con los servicios de películas'
  },
  SUCCESS_MESSAGES: {
    LOCATIONS_LOADED: 'Ubicaciones cargadas correctamente',
    SEARCH_COMPLETE: 'Búsqueda completada',
    LOCATION_LOADED: 'Ubicaciones cargadas correctamente',
    MOVIE_FOUND: 'Película encontrada con ubicación real',
    LOCATION_FOUND: 'Ubicación de filmación encontrada'
  },
  LOADING_MESSAGES: {
    SEARCHING: 'Buscando...',
    LOADING_LOCATIONS: 'Cargando ubicaciones de películas...',
    GETTING_LOCATION: 'Obteniendo tu ubicación...',
    CALCULATING_DISTANCES: 'Calculando distancias...',
    GETTING_MOVIE_DETAILS: 'Obteniendo detalles de la película...',
    GETTING_COUNTRY_INFO: 'Buscando país de filmación...',
    GETTING_COORDINATES: 'Obteniendo coordenadas del país...'
  }
} as const;

export type ViewMode = typeof APP_CONSTANTS.VIEW_MODES[keyof typeof APP_CONSTANTS.VIEW_MODES]; 