function defaultState() {
  return {
    nextOrderNum: 2,
    categories: [
      { id: 'cat-kaprao', name: 'กะเพรา' },
      { id: 'cat-fried-garlic', name: 'ทอดกระเทียม' },
      { id: 'cat-fried-rice', name: 'ข้าวผัด' },
      { id: 'cat-noodle', name: 'เมนูเส้น' },
      { id: 'cat-drink', name: 'เครื่องดื่ม' }
    ],
    addons: [
      { id: 'addon-egg-soft', name: 'ไข่ดาวไม่สุก', price: 15, active: true },
      { id: 'addon-egg-hard', name: 'ไข่ดาวสุก', price: 15, active: true },
      { id: 'addon-egg-omelet', name: 'ไข่เจียว', price: 20, active: true },
      { id: 'addon-rice', name: 'เพิ่มข้าว', price: 10, active: true }
    ],
    comments: [
      { id: 'cm-no-chili', text: 'ไม่ใส่พริก', active: true },
      { id: 'cm-less-spicy', text: 'เผ็ดน้อย', active: true },
      { id: 'cm-less-rice', text: 'ข้าวน้อย', active: true },
      { id: 'cm-no-msg', text: 'ไม่ใส่ผงชูรส', active: true }
    ],
    menuItems: [
      { id: 'menu-kaprao-pork', name: 'กะเพราหมู', categoryId: 'cat-kaprao', price: 50, addonIds: ['addon-egg-soft', 'addon-egg-hard', 'addon-egg-omelet', 'addon-rice'], active: true },
      { id: 'menu-kaprao-chicken', name: 'กะเพราไก่', categoryId: 'cat-kaprao', price: 50, addonIds: ['addon-egg-soft', 'addon-egg-hard', 'addon-egg-omelet', 'addon-rice'], active: true },
      { id: 'menu-kaprao-shrimp', name: 'กะเพรากุ้ง', categoryId: 'cat-kaprao', price: 60, addonIds: ['addon-egg-soft', 'addon-egg-hard', 'addon-egg-omelet', 'addon-rice'], active: true },
      { id: 'menu-garlic-pork', name: 'หมูกระเทียม', categoryId: 'cat-fried-garlic', price: 50, addonIds: ['addon-egg-soft', 'addon-egg-hard', 'addon-egg-omelet', 'addon-rice'], active: true },
      { id: 'menu-fried-rice-pork', name: 'ข้าวผัดหมู', categoryId: 'cat-fried-rice', price: 50, addonIds: ['addon-egg-soft', 'addon-egg-hard', 'addon-egg-omelet', 'addon-rice'], active: true },
      { id: 'menu-fried-rice-shrimp', name: 'ข้าวผัดกุ้ง', categoryId: 'cat-fried-rice', price: 60, addonIds: ['addon-egg-soft', 'addon-egg-hard', 'addon-egg-omelet', 'addon-rice'], active: true }
    ],
    ingredients: [
      { id: 'ing-pork', name: 'เนื้อหมู', qty: 5, unit: 'กิโลกรัม', pricePerUnit: 140, minStock: 1 },
      { id: 'ing-shrimp', name: 'กุ้ง', qty: 2, unit: 'กิโลกรัม', pricePerUnit: 220, minStock: 0.5 },
      { id: 'ing-oyster-sauce', name: 'ซอสน้ำมันหอย', qty: 3, unit: 'ขวด', pricePerUnit: 45, minStock: 1 },
      { id: 'ing-msg', name: 'ผงชูรส', qty: 800, unit: 'กรัม', pricePerUnit: 0.08, minStock: 100 },
      { id: 'ing-sugar', name: 'น้ำตาล', qty: 100, unit: 'กรัม', pricePerUnit: 0.03, minStock: 200 }
    ],
    stockLogs: [],
    orders: [],
    expenses: [],
    cart: []
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/health') {
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

    if (url.pathname === '/api/state') {
      if (request.method === 'GET') {
        try {
          let row = await env.DB.prepare('SELECT data FROM app_state WHERE id = 1').first();
          let data = row && row.data ? JSON.parse(row.data) : null;

          const isEmptyState = !data || (
            Array.isArray(data.categories) &&
            Array.isArray(data.menuItems) &&
            Array.isArray(data.ingredients) &&
            Array.isArray(data.orders) &&
            Array.isArray(data.expenses) &&
            Array.isArray(data.cart) &&
            data.categories.length === 0 &&
            data.menuItems.length === 0 &&
            data.ingredients.length === 0 &&
            data.orders.length === 0 &&
            data.expenses.length === 0 &&
            data.cart.length === 0
          );

          if (isEmptyState) {
            const seeded = defaultState();
            await env.DB.prepare(`
              INSERT INTO app_state (id, data, updated_at)
              VALUES (1, ?, CURRENT_TIMESTAMP)
              ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
            `).bind(JSON.stringify(seeded)).run();
            data = seeded;
          }

          return Response.json({ ok: true, data });
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
            return Response.json({ ok: false, message: 'Invalid JSON payload' }, { status: 400 });
          }

          await env.DB.prepare(`
            INSERT INTO app_state (id, data, updated_at)
            VALUES (1, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
          `).bind(JSON.stringify(payload)).run();

          return Response.json({ ok: true, message: 'App state saved to Cloudflare D1' });
        } catch (error) {
          return Response.json({
            ok: false,
            message: 'Unable to save app state',
            error: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 });
        }
      }

      return Response.json({ ok: false, message: 'Method not allowed' }, { status: 405 });
    }

    const asset = await env.ASSETS.fetch(request);
    if (asset.status === 404 && url.pathname !== '/') {
      return env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
    }
    return asset;
  }
};
