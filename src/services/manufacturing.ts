// ============================================================================
// Módulo de Ingeniería y Fabricación de Ventanas de Aluminio
// ============================================================================

export type WindowType = 'fija' | 'corrediza' | 'abatible';

export interface CalculationInput {
    ancho: number;  // en milímetros (mm)
    alto: number;   // en milímetros (mm)
    tipo: WindowType;
    hojas: number;
}

export interface ProfileCalculation {
    id: string; // Key corresponding to MaterialDictionary
    tipo: string; // Friendly name (optional fallback if dictionary not used)
    cantidad: number;
    longitudCorteMm: number;
    totalLinealM: number;
}

export interface AccessoryCalculation {
    id: string; // Key corresponding to MaterialDictionary
    nombre: string;
    cantidad: number;
    unidad: 'pz' | 'ml'; // piezas o metros lineales
}

export interface CalculationResult {
    resumen: {
        areaVidrioM2: number;
        areaTotalM2: number;
    };
    cristales?: {
        id: string;
        nombre: string;
        m2: number;
    }[];
    perfiles: {
        marco: ProfileCalculation[];
        hojas: ProfileCalculation[];
        junquillos: ProfileCalculation[];
    };
    accesorios: AccessoryCalculation[];
}

/**
 * Calcula el despiece y lista de materiales para una ventana de aluminio.
 * Basado en reglas estándar de carpintería de aluminio.
 */
