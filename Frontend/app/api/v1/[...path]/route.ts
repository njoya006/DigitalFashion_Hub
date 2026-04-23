import { NextRequest } from 'next/server'

const BACKEND_BASE_URL = process.env.BACKEND_API_URL ?? 'http://localhost:8000'

const STRIPPED_HEADERS = new Set([
  'expect',
  'connection',
  'content-length',
  'host',
  'transfer-encoding',
  'upgrade',
])

async function proxy(request: NextRequest, pathParts: string[]) {
  const incomingUrl = new URL(request.url)
  const backendUrl = new URL(`${BACKEND_BASE_URL}/api/v1/${pathParts.join('/')}/`)
  backendUrl.search = incomingUrl.search

  const headers = new Headers()
  request.headers.forEach((value, key) => {
    if (!STRIPPED_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value)
    }
  })

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual',
  }

  if (!['GET', 'HEAD'].includes(request.method)) {
    init.body = await request.text()
  }

  const response = await fetch(backendUrl.toString(), init)
  const responseHeaders = new Headers()
  response.headers.forEach((value, key) => {
    if (!STRIPPED_HEADERS.has(key.toLowerCase())) {
      responseHeaders.set(key, value)
    }
  })

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  })
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params
  return proxy(request, path)
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params
  return proxy(request, path)
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params
  return proxy(request, path)
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params
  return proxy(request, path)
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params
  return proxy(request, path)
}

export async function OPTIONS(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params
  return proxy(request, path)
}