const asyncHandler = require('../utils/asyncHandler');
exports.current = asyncHandler(async (req, res) => {
  const city = String(req.query.city || '').trim();
  const { lat, lon } = req.query;
  if (!process.env.OPENWEATHER_API_KEY) return res.status(503).json({ message: 'Weather service is not configured. Add OPENWEATHER_API_KEY to server/.env.' });
  if (!city && !(Number.isFinite(Number(lat)) && Number.isFinite(Number(lon)))) return res.status(400).json({ message: 'Provide a city or valid latitude and longitude.' });
  const url = new URL('https://api.openweathermap.org/data/2.5/weather');
  if (city) url.searchParams.set('q', city);
  else { url.searchParams.set('lat', lat); url.searchParams.set('lon', lon); }
  url.searchParams.set('appid', process.env.OPENWEATHER_API_KEY);
  url.searchParams.set('units', 'metric');
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  const data = await response.json();
  if (!response.ok) return res.status(response.status === 404 ? 404 : 502).json({ message: data.message || 'Weather provider request failed.' });
  res.json({ weather: data, source: 'OpenWeather' });
});
