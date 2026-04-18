import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle, 
    X, 
    Send, 
    Clock, 
    User, 
    FileText,
    AlertCircle,
    PenTool,
    Mail,
    DollarSign
} from 'lucide-react';
import { sendForApproval, approveQuotation, rejectQuotation, ApprovalRecord } from '../../lib/localStorage/db';
import { useSettingsStore } from '../../store/settingsStore';

interface ApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    projectName: string;
    quotation: any;
    clientName: string;
    clientEmail?: string;
    currentApproval?: ApprovalRecord;
    onApprovalChange?: () => void;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({ 
    isOpen, 
    onClose, 
    projectId, 
    projectName,
    quotation,
    clientName,
    clientEmail,
    currentApproval,
    onApprovalChange
}) => {
    const { companyProfile } = useSettingsStore();
    const [mode, setMode] = useState<'send' | 'approve' | 'reject'>('send');
    const [email, setEmail] = useState(clientEmail || '');
    const [signature, setSignature] = useState('');
    const [isDrawing, setIsDrawing] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hasDrawn, setHasDrawn] = useState(false);

    useEffect(() => {
        if (isOpen && currentApproval) {
            setMode(currentApproval.status === 'pending' ? 'approve' : 'send');
            if (currentApproval.clientSignature) {
                setSignature(currentApproval.clientSignature);
            }
        }
    }, [isOpen, currentApproval]);

    // Canvas signature handling
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Load existing signature if any
        if (signature && !hasDrawn) {
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = signature;
        }
    }, [signature, hasDrawn]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        setHasDrawn(true);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx) {
            ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            setSignature(canvas.toDataURL());
        }
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
        setSignature('');
        setHasDrawn(false);
    };

    const handleSend = async () => {
        setLoading(true);
        try {
            await sendForApproval(projectId, email, 'Usuario');
            
            // Generate mailto link for email client
            const subject = encodeURIComponent(`Cotización para Aprobación - ${projectName}`);
            const signature = companyProfile.email ? `\n\n--\n${companyProfile.companyName}\n${companyProfile.email}` : '';
            const body = encodeURIComponent(
                `Hola ${clientName},\n\n` +
                `Te enviamos la cotización para tu aprobación:\n\n` +
                `Proyecto: ${projectName}\n` +
                `Total: ${formatCurrency(quotation?.totales?.precioVenta || 0)}\n\n` +
                `Por favor revisa y aprueba la cotización en el sistema.\n\n` +
                `Saludos.${signature}`
            );
            const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
            
            // Open email client
            window.open(mailtoLink, '_blank');
            
            onApprovalChange?.();
            onClose();
        } catch (error) {
            console.error('Error sending for approval:', error);
            alert('Error al enviar para aprobación');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!signature) {
            alert('Por favor firma la cotización');
            return;
        }
        setLoading(true);
        try {
            await approveQuotation(projectId, currentApproval?.id || '', signature, email);
            onApprovalChange?.();
            onClose();
        } catch (error) {
            console.error('Error approving:', error);
            alert('Error al aprobar la cotización');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            alert('Por favor indica el motivo del rechazo');
            return;
        }
        setLoading(true);
        try {
            await rejectQuotation(projectId, currentApproval?.id || '', rejectionReason);
            onApprovalChange?.();
            onClose();
        } catch (error) {
            console.error('Error rejecting:', error);
            alert('Error al rechazar la cotización');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    if (!isOpen) return null;

    const isPending = currentApproval?.status === 'pending';
    const isApproved = currentApproval?.status === 'approved';
    const isRejected = currentApproval?.status === 'rejected';

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
                    className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className={`p-6 text-white ${
                        mode === 'approve' ? 'bg-gradient-to-r from-emerald-600 to-teal-600' :
                        mode === 'reject' ? 'bg-gradient-to-r from-red-600 to-rose-600' :
                        'bg-gradient-to-r from-indigo-600 to-purple-600'
                    }`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    {mode === 'approve' ? <CheckCircle size={24} /> :
                                     mode === 'reject' ? <X size={24} /> :
                                     <Send size={24} />}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black">
                                        {mode === 'approve' ? 'Aprobar Cotización' :
                                         mode === 'reject' ? 'Rechazar Cotización' :
                                         'Enviar para Aprobación'}
                                    </h2>
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
                            {mode === 'approve' ? 'Firma digitalmente para confirmar tu aprobación' :
                             mode === 'reject' ? 'Indica el motivo del rechazo' :
                             'Envía la cotización al cliente para su revisión y aprobación'}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        {/* Quotation Summary */}
                        {quotation && (
                            <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <DollarSign className="text-primary" size={18} />
                                    <h3 className="text-sm font-black text-slate-900">Resumen de Cotización</h3>
                                </div>
                                <div className="space-y-2">
                                    {quotation.desglose?.map((item: any, index: number) => (
                                        item.subtotal > 0 && (
                                            <div key={index} className="flex justify-between text-xs">
                                                <span className="font-bold text-slate-600">{item.rubro}</span>
                                                <span className="font-black text-slate-900">
                                                    {formatCurrency(item.subtotal)}
                                                </span>
                                            </div>
                                        )
                                    ))}
                                    <div className="pt-2 border-t border-slate-200 mt-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-black text-primary uppercase">Total</span>
                                            <span className="text-lg font-black text-slate-900">
                                                {formatCurrency(quotation.totales?.precioVenta || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Send Mode */}
                        {mode === 'send' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-900 block mb-2">
                                        Email del Cliente
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="cliente@ejemplo.com"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                    <AlertCircle className="text-indigo-600 flex-shrink-0 mt-0.5" size={16} />
                                    <div>
                                        <p className="text-xs font-black text-indigo-900">Información</p>
                                        <p className="text-[11px] font-bold text-indigo-700">
                                            El cliente recibirá un enlace para revisar y aprobar la cotización digitalmente.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Approve Mode - Signature */}
                        {mode === 'approve' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-900 block mb-2">
                                        Firma Digital
                                    </label>
                                    <div className="relative">
                                        <canvas
                                            ref={canvasRef}
                                            width={400}
                                            height={150}
                                            onMouseDown={startDrawing}
                                            onMouseMove={draw}
                                            onMouseUp={stopDrawing}
                                            onMouseLeave={stopDrawing}
                                            className="w-full h-40 bg-white border-2 border-slate-200 rounded-xl cursor-crosshair"
                                        />
                                        <button
                                            onClick={clearSignature}
                                            className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-lg text-slate-600 hover:text-red-600 transition-colors shadow-sm"
                                            title="Borrar firma"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1">
                                        <PenTool size={12} />
                                        Dibuja tu firma en el área de arriba
                                    </p>
                                </div>
                                <div>
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-900 block mb-2">
                                        Email de Confirmación (opcional)
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="tu@email.com"
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Reject Mode - Reason */}
                        {mode === 'reject' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-900 block mb-2">
                                        Motivo del Rechazo
                                    </label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Describe el motivo por el que rechazas esta cotización..."
                                        rows={4}
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary placeholder:text-slate-400 resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Current Approval Status */}
                        {currentApproval && (
                            <div className={`mt-6 p-4 rounded-2xl border ${
                                isApproved ? 'bg-emerald-50 border-emerald-200' :
                                isRejected ? 'bg-red-50 border-red-200' :
                                'bg-amber-50 border-amber-200'
                            }`}>
                                <div className="flex items-center gap-3">
                                    {isApproved ? <CheckCircle className="text-emerald-600" size={20} /> :
                                     isRejected ? <X className="text-red-600" size={20} /> :
                                     <Clock className="text-amber-600" size={20} />}
                                    <div>
                                        <p className="text-xs font-black text-slate-900">
                                            Estado: {isApproved ? 'Aprobada' : isRejected ? 'Rechazada' : 'Pendiente'}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-500">
                                            {currentApproval.approvedAt && `Aprobada el: ${new Date(currentApproval.approvedAt).toLocaleDateString('es-MX')}`}
                                            {currentApproval.rejectedAt && `Rechazada el: ${new Date(currentApproval.rejectedAt).toLocaleDateString('es-MX')}`}
                                            {!currentApproval.approvedAt && !currentApproval.rejectedAt && `Enviada el: ${new Date(currentApproval.timestamp).toLocaleDateString('es-MX')}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
                        {mode === 'send' && (
                            <>
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-black text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSend}
                                    disabled={loading || !email}
                                    className="flex-1 py-3 bg-primary text-white rounded-xl font-black text-sm shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Enviando...' : <><Send size={18} /> Enviar</>}
                                </motion.button>
                            </>
                        )}
                        {mode === 'approve' && (
                            <>
                                <button
                                    onClick={() => setMode('send')}
                                    className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-black text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    Volver
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleApprove}
                                    disabled={loading || !signature}
                                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black text-sm shadow-xl shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Procesando...' : <><CheckCircle size={18} /> Aprobar</>}
                                </motion.button>
                            </>
                        )}
                        {mode === 'reject' && (
                            <>
                                <button
                                    onClick={() => setMode('send')}
                                    className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-black text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    Volver
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleReject}
                                    disabled={loading || !rejectionReason.trim()}
                                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black text-sm shadow-xl shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Procesando...' : <><X size={18} /> Rechazar</>}
                                </motion.button>
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ApprovalModal;
