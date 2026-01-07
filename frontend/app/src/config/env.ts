
function getDefaultApiBase() {
  return 'http://192.168.x.x:PORT/api'; // Replace with your default local IP and port
}

export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE ?? getDefaultApiBase(),
  USE_SERVER_VISION: (process.env.EXPO_PUBLIC_USE_SERVER_VISION ?? 'true') === 'true',
};
