import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DesignElement } from '../types';
import { CalculationResult } from './manufacturing';
import { PricingResult, MaterialDictionary } from './pricing';

export interface BrandingInfo {
    companyName: string;
    logoBase64: string | null;
}

/**
 * Creates a technical drawing of a window/door element
 * Returns a data URL of the canvas image
 */
export const createTechnicalDrawing = (element: DesignElement): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 350;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 500, 350);
    
    // Calculate scale to fit in canvas with padding
    const padding = 60;
    const maxWidth = canvas.width - (padding * 2);
    const maxHeight = canvas.height - (padding * 2);
    const scale = Math.min(maxWidth / element.width, maxHeight / element.height) * 0.9;
    
    const drawWidth = element.width * scale;
    const drawHeight = element.height * scale;
    const startX = (canvas.width - drawWidth) / 2;
    const startY = (canvas.height - drawHeight) / 2 + 20;
    
    // Draw outer frame (marco)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.strokeRect(startX, startY, drawWidth, drawHeight);
    
    // Draw panels (hojas)
    let currentX = startX;
    element.panels.forEach((panel, index) => {
        const panelWidth = drawWidth * panel.widthRatio;
        
        // Panel frame
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#334155';
        ctx.strokeRect(currentX, startY, panelWidth, drawHeight);
        
        // Glass area (inner)
        const glassPadding = 8;
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(
            currentX + glassPadding, 
            startY + glassPadding, 
            panelWidth - (glassPadding * 2), 
            drawHeight - (glassPadding * 2)
        );
        
        // Glass lines pattern
        ctx.strokeStyle = '#bae6fd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 10; i < panelWidth - 20; i += 15) {
            ctx.moveTo(currentX + i, startY + glassPadding);
            ctx.lineTo(currentX + i, startY + drawHeight - glassPadding);
        }
        ctx.stroke();
        
        // Panel number
        ctx.fillStyle = '#64748b';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`H${index + 1}`, currentX + panelWidth / 2, startY + drawHeight / 2);
        
        currentX += panelWidth;
    });
    
    // Draw dimensions
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    
    // Width dimension (top)
    const dimY = startY - 25;
    ctx.beginPath();
    ctx.moveTo(startX, dimY);
    ctx.lineTo(startX + drawWidth, dimY);
    ctx.stroke();
    
    // Dimension lines
    ctx.beginPath();
    ctx.moveTo(startX, startY - 5);
    ctx.lineTo(startX, dimY + 5);
    ctx.moveTo(startX + drawWidth, startY - 5);
    ctx.lineTo(startX + drawWidth, dimY + 5);
    ctx.stroke();
    
    ctx.fillText(`${Math.round(element.width)} mm`, startX + drawWidth / 2, dimY - 3);
    
    // Height dimension (left)
    const dimX = startX - 35;
    ctx.beginPath();
    ctx.moveTo(dimX, startY);
    ctx.lineTo(dimX, startY + drawHeight);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(startX - 5, startY);
    ctx.lineTo(dimX + 5, startY);
    ctx.moveTo(startX - 5, startY + drawHeight);
    ctx.lineTo(dimX + 5, startY + drawHeight);
    ctx.stroke();
    
    ctx.save();
    ctx.translate(dimX - 3, startY + drawHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${Math.round(element.height)} mm`, 0, 0);
    ctx.restore();
    
    // Title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    const typeText = element.type === 'window' ? 'VENTANA' : 'PUERTA';
    ctx.fillText(`${typeText} - ${element.openingType?.toUpperCase() || 'CORREDIZA'}`, 15, 25);
    
    // Subtitle with panel count
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.fillText(`${element.panels.length} hojas | ${element.material === 'upvc' ? 'uPVC' : 'Aluminio'}`, 15, 42);
    
    return canvas.toDataURL('image/png');
};

export const generateTechnicalPDF = (
    element: DesignElement,
    calcResult: CalculationResult,
    imageDataUrl: string,
    pricingResult: PricingResult,
    diccionario: MaterialDictionary | null = null,
    branding?: BrandingInfo
) => {
    const doc = new jsPDF('p', 'mm', 'a4');

    // ── Header Section ──────────────────────────────────────────────────────────
    const safeCompanyName = branding?.companyName || 'WinDoor SaaS';
    
    if (branding?.logoBase64) {
        // Add custom logo
        try {
            doc.addImage(branding.logoBase64, 'PNG', 14, 10, 40, 20, undefined, 'FAST');
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.text('Plano Técnico y Cotización de Materiales', 14, 36);
            doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 14, 42);
            doc.text(`ID Referencia: PRJ-${Math.floor(Math.random() * 100000)}`, 14, 48);
        } catch (e) {
            // Fallback to text if logo fails
            doc.setFontSize(22);
            doc.setTextColor(30, 41, 59);
            doc.text(safeCompanyName, 14, 20);
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.text('Plano Técnico y Cotización de Materiales', 14, 28);
            doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 14, 34);
            doc.text(`ID Referencia: PRJ-${Math.floor(Math.random() * 100000)}`, 14, 40);
        }
    } else {
        // Default text header
        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59); // Tailwind slate-800
        doc.text(safeCompanyName, 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // Tailwind slate-500
        doc.text('Plano Técnico y Cotización de Materiales', 14, 28);
        doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 14, 34);
        doc.text(`ID Referencia: PRJ-${Math.floor(Math.random() * 100000)}`, 14, 40);
    }

    // Top Divider
    doc.setDrawColor(226, 232, 240); // Tailwind slate-200
    doc.line(14, 45, 196, 45);

    // ── Technical Drawing Section ────────────────────────────────────────────────
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('1. Diseño de Estructura 2D', 14, 55);

    // Enforce aspect ratio formatting for the Konva image
    // We'll bound it to max 90x90mm to fit well, relying on JS Image properties if needed
    // Alternatively, just inject it into a safe box size:
    doc.setDrawColor(241, 245, 249); // slate-100 box
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(14, 60, 100, 80, 'FD'); // Fill and Draw a backdrop

    doc.addImage(imageDataUrl, 'PNG', 19, 65, 90, 70, undefined, 'FAST');

    // Specs Sidebar (Next to image)
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text('Especificaciones Generales', 120, 60);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);

    const specs = [
        `Tipo Base: ${element.type === 'window' ? 'Ventana' : 'Puerta'}`,
        `Apertura: ${element.openingType ? element.openingType.charAt(0).toUpperCase() + element.openingType.slice(1) : 'Estándar'}`,
        `Ancho Total: ${(element.width / 1000).toFixed(2)} m`,
        `Alto Total: ${(element.height / 1000).toFixed(2)} m`,
        `Divisiones (Hojas): ${element.panels.length}`,
        `Material: ${element.material === 'upvc' ? 'uPVC' : 'Aluminio Estándar'}`,
        `Terminación/Color: ${element.color}`,
        `Cristal: Claro 6mm (Recomendado)`
    ];

    specs.forEach((spec, i) => {
        doc.text(`• ${spec}`, 120, 68 + (i * 6));
    });

    // Area Summary Box
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text('Métricas Calculadas', 120, 125);
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(`Área Neta de Vidrio: ${calcResult.resumen.areaVidrioM2} m²`, 120, 133);
    doc.text(`Área Total de Vano: ${calcResult.resumen.areaTotalM2} m²`, 120, 139);

    // Middle Divider
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 146, 196, 146);

    // ── Bill of Materials Section ────────────────────────────────────────────────
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('2. Lista de Corte y Materiales (BOM)', 14, 156);

    // Prepare table data for Profiles
    const perfilesData = [
        // Marco
        ...calcResult.perfiles.marco.map(p => [diccionario?.[p.id as keyof MaterialDictionary]?.nombre ?? p.tipo, `${p.cantidad} pz`, `${p.longitudCorteMm} mm`, `${p.totalLinealM} m`]),
        // Hojas
        ...calcResult.perfiles.hojas.map(p => [diccionario?.[p.id as keyof MaterialDictionary]?.nombre ?? p.tipo, `${p.cantidad} pz`, `${p.longitudCorteMm} mm`, `${p.totalLinealM} m`]),
        // Junquillos
        ...calcResult.perfiles.junquillos.map(p => [diccionario?.[p.id as keyof MaterialDictionary]?.nombre ?? p.tipo, `${p.cantidad} pz`, `${p.longitudCorteMm} mm`, `${p.totalLinealM} m`])
    ];

    autoTable(doc, {
        startY: 161,
        head: [['Descripción del Perfil', 'Piezas', 'Corte Exacto', 'Total Lineal']],
        body: perfilesData,
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241], fontSize: 9 }, // indigo-500
        styles: { fontSize: 8, textColor: [71, 85, 105] },
        margin: { left: 14, right: 14 }
    });

    // Accessories
    const accesoriosData = calcResult.accesorios.map(a => [diccionario?.[a.id as keyof MaterialDictionary]?.nombre ?? a.nombre, `${a.cantidad} ${a.unidad}`]);

    autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 8,
        head: [['Accesorios, Selladores y Herrajes', 'Requerimiento Calculado']],
        body: accesoriosData,
        theme: 'grid',
        headStyles: { fillColor: [14, 165, 233], fontSize: 9 }, // sky-500
        styles: { fontSize: 8, textColor: [71, 85, 105] },
        margin: { left: 14, right: 14 }
    });

    // ── Pricing Section ────────────────────────────────────────────────────────
    const finalY = (doc as any).lastAutoTable.finalY + 25;

    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('3. Presupuesto Estimado', 196, finalY - 8, { align: 'right' });

    doc.setFontSize(28);
    doc.setTextColor(99, 102, 241); // indigo-500
    const moneda = pricingResult?.moneda || '$';
    const precio = pricingResult?.totales?.precioVenta || 0;
    doc.text(`${moneda}${precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 196, finalY + 4, { align: 'right' });

    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`DOCUMENTO GENERADO AUTOMÁTICAMENTE POR ${safeCompanyName.toUpperCase()}.`, 14, 280);
    doc.text('* Precios sujetos a cambio sin previo aviso. Incluye IVA e instalación básica. Las medidas son responsabilidad del cliente final.', 196, finalY + 12, { align: 'right' });

    // ── Export ───────────────────────────────────────────────────────────────────
    const safeTitle = `${element.type}_${element.openingType || 'std'}_${element.width}x${element.height}`.toLowerCase();
    doc.save(`Plano_Tecnico_${safeTitle}.pdf`);
};

