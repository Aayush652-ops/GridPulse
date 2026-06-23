// GridPulse Mobile Commander — Events Service
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

export const eventsService = {
  async getEvents(status = null) {
    const params = {};
    if (status) params.status = status;
    try {
      const data = await api.get('/api/events', params);
      await AsyncStorage.setItem('cached_events', JSON.stringify(data));
      return data;
    } catch (error) {
      const cached = await AsyncStorage.getItem('cached_events');
      if (cached) return JSON.parse(cached);
      throw error;
    }
  },

  async getActiveEvents() {
    const events = await this.getEvents();
    return events.filter(e => e.status?.toLowerCase() === 'active');
  },

  async getHotspots() {
    try {
      const data = await api.get('/api/hotspots');
      await AsyncStorage.setItem('cached_hotspots', JSON.stringify(data));
      return data;
    } catch (error) {
      const cached = await AsyncStorage.getItem('cached_hotspots');
      if (cached) return JSON.parse(cached);
      return [];
    }
  },

  async getClusters(epsKm = 0.5, minSamples = 2) {
    return await api.get('/api/cluster', { eps_km: epsKm, min_samples: minSamples });
  },

  async simulateEvent(payload) {
    return await api.post('/api/simulate', payload);
  },

  async spawnMock() {
    return await api.post('/api/spawn_mock');
  },

  async clearMock() {
    return await api.post('/api/clear_mock');
  },

  async getPlannedEvents() {
    return await api.get('/api/planned-events');
  },

  async createPlannedEvent(payload) {
    return await api.post('/api/planned-events', payload);
  },

  async deletePlannedEvent(eventId) {
    return await api.delete(`/api/planned-events/${eventId}`);
  },

  async getForecastPropagation(params) {
    return await api.get('/api/forecast-propagation', params);
  },

  async getEventOutcomes() {
    try {
      const data = await api.get('/api/event-outcomes');
      await AsyncStorage.setItem('cached_outcomes', JSON.stringify(data));
      return data;
    } catch (error) {
      const cached = await AsyncStorage.getItem('cached_outcomes');
      if (cached) return JSON.parse(cached);
      return [];
    }
  },

  async createEventOutcome(payload) {
    return await api.post('/api/event-outcomes', payload);
  },

  async getLearningAnalytics() {
    try {
      const data = await api.get('/api/learning-analytics');
      await AsyncStorage.setItem('cached_analytics', JSON.stringify(data));
      return data;
    } catch (error) {
      const cached = await AsyncStorage.getItem('cached_analytics');
      if (cached) return JSON.parse(cached);
      throw error;
    }
  },

  async getRoutingSplit(payload) {
    return await api.post('/api/routing/split', payload);
  },
};
