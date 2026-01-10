export default defineEventHandler((event) => {
  // 1. Obtenemos la ruta de la petición
  const { path } = event;

  // 2. Solo protegemos las rutas que empiecen por /api
  if (path.startsWith('/api')) {
    const apiKey = getHeader(event, 'x-api-key');
    const secret = process.env.API_SECRET_KEY;

    // 3. Si la llave no coincide o no existe, lanzamos error 401
    if (apiKey !== secret) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Acceso no autorizado: API Key inválida o ausente',
      });
    }
  }
});