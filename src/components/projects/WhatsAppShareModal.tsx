import React, { useState, useEffect } from 'react';
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
    FileText,
    Clock,
    History,
    CalendarClock,
    Download,
    Copy,
    Sparkles,
    TrendingUp
} from 'lucide-react';
import { ProjectData } from '../../lib/localStorage/db';

interface WhatsAppMessage {
    id: string;
    projectId: string;
    clientPhone: string;
    template: string;
    message: string;
    sentAt: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
}

interface WhatsAppShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: ProjectData;
    clientPhone?: string;
    onMessageSent?: (message: WhatsAppMessage) => void;
}

const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({ 
    isOpen, 
    onClose, 
    project,
    clientPhone,
    onMessageSent
}) => {
    const [phoneNumber, setPhoneNumber] = useState(clientPhone || '');
    const [selectedTemplate, setSelectedTemplate] = useState('quotation');
    const [customMessage, setCustomMessage] = useState('');
    const [includePrice, setIncludePrice] = useState(true);
    const [includeLink, setIncludeLink] = useState(true);
    const [includePDF, setIncludePDF] = useState(false);
    const [scheduleMode, setScheduleMode] = useState(false);
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const [messageHistory, setMessageHistory] = useState<WhatsAppMessage[]>([]);
    const [activeTab, setActiveTab] = useState<'send' | 'history' | 'templates'>('send');
    const [customTemplates, setCustomTemplates] = useState<{[key: string]: {title: string, message: string}}>({});
    const [newTemplateName, setNewTemplateName] = useState('');
    const [newTemplateMessage, setNewTemplateMessage] = useState('');
    const [showNewTemplate, setShowNewTemplate] = useState(false);

    // Cargar historial y plantillas personalizadas
    useEffect(() => {
        loadMessageHistory();
        loadCustomTemplates();
    }, [project.id]);

    const loadMessageHistory = () => {
        const historyKey = `whatsapp_history_${project.id}`;
        const saved = localStorage.getItem(historyKey);
        if (saved) {
            setMessageHistory(JSON.parse(saved));
        }
    };

    const loadCustomTemplates = () => {
        const templatesKey = 'whatsapp_custom_templates';
        const saved = localStorage.getItem(templatesKey);
        if (saved) {
            setCustomTemplates(JSON.parse(saved));
        }
    };

    const saveCustomTemplate = () => {
        if (!newTemplateName.trim() || !newTemplateMessage.trim()) {
            alert('Por favor completa el nombre y el mensaje de la plantilla');
            return;
        }

        const templateKey = `custom_${Date.now()}`;
        const updatedTemplates = {
            ...customTemplates,
            [templateKey]: {
                title: newTemplateName,
                message: newTemplateMessage
            }
        };

        setCustomTemplates(updatedTemplates);
        localStorage.setItem('whatsapp_custom_templates', JSON.stringify(updatedTemplates));
        
        setNewTemplateName('');
        setNewTemplateMessage('');
        setShowNewTemplate(false);
    };

    const deleteCustomTemplate = (key: string) => {
        const updated = { ...customTemplates };
        delete updated[key];
        setCustomTemplates(updated);
        localStorage.setItem('whatsapp_custom_templates', JSON.stringify(updated));
    };

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
        let message = customMessage;
        
        if (!message && selectedTemplate.startsWith('custom_')) {
            message = customTemplates[selectedTemplate]?.message || '';
        } else if (!message) {
            const template = templates[selectedTemplate as keyof typeof templates];
            message = template.defaultMessage(project);
        }
        
        if (includeLink) {
            message += '\n\n🔗 Puedes ver el detalle completo aquí: [Enlace del proyecto]';
        }

        if (includePDF) {
            message += '\n\n📎 Te adjunto el PDF con el detalle completo de la cotización.';
        }
        
        return message;
    };

    const sendToWhatsApp = () => {
        if (!phoneNumber) {
            alert('Por favor ingresa un número de teléfono');
            return;
        }

        if (scheduleMode && (!scheduledDate || !scheduledTime)) {
            alert('Por favor selecciona fecha y hora para programar el mensaje');
            return;
        }

        const message = encodeURIComponent(generateMessage());
        const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${message}`;

        // Guardar en historial
        const newMessage: WhatsAppMessage = {
            id: Date.now().toString(),
            projectId: project.id || '',
            clientPhone: phoneNumber,
            template: selectedTemplate,
            message: generateMessage(),
            sentAt: scheduleMode ? `${scheduledDate} ${scheduledTime}` : new Date().toISOString(),
            status: scheduleMode ? 'sent' : 'sent'
        };

        const historyKey = `whatsapp_history_${project.id}`;
        const updatedHistory = [newMessage, ...messageHistory];
        setMessageHistory(updatedHistory);
        localStorage.setItem(historyKey, JSON.stringify(updatedHistory));

        if (scheduleMode) {
            // Programar mensaje (simulado - en producción usar backend)
            alert(`Mensaje programado para ${scheduledDate} a las ${scheduledTime}`);
            onClose();
        } else {
            window.open(whatsappUrl, '_blank');
            onMessageSent?.(newMessage);
            onClose();
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generateMessage());
        alert('Mensaje copiado al portapapeles');
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
                    className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
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
                                    <h2 className="text-2xl font-black">Integración WhatsApp</h2>
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
                        
                        {/* Tabs */}
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => setActiveTab('send')}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                                    activeTab === 'send'
                                        ? 'bg-white/20 text-white'
                                        : 'bg-white/10 text-white/70 hover:bg-white/15'
                                }`}
                            >
                                <Send size={14} className="inline mr-1" />
                                Enviar
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                                    activeTab === 'history'
                                        ? 'bg-white/20 text-white'
                                        : 'bg-white/10 text-white/70 hover:bg-white/15'
                                }`}
                            >
                                <History size={14} className="inline mr-1" />
                                Historial ({messageHistory.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('templates')}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                                    activeTab === 'templates'
                                        ? 'bg-white/20 text-white'
                                        : 'bg-white/10 text-white/70 hover:bg-white/15'
                                }`}
                            >
                                <Sparkles size={14} className="inline mr-1" />
                                Plantillas
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-220px)]">
                        {activeTab === 'send' && (
                            <div className="space-y-6">
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
                                        {Object.keys(customTemplates).map((key) => (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedTemplate(key)}
                                                className={`p-3 rounded-xl text-xs font-bold transition-all ${
                                                    selectedTemplate === key
                                                        ? 'bg-purple-100 border-2 border-purple-500 text-purple-700'
                                                        : 'bg-slate-50 border-2 border-slate-200 text-slate-600 hover:border-slate-300'
                                                }`}
                                            >
                                                ✨ {customTemplates[key].title}
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
                                    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={includePDF}
                                            onChange={(e) => setIncludePDF(e.target.checked)}
                                            className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <div className="flex items-center gap-2">
                                            <Download size={16} className="text-slate-600" />
                                            <span className="text-xs font-bold text-slate-700">Mencionar PDF adjunto</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={scheduleMode}
                                            onChange={(e) => setScheduleMode(e.target.checked)}
                                            className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <div className="flex items-center gap-2">
                                            <CalendarClock size={16} className="text-slate-600" />
                                            <span className="text-xs font-bold text-slate-700">Programar envío</span>
                                        </div>
                                    </label>
                                </div>

                                {/* Schedule Options */}
                                {scheduleMode && (
                                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-3">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-700 block mb-1">
                                                Fecha
                                            </label>
                                            <input
                                                type="date"
                                                value={scheduledDate}
                                                onChange={(e) => setScheduledDate(e.target.value)}
                                                className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs font-bold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-700 block mb-1">
                                                Hora
                                            </label>
                                            <input
                                                type="time"
                                                value={scheduledTime}
                                                onChange={(e) => setScheduledTime(e.target.value)}
                                                className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs font-bold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>
                                )}

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
                        )}

                        {activeTab === 'history' && (
                            <div className="space-y-4">
                                {messageHistory.length === 0 ? (
                                    <div className="text-center py-8">
                                        <History size={48} className="text-slate-300 mx-auto mb-4" />
                                        <p className="text-sm font-bold text-slate-500">No hay mensajes enviados aún</p>
                                    </div>
                                ) : (
                                    messageHistory.map((msg) => (
                                        <div key={msg.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                                    <span className="text-xs font-black text-slate-900">
                                                        {new Date(msg.sentAt).toLocaleDateString('es-MX', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg">
                                                    {msg.status === 'sent' ? 'Enviado' : msg.status}
                                                </span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-600 mb-2">{msg.template}</p>
                                            <p className="text-sm font-bold text-slate-700 line-clamp-3">{msg.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'templates' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black text-slate-900">Plantillas Personalizadas</h3>
                                    <button
                                        onClick={() => setShowNewTemplate(!showNewTemplate)}
                                        className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-colors flex items-center gap-1"
                                    >
                                        <Sparkles size={14} />
                                        Nueva Plantilla
                                    </button>
                                </div>

                                {showNewTemplate && (
                                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-3">
                                        <input
                                            type="text"
                                            value={newTemplateName}
                                            onChange={(e) => setNewTemplateName(e.target.value)}
                                            placeholder="Nombre de la plantilla"
                                            className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs font-bold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                        <textarea
                                            value={newTemplateMessage}
                                            onChange={(e) => setNewTemplateMessage(e.target.value)}
                                            placeholder="Mensaje de la plantilla (puedes usar {clientName}, {projectType}, {price} como variables)"
                                            rows={4}
                                            className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs font-bold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={saveCustomTemplate}
                                                className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-xs font-black hover:bg-emerald-700 transition-colors"
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                onClick={() => setShowNewTemplate(false)}
                                                className="flex-1 py-2 bg-white border border-emerald-200 rounded-lg text-xs font-black text-emerald-700 hover:bg-emerald-50 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {Object.keys(customTemplates).length === 0 ? (
                                    <div className="text-center py-8">
                                        <Sparkles size={48} className="text-slate-300 mx-auto mb-4" />
                                        <p className="text-sm font-bold text-slate-500">No hay plantillas personalizadas</p>
                                    </div>
                                ) : (
                                    Object.entries(customTemplates).map(([key, template]) => (
                                        <div key={key} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="text-sm font-black text-slate-900">{template.title}</h4>
                                                <button
                                                    onClick={() => deleteCustomTemplate(key)}
                                                    className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                            <p className="text-xs font-bold text-slate-600 line-clamp-2">{template.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
                        <button
                            onClick={copyToClipboard}
                            className="px-4 py-3 bg-white border border-slate-200 rounded-xl font-black text-sm text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2"
                        >
                            <Copy size={16} />
                            Copiar
                        </button>
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
                            {scheduleMode ? 'Programar' : 'Enviar a WhatsApp'}
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default WhatsAppShareModal;
