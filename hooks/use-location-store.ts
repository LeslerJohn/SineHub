import { create } from 'zustand';

interface LocationState {
  location: string;
  setLocation: (location: string) => void;
  isHydrated: boolean;
  setHydrated: (state: boolean) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  location: 'Zamboanga City', // Default fallback
  setLocation: (location) => {
    set({ location });
    // Keep localStorage in sync for easy access, though cookie is primary for SSR
    if (typeof window !== 'undefined') {
      localStorage.setItem('sinehub_location', location);
      document.cookie = `sinehub_location=${location}; path=/; max-age=31536000`; // 1 year expiry
    }
  },
  isHydrated: false,
  setHydrated: (state) => set({ isHydrated: state }),
}));
