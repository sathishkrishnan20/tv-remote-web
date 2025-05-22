// /api/pair-tv.ts
import { NextRequest, NextResponse } from 'next/server';
import WebSocket from 'ws';
export async function POST(req: NextRequest) {
  const { ip } = await req.json();
  const encodedName = Buffer.from('MyRemoteApp').toString('base64');

  const p = new Promise((resolve) => {
    const ws = new WebSocket(`wss://${ip}:8002/api/v2/channels/samsung.remote.control?name=${encodedName}`, {
        rejectUnauthorized: false // ⚠️ Accept self-signed cert
    });
    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.event === 'ms.channel.connect') {
        const token = msg.data?.token;
        ws.close();
        resolve({ token , status: 200 });
      } else if (msg.event === 'ms.channel.unauthorized') {
        ws.close();
        resolve({ error: 'Unauthorized – approve pairing on the TV', status: 403 });
      }
    });

    ws.on('error', (err) => {
      resolve({ error: err.message, status: 500 });
    });
  });
  const resp = await p as { status: number; error: string; token: string };
  return NextResponse.json(resp, { status: resp.status });
}
