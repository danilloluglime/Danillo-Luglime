
import React, { useState } from 'react';
import { useApp } from '../contexto/AppContext';
import { processUniversalInput } from '../services/geminiService';
import { Database, Link, UploadCloud, CheckCircle2, AlertCircle, RefreshCw, Plus, Zap, Tv, Thermometer, Lightbulb, Power, Wifi, Fan, Box, Video, Lock, Blinds, Globe, Smartphone, Mic, AlertTriangle, Link2 } from 'lucide-react';

const HubDeIntegracoes = () => {
  const { integrations, updateIntegration, addTask, addNotification, smartDevices, smartHubs, updateSmartDevice, addSmartDevice, toggleSmartHub } = useApp();
  
  // Estados Gerais
  const [section, setSection] = useState<'data' | 'smarthome'>('data');

  // Estados de Integração de Dados
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [dataInput, setDataInput] = useState('');
  const [processing, setProcessing] = useState(false);

  // Estados de Smart Home
  const [connectingHub, setConnectingHub] = useState<string | null>(null);
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [newDevice, setNewDevice] = useState({ name: '', type: 'AC', brand: '', room: '', hubId: 'lg_thinq' });

  // --- Lógica de Integração de Dados ---
  const handleProcessData = async (integrationId: string, integrationName: string) => {
      if (!dataInput.trim()) return;

      setProcessing(true);
      const result = await processUniversalInput(dataInput, integrationName);
      
      const integration = integrations.find(i => i.id === integrationId);
      if (integration) {
          updateIntegration({
              ...integration,
              status: 'active',
              lastSync: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
              contextData: result.summary 
          });
      }

      if (result.suggestedTasks && result.suggestedTasks.length > 0) {
          result.suggestedTasks.forEach(t => {
              addTask({
                  title: t.title,
                  category: t.category || 'Outro',
                  priority: t.priority || 'Média',
                  dueDate: new Date().toISOString().split('T')[0]
              });
          });
          addNotification({ title: 'Tarefas Importadas', message: `${result.suggestedTasks.length} tarefas foram extraídas dos seus dados.`, type: 'success' });
      } else {
          addNotification({ title: 'Dados Processados', message: 'Suas informações foram salvas na memória da IA.', type: 'success' });
      }

      setProcessing(false);
      setDataInput('');
      setActiveTab(null);
  };

  // --- Lógica Smart Home ---
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

  const togglePower = (device: any) => {
      const hub = smartHubs.find(h => h.id === device.hubId);
      if (hub && hub.status !== 'connected') {
          addNotification({ title: 'Falha de Conexão', message: `O Hub ${hub.name} está desconectado.`, type: 'warning' });
          return;
      }

      const newStatus = device.status === 'on' ? 'off' : 'on';
      if (device.type === 'LOCK') {
          updateSmartDevice(device.id, { status: device.status === 'locked' ? 'unlocked' : 'locked' });
      } else if (device.type === 'CURTAIN') {
          updateSmartDevice(device.id, { status: device.status === 'closed' ? 'open' : 'closed', position: device.status === 'closed' ? 100 : 0 });
      } else {
          updateSmartDevice(device.id, { status: newStatus });
      }
  };

  const adjustSetting = (device: any, setting: string, value: any) => {
      const hub = smartHubs.find(h => h.id === device.hubId);
      if (hub && hub.status !== 'connected') {
           addNotification({ title: 'Hub Desconectado', message: `Conecte o ${hub.name} para ajustar.`, type: 'warning' });
          return;
      }
      updateSmartDevice(device.id, { [setting]: value });
  };

  const handleHubConnection = (hubId: string) => {
      setConnectingHub(hubId);
      setTimeout(() => {
          toggleSmartHub(hubId);
          setConnectingHub(null);
          const hub = smartHubs.find(h => h.id === hubId);
          const isConnecting = hub?.status === 'disconnected'; 
          addNotification({
              title: isConnecting ? 'Hub Conectado' : 'Hub Desconectado',
              message: isConnecting ? `Conexão com ${hub?.name} estabelecida.` : `Conexão com ${hub?.name} encerrada.`,
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
      setShowAddDeviceModal(false);
      setNewDevice({ name: '', type: 'AC', brand: '', room: '', hubId: 'lg_thinq' });
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
                    <Database className="text-indigo-600" />
                    Hub de Conexões
                </h1>
                <p className="text-gray-500 max-w-2xl">
                    Centralize suas conexões externas e dispositivos inteligentes para a IA controlar.
                </p>
            </div>
            
            {/* Toggle de Seção */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button 
                    onClick={() => setSection('data')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${section === 'data' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
                    Dados & Apps
                </button>
                <button 
                    onClick={() => setSection('smarthome')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${section === 'smarthome' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
                    Casa Inteligente
                </button>
            </div>
        </div>

        {/* --- SEÇÃO DE DADOS --- */}
        {section === 'data' && (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {integrations.map(integ => (
                        <div key={integ.id} className={`bg-white dark:bg-dark-800 rounded-2xl border transition-all overflow-hidden ${integ.status === 'active' ? 'border-green-500 shadow-md shadow-green-500/10' : 'border-gray-200 dark:border-gray-700'}`}>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-xl ${integ.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                            <Link size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800 dark:text-white">{integ.name}</h3>
                                            <p className="text-xs text-gray-500">
                                                {integ.status === 'active' ? `Sincronizado: ${integ.lastSync}` : 'Não conectado'}
                                            </p>
                                        </div>
                                    </div>
                                    {integ.status === 'active' && <CheckCircle2 className="text-green-500" />}
                                </div>

                                {integ.contextData && (
                                    <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-xs text-indigo-800 dark:text-indigo-300">
                                        <strong>O que a IA sabe:</strong> {integ.contextData.substring(0, 100)}...
                                    </div>
                                )}

                                {activeTab === integ.id ? (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                        <textarea 
                                            value={dataInput}
                                            onChange={(e) => setDataInput(e.target.value)}
                                            placeholder={`Cole aqui o texto exportado, mensagens ou agenda do ${integ.name}...`}
                                            className="w-full h-32 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                        />
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => setActiveTab(null)}
                                                className="flex-1 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm">
                                                Cancelar
                                            </button>
                                            <button 
                                                onClick={() => handleProcessData(integ.id, integ.name)}
                                                disabled={processing}
                                                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm flex items-center justify-center gap-2">
                                                {processing ? <RefreshCw className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                                                {processing ? 'Analisando...' : 'Processar Dados'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => { setActiveTab(integ.id); setDataInput(''); }}
                                        className="w-full py-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 hover:border-indigo-500 hover:text-indigo-500 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                                        <Plus size={16} /> Importar Dados Externos
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-8 bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-800 flex gap-4">
                    <AlertCircle className="text-blue-600 shrink-0" size={24} />
                    <div>
                        <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-1">Como funciona a integração?</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
                            Você copia o conteúdo (ex: agenda, notas) e cola aqui. 
                            Nossa IA processará o texto bruto, extrairá informações e integrará tudo ao seu Painel e Chat.
                        </p>
                    </div>
                </div>
            </>
        )}

        {/* --- SEÇÃO SMART HOME --- */}
        {section === 'smarthome' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                
                {/* HUBS SECTION */}
                <div>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Hubs Conectados</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {smartHubs.map(hub => (
                            <div key={hub.id} className="bg-white dark:bg-dark-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl relative">
                                        {getHubIcon(hub.icon)}
                                        {hub.status === 'connected' && <div className="absolute -top-1 -right-1 bg-green-500 w-2 h-2 rounded-full border border-white"></div>}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 dark:text-white text-sm">{hub.name}</h3>
                                        <p className="text-[10px] text-gray-500">{hub.status === 'connected' ? 'Online' : 'Offline'}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleHubConnection(hub.id)}
                                    disabled={connectingHub === hub.id}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        hub.status === 'connected' 
                                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                        : 'bg-primary-600 text-white hover:bg-primary-700'
                                    }`}
                                >
                                    {connectingHub === hub.id ? '...' : (hub.status === 'connected' ? 'Desconectar' : 'Conectar')}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* DEVICES SECTION */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Dispositivos</h2>
                        <button onClick={() => setShowAddDeviceModal(true)} className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center gap-1">
                            <Plus size={14} /> Add
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {smartDevices.map(device => {
                            const hub = smartHubs.find(h => h.id === device.hubId);
                            const isHubConnected = hub?.status === 'connected';
                            const isActive = ['on', 'unlocked', 'open'].includes(device.status);

                            return (
                                <div key={device.id} className={`p-5 rounded-2xl border transition-all ${isActive && isHubConnected ? 'bg-white dark:bg-dark-800 border-primary-500 shadow-md' : 'bg-gray-50 dark:bg-dark-900/50 border-gray-200 dark:border-gray-800 opacity-80'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${isActive ? 'bg-gray-100 dark:bg-gray-700' : 'bg-gray-200 dark:bg-gray-800'}`}>
                                                {getDeviceIcon(device.type)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-sm text-gray-800 dark:text-white">{device.name}</h3>
                                                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                                    <span>{device.room}</span>
                                                    {!isHubConnected && <span className="text-red-500 font-bold flex items-center gap-1"><AlertTriangle size={8}/> Hub Off</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => togglePower(device)}
                                            disabled={!isHubConnected}
                                            className={`p-2 rounded-full ${isActive ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-500'}`}>
                                            <Power size={16} />
                                        </button>
                                    </div>

                                    {/* Controles simplificados */}
                                    <div className="space-y-2">
                                        {device.type === 'AC' && (
                                            <div className="flex items-center justify-between text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                                                <span className="font-bold">{device.settings.temperature}°C</span>
                                                <div className="flex gap-1">
                                                    <button onClick={() => adjustSetting(device, 'temperature', (device.settings.temperature || 24) - 1)} className="px-2 bg-white dark:bg-gray-700 rounded shadow-sm">-</button>
                                                    <button onClick={() => adjustSetting(device, 'temperature', (device.settings.temperature || 24) + 1)} className="px-2 bg-white dark:bg-gray-700 rounded shadow-sm">+</button>
                                                </div>
                                            </div>
                                        )}
                                        {device.type === 'LIGHT' && (
                                            <div className="flex gap-1 justify-center mt-2">
                                                {['#FFD700', '#FFFFFF', '#FF0000'].map(color => (
                                                    <button key={color} onClick={() => adjustSetting(device, 'color', color)} className="w-4 h-4 rounded-full border" style={{ backgroundColor: color }} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        )}

        {/* Modal Adicionar Dispositivo */}
        {showAddDeviceModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                    <h2 className="text-xl font-bold mb-4 dark:text-white">Novo Dispositivo</h2>
                    <div className="space-y-3">
                        <input value={newDevice.name} onChange={e => setNewDevice({...newDevice, name: e.target.value})} placeholder="Nome (Ex: Luz Sala)" className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                        <select value={newDevice.type} onChange={e => setNewDevice({...newDevice, type: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                            <option value="AC">Ar Condicionado</option>
                            <option value="TV">TV</option>
                            <option value="LIGHT">Luz</option>
                            <option value="ROBOT">Robô</option>
                        </select>
                        <select value={newDevice.hubId} onChange={e => setNewDevice({...newDevice, hubId: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                            {smartHubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setShowAddDeviceModal(false)} className="px-4 py-2 text-sm text-gray-500">Cancelar</button>
                        <button onClick={handleSaveDevice} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg">Salvar</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default HubDeIntegracoes;
