import { create } from 'zustand';

interface SubscribeModalStore {
  isOpen: boolean;
  publicationId: string | null;
  publicationName: string | null;
  publicationPrice: number | null;
  migrationToken: string | null;
  migrationCreatorName: string | null;
  open: (publicationId: string, name: string, price: number) => void;
  openWithMigration: (publicationId: string, name: string, price: number, token: string, creatorName: string) => void;
  close: () => void;
}

export const useSubscribeModal = create<SubscribeModalStore>((set) => ({
  isOpen: false,
  publicationId: null,
  publicationName: null,
  publicationPrice: null,
  migrationToken: null,
  migrationCreatorName: null,
  open: (publicationId, name, price) =>
    set({
      isOpen: true,
      publicationId,
      publicationName: name,
      publicationPrice: price,
      migrationToken: null,
      migrationCreatorName: null,
    }),
  openWithMigration: (publicationId, name, price, token, creatorName) =>
    set({
      isOpen: true,
      publicationId,
      publicationName: name,
      publicationPrice: price,
      migrationToken: token,
      migrationCreatorName: creatorName,
    }),
  close: () =>
    set({
      isOpen: false,
      publicationId: null,
      publicationName: null,
      publicationPrice: null,
      migrationToken: null,
      migrationCreatorName: null,
    }),
}));
