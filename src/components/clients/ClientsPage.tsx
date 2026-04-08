import React, { useState, useEffect } from 'react';
import { 
    UserPlus, 
    Search, 
    Phone, 
    Mail, 
    MapPin, 
    Plus, 
    ChevronRight, 
    Trash2, 
    MoreVertical,
    CheckCircle2,
    X
} from 'lucide-react';
import { getUserClients, saveClient, deleteClient } from '../../lib/localStorage/db';
import { ClientData, ViewType } from '../../types';
import { useUserStore } from '../../store/userStore';
import { useDesignerStore } from '../../store/designerStore';

interface ClientsPageProps {
    onViewChange: (view: ViewType) => void;
}

const ClientsPage: React.FC<ClientsPageProps> = ({ onViewChange }) => {
    const [clients, setClients] = useState<ClientData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    
    // Form state
    const [newClient, setNewClient] = useState<Partial<ClientData>>({
        name: '',
        email: '',
        phone: '',
        address: '',
        company: '',
        notes: ''
    });

    const { setActiveClient, clearCanvas } = useDesignerStore();
    const { currentUser } = useUserStore();
    const userId = currentUser?.userId || 'unknown';

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const data = await getUserClients(userId);
            setClients(data);
        } catch (error) {
            console.error("Error fetching clients:", error);
            setClients([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClient.name) {
            alert("El nombre es obligatorio");
            return;
        }

        try {
            const clientId = await saveClient({ 
                ...newClient, 
                userId,
                name: newClient.name as string
            } as ClientData);
            
            const newClientWithId = { 
                ...newClient, 
                id: clientId, 
                userId,
                createdAt: new Date().toISOString() 
            };
            
            setShowAddForm(false);
            setNewClient({ name: '', email: '', phone: '', address: '', company: '', notes: '' });
            fetchClients();
            
            // Ask if user wants to create a project with this client
            const shouldCreateProject = window.confirm(
                `Cliente "${newClient.name}" guardado exitosamente.\n\n¿Deseas crear un nuevo proyecto con este cliente ahora?`
            );
            
            if (shouldCreateProject) {
                setActiveClient(newClientWithId as ClientData);
                clearCanvas();
                onViewChange('window');
            }
        } catch (error) {
            console.error("Error saving client:", error);
            alert("Error al guardar cliente");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("¿Estás seguro de eliminar este cliente?")) return;
        try {
            await deleteClient(id);
            fetchClients();
        } catch (error) {
            alert("Error al eliminar");
        }
    };

    const handleStartProject = (client: ClientData) => {
        clearCanvas();
        setActiveClient(client);
        onViewChange('window');
    };

    const filteredClients = clients.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-full">
            {/* 📋 Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-900 tracking-tight">Directorio de Clientes</h3>
                    <p className="text-slate-500 font-medium mt-1">Gestiona tu cartera y crea nuevos proyectos técnicos.</p>
                </div>
                <button 
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-on-primary rounded-2xl font-bold shadow-lg shadow-slate-900/40 transition-all active:scale-[0.98] hover:opacity-90"
                >
                    <UserPlus className="w-5 h-5" />
                    Nuevo Cliente
                </button>
            </div>

            {/* 🔍 Search and Filters */}
            <div className="relative mb-8 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Buscar por nombre, empresa o correo..." 
                    className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[24px] text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-soft-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* 📇 Clients Grid/List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-slate-100 rounded-[32px] animate-pulse"></div>
                    ))}
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] text-center">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-soft-lg mb-6">
                        <Search className="w-10 h-10 text-slate-200" />
                    </div>
                    <p className="text-lg font-bold text-slate-900">No se encontraron clientes</p>
                    <p className="text-slate-400 max-w-xs mt-2">Prueba con otro término o crea un nuevo cliente para empezar.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map(client => (
                        <div key={client.id} className="group bg-white border border-slate-100 rounded-[32px] shadow-soft-xl hover:shadow-soft-2xl transition-all duration-500 flex flex-col overflow-hidden relative">
                            <div className="p-6 pb-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 text-xl font-bold border border-indigo-100/50">
                                        {client.name.charAt(0)}
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(client.id!)}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <h4 className="text-xl font-display font-bold text-slate-900 mb-1 group-hover:text-primary-600 transition-colors">{client.name}</h4>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{client.company || 'Particular'}</p>
                            </div>
                            
                            <div className="px-6 py-4 space-y-3 bg-slate-50/50 flex-1">
                                {client.phone && (
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm font-medium">{client.phone}</span>
                                    </div>
                                )}
                                {client.email && (
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm font-medium">{client.email}</span>
                                    </div>
                                )}
                                {client.address && (
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm font-medium truncate">{client.address}</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-white border-t border-slate-50">
                                <button 
                                    onClick={() => handleStartProject(client)}
                                    className="w-full py-3.5 bg-slate-900 hover:bg-primary-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-primary-700/10"
                                >
                                    Nuevo Proyecto <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ➕ Modal Add Client */}
            {showAddForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 pb-4 flex justify-between items-center border-b border-slate-100">
                            <div>
                                <h3 className="text-2xl font-display font-bold text-slate-900">Registrar Cliente</h3>
                                <p className="text-slate-600 text-sm font-bold">Completa los datos para el expediente digital.</p>
                            </div>
                            <button 
                                onClick={() => setShowAddForm(false)}
                                className="p-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddClient} className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="md:col-span-2">
                                    <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2 block">Nombre Completo *</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-600 font-bold text-slate-900 transition-all placeholder:text-slate-500"
                                        placeholder="ej. Juan Pérez"
                                        value={newClient.name}
                                        onChange={e => setNewClient({...newClient, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2 block">Empresa / Obra</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-600 font-bold text-slate-900 transition-all placeholder:text-slate-500"
                                        placeholder="ej. Constructora Alfa"
                                        value={newClient.company}
                                        onChange={e => setNewClient({...newClient, company: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2 block">Teléfono</label>
                                    <input 
                                        type="tel" 
                                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-600 font-bold text-slate-900 transition-all placeholder:text-slate-500"
                                        placeholder="+52 000 000 0000"
                                        value={newClient.phone}
                                        onChange={e => setNewClient({...newClient, phone: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2 block">Correo Electrónico</label>
                                    <input 
                                        type="email" 
                                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-600 font-bold text-slate-900 transition-all placeholder:text-slate-500"
                                        placeholder="ejemplo@correo.com"
                                        value={newClient.email}
                                        onChange={e => setNewClient({...newClient, email: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2 block">Dirección de Instalación</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-600 font-bold text-slate-900 transition-all placeholder:text-slate-500"
                                        placeholder="Calle, Número, Ciudad..."
                                        value={newClient.address}
                                        onChange={e => setNewClient({...newClient, address: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-4 bg-primary text-on-primary rounded-2xl font-bold shadow-xl shadow-slate-900/40 transition-all flex items-center justify-center gap-2 active:scale-95 hover:opacity-90"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    Guardar Cliente
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientsPage;
