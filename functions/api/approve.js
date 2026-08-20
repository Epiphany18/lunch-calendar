// Cloudflare Pages Function: POST /api/approve
// 写入审批 / 状态，type: "approve" | "status"
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function onRequestPost({ env, request }) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return Response.json({ error: "bad json" }, { status: 400 });
  }

  const raw = await env.LUNCH_KV.get("state");
  const state = raw ? JSON.parse(raw) : { approved: {}, status: {} };

  const { type, key, value } = body || {};
  if (typeof key === "string") {
    if (type === "approve") {
      if (value) state.approved[key] = true;
      else delete state.approved[key];
    } else if (type === "status") {
      state.status[key] = value || "normal";
    }
  }

  await env.LUNCH_KV.put("state", JSON.stringify(state));

  return Response.json(state, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
}
