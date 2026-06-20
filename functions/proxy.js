export async function onRequest(context) {
  const requestUrl = new URL(context.request.url);

  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  const targetUrl = requestUrl.searchParams.get("url");

  if (!targetUrl || !targetUrl.startsWith("https://query1.finance.yahoo.com/")) {
    return new Response("Proxy URL is not allowed.", {
      status: 400,
      headers: corsHeaders(),
    });
  }

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const body = await upstream.arrayBuffer();

    return new Response(body, {
      status: upstream.status,
      headers: {
        ...corsHeaders(),
        "Content-Type": upstream.headers.get("Content-Type") || "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error) {
    return new Response(`Proxy error: ${error.message || error}`, {
      status: 502,
      headers: corsHeaders(),
    });
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
