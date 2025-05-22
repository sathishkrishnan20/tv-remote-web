import { Client } from 'node-ssdp';
import { NextResponse } from 'next/server';
const client = new Client();

interface IPAndName {
name: string; ip: string 
}
export async function GET() {
  const foundDevices: IPAndName[] = [];

  const search = new Promise<IPAndName[]>((resolve) => {
    client.on('response', (headers, statusCode, rinfo) => {
       const hasDMR =  headers.LOCATION?.split('/').pop();
       const hasSTRendering = headers.ST === 'urn:schemas-upnp-org:service:RenderingControl:1'
      if (headers.ST && hasDMR && hasSTRendering && !foundDevices.some(e => e.ip === rinfo.address)) {
        let name = headers.SERVER 
        if (typeof name === 'string') {
            name = name.split('/')[0]
        } else {
          name = headers.USN
        }
        
        foundDevices.push({name: name || '', ip: rinfo.address});
      }
    });
    client.search('ssdp:all');
    
    setTimeout(() => resolve(foundDevices), 1000  * 30); // wait 3s
  });

  const devices = await search;
  return NextResponse.json({ devices });
}