import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Calendar, 
    MapPin, 
    Phone, 
    Mail, 
    FileText, 
    DollarSign,
    TrendingUp,
    ArrowRight,
    X,
    Download,
    Share2
} from 'lucide-react';
import { ProjectData } from '../../lib/localStorage/db';

interface ClientTrackingDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    project: ProjectData;
}

const ClientTrackingDashboard: React.FC<ClientTrackingDashboardProps> = ({ 
    isOpen, 
    onClose, 
    project 
}) => {
    const [timeline, setTimeline] = useState<any[]>([]);

    useEffect(() => {
        if (project) {
            generateTimeline();
        }
    }, [project]);

    const generateTimeline = () => {
        const events = [
            {
                id: 'created',
                title: 'Proyecto Creado',
                date: project.createdAt,
                status: 'completed',
                icon: FileText,
                description: 'Proyecto inicializado y datos básicos registrados'
            },
            {
                id: 'quoted',
                title: 'Cotización Generada',
                date: project.updatedAt,
                status: project.quotation ? 'completed' : 'pending',
                icon: DollarSign,
                description: project.quotation ? `Cotización de $${project.quotation.totales?.precioVenta?.toLocaleString() || 0}` : 'Pendiente de cotización'
            },
            {
                id: 'approved',
                title: 'Aprobación del Cliente',
                date: project.currentApproval?.approvedAt,
                status: project.currentApproval?.status === 'approved' ? 'completed' : 
                       project.currentApproval?.status === 'rejected' ? 'rejected' : 
                       project.currentApproval?.status === 'pending' ? 'in-progress' : 'pending',
                icon: CheckCircle2,
                description: project.currentApproval?.status === 'approved' ? 'Cotización aprobada con firma digital' :
                             project.currentApproval?.status === 'rejected' ? `Rechazada: ${project.currentApproval.rejectionReason}` :
                             project.currentApproval?.status === 'pending' ? 'En espera de aprobación del cliente' : 'Pendiente de envío'
            },
            {
                id: 'production',
                title: 'En Producción',
                date: project.status === 'in-production' ? project.updatedAt : undefined,
                status: project.status === 'in-production' ? 'in-progress' : 
                       project.status === 'completed' ? 'completed' : 'pending',
                icon: TrendingUp,
                description: project.status === 'in-production' ? 'Fabricación de componentes en curso' :
                             project.status === 'completed' ? 'Producción finalizada' : 'Pendiente de iniciar producción'
            },
            {
                id: 'delivery',
                title: 'Entrega e Instalación',
                date: project.status === 'completed' ? project.updatedAt : undefined,
                status: project.status === 'completed' ? 'completed' : 'pending',
                icon: Calendar,
                description: project.status === 'completed' ? 'Proyecto entregado e instalado' : 'Pendiente de programar entrega'
            }
        ];

        setTimeline(events);
    };

    const getEventStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-500';
            case 'in-progress': return 'bg-primary animate-pulse';
            case 'rejected': return 'bg-red-500';
            default: return 'bg-slate-300';
        }
    };

    const getEventStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle2 size={16} className="text-emerald-600" />;
            case 'in-progress': return <Clock size={16} className="text-primary" />;
            case 'rejected': return <AlertCircle size={16} className="text-red-600" />;
            default: return <Clock size={16} className="text-slate-400" />;
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Pendiente';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    if (!isOpen || !project) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
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
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black">Dashboard de Seguimiento</h2>
                                    <p className="text-sm font-medium text-white/80">{project.projectName || project.clientName}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <MapPin size={16} />
                                <span className="text-sm font-medium">{project.siteAddress || 'Sin dirección'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={16} />
                                <span className="text-sm font-medium">{project.contactPhone || 'Sin teléfono'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        {/* Project Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="text-primary" size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo</span>
                                </div>
                                <p className="text-lg font-black text-slate-900">{project.projectType || 'Ventana'}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="text-emerald-600" size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Presupuesto</span>
                                </div>
                                <p className="text-lg font-black text-slate-900">
                                    {project.quotation ? formatCurrency(project.quotation.totales?.precioVenta || 0) : 'Pendiente'}
                                </p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="text-primary" size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado</span>
                                </div>
                                <p className="text-lg font-black text-slate-900">
                                    {project.status === 'draft' ? 'Borrador' :
                                     project.status === 'quoted' ? 'Cotizado' :
                                     project.status === 'in-production' ? 'En Producción' :
                                     project.status === 'completed' ? 'Completado' : 'Pendiente'}
                                </p>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                                <Clock size={16} />
                                Línea de Tiempo del Proyecto
                            </h3>
                            <div className="space-y-4">
                                {timeline.map((event, index) => (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex gap-4"
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getEventStatusColor(event.status)}`}>
                                                {getEventStatusIcon(event.status)}
                                            </div>
                                            {index < timeline.length - 1 && (
                                                <div className="w-0.5 h-16 bg-slate-200 mt-2" />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-8">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                                        {event.title}
                                                        <event.icon size={16} className="text-slate-400" />
                                                    </h4>
                                                    <p className="text-xs font-bold text-slate-500 mt-1">{event.description}</p>
                                                </div>
                                                <span className="text-[11px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                                                    {formatDate(event.date)}
                                                </span>
                                            </div>
                                            {event.status === 'in-progress' && (
                                                <div className="mt-3 p-3 bg-primary/10 rounded-xl border border-primary/20">
                                                    <p className="text-xs font-black text-primary">En progreso</p>
                                                </div>
                                            )}
                                            {event.status === 'rejected' && (
                                                <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200">
                                                    <p className="text-xs font-black text-red-600">Rechazado - Requiere revisión</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex flex-wrap gap-3">
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-100 transition-colors">
                                    <Download size={16} />
                                    Descargar PDF
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-100 transition-colors">
                                    <Share2 size={16} />
                                    Compartir
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-black hover:bg-primary/90 transition-colors">
                                    <Mail size={16} />
                                    Contactar Soporte
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ClientTrackingDashboard;
