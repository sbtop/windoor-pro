import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Phone, 
    Mail, 
    MapPin, 
    Plus, 
    ChevronRight, 
    Trash2, 
    MoreVertical,
    CheckCircle2,
    X,
    Users,
    UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserClients, saveClient, deleteClient, saveProject } from '../../lib/localStorage/db';
import { ClientData, ViewType } from '../../types';
import { useUserContext } from '../../context/UserContext';
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

    const { setActiveClient, clearCanvas, setActiveProjectId } = useDesignerStore();
    const { currentUser } = useUserContext();
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
                // Create a project automatically with the client data
                const projectId = await saveProject({
                    userId,
                    clientName: newClient.name as string,
                    projectName: `Proyecto ${newClient.name}`,
                    siteAddress: newClient.address,
                    contactPhone: newClient.phone,
                    projectType: 'Ventana',
                    status: 'draft',
                    elements: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
                
                // Set active client and clear canvas
                setActiveClient(newClientWithId as ClientData);
                clearCanvas();
                setActiveProjectId(projectId);
                
                // Navigate to designer with the new project
                onViewChange('designer');
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

    const handleStartProject = async (client: ClientData) => {
        try {
            // Set active client and clear canvas
            setActiveClient(client);
            clearCanvas();
            const projectId = await saveProject({
                userId,
                clientName: client.name,
                projectName: `Proyecto ${client.name}`,
                siteAddress: client.address,
                contactPhone: client.phone,
                projectType: 'Ventana',
                status: 'draft',
                elements: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            setActiveProjectId(projectId);
            
            // Navigate to designer
            onViewChange('designer');
        } catch (error) {
            console.error("Error creating project:", error);
            alert("Error al crear proyecto");
        }
    };

    const filteredClients = clients.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto min-h-screen">
            {/* 📋 Modern Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12"
            >
                <div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Directorio Maestro</h3>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
                        <Users size={14} className="text-primary" /> Cartera de Clientes Activos
                    </p>
                </div>
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all"
                >
                    <UserPlus size={18} />
                    Nuevo Registro
                </motion.button>
            </motion.div>

            {/* 🔍 Premium Search Bar */}
            <div className="relative mb-12 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-all" />
                <input 
                    type="text" 
                    placeholder="Filtrar por nombre, empresa o contacto..." 
                    className="w-full pl-16 pr-8 py-5 glass-card bg-white/40 border-white/60 rounded-[32px] text-sm font-black text-slate-700 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* 📇 Bento Grid Layout */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-slate-100/50 rounded-[40px] animate-pulse"></div>
                    ))}
                </div>
            ) : filteredClients.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-24 glass-card border-dashed border-slate-200/50 rounded-[48px] text-center"
                >
                    <div className="w-24 h-24 bg-white/50 rounded-[32px] flex items-center justify-center shadow-xl mb-8">
                        <Search size={32} className="text-slate-300" />
                    </div>
                    <p className="text-xl font-black text-slate-900 tracking-tight">Sin resultados</p>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Inicia tu base de datos hoy</p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {filteredClients.map((client, idx) => (
                            <motion.div 
                                key={client.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group glass-card hover:bg-white/60 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[40px] flex flex-col p-2"
                            >
                                <div className="p-6 pb-2 flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-[20px] flex items-center justify-center text-primary text-2xl font-black">
                                            {client.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-slate-900 tracking-tighter truncate max-w-[150px]">{client.name}</h4>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{client.company || 'PARTICULAR'}</span>
                                        </div>
                                    </div>
                                    <motion.button 
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        onClick={() => handleDelete(client.id!)}
                                        className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </motion.button>
                                </div>
                                
                                <div className="m-4 p-6 space-y-4 bg-white/40 rounded-[32px] border border-white/60 flex-1">
                                    {client.phone && (
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
                                                <Phone size={14} className="text-primary" />
                                            </div>
                                            <span className="text-xs font-bold">{client.phone}</span>
                                        </div>
                                    )}
                                    {client.email && (
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
                                                <Mail size={14} className="text-primary" />
                                            </div>
                                            <span className="text-xs font-bold truncate max-w-[180px]">{client.email}</span>
                                        </div>
                                    )}
                                    {client.address && (
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
                                                <MapPin size={14} className="text-primary" />
                                            </div>
                                            <span className="text-xs font-bold truncate">{client.address}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 pt-0">
                                    <motion.button 
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleStartProject(client)}
                                        className="w-full py-4 bg-slate-900 hover:bg-primary text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                                    >
                                        Crear Proyecto <ChevronRight size={14} strokeWidth={3} />
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
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
