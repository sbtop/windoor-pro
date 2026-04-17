import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageCircle, 
    X, 
    Send, 
    Phone, 
    Mail, 
    CheckCircle2,
    DollarSign,
    Calendar,
    FileText
} from 'lucide-react';
import { ProjectData } from '../../lib/localStorage/db';

interface WhatsAppShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: ProjectData;
    clientPhone?: string;
}

const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({ 
    isOpen, 
    onClose, 
    project,
    clientPhone
}) => {
    const [phoneNumber, setPhoneNumber] = useState(clientPhone || '');
    const [selectedTemplate, setSelectedTemplate] = useState('quotation');
    const [customMessage, setCustomMessage] = useState('');
    const [includePrice, setIncludePrice] = useState(true);
    const [includeLink, setIncludeLink] = useState(true);

    const templates = {
        quotation: {
            title: 'Cotización de Proyecto',
            defaultMessage: (p: ProjectData) => 
                `Hola ${p.clientName}, te compartimos la cotización para tu proyecto de ${p.projectType || 'ventanas'}. 🏠\n\n` +
                `📍 Ubicación: ${p.siteAddress || 'Por definir'}\n` +
                `${includePrice && p.quotation ? `💰 Presupuesto estimado: $${p.quotation.totales?.precioVenta?.toLocaleString('es-MX') || 0}\n` : ''}` +
                `📋 Estado: ${p.status === 'quoted' ? 'Cotizado' : p.status === 'in-production' ? 'En producción' : 'Pendiente'}\n\n` +
                `¿Te gustaría revisar los detalles? Estamos disponibles para aclarar cualquier duda. 🤝`
        },
        approval: {
            title: 'Solicitud de Aprobación',
            defaultMessage: (p: ProjectData) =>
                `Hola ${p.clientName}, tu cotización está lista para revisión. ✅\n\n` +
                `📄 Proyecto: ${p.projectName || p.projectType || 'Ventanas'}\n` +
                `${includePrice && p.quotation ? `💰 Total: $${p.quotation.totales?.precioVenta?.toLocaleString('es-MX') || 0}\n` : ''}` +
                `📅 Fecha: ${new Date().toLocaleDateString('es-MX')}\n\n` +
                `Por favor confírmame si procedemos con la aprobación para iniciar la producción. 🚀`
        },
        production: {
            title: 'Actualización de Producción',
            defaultMessage: (p: ProjectData) =>
                `Hola ${p.clientName}, ¡buenas noticias! 🎉\n\n` +
                `Tu proyecto de ${p.projectType || 'ventanas'} ha entrado en producción. 🏭\n\n` +
                `📍 ${p.siteAddress || 'Dirección del proyecto'}\n` +
                `⏱️ Tiempo estimado: 2-3 semanas\n\n` +
                `Te mantendremos informado sobre el progreso y coordinaremos la entrega. ¡Gracias por tu confianza! 🤝`
        },
        delivery: {
            title: 'Coordinación de Entrega',
            defaultMessage: (p: ProjectData) =>
                `Hola ${p.clientName}, tu proyecto está listo para entrega. ✨\n\n` +
                `📦 Proyecto: ${p.projectName || p.projectType || 'Ventanas'}\n` +
                `📍 ${p.siteAddress || 'Dirección de entrega'}\n\n` +
                `¿Qué día y horario te funciona para la instalación? Por favor confírmame para coordinar el equipo. 📅`
        }
    };

    const generateMessage = () => {
        const template = templates[selectedTemplate as keyof typeof templates];
        let message = customMessage || template.defaultMessage(project);
        
        if (includeLink) {
            message += '\n\n🔗 Puedes ver el detalle completo aquí: [Enlace del proyecto]';
        }
        
        return message;
    };

    const sendToWhatsApp = () => {
        if (!phoneNumber) {
            alert('Por favor ingresa un número de teléfono');
            return;
        }

        const message = encodeURIComponent(generateMessage());
        const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${message}`;
        window.open(whatsappUrl, '_blank');
        onClose();
    };

    const formatCurrency = (amount: number) => {
        return `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    if (!isOpen) return null;

    const currentTemplate = templates[selectedTemplate as keyof typeof templates];

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
                    className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <MessageCircle size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black">Enviar por WhatsApp</h2>
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
                        <p className="text-sm font-medium text-white/90">
                            Comparte cotizaciones y actualizaciones directamente con tus clientes
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
                        {/* Phone Number */}
                        <div>
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-900 block mb-2">
                                Número de WhatsApp
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="+52 55 1234 5678"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* Template Selection */}
                        <div>
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-900 block mb-3">
                                Plantilla de Mensaje
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {(Object.keys(templates) as Array<keyof typeof templates>).map((key) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedTemplate(key)}
                                        className={`p-3 rounded-xl text-xs font-bold transition-all ${
                                            selectedTemplate === key
                                                ? 'bg-emerald-100 border-2 border-emerald-500 text-emerald-700'
                                                : 'bg-slate-50 border-2 border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        {templates[key].title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Options */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={includePrice}
                                    onChange={(e) => setIncludePrice(e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <div className="flex items-center gap-2">
                                    <DollarSign size={16} className="text-slate-600" />
                                    <span className="text-xs font-bold text-slate-700">Incluir precio</span>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={includeLink}
                                    onChange={(e) => setIncludeLink(e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <div className="flex items-center gap-2">
                                    <FileText size={16} className="text-slate-600" />
                                    <span className="text-xs font-bold text-slate-700">Incluir enlace al proyecto</span>
                                </div>
                            </label>
                        </div>

                        {/* Custom Message */}
                        <div>
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-900 block mb-2">
                                Mensaje Personalizado (opcional)
                            </label>
                            <textarea
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                placeholder="Deja vacío para usar la plantilla seleccionada..."
                                rows={4}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400 resize-none"
                            />
                        </div>

                        {/* Message Preview */}
                        <div>
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                                Vista Previa del Mensaje
                            </label>
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <p className="text-sm font-bold text-slate-700 whitespace-pre-wrap">
                                    {generateMessage()}
                                </p>
                            </div>
                        </div>

                        {/* Project Summary */}
                        {project.quotation && includePrice && (
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Total del Proyecto</p>
                                        <p className="text-lg font-black text-slate-900">
                                            {formatCurrency(project.quotation.totales?.precioVenta || 0)}
                                        </p>
                                    </div>
                                    <CheckCircle2 className="text-emerald-500" size={24} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-black text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                            Cancelar
                        </button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={sendToWhatsApp}
                            disabled={!phoneNumber}
                            className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black text-sm shadow-xl shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Send size={18} />
                            Enviar a WhatsApp
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default WhatsAppShareModal;