export const calcularMaterialesVentana = (params: CalculationInput & { glassType?: string }): CalculationResult => {
    const { tipo, hojas, glassType = 'vidrio_6mm' } = params;
    const ancho = Number(params.ancho) || 0;
    const alto = Number(params.alto) || 0;

    // 1. Descuentos estándar (pueden parametrizarse en el futuro)
    const DESCUENTO_MARCO = 40; // mm por lado para el marco
    const VANO_ANCHO = Math.max(0, ancho - (DESCUENTO_MARCO * 2));
    const VANO_ALTO = Math.max(0, alto - (DESCUENTO_MARCO * 2));

    const result: CalculationResult = {
        resumen: {
            areaVidrioM2: 0,
            areaTotalM2: Number(((ancho * alto) / 1_000_000).toFixed(2)),
        },
        perfiles: {
            marco: [],
            hojas: [],
            junquillos: [],
        },
        cristales: [],
        accesorios: []
    };

    // ── CÁLCULO DE PERFILES (MARCO) ───────────────────────────────────────────
    // Todas las ventanas llevan un marco perimetral
    result.perfiles.marco.push({
        id: 'jamba',
        tipo: 'Jamba (Vertical)',
        cantidad: 2,
        longitudCorteMm: alto,
        totalLinealM: Number(((alto * 2) / 1000).toFixed(2))
    });
    result.perfiles.marco.push({
        id: 'cabezal',
        tipo: 'Cabezal/Sillar (Horizontal)',
        cantidad: 2,
        longitudCorteMm: ancho,
        totalLinealM: Number(((ancho * 2) / 1000).toFixed(2))
    });

    // Accesorios básicos del marco
    result.accesorios.push({ id: 'escuadras_marco', nombre: 'Escuadras de armado', cantidad: 4, unidad: 'pz' });
    result.accesorios.push({ id: 'tornillos', nombre: 'Tornillos de fijación', cantidad: 8, unidad: 'pz' });
    result.accesorios.push({ id: 'sellador', nombre: 'Sellador de silicona', cantidad: 1, unidad: 'pz' });


    // ── LÓGICA SEGÚN TIPO ─────────────────────────────────────────────────────
    let areaVidrioBruta = 0;

    if (tipo === 'fija') {
        // Ventana Fija: El vidrio va directo al marco (con junquillos)
        areaVidrioBruta = VANO_ANCHO * VANO_ALTO;

        // Junquillos para sujetar el vidrio
        result.perfiles.junquillos.push(
            { id: 'junquillo_v', tipo: 'Junquillo Vertical', cantidad: 2, longitudCorteMm: VANO_ALTO, totalLinealM: Number(((VANO_ALTO * 2) / 1000).toFixed(2)) },
            { id: 'junquillo_h', tipo: 'Junquillo Horizontal', cantidad: 2, longitudCorteMm: VANO_ANCHO, totalLinealM: Number(((VANO_ANCHO * 2) / 1000).toFixed(2)) }
        );
        result.accesorios.push({ id: 'empaque_cuna', nombre: 'Empaque vinil (Cuña)', cantidad: Number((((VANO_ANCHO * 2) + (VANO_ALTO * 2)) / 1000).toFixed(2)), unidad: 'ml' });

    } else if (tipo === 'corrediza') {
        // Ventana Corrediza: Hojas dividen el ancho, se traslapan en el centro.
        const traslape = 25; // mm de cruce entre hojas
        const anchoHoja = (VANO_ANCHO + (traslape * (hojas - 1))) / hojas;
        const altoHoja = VANO_ALTO - 10; // holgura arriba y abajo

        areaVidrioBruta = (anchoHoja - 40) * (altoHoja - 40) * hojas;

        // Perfiles por hoja
        result.perfiles.hojas.push({
            id: 'zocalo_hoja',
            tipo: 'Zócalo / Cabezal Hoja (Horizontal)',
            cantidad: hojas * 2,
            longitudCorteMm: Math.round(anchoHoja),
            totalLinealM: Number(((anchoHoja * hojas * 2) / 1000).toFixed(2))
        });
        result.perfiles.hojas.push({
            id: 'pierna_traslape',
            tipo: 'Pierna / Traslape (Vertical)',
            cantidad: hojas * 2,
            longitudCorteMm: Math.round(altoHoja),
            totalLinealM: Number(((altoHoja * hojas * 2) / 1000).toFixed(2))
        });

        // Accesorios Corrediza
        result.accesorios.push({ id: 'carretillas', nombre: 'Carretillas / Ruedas', cantidad: hojas * 2, unidad: 'pz' });
        result.accesorios.push({ id: 'cierre_embutido', nombre: 'Cierre embutido', cantidad: hojas > 1 ? 1 : 0, unidad: 'pz' });
        result.accesorios.push({ id: 'felpa', nombre: 'Felpa perimetral', cantidad: Number(((anchoHoja * 2 * hojas + altoHoja * 2 * hojas) / 1000).toFixed(2)), unidad: 'ml' });

    } else if (tipo === 'abatible') {
        // Ventana Abatible: Hojas dividen el vano
        const holguraAbatible = 5;
        const anchoHoja = (VANO_ANCHO / hojas) - holguraAbatible;
        const altoHoja = VANO_ALTO - (holguraAbatible * 2);

        areaVidrioBruta = (anchoHoja - 50) * (altoHoja - 50) * hojas;

        result.perfiles.hojas.push({
            id: 'hoja_abatible_h',
            tipo: 'Perfil Hoja Abatible (Horizontal)',
            cantidad: hojas * 2,
            longitudCorteMm: Math.round(anchoHoja),
            totalLinealM: Number(((anchoHoja * hojas * 2) / 1000).toFixed(2))
        });
        result.perfiles.hojas.push({
            id: 'hoja_abatible_v',
            tipo: 'Perfil Hoja Abatible (Vertical)',
            cantidad: hojas * 2,
            longitudCorteMm: Math.round(altoHoja),
            totalLinealM: Number(((altoHoja * hojas * 2) / 1000).toFixed(2))
        });

        // Accesorios Abatible
        result.accesorios.push({ id: 'bisagras', nombre: 'Bisagras de fricción o libro', cantidad: hojas * 2, unidad: 'pz' });
        result.accesorios.push({ id: 'manija', nombre: 'Manija o cremona', cantidad: hojas, unidad: 'pz' });
        result.accesorios.push({ id: 'empaque_epdm', nombre: 'Empaque perimetral EPDM', cantidad: Number(((anchoHoja * 2 * hojas + altoHoja * 2 * hojas) / 1000).toFixed(2)), unidad: 'ml' });
    }

    // Se actualiza el área de vidrio
    const areaVidrioM2 = Number((areaVidrioBruta / 1_000_000).toFixed(2));
    result.resumen.areaVidrioM2 = areaVidrioM2;

    result.cristales?.push({
        id: glassType,
        nombre: 'Cristal Seleccionado', // Will be overwritten by dictionary mapping in pricing
        m2: areaVidrioM2
    });

    return result;
};
