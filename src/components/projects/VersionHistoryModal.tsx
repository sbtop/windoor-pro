import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    History, 
    X, 
    RotateCcw, 
    Clock, 
    User, 
    FileText,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { getProjectVersionHistory, restoreProjectVersion, ProjectVersion } from '../../lib/localStorage/db';

interface VersionHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    projectName: string;
    onRestore?: () => void;
}

const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ 
    isOpen, 
    onClose, 
    projectId, 
    projectName,
    onRestore 
}) => {
    const [versions, setVersions] = useState<ProjectVersion[]>([]);
    const [loading, setLoading] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen && projectId) {
            loadVersionHistory();
        }
    }, [isOpen, projectId]);

    const loadVersionHistory = async () => {
        setLoading(true);
        try {
            const history = await getProjectVersionHistory(projectId);
            setVersions(history.reverse()); // Show newest first
        } catch (error) {
            console.error('Error loading version history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (version: number) => {
        if (!confirm(`¿Estás seguro de restaurar el proyecto a la versión ${version}? Esta acción no se puede deshacer.`)) {
            return;
        }

        setRestoring(true);
        try {
            await restoreProjectVersion(projectId, version);
            setSelectedVersion(version);
            onRestore?.();
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Error restoring version:', error);
            alert('Error al restaurar la versión. Por favor intenta nuevamente.');
        } finally {
            setRestoring(false);
        }
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isOpen) return null;

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
                    className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <History size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black">Historial de Versiones</h2>
                                    <p className="text-sm font-medium text-white/80">{projectName}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-sm font-medium text-white/90">
                            Gestiona y restaura versiones anteriores del proyecto
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-sm font-bold text-slate-500">Cargando historial...</p>
                                </div>
                            </div>
                        ) : versions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="p-4 bg-slate-100 rounded-2xl mb-4">
                                    <History size={48} className="text-slate-400" />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-2">Sin historial</h3>
                                <p className="text-sm font-bold text-slate-500 max-w-sm">
                                    Este proyecto aún no tiene versiones guardadas. Las versiones se crean automáticamente cuando haces cambios significativos.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {versions.map((version, index) => (
                                    <motion.div
                                        key={version.version}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`p-4 rounded-2xl border-2 transition-all ${
                                            selectedVersion === version.version
                                                ? 'bg-emerald-50 border-emerald-300'
                                                : 'bg-slate-50 border-slate-100 hover:border-indigo-200'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-black">
                                                        Versión {version.version}
                                                    </span>
                                                    {selectedVersion === version.version && (
                                                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black flex items-center gap-1">
                                                            <CheckCircle2 size={12} />
                                                            Restaurada
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="text-sm font-black text-slate-900 mb-1">{version.changes}</h4>
                                                <div className="flex items-center gap-4 text-[11px] text-slate-500">
                                                    <div className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {formatDate(version.timestamp)}
                                                    </div>
                                                    {version.author && (
                                                        <div className="flex items-center gap-1">
                                                            <User size={12} />
                                                            {version.author}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1">
                                                        <FileText size={12} />
                                                        {version.elements.length} elementos
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRestore(version.version)}
                                                disabled={restoring}
                                                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                            >
                                                <RotateCcw size={14} />
                                                Restaurar
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-200 bg-slate-50">
                        <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
                            <div>
                                <p className="text-xs font-black text-amber-900">Importante</p>
                                <p className="text-[11px] font-bold text-amber-700">
                                    Al restaurar una versión, se reemplazará el estado actual del proyecto. 
                                    Se recomienda crear una nueva versión antes de restaurar.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default VersionHistoryModal;
