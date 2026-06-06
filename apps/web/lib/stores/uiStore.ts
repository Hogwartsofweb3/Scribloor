import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export type ModalType = 'tip' | 'share' | 'confirm_delete' | 'wallet_connect' | 'image_crop';

// Basic definition of publication needed for subscription sheet
export interface StorePublication {
  id: string;
  name: string;
  slug: string;
  coverImageUrl?: string | null;
  description?: string | null;
  monthlyPriceUsdc?: number | string | null;
  subscriberCount?: number;
  payoutWallet: string;
}

interface UIStore {
  // Toast
  toasts: Toast[];
  addToast(toast: Omit<Toast, 'id'>): void;
  removeToast(id: string): void;

  // Modals
  activeModal: ModalType | null;
  modalProps: Record<string, any>;
  openModal(type: ModalType, props?: Record<string, any>): void;
  closeModal(): void;

  // Subscribe sheet
  subscribePublication: StorePublication | null;
  openSubscribeSheet(pub: StorePublication): void;
  closeSubscribeSheet(): void;

  // Command palette
  commandPaletteOpen: boolean;
  openCommandPalette(): void;
  closeCommandPalette(): void;

  // Legacy layout states (needed for DashboardSidebar and PublicHeader)
  sidebarCollapsed: boolean;
  setSidebarCollapsed(collapsed: boolean): void;
  toggleSidebar(): void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen(open: boolean): void;
}

export const useUIStore = create<UIStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    
    set((state) => ({
      toasts: [...state.toasts, newToast].slice(-3), // Stack up to 3 toasts
    }));

    // Auto dismiss logic
    const duration = toast.duration || (toast.type === 'warning' ? 6000 : 4000);
    if (toast.type !== 'error') {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  activeModal: null,
  modalProps: {},
  openModal: (type, props = {}) =>
    set({
      activeModal: type,
      modalProps: props,
    }),
  closeModal: () =>
    set({
      activeModal: null,
      modalProps: {},
    }),

  subscribePublication: null,
  openSubscribeSheet: (pub) =>
    set({
      subscribePublication: pub,
    }),
  closeSubscribeSheet: () =>
    set({
      subscribePublication: null,
    }),

  commandPaletteOpen: false,
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),

  // Legacy states implementation
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
}));
