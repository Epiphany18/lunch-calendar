// Cloudflare Pages Function: GET /api/state
// 读取共享状态（审批 + 顺延/调换），存于 KV
export async function onRequestGet({ env }) {
  const raw = await env.LUNCH_KV.get("state");
  const state = raw ? JSON.parse(raw) : { approved: {}, status: {} };
  return Response.json(state, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
}
