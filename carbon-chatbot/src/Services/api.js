const ELECTRICITY_MAPS_API_KEY = import.meta.env.VITE_ELECTRICITY_MAPS_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Cache configuration
const cache = {
  carbonData: null,
  lastFetch: null,
  cacheDuration: 3600000 // 1 hour cache
};

// Enhanced fetch with timeout and error handling
const apiFetch = async (url, options = {}, timeout = 8000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...options.headers,
        'auth-token': ELECTRICITY_MAPS_API_KEY
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `API Error ${response.status}: ${errorData.message || response.statusText}`
      );
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export const getRealTimeCarbonData = async () => {
  try {
    // Return cached data if fresh
    if (cache.carbonData && Date.now() - cache.lastFetch < cache.cacheDuration) {
      return cache.carbonData;
    }

    const response = await apiFetch(
      'https://api.electricitymap.org/v3/carbon-intensity/ranking'
    );

    const data = await response.json();

    // Validate response structure
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format from API');
    }

    // Update cache
    cache.carbonData = data;
    cache.lastFetch = Date.now();

    return data;
  } catch (error) {
    console.error('API Error:', error);

    // Return cached data if available (even if stale)
    if (cache.carbonData) {
      console.warn('Using cached data due to API error');
      return {
        data: cache.carbonData,
        _stale: true,
        _error: error.message,
        _lastUpdated: new Date(cache.lastFetch).toISOString()
      };
    }

    throw new Error(
      `Failed to fetch carbon data: ${error.message}. ` +
      'You can check directly at https://app.electricitymaps.com/map'
    );
  }
};

// Rest of your API functions (queryGemini, etc.) remain the same

export const queryGemini = async (prompt) => {
  try {
    const response = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response structure from Gemini');
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error querying Gemini:', error);
    throw new Error('Failed to get AI response. Please try again.');
  }
};