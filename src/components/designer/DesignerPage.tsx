import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Square, DoorOpen, ZoomIn, ZoomOut, Maximize2, Trash2, Grid, Download, Cloud, UserCheck } from 'lucide-react';
import Konva from 'konva';
import KonvaCanvas from './KonvaCanvas';
import PropertiesPanel from './PropertiesPanel';
import { generateTechnicalPDF } from '../../services/pdfGenerator';
import { calcularMaterialesVentana } from '../../services/manufacturing';
import { calcularCotizacionSaaS } from '../../services/pricing';
import { saveProject, ProjectData } from '../../lib/localStorage/db';
import { useDesignerStore } from '../../store/designerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useUserContext } from '../../context/UserContext';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const DesignerPage: React.FC = () => {
    // 🌍 Global State
    const {
        elements,
        selectedId,
        addElement,
        updateElement,
        deleteElement,
        selectElement,
        activeProjectId,
        setActiveProjectId,
        selectedElement: getSelected
    } = useDesignerStore();

    const selectedElement = getSelected();
    const activeClient = useDesignerStore(s => s.activeClient);
    const { pricingConfig, companyProfile } = useSettingsStore();
    const { currentUser } = useUserContext();

    // 🎨 Local UI State
    const [showGrid, setShowGrid] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
    const [zoom, setZoom] = useState(100);

    // Measure the available canvas area
    useEffect(() => {
        const measure = () => {
            if (containerRef.current) {
                setStageSize({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                });
            }
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    const deleteSelected = useCallback(() => {
        if (!selectedId) return;
        deleteElement(selectedId);
    }, [selectedId, deleteElement]);

    const handleExportPdf = () => {
        if (!selectedElement || selectedElement.type !== 'window' || !stageRef.current) return;

        // Render 2x pixel ratio for crispy quality
        const imageDataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });

        const calcResult = calcularMaterialesVentana({
            ancho: selectedElement.width,
            alto: selectedElement.height,
            tipo: selectedElement.openingType || 'corrediza',
            hojas: selectedElement.panels.length,
            glassType: selectedElement.glassType
        });

        const pricingResult = calcularCotizacionSaaS(calcResult, pricingConfig);

        generateTechnicalPDF(selectedElement, calcResult, imageDataUrl, pricingResult, pricingConfig.diccionario, companyProfile);
    };

    const handleSaveCloud = async () => {
        if (elements.length === 0) {
            alert("Añade al menos un elemento al canvas para guardar.");
            return;
        }

        let pName = "Mi Proyecto WinDoor";
        let cName = activeClient ? activeClient.name : "Cliente Mostrador";

        // Si no hay ID de proyecto activo, pedimos el nombre (es un proyecto nuevo manual)
        if (!activeProjectId) {
            const inputName = prompt("Nombre del Proyecto:", pName);
            if (!inputName) return;
            pName = inputName;
            
            if (!activeClient) {
                const inputClient = prompt("Nombre del Cliente:", cName);
                if (inputClient) cName = inputClient;
            }
        }

        setIsSaving(true);
        console.log("DEBUG: Iniciando guardado...", { activeProjectId, cName, pName });
        try {
            // 1. Mapeo de Cotización
            let finalQuotation = undefined;
            const firstElement = elements[0];

            if (firstElement) {
                const calcResult = calcularMaterialesVentana({
                    ancho: firstElement.width,
                    alto: firstElement.height,
                    tipo: (firstElement.openingType as any) || 'corrediza',
                    hojas: firstElement.panels.length,
                    glassType: firstElement.glassType
                });
                finalQuotation = calcularCotizacionSaaS(calcResult, pricingConfig);
            }

            const projectData: ProjectData = {
                id: activeProjectId || undefined,
                userId: currentUser?.userId || "unknown-user",
                clientName: cName,
                projectName: pName,
                status: "draft",
                elements: elements,
                quotation: finalQuotation
            };

            const cleanProjectData = JSON.parse(JSON.stringify(projectData));
            console.log("DEBUG: Guardando en db.ts...", cleanProjectData);
            
            const docId = await saveProject(cleanProjectData);
            console.log("DEBUG: Guardado exitoso con ID:", docId);
            
            // Si era un proyecto nuevo, guardamos el ID para futuras actualizaciones de esta sesión
            if (!activeProjectId) {
                setActiveProjectId(docId);
            }
            
            alert(`¡Proyecto guardado con éxito!`);
        } catch (error: any) {
            console.error("DEBUG LOCAL SAVE ERROR:", error);
            alert(`Error al guardar: ${error?.message || "Error desconocido"}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
                deleteSelected();
            }
            if (e.key === 'Escape') selectElement(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, deleteSelected, selectElement]);

    return (
        <div className="flex flex-col md:flex-row h-full relative overflow-hidden bg-slate-50/50">
            {/* ─ Toolbar ─────────────────────────────────────────────── */}
            <motion.div 
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="md:relative absolute bottom-6 md:bottom-auto left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-auto md:ml-6 md:my-auto md:w-20 glass-card p-2 md:py-6 flex flex-row md:flex-col items-center gap-3 z-[100] shadow-2xl border-white/40 ring-1 ring-black/5"
            >
                {/* Active client indicator */}
                {activeClient && (
                    <div className="hidden md:flex items-center gap-1.5 px-2 py-1.5 bg-emerald-50 rounded-xl mb-2 w-full">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-[8px] font-bold text-emerald-700 truncate leading-tight">{activeClient.name}</span>
                    </div>
                )}
                <p className="hidden md:block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 shrink-0">Añadir</p>

                <ToolButton
                    icon={<Square className="w-5 h-5" />}
                    label="Ventana"
                    color="indigo"
                    onClick={() => addElement('window')}
                />
                <ToolButton
                    icon={<DoorOpen className="w-5 h-5" />}
                    label="Puerta"
                    color="sky"
                    onClick={() => addElement('door')}
                />

                <div className="w-10 border-t border-slate-100 my-2" />
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Zoom</p>

                <ToolButton
                    icon={<ZoomIn className="w-5 h-5" />}
                    label="+"
                    color="slate"
                    onClick={() => setZoom(z => Math.min(z + 10, 200))}
                />
                <ToolButton
                    icon={<ZoomOut className="w-5 h-5" />}
                    label="-"
                    color="slate"
                    onClick={() => setZoom(z => Math.max(z - 10, 40))}
                />
                <ToolButton
                    icon={<Maximize2 className="w-5 h-5" />}
                    label="100%"
                    color="slate"
                    onClick={() => setZoom(100)}
                />

                <div className="w-10 border-t border-slate-100 my-2" />

                <ToolButton
                    icon={<Grid className="w-5 h-5" />}
                    label="Grid"
                    color={showGrid ? 'indigo' : 'slate'}
                    onClick={() => setShowGrid(g => !g)}
                    active={showGrid}
                />

                <div className="w-10 border-t border-slate-100 my-2" />

                <ToolButton
                    icon={<Cloud className={`w-5 h-5 ${isSaving ? 'animate-pulse' : ''}`} />}
                    label="Guardar"
                    color="sky"
                    onClick={handleSaveCloud}
                />

                {selectedId && (
                    <>
                        <div className="w-10 border-t border-slate-100 my-2" />

                        {selectedElement?.type === 'window' && (
                            <ToolButton
                                icon={<Download className="w-5 h-5" />}
                                label="PDF"
                                color="sky"
                                onClick={handleExportPdf}
                            />
                        )}

                        <ToolButton
                            icon={<Trash2 className="w-5 h-5" />}
                            label="Borrar"
                            color="red"
                            onClick={deleteSelected}
                        />
                    </>
                )}
            </motion.div>

            {/* ─ Canvas Area ───────────────────────────────────────────── */}
            <div
                ref={containerRef}
                className="flex-1 overflow-hidden relative m-4 md:m-6 rounded-[32px] bg-white shadow-inner border border-slate-200/50"
                style={{ 
                    backgroundImage: `radial-gradient(at 0% 0%, hsla(253,16%,7%,0) 0, transparent 50%), 
                                     radial-gradient(at 50% 0%, rgba(99, 102, 241, 0.05) 0, transparent 50%),
                                     radial-gradient(at 100% 0%, rgba(14, 165, 233, 0.05) 0, transparent 50%)`,
                    backgroundColor: '#ffffff'
                }}
            >
                {/* Visual Grid Background (CSS only) */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
                />

                {/* Zoom badge */}
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute top-6 right-6 z-10 px-4 py-2 bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl text-[10px] font-black tracking-widest text-slate-500 shadow-sm uppercase"
                >
                    Escala: {zoom}%
                </motion.div>

                {/* Empty state */}
                {elements.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                        <p className="text-lg font-display font-bold text-indigo-300">Canvas Vacío</p>
                        <p className="text-sm text-indigo-300/70 mt-1 font-medium">Usa la barra izquierda para añadir ventanas o puertas</p>
                    </div>
                )}

                <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
                    <KonvaCanvas
                        ref={stageRef}
                        elements={elements}
                        selectedId={selectedId}
                        onSelect={selectElement}
                        onElementUpdate={updateElement}
                        stageSize={stageSize}
                        showGrid={showGrid}
                    />
                </div>
            </div>

            {/* ─ Properties Panel ──────────────────────────────────────── */}
            <PropertiesPanel />
        </div>
    );
};

// ── Reusable Toolbar Button ──────────────────────────────────────────────────

interface ToolButtonProps {
    icon: React.ReactNode;
    label: string;
    color: 'indigo' | 'sky' | 'slate' | 'red';
    onClick: () => void;
    active?: boolean;
}

const colorMap = {
    indigo: 'hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-indigo-100',
    sky: 'hover:bg-sky-50 hover:text-sky-600 hover:shadow-sky-100',
    slate: 'hover:bg-slate-50 hover:text-slate-700',
    red: 'hover:bg-red-50 hover:text-red-600 hover:shadow-red-100',
};

const activeMap = {
    indigo: 'bg-indigo-100 text-indigo-600',
    sky: 'bg-sky-100 text-sky-600',
    slate: 'bg-slate-100 text-slate-700',
    red: 'bg-red-100 text-red-600',
};

const ToolButton: React.FC<ToolButtonProps> = ({ icon, label, color, onClick, active }) => (
    <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        title={label}
        onClick={onClick}
        className={cn(
            "w-14 h-14 md:w-16 md:h-16 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all",
            "border border-white/50 shadow-sm",
            active ? "bg-primary text-white shadow-lg shadow-primary/20 border-primary" : "bg-white/60 text-slate-400 hover:text-slate-600 hover:bg-white hover:border-slate-300"
        )}
    >
        {icon}
        <span className="text-[7px] font-black uppercase tracking-widest">{label}</span>
    </motion.button>
);

export default DesignerPage;
