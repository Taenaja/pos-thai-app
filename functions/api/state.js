export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'GET') {
    try {
      const row = await env.DB.prepare('SELECT data FROM app_state WHERE id = 1').first();
      const data = row && row.data ? JSON.parse(row.data) : null;

      return Response.json({
        ok: true,
        data: data
      });
    } catch (error) {
      return Response.json({
        ok: false,
        message: 'Unable to load app state',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  }

  if (request.method === 'POST') {
    try {
      const payload = await request.json();

      if (!payload || typeof payload !== 'object') {
        return Response.json({
          ok: false,
          message: 'Invalid JSON payload'
        }, { status: 400 });
      }

      await env.DB.prepare(`
        INSERT INTO app_state (id, data, updated_at)
        VALUES (1, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
      `).bind(JSON.stringify(payload)).run();

      return Response.json({
        ok: true,
        message: 'App state saved to Cloudflare D1'
      });
    } catch (error) {
      return Response.json({
        ok: false,
        message: 'Unable to save app state',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  }

  return Response.json({
    ok: false,
    message: 'Method not allowed'
  }, { status: 405 });
}
