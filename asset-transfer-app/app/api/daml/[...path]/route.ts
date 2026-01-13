import { NextRequest, NextResponse } from 'next/server'

const DAML_JSON_API_URL = 'http://127.0.0.1:7575'

interface RouteParams {
  params: {
    path: string[]
  }
}

export async function GET(request: NextRequest, context: RouteParams) {
  return proxyRequest(request, context.params.path, 'GET')
}

export async function POST(request: NextRequest, context: RouteParams) {
  return proxyRequest(request, context.params.path, 'POST')
}

export async function PUT(request: NextRequest, context: RouteParams) {
  return proxyRequest(request, context.params.path, 'PUT')
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  return proxyRequest(request, context.params.path, 'DELETE')
}

async function proxyRequest(request: NextRequest, pathSegments: string[] | undefined, method: string) {
  try {
    // Extract path from URL as fallback
    const url = new URL(request.url)
    const apiPath = url.pathname.replace('/api/daml/', '')
    
    // Use pathSegments if available, otherwise extract from URL
    const path = pathSegments && pathSegments.length > 0 ? pathSegments.join('/') : apiPath
    const targetUrl = `${DAML_JSON_API_URL}/${path}`
    
    console.log(`Proxying ${method} ${path} to ${targetUrl}`)
    
    // Get request body if it exists
    let body: string | undefined
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.text()
      } catch (e) {
        // No body or invalid body
      }
    }

    // Forward headers (especially Authorization)
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      // Forward important headers but skip some that might cause issues
      if (!['host', 'origin', 'referer'].includes(key.toLowerCase())) {
        headers[key] = value
      }
    })

    // Make request to DAML JSON API
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
    })

    // Get response data
    const responseText = await response.text()
    
    console.log(`DAML API responded with ${response.status}: ${responseText.substring(0, 100)}...`)
    
    // Create response with CORS headers
    const nextResponse = new NextResponse(responseText, {
      status: response.status,
      statusText: response.statusText,
    })

    // Add CORS headers
    nextResponse.headers.set('Access-Control-Allow-Origin', '*')
    nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    // Forward response headers
    response.headers.forEach((value, key) => {
      if (!['access-control-allow-origin', 'access-control-allow-methods', 'access-control-allow-headers'].includes(key.toLowerCase())) {
        nextResponse.headers.set(key, value)
      }
    })

    return nextResponse
  } catch (error) {
    console.error('Proxy error:', error)
    const errorResponse = NextResponse.json(
      { error: 'Proxy request failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
    
    // Add CORS headers even for errors
    errorResponse.headers.set('Access-Control-Allow-Origin', '*')
    errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return errorResponse
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}