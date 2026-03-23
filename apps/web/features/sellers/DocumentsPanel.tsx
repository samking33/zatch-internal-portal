'use client';

import { formatDateTimeInIst, type ISellerDocument } from '@zatch/shared';

import { EmptyState } from '../../components/EmptyState';
import { ArrowUpRightIcon } from '../../components/Icons';

type DocumentsPanelProps = {
  documents: ISellerDocument[];
};

const toDocumentLabel = (value: ISellerDocument['type']): string =>
  value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const DocumentsPanel = ({ documents }: DocumentsPanelProps) => {
  if (documents.length === 0) {
    return (
      <EmptyState
        title="No documents submitted"
        description="This seller record does not include any uploaded verification documents."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {documents.map((document) => (
        <a
          key={`${document.publicId}-${document.type}`}
          href={document.url}
          target="_blank"
          rel="noreferrer"
          className="group overflow-hidden rounded-card border border-border bg-white transition hover:-translate-y-0.5 hover:shadow-card"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={document.url}
              alt={`${toDocumentLabel(document.type)} document`}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
            <div className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-slate-700 shadow-sm">
              <ArrowUpRightIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="p-4">
            <div className="text-sm font-medium text-primary">{toDocumentLabel(document.type)}</div>
            <div className="mt-1 text-xs text-muted">{formatDateTimeInIst(document.uploadedAt)}</div>
          </div>
        </a>
      ))}
    </div>
  );
};
