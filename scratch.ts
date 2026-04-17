import { calcularMaterialesVentana } from './src/services/manufacturing.js';
import { calcularCotizacionSaaS, DEFAULT_PRICING_CONFIG } from './src/services/pricing.js';

const element = { id: 'w1', type: 'window', width: 2000, height: 1500, panels: [{ id: 'p1', widthRatio: 0.5 }, { id: 'p2', widthRatio: 0.5 }], material: 'aluminio', x: 100, y: 100, selected: false };

const calcResult = calcularMaterialesVentana(element as any);
const pricingResult = calcularCotizacionSaaS(calcResult, DEFAULT_PRICING_CONFIG);

console.log(pricingResult.totales);
