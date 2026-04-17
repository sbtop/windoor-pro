import React, { useState, useEffect } from 'react';
import { ViewType } from '../../types';
import DesignerPage from '../designer/DesignerPage';
import ClientsPage from '../clients/ClientsPage';
import ProjectGallery from '../projects/ProjectGallery';
import Reportes from '../Reportes';
import QuotationsView from '../quotations/QuotationsView';
import Calendar from '../Calendar';
import Calculator from '../Calculator';
import SettingsPage from '../SettingsPage';
import VersionHistoryModal from '../projects/VersionHistoryModal';
import ApprovalModal from '../projects/ApprovalModal';
import ClientTrackingDashboard from '../projects/ClientTrackingDashboard';
import WhatsAppShareModal from '../projects/WhatsAppShareModal';
import { usePDFStore } from '../../store/pdfStore';
import { generateTechnicalPDF, generateMultiElementPDF, createTechnicalDrawing } from '../../services/pdfGenerator';
import { getUserProjects, saveProject, deleteProject, updateProject, ProjectData, createProjectVersion } from '../../lib/localStorage/db';
import { calcularMaterialesVentana } from '../../services/manufacturing';
import { calcularCotizacionSaaS } from '../../services/pricing';
import { useDesignerStore } from '../../store/designerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useUserContext } from '../../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, 
    Search, 
    Filter, 
    ChevronRight, 
    LayoutGrid, 
    List, 
    X, 
    Edit3, 
    FileText, 
    Factory, 
    Image as ImageIcon, 
    Trash2,
    Users,
    Clock,
    AlertCircle,
    CheckCircle2,
    FolderOpen,
    Maximize2,
    Settings,
    PenTool,
    History,
    CheckCircle,
    TrendingUp,
    MessageCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface WorkspaceProps {
    activeView: ViewType;
    onViewChange?: (view: ViewType) => void;
}

