import api from '../api';
import { memoize } from 'lodash';
import { CacheManager, CONSTANTS } from '../../utils/security';
import { handleApiError } from '../../utils/errorHandler';

const CACHE_DURATION = CONSTANTS.CACHE_DURATION;
const CACHE_KEY = CONSTANTS.AUTH_CACHE_KEY; 
const SYSTEM_CACHE_KEY = 'system'; 
const MIN_FETCH_INTERVAL = 1000; 

const SYSTEM_ENDPOINTS = {
  GET_PING: '/system/ping',
  GET_HEALTH: '/system/health',
  GET_ENUMS: '/system/enums',
};

let lastSystemFetchTime = 0;
const requestCache = new Map();

// **Helper: Get cached data**
const getCache = () => {
  const cache = CacheManager.get(CACHE_KEY) || {};
  return cache[SYSTEM_CACHE_KEY] || {};
};

// **Helper: Set cache with new data**
const setCache = (data) => {
  const existingCache = CacheManager.get(CACHE_KEY) || {};
  CacheManager.set(CACHE_KEY, { ...existingCache, [SYSTEM_CACHE_KEY]: data });
};

// **Optimized system fetch function**
const fetchSystemData = async (endpoint, key, refresh = false) => {
  const now = Date.now();
  const cache = getCache();

  if (!refresh && cache[key] && now - cache.timestamp < CACHE_DURATION) {
    return cache[key]; // ✅ Serve from cache if valid
  }

  try {
    const response = await api.get(endpoint);
    const updatedCache = { ...cache, [key]: response.data, timestamp: now };
    setCache(updatedCache);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${key}:`, error);
    throw new Error(handleApiError(error));
  }
};

// **Load all system data in a single request**
export const loadSystem = async (refresh = false) => {
  const now = Date.now();
  const cache = getCache();

  if (!refresh && requestCache.has(SYSTEM_CACHE_KEY)) {
    return requestCache.get(SYSTEM_CACHE_KEY); 
  }

  if (!refresh && now - lastSystemFetchTime < MIN_FETCH_INTERVAL && now - cache.timestamp < CACHE_DURATION) {
    return cache; 
  }

  try {
    const systemRequestPromise = (async () => {
      const [enums, health, ping] = await Promise.all([
        fetchSystemData(SYSTEM_ENDPOINTS.GET_ENUMS, 'enums', refresh),
        fetchSystemData(SYSTEM_ENDPOINTS.GET_HEALTH, 'health', refresh),
        fetchSystemData(SYSTEM_ENDPOINTS.GET_PING, 'ping', refresh),
      ]);

      const updatedCache = { enums, health, ping, timestamp: now };
      setCache(updatedCache);
      lastSystemFetchTime = now;

      return updatedCache;
    })();

    requestCache.set(SYSTEM_CACHE_KEY, systemRequestPromise);
    return await systemRequestPromise;
  } catch (error) {
    throw new Error(handleApiError(error));
  } finally {
    setTimeout(() => requestCache.delete(SYSTEM_CACHE_KEY), 2000); // Clear request cache after 2 sec
  }
};

// **SystemService - Optimized API Calls**
export const SystemService = {
  getSystemEnums: memoize(
    async (options = {}) => loadSystem(options.refresh).then((data) => data.enums),
    (options = {}) => `enums-${options?.refresh || false}-${Math.floor(Date.now() / 30000)}`
  ),

  getSystemHealth: memoize(
    async (options = {}) => loadSystem(options.refresh).then((data) => data.health),
    (options = {}) => `health-${options?.refresh || false}-${Math.floor(Date.now() / 30000)}`
  ),

  getSystemPing: memoize(
    async (options = {}) => loadSystem(options.refresh).then((data) => data.ping),
    (options = {}) => `ping-${options?.refresh || false}-${Math.floor(Date.now() / 30000)}`
  ),
};

// **Optimized function to fetch all system data at once**
export const fetchAllSystemData = async () => {
  try {
    return await loadSystem();
  } catch (error) {
    console.error("Error fetching system data:", error);
    throw new Error(error.message);
  }
};
