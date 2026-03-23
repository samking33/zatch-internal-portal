import React, { useEffect, useMemo, useState } from 'react';
import { ApiClient } from 'adminjs';

export const api = new ApiClient();

type ScriptLoaderWindow = Window & {
  Chart?: ChartConstructor;
  L?: LeafletNamespace;
};

export type ChartConfiguration = {
  type: string;
  data: {
    labels: string[];
    datasets: Array<Record<string, unknown>>;
  };
  options?: Record<string, unknown>;
};

export type ChartInstance = {
  destroy: () => void;
};

export type ChartConstructor = new (
  context: CanvasRenderingContext2D,
  configuration: ChartConfiguration,
) => ChartInstance;

export type LeafletCircleMarker = {
  addTo: (map: LeafletMap) => LeafletCircleMarker;
  bindPopup: (html: string) => LeafletCircleMarker;
  setStyle: (style: Record<string, unknown>) => LeafletCircleMarker;
  on: (eventName: string, handler: (...args: unknown[]) => void) => LeafletCircleMarker;
};

export type LeafletTileLayer = {
  addTo: (map: LeafletMap) => LeafletTileLayer;
};

export type LeafletLayerGroup = {
  addLayer: (layer: unknown) => void;
  addTo: (map: LeafletMap) => LeafletLayerGroup;
  clearLayers: () => void;
};

export type LeafletBounds = {
  isValid: () => boolean;
};

export type LeafletMap = {
  setView: (coordinates: [number, number], zoom: number) => LeafletMap;
  fitBounds: (bounds: LeafletBounds, options?: Record<string, unknown>) => LeafletMap;
  flyTo: (coordinates: [number, number], zoom: number, options?: Record<string, unknown>) => LeafletMap;
  removeLayer: (layer: unknown) => void;
  addLayer: (layer: unknown) => void;
  on: (eventName: string, handler: (...args: unknown[]) => void) => LeafletMap;
  remove: () => void;
};

export type LeafletNamespace = {
  map: (element: HTMLElement, options?: Record<string, unknown>) => LeafletMap;
  tileLayer: (url: string, options?: Record<string, unknown>) => LeafletTileLayer;
  circleMarker: (
    coordinates: [number, number],
    options?: Record<string, unknown>,
  ) => LeafletCircleMarker;
  latLngBounds: (coordinates: Array<[number, number]>) => LeafletBounds;
  markerClusterGroup?: () => LeafletLayerGroup;
  heatLayer?: (points: Array<[number, number, number]>, options?: Record<string, unknown>) => unknown;
};

export const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
};

export const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 16,
  marginBottom: 18,
};

export const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 600,
  color: '#1f2937',
};

export const sectionSubtitleStyle: React.CSSProperties = {
  margin: '6px 0 0',
  fontSize: 13,
  color: '#6b7280',
};

export const pageStyle: React.CSSProperties = {
  display: 'grid',
  gap: 20,
  padding: 24,
  background: '#f4f6f9',
  minHeight: 'calc(100vh - 56px)',
};

export const statusColors: Record<string, { fill: string; text: string }> = {
  pending: { fill: '#f59e0b', text: '#92400e' },
  approved: { fill: '#10b981', text: '#065f46' },
  rejected: { fill: '#ef4444', text: '#991b1b' },
};

export const actionColors: Record<string, string> = {
  'seller.approved': '#10b981',
  'seller.rejected': '#ef4444',
  'seller.submitted': '#3b82f6',
  'user.login': '#6b7280',
  'user.logout': '#6b7280',
  'admin.override': '#8b5cf6',
};

export const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(value));

export const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));

export const timeAgo = (value: string): string => {
  const diffMs = new Date(value).getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, 'minute');
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, 'hour');
  }

  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, 'day');
};

export const loadScriptOnce = async (id: string, src: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const existing = document.getElementById(id);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });

export const loadStyleOnce = (id: string, href: string): void => {
  if (document.getElementById(id)) {
    return;
  }

  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
};

export const usePageData = <T,>(pageName: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    api
      .getPage({ pageName })
      .then((response) => {
        if (!active) {
          return;
        }

        setData((response.data as T | undefined) ?? null);
        setLoading(false);
      })
      .catch((caughtError: unknown) => {
        if (!active) {
          return;
        }

        setError(caughtError instanceof Error ? caughtError.message : 'Failed to load page');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [pageName]);

  return { data, loading, error };
};

export const useDashboardData = <T,>() => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    api
      .getDashboard()
      .then((response) => {
        if (!active) {
          return;
        }

        setData((response.data as T | undefined) ?? null);
        setLoading(false);
      })
      .catch((caughtError: unknown) => {
        if (!active) {
          return;
        }

        setError(caughtError instanceof Error ? caughtError.message : 'Failed to load dashboard');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { data, loading, error };
};

export const LoadingState = ({ label }: { label: string }) => (
  <div style={{ ...cardStyle, padding: 24, color: '#6b7280' }}>{label}</div>
);

export const ErrorState = ({ message }: { message: string }) => (
  <div style={{ ...cardStyle, padding: 24, color: '#b91c1c' }}>{message}</div>
);

export const Badge = ({ label, background, color }: { label: string; background: string; color: string }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: 999,
      background,
      color,
      fontSize: 11,
      fontWeight: 600,
    }}
  >
    {label}
  </span>
);

export const useChartJs = (): ChartConstructor | null => {
  const [chartConstructor, setChartConstructor] = useState<ChartConstructor | null>(null);

  useEffect(() => {
    let active = true;

    loadScriptOnce('adminjs-chartjs', 'https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js')
      .then(() => {
        const chart = (window as ScriptLoaderWindow).Chart ?? null;
        if (active && chart) {
          setChartConstructor(() => chart);
        }
      })
      .catch(() => {
        if (active) {
          setChartConstructor(null);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return chartConstructor;
};

export const useLeaflet = (): LeafletNamespace | null => {
  const [leaflet, setLeaflet] = useState<LeafletNamespace | null>(null);

  useEffect(() => {
    let active = true;

    loadStyleOnce('leaflet-style', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
    loadStyleOnce(
      'leaflet-cluster-style',
      'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css',
    );
    loadStyleOnce(
      'leaflet-cluster-default-style',
      'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css',
    );

    Promise.all([
      loadScriptOnce('leaflet-script', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'),
      loadScriptOnce(
        'leaflet-cluster-script',
        'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js',
      ),
      loadScriptOnce('leaflet-heat-script', 'https://unpkg.com/leaflet.heat/dist/leaflet-heat.js'),
    ])
      .then(() => {
        const loadedLeaflet = (window as ScriptLoaderWindow).L ?? null;
        if (active && loadedLeaflet) {
          setLeaflet(loadedLeaflet);
        }
      })
      .catch(() => {
        if (active) {
          setLeaflet(null);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return leaflet;
};

export const useDateLabel = () =>
  useMemo(
    () =>
      new Intl.DateTimeFormat('en-IN', {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date()),
    [],
  );
