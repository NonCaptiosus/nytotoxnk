export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Add any special URL handling here
    
    // Default behavior - pass the request to the application
    return env.ASSETS.fetch(request);
  }
} 