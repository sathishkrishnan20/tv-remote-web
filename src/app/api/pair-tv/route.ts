// /api/pair-tv.ts
import { NextRequest, NextResponse } from 'next/server';
import WebSocket from 'ws';

export async function POST(req: NextRequest) {
  const { ip } = await req.json();
  const encodedName = Buffer.from('MyRemoteApp').toString('base64');

  return new Promise((resolve) => {
    const ws = new WebSocket(`wss://${ip}:8002/api/v2/channels/samsung.remote.control?name=${encodedName}`, {
        rejectUnauthorized: false // ⚠️ Accept self-signed cert
    });
    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.event === 'ms.channel.connect') {
        const token = msg.data?.token;
        ws.close();
        resolve(NextResponse.json({ token }));
      } else if (msg.event === 'ms.channel.unauthorized') {
        ws.close();
        resolve(NextResponse.json({ error: 'Unauthorized – approve pairing on the TV' }, { status: 403 }));
      }
    });

    ws.on('error', (err) => {
      resolve(NextResponse.json({ error: err.message }, { status: 500 }));
    });
  });
}