const Workspace: React.FC<WorkspaceProps> = ({ activeView, onViewChange }) => {
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
    const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
    const [isEditingProjectData, setIsEditingProjectData] = useState(false);
    const [editProjectData, setEditProjectData] = useState<Partial<ProjectData>>({});
    const [calculatedTotal, setCalculatedTotal] = useState<number | null>(null);
    const [newProject, setNewProject] = useState({
        clientName: '',
        siteAddress: '',
        contactPhone: '',
        projectType: 'ventana'
    });

    // Advanced filters
    const [showFilters, setShowFilters] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('date-desc');
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };
    
    // Version history
    const [showVersionHistory, setShowVersionHistory] = useState(false);
    const [versionHistoryProject, setVersionHistoryProject] = useState<ProjectData | null>(null);
    
    // Approval system
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalProject, setApprovalProject] = useState<ProjectData | null>(null);
    
    // Client tracking dashboard
    const [showTrackingDashboard, setShowTrackingDashboard] = useState(false);
    const [trackingProject, setTrackingProject] = useState<ProjectData | null>(null);
    
    // WhatsApp integration
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
    const [whatsappProject, setWhatsappProject] = useState<ProjectData | null>(null);

    const { pricingConfig, companyProfile } = useSettingsStore();
    const { currentUser } = useUserContext();
    const userId = currentUser?.userId || 'unknown';

    // PDF documents from store
    const { documents: recentDocs } = usePDFStore();

    useEffect(() => {
        if (activeView === 'projects' || activeView === 'home') {
            setLoading(true);
            getUserProjects(userId)
                .then(data => {
                    if (data.length === 0) {
                        // Create professional mock data for first-time use
                        const mockData: ProjectData[] = [
                            {
                                id: 'proj-1',
                                userId: userId,
                                clientName: 'Residencia Lomas',
                                projectName: 'Fachada Principal Vidrio',
                                siteAddress: 'Paseo de la Reforma 1234, CDMX',
                                projectType: 'fachada',
                                status: 'in-production',
                                elements: [ { id: 'w1', type: 'window', width: 2000, height: 1500, panels: [{ id: 'p1', widthRatio: 0.5 }, { id: 'p2', widthRatio: 0.5 }], material: 'aluminio', x: 100, y: 100, selected: false } ],
                                sitePhotos: [],
                                quotation: { totales: { precioVenta: 45000, costoDirecto: 30000, gananciaBruta: 15000, margenPorcentaje: 33 } } as any
                            },
                            {
                                id: 'proj-2',
                                userId: userId,
                                clientName: 'Apartamentos Skyview',
                                projectName: 'Instalación Ventanas Piso 12',
                                siteAddress: 'Av. Insurgentes Sur 800, CDMX',
                                projectType: 'ventana',
                                status: 'quoted',
                                elements: [ { id: 'w2', type: 'window', width: 1200, height: 1200, panels: [{ id: 'p3', widthRatio: 1.0 }], material: 'upvc', x: 200, y: 200, selected: false } ],
                                sitePhotos: [],
                                quotation: { totales: { precioVenta: 12500, costoDirecto: 8000, gananciaBruta: 4500, margenPorcentaje: 36 } } as any
                            }
                        ];
                        // Save mock data so they persist from now on
                        Promise.all(mockData.map(p => saveProject(p))).then(() => {
                            setProjects(mockData);
                        });
                    } else {
                        setProjects(data);
                    }
                })
                .catch(err => console.error("Error cargando proyectos", err))
                .finally(() => setLoading(false));
        }
    }, [activeView, userId]);

    // Close action menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveActionMenu(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Calculate real-time price when project is selected
    useEffect(() => {
        if (selectedProject?.elements && selectedProject.elements.length > 0) {
            const calculateTotal = async () => {
                try {
                    const { calcularMaterialesVentana } = await import('../../services/manufacturing');
                    const { calcularCotizacionSaaS, DEFAULT_PRICING_CONFIG } = await import('../../services/pricing');
                    
                    // USAR CONFIGURACIÓN DEL STORE
                    const { pricingConfig: storeConfig } = useSettingsStore.getState();
                    const pricingConfig = storeConfig?.diccionario ? storeConfig : DEFAULT_PRICING_CONFIG;
                    
                    let total = 0;
                    for (const element of selectedProject.elements) {
                        const calcResult = calcularMaterialesVentana({
                            ancho: element.width,
                            alto: element.height,
                            tipo: (element as any).openingType || 'corrediza',
                            hojas: (element as any).panels?.length || 2,
                            glassType: (element as any).glassType
                        });
                        const pricingResult = calcularCotizacionSaaS(calcResult, pricingConfig);
                        total += pricingResult.totales.precioVenta;
                    }
                    setCalculatedTotal(total);
                } catch (err) {
                    console.error('Error calculando total:', err);
                    setCalculatedTotal(null);
                }
            };
            calculateTotal();
        } else {
            setCalculatedTotal(null);
        }
    }, [selectedProject]);

    const formatCurrency = (amount: number) => {
        return `${pricingConfig.moneda}${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-sky-500';
            case 'quoted': return 'bg-amber-500';
            case 'in-production': return 'bg-indigo-500';
            case 'completed': return 'bg-emerald-500';
            default: return 'bg-slate-300';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'draft': return 'Borrador';
            case 'quoted': return 'Cotizado';
            case 'in-production': return 'Producción';
            case 'completed': return 'Finalizado';
            default: return 'Pendiente';
        }
    };

    // Filter projects based on search query and advanced filters
    const filteredProjects = projects
        .filter(project => {
            // Search filter
            const matchesSearch =
                project.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.siteAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.projectType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.projectName?.toLowerCase().includes(searchQuery.toLowerCase());

            // Status filter
            const matchesStatus = filterStatus === 'all' || project.status === filterStatus;

            // Type filter
            const matchesType = filterType === 'all' || project.projectType === filterType;

            return matchesSearch && matchesStatus && matchesType;
        })
        .sort((a, b) => {
            // Sorting
            switch (sortBy) {
                case 'date-desc':
                    return Number(b.createdAt || 0) - Number(a.createdAt || 0);
                case 'date-asc':
                    return Number(a.createdAt || 0) - Number(b.createdAt || 0);
                case 'name-asc':
                    return (a.clientName || '').localeCompare(b.clientName || '');
                case 'name-desc':
                    return (b.clientName || '').localeCompare(a.clientName || '');
                case 'price-desc':
                    return Number(b.quotation?.totales?.precioVenta || 0) - Number(a.quotation?.totales?.precioVenta || 0);
                case 'price-asc':
                    return Number(a.quotation?.totales?.precioVenta || 0) - Number(b.quotation?.totales?.precioVenta || 0);
                default:
                    return 0;
            }
        });

    // Handle new project creation
    const handleCreateProject = () => {
        const { clearCanvas, setActiveClient, setActiveProjectId } = useDesignerStore.getState();

        // Prepare designer for new project
        clearCanvas();
        setActiveClient({
            name: newProject.clientName,
            phone: newProject.contactPhone,
            address: newProject.siteAddress
        });

        // Persist the new project immediately
        const project: ProjectData = {
            userId,
            clientName: newProject.clientName,
            projectName: `Proyecto ${newProject.clientName}`,
            siteAddress: newProject.siteAddress,
            contactPhone: newProject.contactPhone,
            projectType: newProject.projectType,
            status: 'draft',
            elements: [],
            sitePhotos: [],
        };
        saveProject(project).then(id => {
            setProjects(prev => [...prev, { ...project, id }]);
            setActiveProjectId(id);
        });

        setShowNewProjectModal(false);
        setNewProject({ clientName: '', siteAddress: '', contactPhone: '', projectType: 'ventana' });

        // Navigate to designer
        onViewChange?.('designer');
    };

    // Handle action menu actions
    const handleAction = async (action: string, projectId: string | undefined) => {
        if (!projectId) return;
        setActiveActionMenu(null);
        const project = projects.find(p => p.id === projectId);
        switch (action) {
            case 'edit':
                console.log('Editar datos del proyecto:', projectId, project);
                if (project) {
                    // Abrir modal de edición del proyecto
                    setSelectedProject(project);
                    setEditProjectData({
                        projectName: project.projectName,
                        clientName: project.clientName,
                        siteAddress: project.siteAddress,
                        contactPhone: project.contactPhone,
                        projectType: project.projectType,
                        status: project.status
                    });
                    setIsEditingProjectData(true);
                }
                break;
            case 'design':
                console.log('Abrir diseñador:', projectId, project);
                if (project) {
                    const { setElements, setActiveClient, setActiveProjectId } = useDesignerStore.getState();
                    // Cargar elementos del proyecto en el diseñador
                    setElements(project.elements || []);
                    // Establecer ID del proyecto
                    setActiveProjectId(projectId);
                    // Establecer cliente activo
                    setActiveClient({
                        name: project.clientName || '',
                        address: project.siteAddress || '',
                        phone: project.contactPhone || ''
                    });
                    console.log('Proyecto cargado en diseñador:', project.elements?.length, 'elementos');
                }
                onViewChange?.('designer');
                break;
            case 'pdf':
                console.log('Generar PDF:', projectId);
                // Generate professional quotation PDF
                if (project && project.elements && project.elements.length > 0) {
                    try {
                        const { pricingConfig } = useSettingsStore.getState();
                        
                        // Calculate materials and pricing for each element
                        const elementsData = project.elements.map((element: any) => {
                            const calcResult = calcularMaterialesVentana(element);
                            const pricingResult = calcularCotizacionSaaS(calcResult, pricingConfig);
                            const imageDataUrl = createTechnicalDrawing(element);
                            
                            return {
                                element,
                                calcResult,
                                imageDataUrl,
                                pricingResult
                            };
                        });
                        
                        // Calculate total pricing
                        const totalCalcResult = elementsData.reduce((acc, item) => {
                            return {
                                ...acc,
                                totales: {
                                    ...acc.totales,
                                    precioVenta: acc.totales.precioVenta + item.pricingResult.totales.precioVenta
                                }
                            };
                        }, { totales: { precioVenta: 0 } });
                        
                        // Generate PDF
                        generateMultiElementPDF(
                            elementsData,
                            totalCalcResult as any,
                            pricingConfig.diccionario,
                            companyProfile,
                            {
                                clientName: project.clientName,
                                projectName: project.projectName,
                                siteAddress: project.siteAddress
                            }
                        );
                        
                        // Also save to store
                        const { addDocument } = usePDFStore.getState();
                        addDocument({
                            name: `Cotizacion_${project.clientName}_${Date.now()}.pdf`,
                            type: 'cotizacion',
                            projectId: project.id,
                            projectName: project.projectType || 'Proyecto',
                            clientName: project.clientName || 'Sin cliente'
                        });
                    } catch (error) {
                        console.error('Error generating PDF:', error);
                        alert('Error al generar el PDF. Por favor intenta nuevamente.');
                    }
                } else {
                    alert('El proyecto no tiene elementos. Agrega elementos en el diseñador antes de generar la cotización.');
                }
                break;
            case 'production':
                if (project && confirm(`¿Enviar "${project.projectName || project.clientName}" a producción?`)) {
                    await updateProject(projectId, { status: 'in-production' });
                    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: 'in-production' } : p));
                    showToast(`✓ Proyecto enviado a producción`);
                }
                break;
            case 'finish':
                if (project && confirm(`¿Marcar "${project.projectName || project.clientName}" como completado?`)) {
                    await updateProject(projectId, { status: 'completed' });
                    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: 'completed' } : p));
                    showToast(`✓ Proyecto marcado como completado`);
                }
                break;
            case 'gallery':
                if (project) setSelectedProject(project);
                break;
            case 'history':
                if (project) {
                    setVersionHistoryProject(project);
                    setShowVersionHistory(true);
                }
                break;
            case 'approve':
                if (project) {
                    setApprovalProject(project);
                    setShowApprovalModal(true);
                }
                break;
            case 'tracking':
                if (project) {
                    setTrackingProject(project);
                    setShowTrackingDashboard(true);
                }
                break;
            case 'whatsapp':
                if (project) {
                    setWhatsappProject(project);
                    setShowWhatsAppModal(true);
                }
                break;
            case 'delete':
                if (confirm('¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.')) {
                    setProjects(prev => prev.filter(p => p.id !== projectId));
                    if (projectId) deleteProject(projectId);
                }
                break;
        }
    };

    // Accept a real base64 string from the file input in ProjectGallery
    const handleAddPhotoToProject = (projectId: string, base64: string) => {
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                const updatedPhotos = [...(p.sitePhotos || []), base64];
                const updated = { ...p, sitePhotos: updatedPhotos };
                // Persist to localStorage
                saveProject(updated);
                // Also update the open detail modal if it's the same project
                if (selectedProject?.id === projectId) {
                    setSelectedProject(updated);
                }
                return updated;
            }
            return p;
        }));
    };

    const renderDashboard = () => (
        <>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 md:p-8 space-y-8"
            >
            {/* Minimalist Professional Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
                <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="max-w-2xl"
                >
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
                        Panel de <span className="text-primary italic">Proyectos</span>
                    </h1>
                    <p className="text-sm font-bold text-slate-500 max-w-lg leading-relaxed">
                        Control central de instalaciones, presupuestos dinámicos y gestión de clientes con precisión técnica de grado arquitectónico.
                    </p>
                </motion.div>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onViewChange?.('clients')}
                        className="flex-1 md:flex-none px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-sm shadow-sm hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                    >
                        <Users size={18} />
                        Clientes
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowNewProjectModal(true)}
                        className="flex-1 md:flex-none px-6 py-4 rounded-2xl bg-primary text-white font-black text-sm shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={20} strokeWidth={3} />
                        Nuevo Proyecto
                    </motion.button>
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-12 gap-6">
                {/* Main Hero Card */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="col-span-12 lg:col-span-8 glass-card p-8 bg-gradient-to-br from-indigo-50/50 to-white flex flex-col justify-between min-h-[280px]"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">Reporte Matinal</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">Visión de Operaciones</h3>
                        <p className="text-sm font-semibold text-slate-500 max-w-md">
                            Tienes <span className="text-primary font-black underline decoration-2">{projects.filter(p => p.status === 'in-production').length} proyectos</span> en línea de producción hoy. 
                            El rendimiento se mantiene un <span className="text-emerald-600 font-black">+12%</span> por encima del mes pasado.
                        </p>
                    </div>
                    <div className="flex gap-4 pt-6">
                        <button className="text-xs font-black text-primary hover:underline flex items-center gap-1 group">
                            Ver logística <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </motion.div>

                {/* Status Stats Grid */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="col-span-12 md:col-span-6 lg:col-span-4 glass-card p-6 grid grid-cols-2 gap-4"
                >
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 group hover:border-primary/20 transition-all">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Cotizados</p>
                        <p className="text-2xl font-black text-slate-900">{projects.filter(p => p.status === 'quoted').length}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 group hover:border-primary/20 transition-all">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">En Obra</p>
                        <p className="text-2xl font-black text-slate-900">{projects.filter(p => p.status === 'in-production').length}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 group hover:border-primary/20 transition-all">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Alertas</p>
                        <p className="text-2xl font-black text-red-600">{projects.filter(p => p.status === 'draft').length}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-primary text-white group cursor-pointer active:scale-95 transition-all">
                        <p className="text-[10px] font-black text-white/60 uppercase mb-1">Total</p>
                        <p className="text-2xl font-black">{projects.length}</p>
                    </div>
                </motion.div>

                {/* Alerts / Activity Bento Box */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="col-span-12 lg:col-span-8 glass-card p-6 min-h-[200px]"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-black text-slate-800 flex items-center gap-2">
                            <Clock size={16} className="text-primary" />
                            Actividad Crítica
                        </h4>
                        <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary">Ver todas</button>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><AlertCircle size={16} /></div>
                            <div className="flex-1">
                                <p className="text-xs font-black text-slate-900">Proyecto Residencia Lomas <span className="text-[10px] text-slate-400 font-bold ml-2">Hace 2h</span></p>
                                <p className="text-[11px] font-medium text-slate-500">Diferencia de medida detectada (+6mm). Requiere revisión técnica.</p>
                            </div>
                            <button className="text-[10px] font-black text-primary px-3 py-1 bg-primary/5 rounded-lg">Corregir</button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Main Projects Section */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card overflow-hidden bg-white shadow-xl shadow-slate-200/50"
            >
                <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <FolderOpen size={20} className="text-primary" />
                            Proyectos Activos
                        </h3>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    className={cn(
                                        "w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm transition-all focus:ring-2 focus:ring-primary/10",
                                        "font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium"
                                    )}
                                    placeholder="Buscar por cliente o proyecto..."
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                                className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-primary transition-colors"
                            >
                                {viewMode === 'table' ? <LayoutGrid size={20} /> : <List size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {viewMode === 'table' ? (
                        <motion.div 
                            key="table-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="overflow-x-auto"
                        >
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                        <th className="px-8 py-4">Información Clave</th>
                                        <th className="px-8 py-4">Ubicación</th>
                                        <th className="px-8 py-4">Tipo</th>
                                        <th className="px-8 py-4">Estado Logístico</th>
                                        <th className="px-8 py-4 text-right">Detalles</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr><td colSpan={5} className="px-8 py-10 text-center text-sm font-bold text-primary animate-pulse">Analizando base de datos...</td></tr>
                                    ) : filteredProjects.map((project) => (
                                        <motion.tr 
                                            key={project.id}
                                            layout
                                            className="group hover:bg-slate-50/50 transition-colors"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary font-black text-sm">
                                                        {project.clientName?.charAt(0) || 'C'}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 text-sm leading-tight">{project.clientName || 'Sin identificar'}</p>
                                                        <p className="text-[10px] font-bold text-slate-400">{project.projectType || 'Módulo'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-sm font-bold text-slate-500 max-w-[200px] truncate">{project.siteAddress || 'No asignado'}</td>
                                            <td className="px-8 py-5">
                                                <span className="text-[9px] font-black uppercase px-2 py-1 bg-slate-100 text-slate-600 rounded-lg">
                                                    {project.projectType || 'General'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("w-2 h-2 rounded-full", getStatusColor(project.status))} />
                                                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{getStatusLabel(project.status)}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right flex justify-end gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleAction('edit', project.id)} className="p-2 hover:bg-primary/10 text-slate-400 hover:text-primary rounded-lg transition-colors" title="Editar datos"><Edit3 size={16} /></button>
                                                <button onClick={() => handleAction('design', project.id)} className="p-2 hover:bg-purple-50 text-slate-400 hover:text-purple-600 rounded-lg transition-colors" title="Abrir diseñador"><PenTool size={16} /></button>
                                                <button onClick={() => handleAction('pdf', project.id)} className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors" title="Generar PDF"><FileText size={16} /></button>
                                                <button onClick={() => handleAction('whatsapp', project.id)} className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors" title="Enviar por WhatsApp"><MessageCircle size={16} /></button>
                                                <button onClick={() => handleAction('approve', project.id)} className={`p-2 rounded-lg transition-colors ${
                                                    project.currentApproval?.status === 'approved' 
                                                        ? 'hover:bg-emerald-100 text-emerald-600' 
                                                        : project.currentApproval?.status === 'rejected'
                                                        ? 'hover:bg-red-100 text-red-600'
                                                        : 'hover:bg-blue-100 text-blue-600'
                                                }`} title="Aprobación digital"><CheckCircle size={16} /></button>
                                                <button onClick={() => handleAction('history', project.id)} className="p-2 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg transition-colors" title="Historial de versiones"><History size={16} /></button>
                                                <button onClick={() => handleAction('production', project.id)} className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors" title="Producción"><Factory size={16} /></button>
                                                <button onClick={() => handleAction('delete', project.id)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors" title="Eliminar"><Trash2 size={16} /></button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="card-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {filteredProjects.map((project) => (
                                <motion.div 
                                    layout
                                    key={project.id}
                                    whileHover={{ scale: 1.02 }}
                                    className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all flex flex-col justify-between"
                                >
                                    <div className="mb-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-primary font-black text-lg">
                                                {project.clientName?.charAt(0) || 'C'}
                                            </div>
                                            <div className={cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-sm", getStatusColor(project.status))}>
                                                {getStatusLabel(project.status)}
                                            </div>
                                        </div>
                                        <h4 className="font-black text-slate-900 mb-1 leading-tight">{project.clientName}</h4>
                                        <p className="text-[11px] font-bold text-slate-400 truncate mb-4">{project.siteAddress}</p>
                                        
                                        {project.quotation?.totales?.precioVenta && (
                                            <div className="p-3 bg-slate-50 rounded-xl mt-4">
                                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Presupuesto</p>
                                                <p className="text-xl font-black text-primary">${project.quotation.totales.precioVenta.toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleAction('edit', project.id)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl font-black text-xs hover:bg-primary/10 hover:text-primary transition-all">Editar</button>
                                        <button onClick={() => handleAction('design', project.id)} className="px-3 py-2 bg-purple-100 text-purple-700 rounded-xl font-black text-xs hover:bg-purple-200 transition-all"><PenTool size={16} /></button>
                                        <button onClick={() => handleAction('pdf', project.id)} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl font-black text-xs hover:bg-indigo-50 hover:text-indigo-600 transition-all"><FileText size={16} /></button>
                                        <button onClick={() => handleAction('whatsapp', project.id)} className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-black text-xs hover:bg-emerald-200 transition-all" title="Enviar por WhatsApp"><MessageCircle size={16} /></button>
                                        <button onClick={() => handleAction('approve', project.id)} className={`px-3 py-2 rounded-xl font-black text-xs transition-all ${
                                            project.currentApproval?.status === 'approved' 
                                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                                                : project.currentApproval?.status === 'rejected'
                                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                        }`} title="Aprobación digital"><CheckCircle size={16} /></button>
                                        <button onClick={() => handleAction('history', project.id)} className="px-3 py-2 bg-amber-100 text-amber-700 rounded-xl font-black text-xs hover:bg-amber-200 transition-all" title="Historial de versiones"><History size={16} /></button>
                                        <button onClick={() => handleAction('delete', project.id)} className="px-3 py-2 bg-red-50 text-red-600 rounded-xl font-black text-xs transition-all"><Trash2 size={16} /></button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registros: {filteredProjects.length}</span>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-400 hover:text-slate-800 transition-colors">Anterior</button>
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-400 hover:text-slate-800 transition-colors">Siguiente</button>
                    </div>
                </div>
            </motion.div>
        </motion.div>

            {/* New Project Modal */}
            {showNewProjectModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-headline font-bold text-primary">Nuevo Proyecto</h3>
                            <button
                                onClick={() => setShowNewProjectModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <span className="material-symbols-outlined text-slate-400">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-900 block mb-2">Nombre del Cliente</label>
                                <input
                                    type="text"
                                    value={newProject.clientName}
                                    onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-400 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary-700 placeholder:text-slate-500"
                                    placeholder="Ej: Juan Pérez"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-900 block mb-2">Dirección del Sitio</label>
                                <input
                                    type="text"
                                    value={newProject.siteAddress}
                                    onChange={(e) => setNewProject({ ...newProject, siteAddress: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-400 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary-700 placeholder:text-slate-500"
                                    placeholder="Ej: Av. Principal 123, Ciudad"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-900 block mb-2">Teléfono de Contacto</label>
                                <input
                                    type="tel"
                                    value={newProject.contactPhone}
                                    onChange={(e) => setNewProject({ ...newProject, contactPhone: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-400 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary-700 placeholder:text-slate-500"
                                    placeholder="Ej: (555) 123-4567"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-900 block mb-2">Tipo de Proyecto</label>
                                <select
                                    value={newProject.projectType}
                                    onChange={(e) => setNewProject({ ...newProject, projectType: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-400 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary-700"
                                >
                                    <option value="ventana">Ventana</option>
                                    <option value="puerta">Puerta</option>
                                    <option value="mampara">Mampara</option>
                                    <option value="fachada">Fachada</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 flex gap-3">
                            <button
                                onClick={() => setShowNewProjectModal(false)}
                                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateProject}
                                className="flex-1 px-4 py-3 bg-primary-700 text-white rounded-xl font-black uppercase tracking-widest hover:bg-primary-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-700/20 active:scale-95"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                Crear Proyecto
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Project Detail Modal with Gallery */}
            {selectedProject && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    {isEditingProjectData ? (
                                        <select 
                                            value={editProjectData.projectType}
                                            onChange={e => setEditProjectData({...editProjectData, projectType: e.target.value as any})}
                                            className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border-none outline-none ring-1 ring-primary/50"
                                        >
                                            <option value="ventana">Ventana</option>
                                            <option value="puerta">Puerta</option>
                                            <option value="mampara">Mampara</option>
                                            <option value="fachada">Fachada</option>
                                        </select>
                                    ) : (
                                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
                                            {selectedProject.projectType || 'Proyecto'}
                                        </span>
                                    )}

                                    {isEditingProjectData ? (
                                        <select 
                                            value={editProjectData.status}
                                            onChange={e => setEditProjectData({...editProjectData, status: e.target.value as any})}
                                            className={`px-3 py-1 text-white text-[10px] font-black uppercase tracking-widest rounded-full border-none outline-none ${getStatusColor(editProjectData.status || 'draft')}`}
                                        >
                                            <option value="draft">Borrador</option>
                                            <option value="quoted">Cotizado</option>
                                            <option value="in-production">En Producción</option>
                                        </select>
                                    ) : (
                                        <span className={`px-3 py-1 text-white text-[10px] font-black uppercase tracking-widest rounded-full ${getStatusColor(selectedProject.status)}`}>
                                            {getStatusLabel(selectedProject.status)}
                                        </span>
                                    )}
                                </div>

                                {isEditingProjectData ? (
                                    <div className="space-y-3 mt-4">
                                        <input 
                                            value={editProjectData.projectName}
                                            onChange={e => setEditProjectData({...editProjectData, projectName: e.target.value})}
                                            className="w-full text-2xl font-display font-bold text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-1"
                                            placeholder="Nombre del Proyecto"
                                        />
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase px-1 block mb-1">Cliente / Contacto</span>
                                                <input 
                                                    value={editProjectData.clientName}
                                                    onChange={e => setEditProjectData({...editProjectData, clientName: e.target.value})}
                                                    className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1 mb-2"
                                                    placeholder="Cliente"
                                                />
                                                <input 
                                                    value={editProjectData.contactPhone || ''}
                                                    onChange={e => setEditProjectData({...editProjectData, contactPhone: e.target.value})}
                                                    className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1"
                                                    placeholder="Teléfono"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase px-1 block mb-1">Dirección</span>
                                                <textarea 
                                                    value={editProjectData.siteAddress || ''}
                                                    onChange={e => setEditProjectData({...editProjectData, siteAddress: e.target.value})}
                                                    className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1 h-[72px] resize-none"
                                                    placeholder="Dirección"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-3xl font-display font-bold text-slate-900">{selectedProject.projectName}</h3>
                                        <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                                            <span className="material-symbols-outlined text-sm">person</span>
                                            {selectedProject.clientName}
                                            {selectedProject.contactPhone && <span className="text-xs">({selectedProject.contactPhone})</span>}
                                            <span className="mx-1">•</span>
                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                            {selectedProject.siteAddress || 'S/D'}
                                        </p>
                                    </>
                                )}
                            </div>
                            
                            <div className="flex gap-2">
                                {isEditingProjectData ? (
                                    <button 
                                        onClick={() => {
                                            const updatedProject = { ...selectedProject, ...editProjectData } as ProjectData;
                                            saveProject(updatedProject);
                                            setSelectedProject(updatedProject);
                                            setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
                                            setIsEditingProjectData(false);
                                        }}
                                        className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl shadow-md hover:bg-emerald-600 transition-all text-sm flex items-center gap-2 h-max"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">save</span>
                                        Guardar
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => {
                                            setEditProjectData({
                                                projectName: selectedProject.projectName,
                                                clientName: selectedProject.clientName,
                                                siteAddress: selectedProject.siteAddress,
                                                contactPhone: selectedProject.contactPhone,
                                                projectType: selectedProject.projectType,
                                                status: selectedProject.status
                                            });
                                            setIsEditingProjectData(false);
                                            setTimeout(()=>setIsEditingProjectData(true), 0);
                                        }}
                                        className="px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-lg">edit_note</span>
                                        Editar
                                    </button>
                                )}
                                <button 
                                    onClick={() => {
                                        setSelectedProject(null);
                                        setIsEditingProjectData(false);
                                    }}
                                    className="p-2.5 bg-slate-200 text-slate-700 hover:bg-slate-300 hover:text-slate-900 rounded-lg shadow-sm transition-all active:scale-90"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left: Technical Summary */}
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="p-6 bg-slate-100 rounded-3xl border-2 border-slate-200 shadow-sm">
                                        <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-4">Resumen Técnico</h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between">
                                                <span className="text-sm font-bold text-slate-700">Elementos</span>
                                                <span className="text-sm font-black text-slate-900">{selectedProject.elements.length}</span>
                                            </div>
                                            {calculatedTotal !== null && (
                                                <div className="flex justify-between pt-4 border-t border-slate-200">
                                                    <span className="text-sm text-slate-500">Valor Total Calculado</span>
                                                    <span className="text-lg font-black text-emerald-600">
                                                        ${calculatedTotal.toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 bg-primary-50 rounded-3xl border-2 border-primary-200 shadow-sm">
                                        <h4 className="text-[11px] font-black text-primary-900 uppercase tracking-widest mb-4">Acciones Rápidas</h4>
                                        <div className="grid grid-cols-1 gap-2">
                                            <button 
                                                onClick={async () => {
                                                    console.log('=== BOTÓN PDF CLICKEADO ===');
                                                    console.log('selectedProject:', selectedProject);
                                                    console.log('selectedProject.elements:', selectedProject?.elements);
                                                    console.log('Cantidad de elementos:', selectedProject?.elements?.length);
                                                    
                                                    if (selectedProject && selectedProject.elements && selectedProject.elements.length > 0) {
                                                        try {
                                                            const { calcularMaterialesVentana } = await import('../../services/manufacturing');
                                                            const { calcularCotizacionSaaS, DEFAULT_PRICING_CONFIG } = await import('../../services/pricing');
                                                            const { generateMultiElementPDF, createTechnicalDrawing } = await import('../../services/pdfGenerator');
                                                            console.log('Funciones importadas correctamente');
                                                            
                                                            // USAR CONFIGURACIÓN DEL STORE (no localStorage directo)
                                                            const { pricingConfig: storeConfig, companyProfile } = useSettingsStore.getState();
                                                            const pricingConfig = storeConfig?.diccionario ? storeConfig : DEFAULT_PRICING_CONFIG;
                                                            console.log('pricingConfig usado:', pricingConfig);
                                                            
                                                            // Procesar todos los elementos
                                                            const allElements = [];
                                                            let totalPrecioVenta = 0;
                                                            let totalCostoDirecto = 0;
                                                            
                                                            for (let i = 0; i < selectedProject.elements.length; i++) {
                                                                const element = selectedProject.elements[i];
                                                                console.log(`Procesando elemento ${i + 1}/${selectedProject.elements.length}:`, element);
                                                                
                                                                // Crear dibujo técnico real del elemento
                                                                const imageDataUrl = createTechnicalDrawing(element);
                                                                console.log('Dibujo técnico creado para elemento', i + 1);
                                                                
                                                                const calcResult = calcularMaterialesVentana({
                                                                    ancho: element.width,
                                                                    alto: element.height,
                                                                    tipo: (element as any).openingType || 'corrediza',
                                                                    hojas: (element as any).panels?.length || 2,
                                                                    glassType: (element as any).glassType
                                                                });
                                                                
                                                                const pricingResult = calcularCotizacionSaaS(calcResult, pricingConfig);
                                                                
                                                                allElements.push({
                                                                    element,
                                                                    calcResult,
                                                                    imageDataUrl,
                                                                    pricingResult
                                                                });
                                                                
                                                                totalPrecioVenta += pricingResult.totales.precioVenta;
                                                                totalCostoDirecto += pricingResult.totales.costoDirecto;
                                                            }
                                                            
                                                            console.log('Todos los elementos procesados:', allElements.length);
                                                            
                                                            // Generar PDF con todos los elementos
                                                            const combinedPricingResult = {
                                                                ...allElements[0].pricingResult,
                                                                totales: {
                                                                    ...allElements[0].pricingResult.totales,
                                                                    precioVenta: totalPrecioVenta,
                                                                    costoDirecto: totalCostoDirecto,
                                                                    gananciaBruta: totalPrecioVenta - totalCostoDirecto
                                                                }
                                                            };
                                                            
                                                            generateMultiElementPDF(
                                                                allElements,
                                                                combinedPricingResult,
                                                                pricingConfig.diccionario,
                                                                companyProfile,
                                                                {
                                                                    clientName: selectedProject.clientName,
                                                                    projectName: selectedProject.projectName,
                                                                    siteAddress: selectedProject.siteAddress
                                                                }
                                                            );
                                                            
                                                            // Guardar en Documentos Recientes
                                                            const { addDocument } = usePDFStore.getState();
                                                            addDocument({
                                                                name: `Cotizacion_${selectedProject.clientName}_${selectedProject.elements.length}_items_${Date.now()}.pdf`,
                                                                type: 'cotizacion',
                                                                projectId: selectedProject.id,
                                                                projectName: selectedProject.projectType || 'Proyecto',
                                                                clientName: selectedProject.clientName || 'Sin cliente'
                                                            });
                                                            
                                                            alert(`PDF descargado exitosamente con ${allElements.length} elementos. Total: $${totalPrecioVenta.toLocaleString()}`);
                                                        } catch (error) {
                                                            console.error('=== ERROR GENERANDO PDF ===', error);
                                                            alert('Error al generar PDF: ' + (error as Error).message);
                                                        }
                                                    } else {
                                                        console.warn('No hay elementos en el proyecto:', selectedProject?.elements);
                                                        alert('El proyecto no tiene elementos para generar el PDF. Crea ventanas/puertas primero en el Diseñador.');
                                                    }
                                                }}
                                                className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 text-primary-800 rounded-2xl text-sm font-black transition-all shadow-sm border border-primary-100"
                                            >
                                                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                                                Descargar PDF
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    onViewChange?.('designer');
                                                }}
                                                className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 text-primary-800 rounded-2xl text-sm font-black transition-all shadow-sm border border-primary-100"
                                            >
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                                Editar Medidas
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Gallery Section */}
                                <div className="lg:col-span-2">
                                    <ProjectGallery
                                        photos={selectedProject.sitePhotos || []}
                                        onAddPhoto={(base64) => handleAddPhotoToProject(selectedProject.id!, base64)}
                                        onRemovePhoto={(idx) => {
                                            const updatedPhotos = [...(selectedProject.sitePhotos || [])];
                                            updatedPhotos.splice(idx, 1);
                                            const updatedProject = { ...selectedProject, sitePhotos: updatedPhotos };
                                            setSelectedProject(updatedProject);
                                            setProjects(prev => prev.map(p => p.id === selectedProject.id ? updatedProject : p));
                                            // Persist removal to localStorage
                                            saveProject(updatedProject);
                                        }}
                                    />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            )}
        </>
    );

    const renderContent = () => {
        try {
            switch (activeView) {
                case 'window':
                case 'door':
                case 'designer':
                    return <DesignerPage />;
                case 'calendar':
                    return <Calendar variant="full" />;
                case 'clients':
                    return <ClientsPage onViewChange={onViewChange || (() => {})} />;
                case 'pdf':
                case 'reports':
                    return <Reportes />;
                case 'quote':
                    return <QuotationsView />;
                case 'calculator':
                    return <Calculator />;
                case 'settings':
                    return <SettingsPage onViewChange={onViewChange || (() => {})} />;
                case 'projects':
                case 'home':
                case 'notifications':
                default:
                    return renderDashboard();
            }
        } catch (error) {
            console.error('Error rendering content:', error);
            return (
                <div className="p-8">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                        <h2 className="text-red-600 font-bold mb-2">Error al cargar la vista</h2>
                        <p className="text-red-500">{String(error)}</p>
                        <button
                            onClick={() => onViewChange?.('home')}
                            className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
                        >
                            Volver al inicio
                        </button>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="h-full w-full bg-surface overflow-y-auto custom-scrollbar">
            {renderContent()}
            
            {/* Version History Modal */}
            {versionHistoryProject && (
                <VersionHistoryModal
                    isOpen={showVersionHistory}
                    onClose={() => {
                        setShowVersionHistory(false);
                        setVersionHistoryProject(null);
                    }}
                    projectId={versionHistoryProject.id || ''}
                    projectName={versionHistoryProject.projectName || versionHistoryProject.clientName || 'Proyecto'}
                    onRestore={() => {
                        // Reload projects after restore
                        getUserProjects(userId).then(data => setProjects(data));
                    }}
                />
            )}
            
            {/* Approval Modal */}
            {approvalProject && (
                <ApprovalModal
                    isOpen={showApprovalModal}
                    onClose={() => {
                        setShowApprovalModal(false);
                        setApprovalProject(null);
                    }}
                    projectId={approvalProject.id || ''}
                    projectName={approvalProject.projectName || approvalProject.clientName || 'Proyecto'}
                    quotation={approvalProject.quotation}
                    clientName={approvalProject.clientName}
                    clientEmail={approvalProject.contactPhone}
                    currentApproval={approvalProject.currentApproval}
                    onApprovalChange={() => {
                        // Reload projects after approval change
                        getUserProjects(userId).then(data => setProjects(data));
                    }}
                />
            )}
            
            {/* Client Tracking Dashboard */}
            {trackingProject && (
                <ClientTrackingDashboard
                    isOpen={showTrackingDashboard}
                    onClose={() => {
                        setShowTrackingDashboard(false);
                        setTrackingProject(null);
                    }}
                    project={trackingProject}
                />
            )}
            
            {/* WhatsApp Share Modal */}
            {whatsappProject && (
                <WhatsAppShareModal
                    isOpen={showWhatsAppModal}
                    onClose={() => {
                        setShowWhatsAppModal(false);
                        setWhatsappProject(null);
                    }}
                    project={whatsappProject}
                    clientPhone={whatsappProject.contactPhone}
                />
            )}

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3.5 rounded-2xl shadow-2xl text-sm font-black text-white flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                    <span>{toast.message}</span>
                </div>
            )}
        </div>
    );
};

export default Workspace;