// Interface for multi-element PDF
interface ProjectElement {
    element: DesignElement;
    calcResult: CalculationResult;
    imageDataUrl: string;
    pricingResult: PricingResult;
}

/**
 * Genera un PDF con múltiples elementos del proyecto
 * Muestra un resumen de todos los elementos y el precio total
 */
export const generateMultiElementPDF = (
    elements: ProjectElement[],
    totalPricing: PricingResult,
    diccionario: MaterialDictionary | null = null,
    branding?: BrandingInfo,
    projectInfo?: { clientName?: string; projectName?: string; siteAddress?: string }
) => {
    if (elements.length === 0) return;
    
    // Initialize A4 Portrait document
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // ── Header Section ──────────────────────────────────────────────────────────
    const safeCompanyName = branding?.companyName || 'WinDoor SaaS';
    
    if (branding?.logoBase64) {
        try {
            doc.addImage(branding.logoBase64, 'PNG', 14, 10, 40, 20, undefined, 'FAST');
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.text(`Cotización Profesional - ${safeCompanyName}`, 14, 36);
            doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 14, 42);
            doc.text(`Cliente: ${projectInfo?.clientName || 'Sin cliente'}`, 14, 48);
        } catch (e) {
            doc.setFontSize(22);
            doc.setTextColor(30, 41, 59);
            doc.text(safeCompanyName, 14, 20);
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.text('Cotización de Proyecto', 14, 28);
            doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 34);
            doc.text(`Cliente: ${projectInfo?.clientName || 'Sin cliente'}`, 14, 40);
        }
    } else {
        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59);
        doc.text(safeCompanyName, 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text('Cotización de Proyecto', 14, 28);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 34);
        doc.text(`Cliente: ${projectInfo?.clientName || 'Sin cliente'}`, 14, 40);
    }
    
    // Top Divider
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 45, 196, 45);
    
    // ── Summary Section ─────────────────────────────────────────────────────────
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text(`Resumen del Proyecto (${elements.length} elementos)`, 14, 55);
    
    // Create summary table of all elements
    const summaryData = elements.map((item, index) => {
        const precio = item.pricingResult?.totales?.precioVenta || 0;
        const width = Number(item.element.width) || 0;
        const height = Number(item.element.height) || 0;
        const moneda = item.pricingResult?.moneda || '$';
        
        return [
            `${index + 1}`,
            item.element.type === 'window' ? 'Ventana' : 'Puerta',
            `${Math.round(width)}x${Math.round(height)}mm`,
            (item.element as any).openingType || 'corrediza',
            (item.element.panels?.length || 1).toString(),
            `${moneda}${precio.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        ];
    });
    
    autoTable(doc, {
        startY: 60,
        head: [['#', 'Tipo', 'Medidas', 'Apertura', 'Hojas', 'Precio']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241], fontSize: 9 },
        styles: { fontSize: 8, textColor: [71, 85, 105] },
        margin: { left: 14, right: 14 }
    });
    
    let currentY = (doc as any).lastAutoTable.finalY + 10;
    
    // ── Detailed Elements Section ───────────────────────────────────────────────
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Detalle de Elementos', 14, currentY);
    currentY += 8;
    
    // Show all elements - 3 per row, compact layout
    const itemsPerRow = 3;
    const itemWidth = 58;
    const itemHeight = 52;
    const spacing = 6;
    const itemsPerPage = 9; // 3 rows x 3 columns = 9 items per page
    
    for (let i = 0; i < elements.length; i++) {
        // Add new page if needed (every 9 items)
        if (i > 0 && i % itemsPerPage === 0) {
            doc.addPage();
            currentY = 30;
        }
        
        const item = elements[i];
        const pageIndex = i % itemsPerPage;
        const row = Math.floor(pageIndex / itemsPerRow);
        const col = pageIndex % itemsPerRow;
        const x = 14 + col * (itemWidth + spacing);
        const y = currentY + row * (itemHeight + 18);
        
        // Draw item box
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(x, y, itemWidth, itemHeight, 2, 2, 'FD');
        
        // Add image
        try {
            doc.addImage(item.imageDataUrl, 'PNG', x + 3, y + 3, itemWidth - 6, itemHeight - 20, undefined, 'FAST');
        } catch (e) {
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text(`${i + 1}`, x + itemWidth/2, y + itemHeight/2, { align: 'center' });
        }
        
        // Element info below image - compact
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text(`${i + 1}. ${item.element.type === 'window' ? 'Vent' : 'Puer'}`, x + 3, y + itemHeight - 14);
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        const width = Number(item.element.width) || 0;
        const height = Number(item.element.height) || 0;
        const medidas = `${Math.round(width)}x${Math.round(height)}`;
        doc.text(`${medidas}mm`, x + 3, y + itemHeight - 7);
        doc.setTextColor(99, 102, 241);
        
        const moneda = item.pricingResult?.moneda || '$';
        const precio = item.pricingResult?.totales?.precioVenta || 0;
        doc.text(`${moneda}${precio.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, x + 3, y + itemHeight - 1);
    }
    
    // Calculate final Y position
    const lastPageIndex = (elements.length - 1) % itemsPerPage;
    const lastRow = Math.floor(lastPageIndex / itemsPerRow);
    let totalY = currentY + ((lastRow + 1) * (itemHeight + 18)) + 15;
    
    // Add new page for total if it doesn't fit
    if (totalY > 240) {
        doc.addPage();
        totalY = 40;
    }
    
    // ── Total Pricing Section ────────────────────────────────────────────────────
    
    // Professional pricing box for client
    doc.setDrawColor(99, 102, 241);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(100, totalY - 5, 96, 32, 3, 3, 'FD');
    
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text('TOTAL DEL PROYECTO', 196, totalY + 4, { align: 'right' });
    
    doc.setFontSize(28);
    doc.setTextColor(99, 102, 241);
    doc.text(`${totalPricing.moneda}${totalPricing.totales.precioVenta.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 196, totalY + 18, { align: 'right' });
    
    // Professional footer
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('Esta cotización tiene una validez de 15 días calendario.', 14, 275);
    doc.text('Precios sujetos a cambio sin previo aviso. Incluye IVA, materiales e instalación básica.', 14, 280);
    doc.text('Medidas finales serán verificadas en sitio antes de la fabricación.', 14, 285);
    doc.text(`${new Date().getFullYear()} ${safeCompanyName} - Cotización Profesional`, 196, 285, { align: 'right' });
    
    // Export
    const safeClientName = (projectInfo?.clientName || 'Proyecto').toLowerCase().replace(/\s+/g, '_').substring(0, 30);
    const safeTitle = `Plano_Tecnico_${safeClientName}_${elements.length}items`.toLowerCase();
    doc.save(`${safeTitle}.pdf`);
};
