import { Platform } from 'react-native';

// GridPulse Mobile Commander — App Configuration
export const Config = {
  // API Configuration — Points to Render backend
  API_BASE_URL: 'https://gridpulse-qg9h.onrender.com',

  // MapTiler Configuration
  MAPTILER_KEY: '307hElwyEnYjI44fnWEx',
  MAPTILER_STYLE: 'https://api.maptiler.com/maps/dataviz-dark/style.json',

  // Polling intervals (milliseconds)
  POLLING: {
    EVENTS: 30000,        // 30 seconds
    HOTSPOTS: 60000,      // 1 minute
    WEATHER: 300000,      // 5 minutes
    ANALYTICS: 120000,    // 2 minutes
  },

  // App metadata
  APP_NAME: 'GridPulse Commander',
  APP_VERSION: '1.0.0',
  APP_TAGLINE: 'Tactical Field Operations Platform',

  // Bengaluru center coordinates
  BENGALURU: {
    latitude: 12.9716,
    longitude: 77.5946,
  },

  // User roles
  ROLES: [
    { key: 'administrator', label: 'Administrator', icon: 'shield-checkmark' },
    { key: 'traffic_controller', label: 'Traffic Controller', icon: 'car' },
    { key: 'police_officer', label: 'Police Officer', icon: 'shield' },
    { key: 'ambulance_driver', label: 'Ambulance Driver', icon: 'medkit' },
    { key: 'fire_officer', label: 'Fire Officer', icon: 'flame' },
    { key: 'emergency_coordinator', label: 'Emergency Coordinator', icon: 'alert-circle' },
  ],

  // Languages
  LANGUAGES: [
    { key: 'en', label: 'English', flag: '🇺🇸' },
    { key: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { key: 'kn', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
  ],

  // Emergency vehicle types
  VEHICLE_TYPES: [
    { key: 'ambulance', label: 'Ambulance', icon: 'medkit', color: '#EF4444' },
    { key: 'fire_truck', label: 'Fire Truck', icon: 'flame', color: '#F97316' },
    { key: 'police', label: 'Police Vehicle', icon: 'shield', color: '#3B82F6' },
    { key: 'disaster', label: 'Disaster Response', icon: 'warning', color: '#8B5CF6' },
    { key: 'medical', label: 'Medical Response', icon: 'fitness', color: '#EC4899' },
  ],

  // Event cause types
  EVENT_CAUSES: [
    'accident', 'water_logging', 'pot_holes', 'construction',
    'tree_fall', 'congestion', 'public_event', 'vehicle_breakdown', 'others',
  ],

  // Incident categories for mobile display
  INCIDENT_CATEGORIES: [
    { key: 'all', label: 'All', icon: 'grid' },
    { key: 'accident', label: 'Accidents', icon: 'car' },
    { key: 'water_logging', label: 'Floods', icon: 'water' },
    { key: 'construction', label: 'Construction', icon: 'construct' },
    { key: 'congestion', label: 'Congestion', icon: 'swap-horizontal' },
    { key: 'vehicle_breakdown', label: 'Breakdowns', icon: 'warning' },
    { key: 'others', label: 'Others', icon: 'ellipsis-horizontal' },
  ],
};
