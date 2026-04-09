import React, { useState, useEffect } from 'react';
import { ViewType } from '../../types';
import DesignerPage from '../designer/DesignerPage';
import ClientsPage from '../clients/ClientsPage';
import ProjectGallery from '../projects/ProjectGallery';
import Reportes from '../Reportes';
import Calendar from '../Calendar';
import Calculator from '../Calculator';
import SettingsPage from '../SettingsPage';
import { usePDFStore } from '../../store/pdfStore';
import { generateTechnicalPDF } from '../../services/pdfGenerator';
import { getUserProjects, saveProject, deleteProject, updateProject, ProjectData } from '../../lib/localStorage/db';
import { useDesignerStore } from '../../store/designerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useUserStore } from '../../store/userStore';

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

    const { pricingConfig } = useSettingsStore();
    const { currentUser } = useUserStore();
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
            case 'draft': return 'bg-emerald-500';
            case 'quoted': return 'bg-amber-500';
            case 'in-production': return 'bg-blue-500';
            default: return 'bg-slate-300';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'draft': return 'Borrador';
            case 'quoted': return 'Cotizado';
            case 'in-production': return 'En Producción';
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
        const { clearCanvas, setActiveClient } = useDesignerStore.getState();

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
        });

        setShowNewProjectModal(false);
        setNewProject({ clientName: '', siteAddress: '', contactPhone: '', projectType: 'ventana' });

        // Navigate to designer
        onViewChange?.('designer');
    };

    // Handle action menu actions
    const handleAction = (action: string, projectId: string | undefined) => {
        if (!projectId) return;
        setActiveActionMenu(null);
        const project = projects.find(p => p.id === projectId);
        switch (action) {
            case 'edit':
                console.log('Editar proyecto:', projectId, project);
                if (project) {
                    const { setElements, setActiveClient } = useDesignerStore.getState();
                    // Cargar elementos del proyecto en el diseñador
                    setElements(project.elements || []);
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
                // Save PDF to store
                if (project) {
                    const { addDocument } = usePDFStore.getState();
                    addDocument({
                        name: `Cotizacion_${project.clientName}_${Date.now()}.pdf`,
                        type: 'cotizacion',
                        projectId: project.id,
                        projectName: project.projectType || 'Proyecto',
                        clientName: project.clientName || 'Sin cliente'
                    });
                    alert('PDF generado y guardado en Documentos Recientes');
                }
                break;
            case 'production':
                console.log('Enviar a producción:', projectId);
                alert('Proyecto enviado a producción');
                break;
            case 'finish':
                console.log('Finalizar proyecto:', projectId);
                alert('Proyecto finalizado');
                break;
            case 'gallery':
                if (project) setSelectedProject(project);
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
        <div className="p-8">
            {/* Header Section */}
            <div className="flex justify-between items-end mb-12">
                <div className="max-w-2xl">
                    <h1 className="text-4xl font-headline font-bold text-primary tracking-tight mb-2">Panel de Proyectos</h1>
                    <p className="text-secondary font-body">Gestiona instalaciones de ventanas y puertas, realiza mediciones y genera cotizaciones para contratos de clientes.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => onViewChange?.('clients')}
                        className="flex items-center gap-2 bg-white text-slate-800 border-2 border-slate-200 px-6 py-4 rounded-xl font-bold tracking-wide shadow-sm hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined">person_add</span>
                        Nuevo Cliente
                    </button>
                    <button
                        onClick={() => setShowNewProjectModal(true)}
                        className="flex items-center gap-2 bg-primary text-on-primary px-6 py-4 rounded-xl font-bold tracking-wide shadow-xl shadow-slate-900/40 hover:opacity-90 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Nuevo Proyecto
                    </button>
                </div>
            </div>

            {/* Dashboard Stats Grid */}
            <div className="grid grid-cols-12 gap-6 mb-12">
                <div className="col-span-12 md:col-span-8 bg-surface-container-low p-8 rounded-xl border-l-4 border-primary">
                    <h3 className="text-xl font-bold text-primary mb-2">Resumen Ejecutivo</h3>
                    <p className="text-secondary">Visualiza métricas clave, controla plazos de entrega y optimiza la rentabilidad de tus instalaciones.</p>
                </div>
                <div className="col-span-12 md:col-span-4 bg-primary-700 text-white p-8 rounded-xl shadow-2xl shadow-indigo-950/20 relative overflow-hidden">
                    <div className="relative z-10">
                        <span className="text-[11px] font-black uppercase tracking-widest text-indigo-200 mb-1 block">Cotizaciones Activas</span>
                        <h2 className="text-3xl font-headline font-bold">{projects.filter(p => p.status === 'quoted').length}</h2>
                        <p className="text-xs text-indigo-300 font-bold mt-2">
                            {projects.filter(p => p.status === 'draft').length} proyectos requieren actualización de medidas.
                        </p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                        <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'wght' 100" }}>architecture</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats Section */}
            <div className="grid grid-cols-12 gap-6 mb-12">
                <div className="col-span-12 md:col-span-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1">Total Proyectos</h4>
                    <p className="text-2xl font-black text-slate-900">{projects.length}</p>
                </div>
                <div className="col-span-12 md:col-span-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1">En Producción</h4>
                    <p className="text-2xl font-black text-blue-800">{projects.filter(p => p.status === 'in-production').length}</p>
                </div>
                <div className="col-span-12 md:col-span-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1">Cotizaciones Activas</h4>
                    <p className="text-2xl font-black text-amber-800">{projects.filter(p => p.status === 'quoted').length}</p>
                </div>
            </div>

            {/* Project List Section */}
            <div className="bg-surface-container-low rounded-xl overflow-hidden">
                <div className="p-6 border-b border-outline-variant/10 bg-surface-container-highest/30">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-headline font-bold text-lg text-primary">Proyectos Activos</h3>
                        <div className="flex gap-2">
                            {/* View Mode Toggle */}
                            <button
                                onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                                className="p-2 bg-surface-container-lowest text-slate-500 rounded-md hover:bg-white transition-colors"
                                title={viewMode === 'table' ? 'Ver como tarjetas' : 'Ver como tabla'}
                            >
                                <span className="material-symbols-outlined">
                                    {viewMode === 'table' ? 'grid_view' : 'table_rows'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Search and Filters Bar */}
                    <div className="flex flex-col md:flex-row gap-3">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                            <input
                                className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 font-bold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-medium"
                                placeholder="Buscar por cliente, dirección o tipo de proyecto..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            )}
                        </div>

                        {/* Filter Button */}
                        <div className="relative">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-4 py-3 border-2 rounded-xl font-bold text-sm transition-all ${
                                    showFilters || filterStatus !== 'all' || filterType !== 'all'
                                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                                        : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                                }`}
                            >
                                <span className="material-symbols-outlined">tune</span>
                                Filtros
                                {(filterStatus !== 'all' || filterType !== 'all') && (
                                    <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                                )}
                            </button>

                            {/* Filter Dropdown */}
                            {showFilters && (
                                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3">Filtros</h4>

                                    {/* Status Filter */}
                                    <div className="mb-4">
                                        <label className="text-xs font-bold text-slate-700 mb-2 block">Estado</label>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        >
                                            <option value="all">Todos los estados</option>
                                            <option value="draft">Borrador</option>
                                            <option value="quoted">Cotizado</option>
                                            <option value="in-production">En Producción</option>
                                        </select>
                                    </div>

                                    {/* Type Filter */}
                                    <div className="mb-4">
                                        <label className="text-xs font-bold text-slate-700 mb-2 block">Tipo de Proyecto</label>
                                        <select
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        >
                                            <option value="all">Todos los tipos</option>
                                            <option value="ventana">Ventanas</option>
                                            <option value="puerta">Puertas</option>
                                            <option value="fachada">Fachadas</option>
                                        </select>
                                    </div>

                                    {/* Sort */}
                                    <div className="mb-4">
                                        <label className="text-xs font-bold text-slate-700 mb-2 block">Ordenar por</label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        >
                                            <option value="date-desc">Fecha (más recientes)</option>
                                            <option value="date-asc">Fecha (más antiguos)</option>
                                            <option value="name-asc">Nombre (A-Z)</option>
                                            <option value="name-desc">Nombre (Z-A)</option>
                                            <option value="price-desc">Precio (mayor a menor)</option>
                                            <option value="price-asc">Precio (menor a mayor)</option>
                                        </select>
                                    </div>

                                    {/* Clear Filters */}
                                    <button
                                        onClick={() => {
                                            setFilterStatus('all');
                                            setFilterType('all');
                                            setSortBy('date-desc');
                                        }}
                                        className="w-full py-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                                    >
                                        Limpiar filtros
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table View */}
                {viewMode === 'table' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[11px] font-black uppercase tracking-widest text-slate-700 border-b border-slate-200 bg-slate-100">
                                    <th className="px-8 py-5">Cliente</th>
                                    <th className="px-8 py-5">Contacto</th>
                                    <th className="px-8 py-5">Dirección</th>
                                    <th className="px-8 py-5">Tipo</th>
                                    <th className="px-8 py-5">Estado</th>
                                    <th className="px-8 py-5 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/40">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-6 text-center">
                                            <p className="text-indigo-400 font-bold">Cargando proyectos...</p>
                                        </td>
                                    </tr>
                                ) : filteredProjects.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-12 text-center">
                                            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">folder_open</span>
                                            <p className="text-slate-600 font-bold">
                                                {searchQuery ? 'No se encontraron resultados' : 'No hay proyectos guardados'}
                                            </p>
                                            <p className="text-sm text-slate-400 mt-1">
                                                {searchQuery ? 'Intenta con otra búsqueda' : 'Crea una ventana para comenzar'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProjects.map((project) => (
                                        <tr key={project.id} className="group hover:bg-surface-container-high/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-secondary-container flex items-center justify-center text-primary font-bold text-xs">
                                                        {project.clientName?.charAt(0) || 'C'}
                                                    </div>
                                                    <span className="font-bold text-primary text-sm">{project.clientName || 'Sin cliente'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm text-secondary">{project.contactPhone || '(555) 000-0000'}</td>
                                            <td className="px-8 py-6 text-sm text-secondary">{project.siteAddress || 'Dirección no especificada'}</td>
                                            <td className="px-8 py-6">
                                                <span className="text-[10px] font-bold uppercase px-2 py-1 bg-tertiary-fixed text-primary rounded">
                                                    {project.projectType || 'Ventana'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`}></div>
                                                    <span className="text-xs font-medium text-slate-600">{getStatusLabel(project.status)}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleAction('edit', project.id)}
                                                        className="p-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-primary rounded-xl transition-all active:scale-90 group"
                                                        title="Editar medidas"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction('pdf', project.id)}
                                                        className="p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all active:scale-90 group"
                                                        title="Generar PDF"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction('production', project.id)}
                                                        className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all active:scale-90 group"
                                                        title="Enviar a producción"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">factory</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction('gallery', project.id)}
                                                        className="p-2.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl transition-all active:scale-90 group"
                                                        title="Galería de obra"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">photo_library</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction('delete', project.id)}
                                                        className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all active:scale-90 group"
                                                        title="Eliminar proyecto"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Cards View */}
                {viewMode === 'cards' && (
                    <div className="p-6">
                        {loading ? (
                            <div className="text-center py-12">
                                <p className="text-indigo-400 font-bold">Cargando proyectos...</p>
                            </div>
                        ) : filteredProjects.length === 0 ? (
                            <div className="text-center py-12">
                                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">folder_open</span>
                                <p className="text-slate-600 font-bold">
                                    {searchQuery ? 'No se encontraron resultados' : 'No hay proyectos guardados'}
                                </p>
                                <p className="text-sm text-slate-400 mt-1">
                                    {searchQuery ? 'Intenta con otra búsqueda' : 'Crea una ventana para comenzar'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredProjects.map((project) => (
                                    <div key={project.id} className="bg-white rounded-xl border-2 border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all group">
                                        {/* Card Header */}
                                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                    {project.clientName?.charAt(0) || 'C'}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-sm">{project.clientName || 'Sin cliente'}</h4>
                                                    <p className="text-xs text-slate-500">{project.projectName || 'Sin nombre'}</p>
                                                </div>
                                            </div>
                                            <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`} title={getStatusLabel(project.status)}></div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-4 space-y-3">
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <span className="material-symbols-outlined text-sm">location_on</span>
                                                <span className="truncate">{project.siteAddress || 'Dirección no especificada'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <span className="material-symbols-outlined text-sm">phone</span>
                                                <span>{project.contactPhone || '(555) 000-0000'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <span className="material-symbols-outlined text-sm">category</span>
                                                <span className="font-medium">{project.projectType || 'Ventana'}</span>
                                            </div>
                                            {project.quotation?.totales?.precioVenta && (
                                                <div className="pt-3 border-t border-slate-100">
                                                    <p className="text-xs text-slate-500">Precio de venta</p>
                                                    <p className="text-lg font-black text-indigo-600">
                                                        ${project.quotation.totales.precioVenta.toLocaleString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Footer */}
                                        <div className="p-4 border-t border-slate-100 flex gap-2">
                                            <button
                                                onClick={() => handleAction('edit', project.id)}
                                                className="flex-1 py-2 bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleAction('pdf', project.id)}
                                                className="flex-1 py-2 bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                                                PDF
                                            </button>
                                            <button
                                                onClick={() => handleAction('delete', project.id)}
                                                className="py-2 px-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-all"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                <div className="p-6 flex justify-between items-center bg-surface-container-highest/10 text-xs text-slate-500 font-medium">
                    <span>Mostrando {filteredProjects.length} de {projects.length} proyectos</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 bg-white rounded border border-outline-variant/20 hover:bg-slate-50 transition-colors">Anterior</button>
                        <button className="px-3 py-1 bg-primary text-white rounded shadow-md hover:bg-primary/90 transition-colors">Siguiente</button>
                    </div>
                </div>
            </div>

            {/* Contextual Cards */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_24px_48px_-12px_rgba(30,58,138,0.05)] border-l-4 border-secondary-container">
                    <h4 className="font-headline font-bold text-primary mb-4">Alertas de Medición</h4>
                    <div className="space-y-4">
                        <div className="flex gap-4 items-start">
                            <span className="material-symbols-outlined text-amber-500">warning</span>
                            <div>
                                <p className="text-sm font-bold text-on-surface">Proyecto #123: Diferencia de medidas</p>
                                <p className="text-xs text-secondary mt-1">El ancho inferior excede el superior por 6mm. Revisión estructural recomendada.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_24px_48px_-12px_rgba(30,58,138,0.05)] border-l-4 border-primary-fixed">
                    <h4 className="font-headline font-bold text-primary mb-4">Documentos Recientes</h4>
                    {recentDocs.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">No hay documentos generados aún</p>
                    ) : (
                        <ul className="space-y-3">
                            {recentDocs.map(doc => (
                                <li 
                                    key={doc.id} 
                                    className="flex justify-between items-center group hover:bg-slate-50 p-2 rounded-lg transition-colors"
                                >
                                    <div 
                                        className="flex items-center gap-2 cursor-pointer flex-1"
                                        onClick={() => {
                                            const project = projects.find(p => p.id === doc.projectId);
                                            if (project) {
                                                setSelectedProject(project);
                                            } else {
                                                alert('El proyecto asociado ya no existe.');
                                            }
                                        }}
                                    >
                                        <span className="material-symbols-outlined text-sm text-slate-400">print</span>
                                        <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
                                            {doc.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] uppercase font-bold text-slate-400">
                                            {new Date(doc.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('¿Eliminar este documento?')) {
                                                    const { deleteDocument } = usePDFStore.getState();
                                                    deleteDocument(doc.id);
                                                }
                                            }}
                                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                            title="Eliminar documento"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

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
                                                            const { pricingConfig: storeConfig } = useSettingsStore.getState();
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
                                                                null,
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
        </div>
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
                case 'calculator':
                    return <Calculator />;
                case 'settings':
                    return <SettingsPage onViewChange={onViewChange || (() => {})} />;
                case 'quote':
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
        </div>
    );
};

export default Workspace;
