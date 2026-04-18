import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PricingConfig, DEFAULT_PRICING_CONFIG } from '../services/pricing';

export interface CompanyProfile {
    companyName: string;
    logoBase64: string | null;
    email: string;
    address: string;
    phone: string;
}

const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
    companyName: 'WinDoor',
    logoBase64: null,
    email: '',
    address: '',
    phone: '',
};

interface SettingsState {
    pricingConfig: PricingConfig;
    companyProfile: CompanyProfile;
    updatePricingConfig: (changes: Partial<PricingConfig>) => void;
    updateCompanyProfile: (changes: Partial<CompanyProfile>) => void;
    resetPricingConfig: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            pricingConfig: DEFAULT_PRICING_CONFIG,
            companyProfile: DEFAULT_COMPANY_PROFILE,
            updatePricingConfig: (changes) =>
                set((state) => ({
                    pricingConfig: {
                        ...state.pricingConfig,
                        ...changes,
                    },
                })),
            updateCompanyProfile: (changes) =>
                set((state) => ({
                    companyProfile: {
                        ...state.companyProfile,
                        ...changes,
                    },
                })),
            resetPricingConfig: () =>
                set({
                    pricingConfig: DEFAULT_PRICING_CONFIG,
                    companyProfile: DEFAULT_COMPANY_PROFILE,
                }),
        }),
        {
            name: 'windoor-settings-v5', // bumped to v5 to add IVA field
        }
    )
);
