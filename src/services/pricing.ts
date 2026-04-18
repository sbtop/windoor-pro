import { CalculationResult } from './manufacturing';

export interface MaterialItem {
    nombre: string;
    precio: number;
    unidad: 'ml' | 'm2' | 'pz';
}

export interface MaterialDictionary {
    // Perfiles
    jamba: MaterialItem;
    cabezal: MaterialItem;
    junquillo_v: MaterialItem;
    junquillo_h: MaterialItem;
    zocalo_hoja: MaterialItem;
    pierna_traslape: MaterialItem;
    hoja_abatible_h: MaterialItem;
    hoja_abatible_v: MaterialItem;
    
    // Cristales
    vidrio_6mm: MaterialItem;
    vidrio_8mm: MaterialItem;
    vidrio_10mm: MaterialItem;
    vidrio_12mm: MaterialItem;
    vidrio_15mm: MaterialItem;
    vidrio_19mm: MaterialItem;

    // Accesorios
    escuadras_marco: MaterialItem;
    tornillos: MaterialItem;
    sellador: MaterialItem;
    empaque_cuna: MaterialItem;
    carretillas: MaterialItem;
    cierre_embutido: MaterialItem;
    felpa: MaterialItem;
    bisagras: MaterialItem;
    manija: MaterialItem;
    empaque_epdm: MaterialItem;
}

export interface PricingConfig {
    moneda: string;             // ej. '$', 'MXN', 'COP', '€'
    margenGanancia: number;     // Profit margin as a decimal (e.g. 0.40 for 40%)
    costosOperativos: {
        manoObraPorcentaje: number; // Porcentaje sobre materiales (ej. 0.15 = 15%)
        instalacionFija: number;    // Monto fijo por elemento
        transporteFijo: number;     // Monto fijo por elemento (flete proporcional)
    };
    diccionario: MaterialDictionary;
    iva: number;                // IVA como decimal (ej. 0.16 para 16%)
}

export interface CostDesglose {
    rubro: string; // "Perfiles", "Cristales", "Accesorios"
    items: { nombre: string; cantidad: number; unidad: string; costoTotal: number }[];
    subtotal: number;
}

export interface PricingResult {
    moneda: string;
    desglose: CostDesglose[];
    totales: {
        costoDirecto: number;
        precioVenta: number;
        margenPorcentaje: number;
        gananciaBruta: number;
    };
}

/**
 * Módulo de Cotización SaaS
 * Calcula los costos reales y el precio de venta sugerido basado en
 * los requisitos de fabricación y los márgenes de ganancia configurables.
 */
