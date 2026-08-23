export async function onRequestGet({ env }) {
  try {
    const result = await env.DB.prepare('SELECT 1 AS ok').first();

    return Response.json({
      ok: true,
      database: !!result,
      message: 'Cloudflare D1 connected successfully',
      time: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({
      ok: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
