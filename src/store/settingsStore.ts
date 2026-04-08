import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PricingConfig, DEFAULT_PRICING_CONFIG } from '../services/pricing';

interface SettingsState {
    pricingConfig: PricingConfig;
    updatePricingConfig: (changes: Partial<PricingConfig>) => void;
    resetPricingConfig: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            pricingConfig: DEFAULT_PRICING_CONFIG,
            updatePricingConfig: (changes) =>
                set((state) => ({
                    pricingConfig: {
                        ...state.pricingConfig,
                        ...changes,
                    },
                })),
            resetPricingConfig: () =>
                set({
                    pricingConfig: DEFAULT_PRICING_CONFIG,
                }),
        }),
        {
            name: 'windoor-settings-v3', // key in localStorage bumped to v3 to clear old cache
        }
    )
);
