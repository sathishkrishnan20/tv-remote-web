import { NextRequest, NextResponse } from 'next/server';
import WebSocket from 'ws';

export async function POST(req: NextRequest) {
  const { ip, key, token } = await req.json();

  if (!ip || !key || !token) {
    return NextResponse.json({ error: 'Missing ip, key, or token' }, { status: 400 });
  }

  const encodedAppName = Buffer.from('MyRemoteApp').toString('base64');
  const wsUrl = `wss://${ip}:8002/api/v2/channels/samsung.remote.control?name=${encodedAppName}&token=${token}`;

  try {
    const result = await new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl, {
        rejectUnauthorized: false, // Allow self-signed certs from TV
      });

      ws.on('open', () => {
        console.log('WebSocket opened');
        ws.send(
          JSON.stringify({
            method: 'ms.remote.control',
            params: {
              Cmd: 'Click',
              DataOfCmd: key,
              Option: 'false',
              TypeOfRemote: 'SendRemoteKey',
            },
          }),
          (err) => {
            if (err) {
              ws.close();
              reject(new Error('Failed to send command'));
            } else {
              ws.close();
              resolve({ success: true });
            }
          }
        );
      });

      ws.on('error', (err) => {
        console.error('WebSocket error:', err);
        reject(new Error('WebSocket error: ' + err.message));
      });

      ws.on('close', (code, reason) => {
        console.log(`WebSocket closed: ${code} - ${reason}`);
      });
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
