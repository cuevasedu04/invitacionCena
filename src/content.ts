/** Datos de la invitación: un solo lugar para editar textos, horarios y ubicación. */

const VENUE_QUERY = 'Le Crillon, Av. Cuauhtémoc 1438, Del Valle, Benito Juárez, 03310 Ciudad de México';

export const VENUE = {
  name: 'Le Crillon',
  room: 'Salón Toulouse',
  floor: '2.º piso',
  address: ['Av. Cuauhtémoc 1438', 'Col. Del Valle, C.P. 03310', 'Benito Juárez, CDMX, México'],
  /** Enlace compartido del lugar: abre la app de Google Maps en el celular. */
  mapsUrl: 'https://maps.app.goo.gl/h3jhU6RmnQqnqLpA8',
  /** Ruta desde la ubicación actual hasta el salón. */
  directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(VENUE_QUERY)}`,
  wazeUrl: `https://waze.com/ul?q=${encodeURIComponent('Le Crillon, Av. Cuauhtémoc 1438, Ciudad de México')}&navigate=yes`,
  embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(VENUE_QUERY)}&z=16&hl=es&iwloc=near&output=embed`
};

export const INVITATION = {
  host: 'Unidad de Administración y Finanzas',
  lead: 'tiene el honor de invitarle a la',
  title: 'Cena de Fin de Año',
  year: '2026',
  message:
    'Celebremos los logros de 2026 y el compromiso que nos une, reafirmando la honestidad y la transparencia que distinguen nuestro servicio.'
};

export const AUDIO = {
  /**
   * Música de fondo. Vacío = pieza instrumental generada en vivo (sin archivos ni licencias).
   * Para usar una canción propia, coloca el MP3 en public/audio/ y escribe su ruta,
   * p. ej. './audio/musica.mp3' (asegúrate de tener derechos de uso).
   */
  musicUrl: '',
  musicVolume: 0.35
};
