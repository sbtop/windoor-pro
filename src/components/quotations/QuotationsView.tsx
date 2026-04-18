import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileText, 
    Download, 
    Share2, 
    Eye, 
    Search, 
    Filter,
    Calendar,
    DollarSign,
    User,
    MapPin,
    CheckCircle2,
    Clock,
    AlertCircle,
    X
} from 'lucide-react';
import { getUserProjects, ProjectData } from '../../lib/localStorage/db';
import { useUserContext } from '../../context/UserContext';
import { cn } from '../../lib/utils';
import { generateMultiElementPDF, createTechnicalDrawing } from '../../services/pdfGenerator';
import { calcularMaterialesVentana } from '../../services/manufacturing';
import { calcularCotizacionSaaS } from '../../services/pricing';
import { useSettingsStore } from '../../store/settingsStore';

const QuotationsView: React.FC = () => {
    const [quotations, setQuotations] = useState<ProjectData[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
    const [selectedQuotation, setSelectedQuotation] = useState<ProjectData | null>(null);
    const [clipboardToast, setClipboardToast] = useState(false);
    const { currentUser } = useUserContext();
    const { pricingConfig, companyProfile } = useSettingsStore();
    const userId = currentUser?.userId || 'unknown';

    const showClipboardToast = () => {
        setClipboardToast(true);
        setTimeout(() => setClipboardToast(false), 2500);
    };

    const handleDownloadPDF = (quotation: ProjectData) => {
        if (!quotation.elements || quotation.elements.length === 0) {
            alert('Este proyecto no tiene elementos para generar el PDF.');
            return;
        }
        try {
            // Debug: Verificar valor del IVA
            console.log('pricingConfig:', pricingConfig);
            console.log('IVA desde config:', pricingConfig.iva);

            // Use saved quotation if available to ensure consistency
            const useSavedQuotation = quotation.quotation && quotation.quotation.totales;

            const elementsData = quotation.elements.map((element: any) => {
                const calcResult = calcularMaterialesVentana(element);
                const pricingResult = calcularCotizacionSaaS(calcResult, pricingConfig);
                const imageDataUrl = createTechnicalDrawing(element);
                return { element, calcResult, imageDataUrl, pricingResult };
            });

            const isDetailed = window.confirm("¿Deseas incluir el desglose técnico de materiales, mano de obra y utilidades en el PDF?\n\n- [OK] para versión Detallada (Taller)\n- [Cancelar] para versión Básica (Ejecutiva/Cliente)");

            // Use saved quotation total if available
            const totalPricing = quotation.quotation || {
                totales: {
                    precioVenta: elementsData.reduce((sum, item) => sum + item.pricingResult.totales.precioVenta, 0),
                    costoDirecto: elementsData.reduce((sum, item) => sum + item.pricingResult.totales.costoDirecto, 0),
                    gananciaBruta: elementsData.reduce((sum, item) => sum + item.pricingResult.totales.gananciaBruta, 0),
                    margenPorcentaje: pricingConfig.margenGanancia * 100
                }
            };

            const ivaRate = pricingConfig.iva || 0.16;
            console.log('IVA rate usado:', ivaRate);
            console.log('Cotización guardada:', quotation.quotation);
            console.log('Usando cotización guardada:', useSavedQuotation);
            console.log('TotalPricing usado:', totalPricing);

            generateMultiElementPDF(
                elementsData,
                totalPricing,
                pricingConfig.diccionario,
                companyProfile,
                { clientName: quotation.clientName, projectName: quotation.projectName, siteAddress: quotation.siteAddress },
                isDetailed,
                ivaRate
            );
        } catch (e) {
            alert('Error al generar el PDF.');
            console.error(e);
        }
    };

    const handleShare = (quotation: ProjectData) => {
        const text = `WinDoor Pro — Cotización\nCliente: ${quotation.clientName}\nProyecto: ${quotation.projectName || 'Sin nombre'}\nTotal: $${quotation.quotation?.totales?.precioVenta?.toLocaleString() || 0}`;
        navigator.clipboard.writeText(text).then(showClipboardToast);
    };

    useEffect(() => {
        loadQuotations();
    }, [userId]);

    const loadQuotations = async () => {
        setLoading(true);
        try {
            const projects = await getUserProjects(userId);
            // Filter projects that have quotations
            const projectsWithQuotations = projects.filter(p => p.quotation && p.quotation.totales);
            setQuotations(projectsWithQuotations);
        } catch (error) {
            console.error('Error loading quotations:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredQuotations = quotations.filter(q => {
        const matchesSearch = 
            q.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.projectName?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesFilter = 
            filterStatus === 'all' ||
            (filterStatus === 'approved' && q.currentApproval?.status === 'approved') ||
            (filterStatus === 'pending' && (!q.currentApproval || q.currentApproval?.status === 'pending')) ||
            (filterStatus === 'rejected' && q.currentApproval?.status === 'rejected');
        
        return matchesSearch && matchesFilter;
    });

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case 'approved': return <CheckCircle2 size={16} />;
            case 'rejected': return <AlertCircle size={16} />;
            case 'pending': return <Clock size={16} />;
            default: return <Clock size={16} />;
        }
    };

    const handleViewQuotation = (quotation: ProjectData) => {
        setSelectedQuotation(quotation);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-500">Cargando cotizaciones...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Cotizaciones</h1>
                <p className="text-sm font-bold text-slate-500">Gestiona todas las cotizaciones de tus proyectos</p>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 items-center"
            >
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por cliente o proyecto..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', 'approved', 'pending', 'rejected'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-xs font-black transition-all",
                                filterStatus === status
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            )}
                        >
                            {status === 'all' ? 'Todas' :
                             status === 'approved' ? 'Aprobadas' :
                             status === 'pending' ? 'Pendientes' : 'Rechazadas'}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Quotations List */}
            {filteredQuotations.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl p-12 text-center border border-slate-100"
                >
                    <FileText size={48} className="text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-slate-900 mb-2">No hay cotizaciones</h3>
                    <p className="text-sm font-bold text-slate-500">
                        {quotations.length === 0 
                            ? 'No tienes proyectos con cotizaciones generadas' 
                            : 'No se encontraron cotizaciones con los filtros actuales'}
                    </p>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    {filteredQuotations.map((quotation, index) => (
                        <motion.div
                            key={quotation.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                            <FileText size={20} className="text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-slate-900">{quotation.clientName}</h3>
                                            <p className="text-xs font-bold text-slate-500">{quotation.projectName || quotation.projectType || 'Proyecto'}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-4 mt-3 text-xs">
                                        <div className="flex items-center gap-1.5 text-slate-600">
                                            <MapPin size={14} />
                                            <span className="font-bold">{quotation.siteAddress || 'Sin dirección'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-600">
                                            <Calendar size={14} />
                                            <span className="font-bold">{formatDate(quotation.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-600">
                                            <User size={14} />
                                            <span className="font-bold">{quotation.elements?.length || 0} elementos</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total</p>
                                        <p className="text-xl font-black text-slate-900">
                                            {formatCurrency(quotation.quotation?.totales?.precioVenta || 0)}
                                        </p>
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-black border flex items-center gap-1.5",
                                        getStatusColor(quotation.currentApproval?.status)
                                    )}>
                                        {getStatusIcon(quotation.currentApproval?.status)}
                                        {quotation.currentApproval?.status === 'approved' ? 'Aprobada' :
                                         quotation.currentApproval?.status === 'rejected' ? 'Rechazada' :
                                         quotation.currentApproval?.status === 'pending' ? 'Pendiente' : 'Enviada'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => handleViewQuotation(quotation)}
                                    className="flex-1 py-2.5 bg-primary text-white rounded-xl text-xs font-black hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Eye size={14} />
                                    Ver Detalle
                                </button>
                                <button
                                    onClick={() => handleDownloadPDF(quotation)}
                                    className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-200 transition-colors flex items-center gap-2"
                                >
                                    <Download size={14} />
                                    PDF
                                </button>
                                <button
                                    onClick={() => handleShare(quotation)}
                                    className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-200 transition-colors flex items-center gap-2"
                                >
                                    <Share2 size={14} />
                                    Compartir
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Quotation Detail Modal */}
            <AnimatePresence>
                {selectedQuotation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedQuotation(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-primary to-indigo-600 p-6 text-white">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-xl">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black">Detalle de Cotización</h2>
                                            <p className="text-sm font-medium text-white/80">{selectedQuotation.clientName}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedQuotation(null)}
                                        className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} />
                                        <span className="text-sm font-medium">{selectedQuotation.siteAddress || 'Sin dirección'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} />
                                        <span className="text-sm font-medium">{formatDate(selectedQuotation.createdAt)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                                {/* Quotation Breakdown */}
                                {selectedQuotation.quotation?.desglose && (
                                    <div className="mb-6">
                                        <h3 className="text-sm font-black text-slate-900 mb-4">Desglose de Costos</h3>
                                        <div className="space-y-2">
                                            {selectedQuotation.quotation.desglose.map((item: any, index: number) => (
                                                item.subtotal > 0 && (
                                                    <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                                        <span className="text-xs font-bold text-slate-700">{item.rubro}</span>
                                                        <span className="text-sm font-black text-slate-900">{formatCurrency(item.subtotal)}</span>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Total */}
                                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-xs font-black text-slate-500 uppercase">Total del Proyecto</p>
                                            <p className="text-sm font-bold text-slate-600">
                                                {selectedQuotation.elements?.length || 0} elementos
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-black text-primary">
                                                {formatCurrency(selectedQuotation.quotation?.totales?.precioVenta || 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
                                <button
                                    onClick={() => setSelectedQuotation(null)}
                                    className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-black text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    Cerrar
                                </button>
                                <button 
                                    onClick={() => selectedQuotation && handleDownloadPDF(selectedQuotation)}
                                    className="flex-1 py-3 bg-primary text-white rounded-xl font-black text-sm shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    <Download size={18} />
                                    Descargar PDF
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Clipboard Toast */}
            {clipboardToast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3.5 rounded-2xl shadow-2xl text-sm font-black text-white bg-emerald-600 flex items-center gap-2 animate-in slide-in-from-bottom-4 duration-300">
                    ✓ Copiado al portapapeles
                </div>
            )}
        </div>
    );
};

export default QuotationsView;
