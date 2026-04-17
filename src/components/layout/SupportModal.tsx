import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageCircle, 
    Mail, 
    Phone, 
    Clock, 
    CheckCircle2, 
    AlertTriangle,
    X,
    Send,
    FileText
} from 'lucide-react';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const supportChannels = [
        {
            icon: MessageCircle,
            title: 'Chat en Vivo',
            description: 'Soporte inmediato durante horario laboral',
            availability: 'Lun-Vie 9:00-18:00',
            action: 'Iniciar Chat',
            priority: 'high'
        },
        {
            icon: Mail,
            title: 'Correo Electrónico',
            description: 'soporte@windoor-pro.com',
            availability: 'Respuesta en 24h',
            action: 'Enviar Email',
            priority: 'medium'
        },
        {
            icon: Phone,
            title: 'Llamada Telefónica',
            description: '+52 (55) 1234-5678',
            availability: 'Lun-Vie 9:00-17:00',
            action: 'Llamar',
            priority: 'medium'
        }
    ];

    const commonIssues = [
        { title: 'Error al guardar proyecto', solution: 'Verifica conexión a internet y recarga la página' },
        { title: 'Cotización incorrecta', solution: 'Revisa la configuración de precios en Ajustes' },
        { title: 'PDF no se genera', solution: 'Asegúrate de tener elementos en el diseñador' },
        { title: 'Cliente no aparece', solution: 'Verifica que el cliente esté creado en la sección Clientes' }
    ];

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
                    <div className="bg-gradient-to-r from-primary to-indigo-600 p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <MessageCircle size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black">Soporte Técnico</h2>
                                    <p className="text-sm font-medium text-white/80">WinDoor Pro SaaS</p>
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
                            Estamos aquí para ayudarte con cualquier problema técnico o duda sobre el sistema.
                        </p>
                    </div>

                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        {/* Response Time */}
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <Clock className="text-emerald-600" size={20} />
                                <div>
                                    <p className="text-sm font-black text-emerald-900">Tiempo de Respuesta Promedio</p>
                                    <p className="text-xs font-bold text-emerald-700">Chat: 5 min | Email: 24h | Teléfono: Inmediato</p>
                                </div>
                            </div>
                        </div>

                        {/* Support Channels */}
                        <div className="mb-8">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Canales de Contacto</h3>
                            <div className="grid gap-3">
                                {supportChannels.map((channel, index) => (
                                    <motion.div
                                        key={index}
                                        whileHover={{ scale: 1.02 }}
                                        className={`p-4 rounded-2xl border-2 transition-all ${
                                            channel.priority === 'high' 
                                                ? 'bg-primary/5 border-primary/20 hover:border-primary/40' 
                                                : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl ${
                                                    channel.priority === 'high' ? 'bg-primary text-white' : 'bg-white text-slate-600'
                                                }`}>
                                                    <channel.icon size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-900">{channel.title}</h4>
                                                    <p className="text-xs font-bold text-slate-500">{channel.description}</p>
                                                    <p className="text-[10px] font-medium text-slate-400 mt-1">{channel.availability}</p>
                                                </div>
                                            </div>
                                            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-50 transition-colors">
                                                {channel.action}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Common Issues */}
                        <div className="mb-8">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Problemas Comunes</h3>
                            <div className="space-y-3">
                                {commonIssues.map((issue, index) => (
                                    <div key={index} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="text-amber-500 mt-0.5" size={16} />
                                            <div className="flex-1">
                                                <h4 className="text-xs font-black text-slate-900 mb-1">{issue.title}</h4>
                                                <p className="text-[11px] font-bold text-slate-600">{issue.solution}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Contact Form */}
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Envíanos un Mensaje</h3>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Tu nombre"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                                <input
                                    type="email"
                                    placeholder="Tu correo electrónico"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                                <textarea
                                    placeholder="Describe tu problema o consulta..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-3 bg-primary text-white rounded-xl font-black text-sm shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    <Send size={18} />
                                    Enviar Mensaje
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SupportModal;
