'use client';
import { useEffect, useState } from 'react';
const tokenKey = '@token';
const ipKey = '@ip';

const CONTROLS = {
  power: { label: 'Power', command: 'KEY_POWER', className: 'bg-red-600 hover:bg-red-700' },
  volumeUp: { label: 'Vol +', command: 'KEY_VOLUP' },
  volumeDown: { label: 'Vol -', command: 'KEY_VOLDOWN' },
  channelUp: { label: 'Ch +', command: 'KEY_CHUP' },
  channelDown: { label: 'Ch -', command: 'KEY_CHDOWN' },
  mute: { label: 'Mute', command: 'KEY_MUTE' },
  up: { label: '▲', command: 'KEY_UP' },
  down: { label: '▼', command: 'KEY_DOWN' },
  left: { label: '◄', command: 'KEY_LEFT' },
  right: { label: '►', command: 'KEY_RIGHT' },
  ok: { label: 'OK', command: 'KEY_OK', className: 'bg-blue-600 hover:bg-blue-700' },
  back: { label: 'Back', command: 'KEY_RETURN' },
  home: { label: 'Home', command: 'KEY_HOME' },
  menu: { label: 'Menu', command: 'KEY_MENU' },
  info: { label: 'Info', command: 'KEY_INFO' },
  exit: { label: 'Exit', command: 'KEY_EXIT' },
};
interface IPAndName {
  name: string; ip: string 
}
const Loader = () => (
  <div className="flex justify-center items-center h-20">
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function Home() {
  const [tvs, setTvs] = useState<IPAndName[]>([]);
  const [selectedIp, setSelectedIp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const alreadySelectedIp = localStorage.getItem(ipKey);
    if (alreadySelectedIp) {
        handleSelectTV(alreadySelectedIp)
    } else {
      discoverTvs()
    }
  }, [])

  const handleSelectTV = (ip: string) => {
    localStorage.setItem(ipKey, ip);
    setSelectedIp(ip)
  }

  const discoverTvs = async () => {
    setSelectedIp(null);
    setLoading(true);
    const res = await fetch('/api/discover-tvs');
    const data: { devices: IPAndName[] } = await res.json();
    setTvs(data.devices);
    setLoading(false);
  };

  const handleClick = async (key: string) => {
    if (!selectedIp) return alert('Select a TV first');
    await fetch('/api/send-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip: selectedIp, key, token: localStorage.getItem(tokenKey) }),
    });
  };

   const pairTV = async (selectedIp: string) => {
    if (!selectedIp) return alert('Select a TV first');
    const res = await fetch('/api/pair-tv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip: selectedIp }),
    });
    const data = await res.json();
    localStorage.setItem(tokenKey, data.token);
    handleSelectTV(selectedIp);
    console.log(data);
  };


  const BottomButton = ({ onClick, name }: { onClick: () => void; name: string }) => (
    <button
        onClick={onClick}
        className={`py-2 rounded bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500`}
        aria-label={name}
      >
      {name}
    </button>
  )

    const VolumneButtons = ({ onClick, name }: { onClick: () => void; name: string; }) => (
    <button
            onClick={onClick}
            className="w-16 h-10 rounded bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 "
            aria-label={name}
          >
            {name}
          </button>
  )
const ArrowButtons = ({ onClick, name , style = ''}: { onClick: () => void; name: string; style?: string }) => (
    <button
      onClick={onClick}
      className={`w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500 ${style}`}
      aria-label={name}
    >
      {name}
    </button>
  )

  return (
    <div className="p-6 font-sans">
      <div className="max-w-sm mx-auto bg-gray-900 text-white rounded-lg p-6 shadow-lg select-none">
      
      <h1 className="text-xl font-bold text-center mb-4">TV Remote</h1>
      
      {!selectedIp && <div className="mt-4">
          <h2 className="font-semibold text-lg mb-2 text-white">Discovered TVs:</h2>
          {loading ? <Loader /> : <div className="space-y-2">
            {tvs.map(({ip, name }) => (
              <label
                key={ip}
                className="flex items-center space-x-3 p-3 rounded-md border border-gray-700 hover:bg-gray-800 cursor-pointer transition"
              >
                <input
                  type="radio"
                  name="tv"
                  value={ip}
                  className="form-radio h-5 w-5 text-blue-400 bg-gray-900 border-gray-600"
                  onChange={() => pairTV(ip)}
                />
                <span className="text-gray-100">{name}</span>
              </label>
            ))}
          </div> }
      </div> }
      
      {selectedIp && (
        <div className='mt-4'> 
      {/* Top row */}
      <div className="flex justify-between mb-6">
        <button
          onClick={() => handleClick(CONTROLS.power.command)}
          className={`px-4 py-2 rounded ${CONTROLS.power.className} focus:outline-none focus:ring-2 focus:ring-red-500`}
          aria-label="Power"
        >
          {CONTROLS.power.label}
        </button>
        <button
          onClick={() => handleClick(CONTROLS.mute.command)}
          className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          aria-label="Mute"
        >
          {CONTROLS.mute.label}
        </button>
      </div>

      {/* Volume and Channel Controls */}
      <div className="flex justify-between mb-6 space-x-4">
        <div className="flex flex-col items-center space-y-2">
          <VolumneButtons name={CONTROLS.volumeUp.label} onClick={() => handleClick(CONTROLS.volumeUp.command)} />
          <VolumneButtons name={CONTROLS.volumeDown.label} onClick={() => handleClick(CONTROLS.volumeDown.command)} />
        </div>
        <div className="flex flex-col items-center space-y-2">
          <VolumneButtons name={CONTROLS.channelUp.label} onClick={() => handleClick(CONTROLS.channelUp.command)} />
          <VolumneButtons name={CONTROLS.channelDown.label} onClick={() => handleClick(CONTROLS.channelDown.command)} />
        </div>
      </div>

      {/* Navigation Pad */}
      <div className="flex flex-col items-center mb-6">
        <ArrowButtons onClick={() => handleClick(CONTROLS.up.command)} name={CONTROLS.up.label} style='mb-2' />
        <div className="flex space-x-4">
          <ArrowButtons onClick={() => handleClick(CONTROLS.left.command)} name={CONTROLS.left.label} style='' />
           <button
            onClick={() => handleClick(CONTROLS.ok.command)}
            className={`w-16 h-16 rounded-full text-lg font-semibold ${CONTROLS.ok.className} flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500`}
            aria-label="OK"
          >
            {CONTROLS.ok.label}
          </button>
          <ArrowButtons onClick={() => handleClick(CONTROLS.right.command)} name={CONTROLS.right.label} style='' />
        </div>
        <ArrowButtons onClick={() => handleClick(CONTROLS.down.command)} name={CONTROLS.down.label} style='mt-2' />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-4">
        <BottomButton name= {CONTROLS.back.label} onClick={() => handleClick(CONTROLS.back.command)} />
        <BottomButton name= {CONTROLS.home.label} onClick={() => handleClick(CONTROLS.home.command)} />
        <BottomButton name= {CONTROLS.menu.label} onClick={() => handleClick(CONTROLS.menu.command)} />
        <BottomButton name= {CONTROLS.info.label} onClick={() => handleClick(CONTROLS.exit.command)} />
        <BottomButton name= {CONTROLS.exit.label} onClick={() => handleClick(CONTROLS.exit.command)} />
        <BottomButton name='Discover' onClick={discoverTvs} />
      </div>
      </div> )}
    </div>
      
    
    </div>
  );
}