export const calcularCotizacionSaaS = (
    materiales: CalculationResult,
    config: Partial<PricingConfig>
): PricingResult => {
    
    const dic = config.diccionario;
    
    // Si no hay diccionario, usar valores por defecto
    if (!dic) {
        console.warn('No hay diccionario de precios configurado, usando valores por defecto');
        return {
            moneda: config.moneda || '$',
            desglose: [],
            totales: {
                costoDirecto: 0,
                precioVenta: 0,
                margenPorcentaje: Number(((config.margenGanancia || 0.40) * 100).toFixed(1)),
                gananciaBruta: 0
            }
        };
    }
    
    const breakdown: CostDesglose[] = [
        { rubro: 'Perfiles de Aluminio', items: [], subtotal: 0 },
        { rubro: 'Cristales', items: [], subtotal: 0 },
        { rubro: 'Herrajes y Accesorios', items: [], subtotal: 0 },
        { rubro: 'Costos Operativos', items: [], subtotal: 0 }
    ];

    let costoMateriales = 0;

    // Procesar todos los perfiles (Calculated in ML)
    const todosLosPerfiles = [
        ...materiales.perfiles.marco,
        ...materiales.perfiles.hojas,
        ...materiales.perfiles.junquillos
    ];

    todosLosPerfiles.forEach(p => {
        const mat = dic?.[p.id as keyof MaterialDictionary];
        if (mat) {
            const costo = Number((p.totalLinealM * mat.precio).toFixed(2));
            breakdown[0].items.push({ nombre: mat.nombre, cantidad: p.totalLinealM, unidad: mat.unidad, costoTotal: costo });
            breakdown[0].subtotal += costo;
            costoMateriales += costo;
        }
    });

    // Procesar Vidrios (Calculated in M2 from el resultado dinámico)
    if (materiales.cristales) {
        materiales.cristales.forEach(c => {
            const mat = dic?.[c.id as keyof MaterialDictionary];
            if (mat) {
                const costo = Number((c.m2 * mat.precio).toFixed(2));
                breakdown[1].items.push({ nombre: mat.nombre, cantidad: c.m2, unidad: mat.unidad, costoTotal: costo });
                breakdown[1].subtotal += costo;
                costoMateriales += costo;
            }
        });
    } else {
        // Fallback for older formats where only resumen was present
        const areaM2 = materiales.resumen.areaVidrioM2;
        if (areaM2 > 0) {
            const mat = dic.vidrio_6mm;
            if (mat) {
                const costo = Number((areaM2 * mat.precio).toFixed(2));
                breakdown[1].items.push({ nombre: mat.nombre, cantidad: areaM2, unidad: mat.unidad, costoTotal: costo });
                breakdown[1].subtotal += costo;
                costoMateriales += costo;
            }
        }
    }

    // Procesar Accesorios (Calculated in pz or ml)
    materiales.accesorios.forEach(a => {
        const mat = dic?.[a.id as keyof MaterialDictionary];
        if (mat) {
            const costo = Number((a.cantidad * mat.precio).toFixed(2));
            breakdown[2].items.push({ nombre: mat.nombre, cantidad: a.cantidad, unidad: mat.unidad, costoTotal: costo });
            breakdown[2].subtotal += costo;
            costoMateriales += costo;
        }
    });

    // 4. Operativos y Logística
    const configOps = config.costosOperativos || { manoObraPorcentaje: 0.15, instalacionFija: 300, transporteFijo: 200 };
    
    const costoManoObra = costoMateriales * (configOps.manoObraPorcentaje || 0);
    const costoInstalacion = configOps.instalacionFija || 0;
    const costoTransporte = configOps.transporteFijo || 0;

    if (costoManoObra > 0) breakdown[3].items.push({ nombre: `Mano de Obra (${(configOps.manoObraPorcentaje * 100).toFixed(0)}% del material)`, cantidad: 1, unidad: 'global', costoTotal: costoManoObra });
    if (costoInstalacion > 0) breakdown[3].items.push({ nombre: 'Instalación y Montaje', cantidad: 1, unidad: 'global', costoTotal: costoInstalacion });
    if (costoTransporte > 0) breakdown[3].items.push({ nombre: 'Logística y Transporte', cantidad: 1, unidad: 'global', costoTotal: costoTransporte });

    breakdown[3].subtotal = costoManoObra + costoInstalacion + costoTransporte;

    // 5. Mapeo Financiero Total
    const costoDirecto = costoMateriales + breakdown[3].subtotal;
    const margenGanancia = config.margenGanancia || 0.40;
    const gananciaBruta = costoDirecto * margenGanancia;
    const precioVenta = costoDirecto + gananciaBruta;

    return {
        moneda: config.moneda || '$',
        desglose: breakdown,
        totales: {
            costoDirecto: Number(costoDirecto.toFixed(2)),
            precioVenta: Number(precioVenta.toFixed(2)),
            margenPorcentaje: Number((margenGanancia * 100).toFixed(1)),
            gananciaBruta: Number(gananciaBruta.toFixed(2))
        }
    };
};

/**
 * Combina matemáticamente un array de PricingResult en un solo total general maestreado,
 * sumando detalladamente todos los subtotales para la consistencia del Dashboard y PDF.
 */
