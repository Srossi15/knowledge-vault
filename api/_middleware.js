// api/_middleware.js - Middleware for all API routes

export const config = {
  matcher: ['/api/:path*']
}

export default function middleware(request) {
  // Add CORS headers
  const response = new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })

  if (request.method === 'OPTIONS') {
    return response
  }

  return response
}
