import { create } from 'zustand';

interface SubscribeModalStore {
  isOpen: boolean;
  publicationId: string | null;
  publicationName: string | null;
  publicationPrice: number | null;
  open: (publicationId: string, name: string, price: number) => void;
  close: () => void;
}

export const useSubscribeModal = create<SubscribeModalStore>((set) => ({
  isOpen: false,
  publicationId: null,
  publicationName: null,
  publicationPrice: null,
  open: (publicationId, name, price) =>
    set({
      isOpen: true,
      publicationId,
      publicationName: name,
      publicationPrice: price,
    }),
  close: () =>
    set({
      isOpen: false,
      publicationId: null,
      publicationName: null,
      publicationPrice: null,
    }),
}));