export const sumarCotizacionesSaaS = (
    resultados: PricingResult[],
    monedaFallback: string = '$'
): PricingResult => {
    return resultados.reduce((acc, curr) => {
        return {
            moneda: curr.moneda || acc.moneda,
            desglose: [], // El desglose consolidado a nivel proyecto no se requiere iterar completo si no se usa
            totales: {
                costoDirecto: acc.totales.costoDirecto + (curr.totales?.costoDirecto || 0),
                precioVenta: acc.totales.precioVenta + (curr.totales?.precioVenta || 0),
                margenPorcentaje: curr.totales?.margenPorcentaje || acc.totales.margenPorcentaje,
                gananciaBruta: acc.totales.gananciaBruta + (curr.totales?.gananciaBruta || 0)
            }
        };
    }, {
        moneda: monedaFallback,
        desglose: [],
        totales: { costoDirecto: 0, precioVenta: 0, margenPorcentaje: 0, gananciaBruta: 0 }
    });
};

// Configuración Base Inicial (Rehidratable por el usuario)
export const DEFAULT_PRICING_CONFIG: PricingConfig = {
    moneda: '$', // Por defecto a genérico internacional
    margenGanancia: 0.40, // 40%
    costosOperativos: {
        manoObraPorcentaje: 0.15, // 15% del costo de materiales
        instalacionFija: 300,     // $300 base por elemento
        transporteFijo: 200       // $200 de flete por elemento
    },
    iva: 0.16, // 16% por defecto
    diccionario: {
        // Perfiles
        jamba: { nombre: 'Jamba (Vertical)', precio: 120, unidad: 'ml' },
        cabezal: { nombre: 'Cabezal/Sillar (Horizontal)', precio: 120, unidad: 'ml' },
        junquillo_v: { nombre: 'Junquillo Vertical', precio: 45, unidad: 'ml' },
        junquillo_h: { nombre: 'Junquillo Horizontal', precio: 45, unidad: 'ml' },
        zocalo_hoja: { nombre: 'Zócalos (Horizontal)', precio: 140, unidad: 'ml' },
        pierna_traslape: { nombre: 'Pierna / Traslape (Vertical)', precio: 140, unidad: 'ml' },
        hoja_abatible_h: { nombre: 'Perfil Hoja Abatible (H)', precio: 150, unidad: 'ml' },
        hoja_abatible_v: { nombre: 'Perfil Hoja Abatible (V)', precio: 150, unidad: 'ml' },
        
        // Vidrios (Variantes Comerciales)
        vidrio_6mm: { nombre: 'Cristal Claro 6mm', precio: 750, unidad: 'm2' },
        vidrio_8mm: { nombre: 'Cristal Claro 8mm (Templable)', precio: 1100, unidad: 'm2' },
        vidrio_10mm: { nombre: 'Cristal Incoloro 10mm (Templable)', precio: 1450, unidad: 'm2' },
        vidrio_12mm: { nombre: 'Cristal Incoloro 12mm (Pesado)', precio: 1800, unidad: 'm2' },
        vidrio_15mm: { nombre: 'Cristal Extra Claro 15mm (Especial)', precio: 2900, unidad: 'm2' },
        vidrio_19mm: { nombre: 'Cristal Claro 19mm (Estructural)', precio: 4500, unidad: 'm2' },
        
        // Accesorios
        escuadras_marco: { nombre: 'Escuadras de armado', precio: 15, unidad: 'pz' },
        tornillos: { nombre: 'Tornillos de fijación', precio: 2, unidad: 'pz' },
        sellador: { nombre: 'Sellador de silicona', precio: 65, unidad: 'pz' },
        empaque_cuna: { nombre: 'Empaque vinil (Cuña)', precio: 8, unidad: 'ml' },
        carretillas: { nombre: 'Carretillas / Ruedas', precio: 45, unidad: 'pz' },
        cierre_embutido: { nombre: 'Cierre embutido', precio: 120, unidad: 'pz' },
        felpa: { nombre: 'Felpa perimetral', precio: 5, unidad: 'ml' },
        bisagras: { nombre: 'Bisagras de fricción', precio: 80, unidad: 'pz' },
        manija: { nombre: 'Manija abatible', precio: 150, unidad: 'pz' },
        empaque_epdm: { nombre: 'Empaque EPDM (Abatible)', precio: 12, unidad: 'ml' },
    }
};
