import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BookOpen, 
    ChevronRight, 
    ChevronLeft, 
    X, 
    CheckCircle2,
    Play,
    Settings,
    Users,
    FileText,
    Calculator,
    Calendar,
    Maximize2,
    TrendingUp,
    Shield,
    Zap
} from 'lucide-react';

interface UserManualModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const UserManualModal: React.FC<UserManualModalProps> = ({ isOpen, onClose }) => {
    const [activeSection, setActiveSection] = useState(0);

    if (!isOpen) return null;

    const sections = [
        {
            id: 'introduction',
            title: 'Introducción',
            icon: BookOpen,
            content: {
                heading: 'Bienvenido a WinDoor Pro SaaS',
                description: 'WinDoor Pro es una plataforma SaaS premium para la gestión profesional de proyectos de ventanas y puertas. Diseñada para fabricantes, instaladores y distribuidores que necesitan precisión técnica y eficiencia operativa.',
                features: [
                    'Diseñador 2D interactivo con cálculos en tiempo real',
                    'Cotizaciones automáticas con márgenes configurables',
                    'Gestión de clientes y proyectos centralizada',
                    'Generación de PDFs técnicos y comerciales',
                    'Calendario de instalaciones y entregas',
                    'Reportes y analíticas de rendimiento'
                ]
            }
        },
        {
            id: 'dashboard',
            title: 'Dashboard Principal',
            icon: TrendingUp,
            content: {
                heading: 'Panel de Control',
                description: 'El dashboard es tu centro de operaciones. Aquí verás el estado de todos tus proyectos en tiempo real.',
                features: [
                    'Visión general de proyectos en producción',
                    'Métricas operativas (cotizados, en obra, alertas)',
                    'Acceso rápido a acciones críticas',
                    'Búsqueda y filtrado avanzado de proyectos',
                    'Vista de tabla o tarjetas según preferencia'
                ],
                tips: [
                    'Usa el buscador para encontrar proyectos por cliente o dirección',
                    'Los indicadores de color muestran el estado logístico',
                    'Haz clic en los iconos de acción para editar, diseñar o generar PDFs'
                ]
            }
        },
        {
            id: 'clients',
            title: 'Gestión de Clientes',
            icon: Users,
            content: {
                heading: 'Base de Datos de Clientes',
                description: 'Mantén toda la información de tus clientes organizada y accesible.',
                features: [
                    'Registro completo con datos de contacto',
                    'Historial de proyectos por cliente',
                    'Seguimiento de instalaciones y entregas',
                    'Notas y observaciones personalizadas'
                ],
                tips: [
                    'Agrega fotos del sitio para referencia visual',
                    'Mantén actualizada la información de contacto',
                    'Usa el historial para identificar clientes recurrentes'
                ]
            }
        },
        {
            id: 'designer',
            title: 'Diseñador 2D',
            icon: Maximize2,
            content: {
                heading: 'Diseñador Interactivo',
                description: 'Crea diseños precisos de ventanas y puertas con cálculos automáticos de materiales y costos.',
                features: [
                    'Canvas interactivo para arrastrar y posicionar elementos',
                    'Configuración de tipos: ventanas corredizas, fijas, puertas',
                    'Selección de materiales: aluminio, UPVC, vidrios templados',
                    'Cálculo automático de área y peso',
                    'Cotización en tiempo real mientras diseñas'
                ],
                tips: [
                    'Selecciona un elemento para ver sus propiedades',
                    'Usa el panel lateral para ajustar dimensiones con precisión',
                    'Los cambios se reflejan instantáneamente en la cotización',
                    'Puedes agregar múltiples hojas/paneles por elemento'
                ]
            }
        },
        {
            id: 'pricing',
            title: 'Configuración de Precios',
            icon: Settings,
            content: {
                heading: 'Diccionario de Precios',
                description: 'Personaliza los márgenes, costos y precios de venta según tu estructura de negocio.',
                features: [
                    'Configuración de costos por material (aluminio, vidrio, herrajes)',
                    'Márgenes de ganancia ajustables por rubro',
                    'Moneda y formato de precios',
                    'Fórmulas de cálculo personalizables'
                ],
                tips: [
                    'Actualiza los costos regularmente según el mercado',
                    'Los márgenes se aplican automáticamente a cada cotización',
                    'Puedes tener diferentes configuraciones por tipo de proyecto'
                ]
            }
        },
        {
            id: 'reports',
            title: 'Reportes y Analíticas',
            icon: FileText,
            content: {
                heading: 'Análisis de Rendimiento',
                description: 'Visualiza el desempeño de tu negocio con reportes detallados y métricas clave.',
                features: [
                    'Reportes de ventas por período',
                    'Análisis de márgenes de ganancia',
                    'Proyectos por estado y tipo',
                    'Tendencias de producción y entrega'
                ],
                tips: [
                    'Exporta reportes en PDF para compartir con tu equipo',
                    'Usa los filtros para analizar períodos específicos',
                    'Compara métricas entre diferentes meses'
                ]
            }
        },
        {
            id: 'calendar',
            title: 'Agenda de Instalaciones',
            icon: Calendar,
            content: {
                heading: 'Gestión de Citas',
                description: 'Organiza y programa instalaciones, entregas y visitas técnicas.',
                features: [
                    'Vista mensual y semanal de agenda',
                    'Programación de instalaciones con detalles',
                    'Recordatorios automáticos',
                    'Sincronización con proyectos'
                ],
                tips: [
                    'Asigna tiempo suficiente según la complejidad del proyecto',
                    'Agrega notas especiales para cada instalación',
                    'Usa colores para diferenciar tipos de citas'
                ]
            }
        },
        {
            id: 'calculator',
            title: 'Calculadora de Materiales',
            icon: Calculator,
            content: {
                heading: 'Cálculo Técnico',
                description: 'Herramienta para calcular materiales necesarios basada en dimensiones y especificaciones.',
                features: [
                    'Cálculo de perfiles de aluminio',
                    'Estimación de vidrio por m²',
                    'Cantidad de herrajes y accesorios',
                    'Peso total de la instalación'
                ],
                tips: [
                    'Úsala antes de ordenar materiales',
                    'Considera un margen de seguridad del 5-10%',
                    'Verifica las tolerancias de medida'
                ]
            }
        },
        {
            id: 'best-practices',
            title: 'Buenas Prácticas',
            icon: Shield,
            content: {
                heading: 'Recomendaciones de Uso',
                description: 'Maximiza la eficiencia de tu flujo de trabajo con estas prácticas probadas.',
                features: [
                    'Nombra proyectos con criterio (Cliente-Tipo-Fecha)',
                    'Mantén actualizada la información de clientes',
                    'Revisa cotizaciones antes de enviarlas',
                    'Genera PDFs para cada etapa del proyecto',
                    'Usa el calendario para no perder instalaciones'
                ],
                tips: [
                    'Haz copias de seguridad regularmente',
                    'Capacita a tu equipo en el uso del sistema',
                    'Reporta cualquier problema técnico de inmediato',
                    'Mantén actualizada la configuración de precios'
                ]
            }
        },
        {
            id: 'security',
            title: 'Seguridad',
            icon: Zap,
            content: {
                heading: 'Protección de Datos',
                description: 'Tu información y la de tus clientes está protegida con estándares de seguridad enterprise.',
                features: [
                    'Encriptación de datos en reposo y tránsito',
                    'Autenticación segura con tokens',
                    'Control de acceso por usuario',
                    'Auditoría de actividades'
                ],
                tips: [
                    'Usa contraseñas fuertes y únicas',
                    'Cierra sesión al terminar de trabajar',
                    'No compartas credenciales con terceros',
                    'Reporta actividades sospechosas'
                ]
            }
        }
    ];

