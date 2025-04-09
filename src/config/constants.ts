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
    TIMEOUT: 'La solicitud de ubicación tardó demasiado. Por favor, intenta de nuevo'
  },
  SUCCESS_MESSAGES: {
    LOCATIONS_LOADED: 'Ubicaciones cargadas correctamente',
    SEARCH_COMPLETE: 'Búsqueda completada',
    LOCATION_LOADED: 'Ubicaciones cargadas correctamente'
  },
  LOADING_MESSAGES: {
    SEARCHING: 'Buscando...',
    LOADING_LOCATIONS: 'Cargando ubicaciones de películas...',
    GETTING_LOCATION: 'Obteniendo tu ubicación...',
    CALCULATING_DISTANCES: 'Calculando distancias...'
  }
} as const;

export type ViewMode = typeof APP_CONSTANTS.VIEW_MODES[keyof typeof APP_CONSTANTS.VIEW_MODES]; 