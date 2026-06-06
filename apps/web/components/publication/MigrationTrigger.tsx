'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSubscribeModal } from '@/hooks/useSubscribeModal';

interface MigrationTriggerProps {
  publicationId: string;
  publicationName: string;
  publicationPrice: number;
  creatorName: string;
}

export default function MigrationTrigger({
  publicationId,
  publicationName,
  publicationPrice,
  creatorName,
}: MigrationTriggerProps) {
  const searchParams = useSearchParams();
  const { openWithMigration } = useSubscribeModal();

  useEffect(() => {
    const migrate = searchParams.get('migrate');
    const token = searchParams.get('token');

    if (migrate === 'true' && token) {
      openWithMigration(publicationId, publicationName, publicationPrice, token, creatorName);
    }
  }, [searchParams, publicationId, publicationName, publicationPrice, creatorName, openWithMigration]);

  return null;
}