    const currentSection = sections[activeSection];

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
                    className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Sidebar Navigation */}
                    <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 overflow-y-auto">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary rounded-xl text-white">
                                <BookOpen size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900">Manual</h3>
                                <p className="text-[10px] font-bold text-slate-500">WinDoor Pro</p>
                            </div>
                        </div>
                        
                        <nav className="space-y-1">
                            {sections.map((section, index) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(index)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                        activeSection === index
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <section.icon size={16} strokeWidth={activeSection === index ? 2.5 : 2} />
                                    {section.title}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-200 bg-white">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                        <currentSection.icon size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900">{currentSection.content.heading}</h2>
                                        <p className="text-sm font-bold text-slate-500">{currentSection.title}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <p className="text-sm font-medium text-slate-600">{currentSection.content.description}</p>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Características</h3>
                                    <div className="space-y-3">
                                        {currentSection.content.features.map((feature, index) => (
                                            <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                                                <CheckCircle2 className="text-emerald-500 mt-0.5 flex-shrink-0" size={16} />
                                                <p className="text-sm font-bold text-slate-700">{feature}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {currentSection.content.tips && (
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Consejos Pro</h3>
                                        <div className="space-y-3">
                                            {currentSection.content.tips.map((tip, index) => (
                                                <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                                    <Play className="text-amber-600 mt-0.5 flex-shrink-0" size={16} />
                                                    <p className="text-sm font-bold text-amber-900">{tip}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Navigation */}
                        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
                            <button
                                onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
                                disabled={activeSection === 0}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                                Anterior
                            </button>
                            <div className="flex items-center gap-2">
                                {sections.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`w-2 h-2 rounded-full transition-all ${
                                            activeSection === index ? 'bg-primary w-6' : 'bg-slate-200'
                                        }`}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={() => setActiveSection(Math.min(sections.length - 1, activeSection + 1))}
                                disabled={activeSection === sections.length - 1}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Siguiente
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default UserManualModal;
