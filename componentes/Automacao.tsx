import React, { useState } from 'react';
import { useApp } from '../contexto/AppContext';
import { Zap, Tv, Thermometer, Lightbulb, Power, Plus, Wifi, Battery, Fan, Box, Video, Lock, Blinds, Layers, Globe, Smartphone, Mic, Check, AlertTriangle, Link2 } from 'lucide-react';

const Automacao = () => {
  const { smartDevices, smartHubs, updateSmartDevice, addSmartDevice, toggleSmartHub, addNotification } = useApp();
  const [activeTab, setActiveTab] = useState<'devices' | 'hubs'>('devices');
  const [connectingHub, setConnectingHub] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // State for new device form
  const [newDevice, setNewDevice] = useState({
      name: '',
      type: 'AC',
      brand: '',
      room: '',
      hubId: 'lg_thinq'
  });

  // Função auxiliar para determinar ícone do dispositivo
  const getDeviceIcon = (type: string) => {
      switch (type) {
          case 'AC': return <Fan size={24} className="text-cyan-500" />;
          case 'TV': return <Tv size={24} className="text-purple-500" />;
          case 'LIGHT': return <Lightbulb size={24} className="text-yellow-500" />;
          case 'ROBOT': return <Box size={24} className="text-orange-500" />;
          case 'CAMERA': return <Video size={24} className="text-red-500" />;
          case 'LOCK': return <Lock size={24} className="text-gray-500" />;
          case 'CURTAIN': return <Blinds size={24} className="text-blue-500" />;
          default: return <Zap size={24} />;
      }
  };

  // Função para ícone do Hub
  const getHubIcon = (iconName: string) => {
      switch(iconName) {
          case 'mic': return <Mic size={32} className="text-blue-400" />;
          case 'home': return <Box size={32} className="text-red-400" />; 
          case 'smartphone': return <Smartphone size={32} className="text-blue-600" />;
          case 'globe': return <Globe size={32} className="text-orange-500" />;
          case 'lightbulb': return <Lightbulb size={32} className="text-yellow-500" />;
          default: return <Wifi size={32} />;
      }
  };

  const checkHubConnection = (hubId: string) => {
      const hub = smartHubs.find(h => h.id === hubId);
      return hub?.status === 'connected';
  };

  const togglePower = (device: any) => {
      // Verifica se o Hub está conectado antes de permitir controle
      const hub = smartHubs.find(h => h.id === device.hubId);
      if (hub && hub.status !== 'connected') {
          addNotification({
              title: 'Falha de Conexão',
              message: `O Hub ${hub.name} está desconectado. Vá na aba 'Hubs & Integrações' para reconectar.`,
              type: 'warning'
          });
          return;
      }

      const newStatus = device.status === 'on' ? 'off' : 'on';
      // Para lock é diferente
      if (device.type === 'LOCK') {
          updateSmartDevice(device.id, { status: device.status === 'locked' ? 'unlocked' : 'locked' });
      } else if (device.type === 'CURTAIN') {
          updateSmartDevice(device.id, { status: device.status === 'closed' ? 'open' : 'closed', position: device.status === 'closed' ? 100 : 0 });
      } else {
          updateSmartDevice(device.id, { status: newStatus });
      }
      
      let action = '';
      if(device.type === 'LOCK') action = device.status === 'locked' ? 'destrancada' : 'trancada';
      else if(device.type === 'CURTAIN') action = device.status === 'closed' ? 'aberta' : 'fechada';
      else action = newStatus === 'on' ? 'ligado' : 'desligado';

      addNotification({
          title: 'Dispositivo Atualizado',
          message: `${device.name} foi ${action}.`,
          type: 'success'
      });
  };

  const adjustSetting = (device: any, setting: string, value: any) => {
      // Verifica Hub
      const hub = smartHubs.find(h => h.id === device.hubId);
      if (hub && hub.status !== 'connected') {
           addNotification({
              title: 'Hub Desconectado',
              message: `Conecte o ${hub.name} para ajustar configurações.`,
              type: 'warning'
          });
          return;
      }
      updateSmartDevice(device.id, { [setting]: value });
  };

  const handleHubConnection = (hubId: string) => {
      setConnectingHub(hubId);
      // Simula delay de conexão para realismo
      setTimeout(() => {
          toggleSmartHub(hubId);
          setConnectingHub(null);
          
          const hub = smartHubs.find(h => h.id === hubId);
          const isConnecting = hub?.status === 'disconnected'; // Vai inverter

          addNotification({
              title: isConnecting ? 'Hub Conectado' : 'Hub Desconectado',
              message: isConnecting 
                ? `Conexão estabelecida com ${hub?.name}. Dispositivos disponíveis.` 
                : `Conexão encerrada com ${hub?.name}.`,
              type: isConnecting ? 'success' : 'info'
          });
      }, 1000);
  };

  const handleSaveDevice = () => {
      if(!newDevice.name || !newDevice.brand || !newDevice.room) return;
      
      addSmartDevice({
          name: newDevice.name,
          type: newDevice.type as any,
          brand: newDevice.brand,
          room: newDevice.room,
          hubId: newDevice.hubId
      });
      setShowAddModal(false);
      setNewDevice({ name: '', type: 'AC', brand: '', room: '', hubId: 'lg_thinq' });
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
                    <Zap className="text-yellow-500" size={32} /> Central de Automação
                </h1>
                <p className="text-gray-500 dark:text-gray-400">Controle total da sua casa inteligente e integrações.</p>
            </div>
            
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button 
                    onClick={() => setActiveTab('devices')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'devices' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
                    Meus Dispositivos
                </button>
                <button 
                    onClick={() => setActiveTab('hubs')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'hubs' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
                    Hubs & Integrações
                </button>
            </div>
        </div>

        {activeTab === 'devices' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {smartDevices.map(device => {
                    const hub = smartHubs.find(h => h.id === device.hubId);
                    const isHubConnected = hub?.status === 'connected';
                    const isActive = ['on', 'unlocked', 'open'].includes(device.status);

                    return (
                        <div key={device.id} className={`relative overflow-hidden p-6 rounded-3xl border transition-all duration-300 
                            ${!isHubConnected ? 'bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-75' : 
                              isActive ? 'bg-white dark:bg-dark-800 border-primary-500 shadow-lg shadow-primary-500/10' : 
                              'bg-gray-50 dark:bg-dark-900/50 border-gray-200 dark:border-gray-800'}`}>
                            
                            {/* Overlay se Hub desconectado */}
                            {!isHubConnected && (
                                <div className="absolute top-2 right-2 z-10">
                                    <div className="flex items-center gap-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase">
                                        <AlertTriangle size={12} /> Hub Offline
                                    </div>
                                </div>
                            )}

                            {/* Header do Card */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-2xl ${isActive ? 'bg-gray-100 dark:bg-gray-700' : 'bg-gray-200 dark:bg-gray-800'}`}>
                                        {getDeviceIcon(device.type)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800 dark:text-white leading-tight">{device.name}</h3>
                                        <div className="flex items-center gap-1 mt-1">
                                            <span className="text-xs text-gray-500">{device.room}</span>
                                            <span className="text-gray-300">•</span>
                                            <button 
                                                onClick={() => setActiveTab('hubs')}
                                                className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded flex items-center gap-1 hover:underline ${isHubConnected ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                                                {isHubConnected ? <Link2 size={8} /> : <AlertTriangle size={8} />}
                                                {hub?.name || 'HUB'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => togglePower(device)}
                                    disabled={!isHubConnected}
                                    className={`p-3 rounded-full transition-all ${
                                        !isHubConnected ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed' :
                                        isActive ? 'bg-green-500 text-white shadow-lg shadow-green-500/30 hover:scale-105' : 
                                        'bg-gray-300 dark:bg-gray-700 text-gray-500 hover:bg-gray-400'
                                    }`}>
                                    <Power size={20} />
                                </button>
                            </div>

                            {/* Controles Específicos */}
                            <div className={`space-y-4 transition-opacity duration-300 ${(!isActive || !isHubConnected) ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                
                                {/* AR CONDICIONADO */}
                                {device.type === 'AC' && (
                                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                            <Thermometer size={20} />
                                            <span className="text-2xl font-bold">{device.settings.temperature}°C</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => adjustSetting(device, 'temperature', (device.settings.temperature || 24) - 1)} className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300">-</button>
                                            <button onClick={() => adjustSetting(device, 'temperature', (device.settings.temperature || 24) + 1)} className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300">+</button>
                                        </div>
                                    </div>
                                )}

                                {/* TV */}
                                {device.type === 'TV' && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Volume: {device.settings.volume}</span>
                                            <input 
                                                type="range" min="0" max="100" 
                                                value={device.settings.volume} 
                                                onChange={(e) => adjustSetting(device, 'volume', Number(e.target.value))}
                                                className="w-24 accent-purple-500"
                                            />
                                        </div>
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                            {['Netflix', 'YouTube', 'Prime', 'HDMI 1'].map(app => (
                                                <button 
                                                    key={app}
                                                    onClick={() => adjustSetting(device, 'channel', app)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border transition ${device.settings.channel === app ? 'bg-purple-500 text-white border-purple-500' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                                                    {app}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* LIGHT */}
                                {device.type === 'LIGHT' && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Brilho</span>
                                            <input 
                                                type="range" min="0" max="100" 
                                                value={device.settings.brightness} 
                                                onChange={(e) => adjustSetting(device, 'brightness', Number(e.target.value))}
                                                className="w-full ml-4 accent-yellow-500"
                                            />
                                        </div>
                                        <div className="flex gap-2 justify-center">
                                            {['#FFD700', '#FFFFFF', '#FF0000', '#0000FF', '#00FF00'].map(color => (
                                                <button 
                                                    key={color}
                                                    onClick={() => adjustSetting(device, 'color', color)}
                                                    className={`w-6 h-6 rounded-full border-2 ${device.settings.color === color ? 'border-gray-400 scale-110' : 'border-transparent'}`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ROBOT / CAMERA / LOCK / CURTAIN */}
                                {(device.type === 'ROBOT' || device.type === 'LOCK' || device.type === 'CAMERA') && (
                                    <div className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                        <div className="flex items-center gap-2 text-gray-500 font-bold">
                                            {device.type === 'LOCK' ? 'Bateria' : 'Status'}
                                        </div>
                                        <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                                            {device.type === 'LOCK' ? `${device.settings.battery}%` : device.settings.mode}
                                        </span>
                                    </div>
                                )}
                                
                                {device.type === 'CURTAIN' && (
                                    <div className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                        <div className="flex items-center gap-2 text-gray-500 font-bold">Abertura</div>
                                        <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">{device.settings.position}%</span>
                                    </div>
                                )}

                            </div>

                            {/* Status Dot */}
                            {isHubConnected && (
                                <div className="absolute top-4 right-4 w-2 h-2 rounded-full" style={{ backgroundColor: isActive ? '#10b981' : '#ef4444' }}></div>
                            )}
                        </div>
                    );
                })}
                
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-400 hover:text-primary-500 hover:border-primary-500 transition-all min-h-[200px] cursor-pointer">
                    <Plus size={40} className="mb-2" />
                    <span className="font-medium">Adicionar Dispositivo</span>
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {smartHubs.map(hub => (
                    <div key={hub.id} className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl relative">
                                {getHubIcon(hub.icon)}
                                {hub.status === 'connected' && (
                                    <div className="absolute -top-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white dark:border-dark-800"></div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white">{hub.name}</h3>
                                <p className="text-xs text-gray-500 mb-2 max-w-[200px]">{hub.description}</p>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${hub.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {hub.status === 'connected' ? 'Conectado' : 'Desconectado'}
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleHubConnection(hub.id)}
                            disabled={connectingHub === hub.id}
                            className={`px-6 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
                                hub.status === 'connected' 
                                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/20'
                            }`}
                        >
                            {connectingHub === hub.id ? '...' : (hub.status === 'connected' ? 'Desconectar' : <><Link2 size={16}/> Conectar</>)}
                        </button>
                    </div>
                ))}
            </div>
        )}

        {/* Modal Adicionar Dispositivo */}
        {showAddModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
                    <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2">
                        <Plus className="text-primary-500" /> Novo Dispositivo
                    </h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                            <input 
                                value={newDevice.name}
                                onChange={e => setNewDevice({...newDevice, name: e.target.value})}
                                placeholder="Ex: Ar do Quarto"
                                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                                <select 
                                    value={newDevice.type}
                                    onChange={e => setNewDevice({...newDevice, type: e.target.value})}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                >
                                    <option value="AC">Ar Condicionado</option>
                                    <option value="TV">Smart TV</option>
                                    <option value="LIGHT">Luz Inteligente</option>
                                    <option value="ROBOT">Robô Aspirador</option>
                                    <option value="LOCK">Fechadura</option>
                                    <option value="CAMERA">Câmera</option>
                                    <option value="CURTAIN">Cortina</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marca</label>
                                <input 
                                    value={newDevice.brand}
                                    onChange={e => setNewDevice({...newDevice, brand: e.target.value})}
                                    placeholder="Ex: LG, Philips..."
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hub Controlador</label>
                            <select 
                                value={newDevice.hubId}
                                onChange={e => setNewDevice({...newDevice, hubId: e.target.value})}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                {smartHubs.map(hub => (
                                    <option key={hub.id} value={hub.id}>{hub.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cômodo / Sala</label>
                            <input 
                                value={newDevice.room}
                                onChange={e => setNewDevice({...newDevice, room: e.target.value})}
                                placeholder="Ex: Quarto Principal"
                                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition">Cancelar</button>
                        <button 
                            onClick={handleSaveDevice} 
                            disabled={!newDevice.name || !newDevice.brand || !newDevice.room}
                            className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-500/30 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                            Adicionar
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Automacao;