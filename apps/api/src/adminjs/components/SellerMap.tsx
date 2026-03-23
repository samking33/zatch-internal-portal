import React, { useEffect, useMemo, useRef, useState } from 'react';

import type { NoLocationSellerRecord, SellerMapPayload, SellerMapRecord } from '../types';
import {
  Badge,
  ErrorState,
  LoadingState,
  cardStyle,
  formatDate,
  pageStyle,
  sectionHeaderStyle,
  sectionSubtitleStyle,
  sectionTitleStyle,
  statusColors,
  useLeaflet,
  usePageData,
} from './shared';

type SellerMapPanelProps = {
  payload: SellerMapPayload;
  standalone?: boolean;
};

type MapFilters = {
  status: 'all' | 'pending' | 'approved' | 'rejected';
  states: string[];
  city: string;
  pincode: string;
  from: string;
  to: string;
};

type SellerMapLikeRecord = SellerMapRecord | NoLocationSellerRecord;

const defaultFilters: MapFilters = {
  status: 'all',
  states: [],
  city: '',
  pincode: '',
  from: '',
  to: '',
};

const legendItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  fontSize: 12,
  color: '#374151',
};

const buttonStyle: React.CSSProperties = {
  borderRadius: 8,
  border: '1px solid #d1d5db',
  background: '#ffffff',
  color: '#1f2937',
  fontWeight: 600,
  padding: '9px 12px',
  cursor: 'pointer',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  padding: '10px 12px',
  fontSize: 13,
  color: '#1f2937',
  boxSizing: 'border-box',
};

const isWithinDateRange = (receivedAt: string, from: string, to: string): boolean => {
  const timestamp = new Date(receivedAt).getTime();

  if (from) {
    const fromTimestamp = new Date(`${from}T00:00:00`).getTime();
    if (timestamp < fromTimestamp) {
      return false;
    }
  }

  if (to) {
    const toTimestamp = new Date(`${to}T23:59:59`).getTime();
    if (timestamp > toTimestamp) {
      return false;
    }
  }

  return true;
};

const matchesBaseFilters = (
  seller: SellerMapLikeRecord,
  filters: Omit<MapFilters, 'city'>,
): boolean => {
  if (filters.status !== 'all' && seller.status !== filters.status) {
    return false;
  }

  if (filters.states.length > 0 && !filters.states.includes(seller.location.state)) {
    return false;
  }

  if (filters.pincode && seller.location.pincode !== filters.pincode) {
    return false;
  }

  return isWithinDateRange(seller.receivedAt, filters.from, filters.to);
};

const matchesCity = (seller: SellerMapLikeRecord, city: string): boolean =>
  city.trim().length === 0 ||
  seller.location.city.toLowerCase().includes(city.trim().toLowerCase());

const groupByState = (sellers: SellerMapRecord[]) =>
  Object.entries(
    sellers.reduce<Record<string, Array<[number, number]>>>((accumulator, seller) => {
      const key = seller.location.state || 'Unknown';
      accumulator[key] ??= [];
      accumulator[key].push([seller.location.lat, seller.location.lng]);
      return accumulator;
    }, {}),
  ).map(([state, coordinates]) => {
    const total = coordinates.length;
    const [lat, lng] = coordinates.reduce<[number, number]>(
      (sum, coordinate) => [sum[0] + coordinate[0], sum[1] + coordinate[1]],
      [0, 0],
    );

    return {
      state,
      total,
      center: [lat / total, lng / total] as [number, number],
    };
  });

const buildPopup = (seller: SellerMapRecord): string => {
  const badge = statusColors[seller.status] ?? { fill: '#f59e0b', text: '#92400e' };

  return `
    <div style="min-width:220px;font-family:Inter,sans-serif">
      <div style="font-weight:600;color:#1f2937">${seller.businessName}</div>
      <div style="margin-top:4px;color:#6b7280">${seller.sellerName}</div>
      <div style="margin-top:8px;color:#374151">Status: <span style="color:${badge.fill};font-weight:600">${seller.status}</span></div>
      <div style="margin-top:4px;color:#374151">${seller.location.city}, ${seller.location.state} ${seller.location.pincode}</div>
      <div style="margin-top:4px;color:#374151">Received: ${formatDate(seller.receivedAt)}</div>
      <div style="margin-top:8px;display:flex;gap:10px;flex-wrap:wrap">
        <a href="#" data-filter-city="${seller.location.city}" style="color:#2563eb;font-size:11px;text-decoration:none">Filter: ${seller.location.city}</a>
        <a href="#" data-filter-state="${seller.location.state}" style="color:#2563eb;font-size:11px;text-decoration:none">Filter: ${seller.location.state}</a>
      </div>
      <a href="/admin/resources/Seller/records/${seller.id}/show" style="display:inline-block;margin-top:10px;color:#2563eb;font-weight:600;text-decoration:none">View in Admin →</a>
    </div>
  `;
};

const SellerMapPanel = ({ payload, standalone = false }: SellerMapPanelProps) => {
  const leaflet = useLeaflet();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<ReturnType<NonNullable<typeof leaflet>['map']> | null>(null);
  const [mode, setMode] = useState<'markers' | 'heatmap'>('markers');
  const [draftFilters, setDraftFilters] = useState<MapFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<MapFilters>(defaultFilters);
  const [showNoLocation, setShowNoLocation] = useState(false);

  const allSellerRecords = useMemo<Array<SellerMapLikeRecord>>(
    () => [...payload.sellers, ...payload.noLocation],
    [payload.noLocation, payload.sellers],
  );

  const availableStates = useMemo(
    () =>
      [...new Set(allSellerRecords.map((seller) => seller.location.state).filter(Boolean))].sort((left, right) =>
        left.localeCompare(right),
      ),
    [allSellerRecords],
  );

  const baseMatchedMarkers = useMemo(
    () =>
      payload.sellers.filter((seller) =>
        matchesBaseFilters(seller, {
          status: appliedFilters.status,
          states: appliedFilters.states,
          pincode: appliedFilters.pincode,
          from: appliedFilters.from,
          to: appliedFilters.to,
        }),
      ),
    [appliedFilters.from, appliedFilters.pincode, appliedFilters.states, appliedFilters.status, appliedFilters.to, payload.sellers],
  );

  const visibleMarkers = useMemo(
    () => baseMatchedMarkers.filter((seller) => matchesCity(seller, draftFilters.city)),
    [baseMatchedMarkers, draftFilters.city],
  );

  const visibleNoLocation = useMemo(
    () =>
      payload.noLocation.filter(
        (seller) =>
          matchesBaseFilters(seller, {
            status: appliedFilters.status,
            states: appliedFilters.states,
            pincode: appliedFilters.pincode,
            from: appliedFilters.from,
            to: appliedFilters.to,
          }) && matchesCity(seller, draftFilters.city),
      ),
    [appliedFilters.from, appliedFilters.pincode, appliedFilters.states, appliedFilters.status, appliedFilters.to, draftFilters.city, payload.noLocation],
  );

  const visibleCounts = useMemo(
    () => ({
      total: visibleMarkers.length + visibleNoLocation.length,
      pending:
        visibleMarkers.filter((seller) => seller.status === 'pending').length +
        visibleNoLocation.filter((seller) => seller.status === 'pending').length,
      approved:
        visibleMarkers.filter((seller) => seller.status === 'approved').length +
        visibleNoLocation.filter((seller) => seller.status === 'approved').length,
      rejected:
        visibleMarkers.filter((seller) => seller.status === 'rejected').length +
        visibleNoLocation.filter((seller) => seller.status === 'rejected').length,
    }),
    [visibleMarkers, visibleNoLocation],
  );

  useEffect(() => {
    const handleFilterLinkClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const city = target.dataset.filterCity;
      const state = target.dataset.filterState;

      if (!city && !state) {
        return;
      }

      event.preventDefault();

      if (city) {
        setDraftFilters((current) => ({ ...current, city }));
      }

      if (state) {
        const next = {
          ...draftFilters,
          states: [state],
          city: city ?? draftFilters.city,
        };
        setDraftFilters(next);
        setAppliedFilters(next);
      }
    };

    document.addEventListener('click', handleFilterLinkClick);
    return () => {
      document.removeEventListener('click', handleFilterLinkClick);
    };
  }, [draftFilters]);

  useEffect(() => {
    if (!leaflet || !mapRef.current) {
      return;
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = leaflet.map(mapRef.current).setView([20.5937, 78.9629], 5);
    mapInstanceRef.current = map;

    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const markerLayer = leaflet.markerClusterGroup ? leaflet.markerClusterGroup() : null;
    const stateLayer = leaflet.markerClusterGroup ? leaflet.markerClusterGroup() : null;

    const cityQuery = draftFilters.city.trim().toLowerCase();

    baseMatchedMarkers.forEach((seller) => {
      const badge = statusColors[seller.status] ?? { fill: '#f59e0b', text: '#92400e' };
      const matchesCurrentCity =
        cityQuery.length === 0 || seller.location.city.toLowerCase().includes(cityQuery);
      const marker = leaflet.circleMarker([seller.location.lat, seller.location.lng], {
        radius: 8,
        color: '#ffffff',
        weight: matchesCurrentCity ? 2 : 1,
        fillColor: badge.fill,
        fillOpacity: matchesCurrentCity ? 0.9 : 0.15,
        opacity: matchesCurrentCity ? 1 : 0.2,
      });

      marker.bindPopup(buildPopup(seller));
      if (matchesCurrentCity && cityQuery.length > 0) {
        marker.setStyle({ radius: 10 });
      }

      if (markerLayer) {
        markerLayer.addLayer(marker);
      } else {
        marker.addTo(map);
      }
    });

    if (appliedFilters.states.length === 0) {
      groupByState(baseMatchedMarkers).forEach((stateGroup) => {
        const circle = leaflet.circleMarker(stateGroup.center, {
          radius: Math.min(26, 12 + stateGroup.total),
          color: '#ffffff',
          weight: 2,
          fillColor: '#3b82f6',
          fillOpacity: 0.45,
        });

        circle.bindPopup(
          `<div style="font-family:Inter,sans-serif"><strong>${stateGroup.state}</strong><div style="margin-top:4px;color:#6b7280">${stateGroup.total} sellers</div></div>`,
        );
        circle.on('click', () => {
          const nextFilters = {
            ...draftFilters,
            states: [stateGroup.state],
          };
          setDraftFilters(nextFilters);
          setAppliedFilters(nextFilters);
          map.flyTo(stateGroup.center, 8, { duration: 1 });
        });

        if (stateLayer) {
          stateLayer.addLayer(circle);
        } else {
          circle.addTo(map);
        }
      });
    }

    const heatLayer =
      mode === 'heatmap' && leaflet.heatLayer
        ? leaflet.heatLayer(
            visibleMarkers.map((seller) => [seller.location.lat, seller.location.lng, 0.9]),
            {
              radius: 26,
              blur: 20,
              gradient: {
                0.2: '#3b82f6',
                0.5: '#f59e0b',
                0.9: '#ef4444',
              },
            },
          )
        : null;

    if (mode === 'markers') {
      markerLayer?.addTo(map);
      stateLayer?.addTo(map);
    } else if (heatLayer) {
      map.addLayer(heatLayer);
    }

    const focusCoordinates =
      visibleMarkers.length > 0
        ? visibleMarkers.map((seller) => [seller.location.lat, seller.location.lng] as [number, number])
        : [];

    if (focusCoordinates.length > 0) {
      const bounds = leaflet.latLngBounds(focusCoordinates);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [appliedFilters.states, appliedFilters.status, appliedFilters.pincode, appliedFilters.from, appliedFilters.to, baseMatchedMarkers, draftFilters, leaflet, mode, visibleMarkers]);

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
  };

  const clearAll = () => {
    setDraftFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  if (!standalone) {
    return (
      <section style={{ ...cardStyle, padding: 20 }}>
        <div style={sectionHeaderStyle}>
          <div>
            <h2 style={sectionTitleStyle}>Seller distribution map</h2>
            <p style={sectionSubtitleStyle}>Plot of geocoded seller locations from the intake flow.</p>
          </div>
        </div>
        <div ref={mapRef} style={{ width: '100%', height: 420, borderRadius: 8, overflow: 'hidden' }} />
      </section>
    );
  }

  return (
    <section style={{ ...cardStyle, padding: 20 }}>
      <div style={sectionHeaderStyle}>
        <div>
          <h2 style={sectionTitleStyle}>Seller distribution map</h2>
          <p style={sectionSubtitleStyle}>
            Filter sellers by status, location, and submission window directly from the map view.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '280px minmax(0, 1fr)' }}>
        <aside style={{ ...cardStyle, padding: 16, alignSelf: 'start' }}>
          <div style={{ ...sectionTitleStyle, fontSize: 14, marginBottom: 12 }}>Map filters</div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>Status</div>
            <div style={{ display: 'grid', gap: 6 }}>
              {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                <label key={status} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <input
                    type="radio"
                    checked={draftFilters.status === status}
                    onChange={() => setDraftFilters((current) => ({ ...current, status }))}
                  />
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>States</div>
            <div style={{ maxHeight: 160, overflowY: 'auto', display: 'grid', gap: 6 }}>
              {availableStates.map((state) => (
                <label key={state} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={draftFilters.states.includes(state)}
                    onChange={(event) =>
                      setDraftFilters((current) => ({
                        ...current,
                        states: event.target.checked
                          ? [...current.states, state]
                          : current.states.filter((item) => item !== state),
                      }))
                    }
                  />
                  {state}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>City</div>
            <input
              value={draftFilters.city}
              onChange={(event) => setDraftFilters((current) => ({ ...current, city: event.target.value }))}
              placeholder="Type a city"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>Pincode</div>
            <input
              value={draftFilters.pincode}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  pincode: event.target.value.replace(/\D/g, '').slice(0, 6),
                }))
              }
              placeholder="6-digit pincode"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>Date range</div>
            <div style={{ display: 'grid', gap: 8 }}>
              <input
                type="date"
                value={draftFilters.from}
                onChange={(event) => setDraftFilters((current) => ({ ...current, from: event.target.value }))}
                style={inputStyle}
              />
              <input
                type="date"
                value={draftFilters.to}
                onChange={(event) => setDraftFilters((current) => ({ ...current, to: event.target.value }))}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button type="button" onClick={applyFilters} style={{ ...buttonStyle, background: '#3b82f6', color: '#ffffff', borderColor: '#3b82f6', flex: 1 }}>
              Apply Filters
            </button>
            <button type="button" onClick={clearAll} style={{ ...buttonStyle, flex: 1 }}>
              Clear All
            </button>
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>
              Showing {visibleCounts.total} sellers
            </div>
            <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
              <div style={legendItemStyle}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
                {visibleCounts.pending} pending
              </div>
              <div style={legendItemStyle}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                {visibleCounts.approved} approved
              </div>
              <div style={legendItemStyle}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                {visibleCounts.rejected} rejected
              </div>
            </div>
          </div>
        </aside>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setMode('markers')}
                style={{
                  ...buttonStyle,
                  borderRadius: 999,
                  background: mode === 'markers' ? '#3b82f6' : '#ffffff',
                  color: mode === 'markers' ? '#ffffff' : '#374151',
                }}
              >
                Markers
              </button>
              <button
                type="button"
                onClick={() => setMode('heatmap')}
                style={{
                  ...buttonStyle,
                  borderRadius: 999,
                  background: mode === 'heatmap' ? '#3b82f6' : '#ffffff',
                  color: mode === 'heatmap' ? '#ffffff' : '#374151',
                }}
              >
                Heatmap
              </button>
            </div>

            <div style={{ ...cardStyle, padding: 12, width: 170, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)' }}>
              <div style={{ ...sectionTitleStyle, fontSize: 13, marginBottom: 10 }}>Legend</div>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={legendItemStyle}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                  Pending
                </div>
                <div style={legendItemStyle}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                  Approved
                </div>
                <div style={legendItemStyle}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                  Rejected
                </div>
              </div>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div ref={mapRef} style={{ width: '100%', height: 520, borderRadius: 8, overflow: 'hidden' }} />
            <div
              style={{
                position: 'absolute',
                left: 12,
                bottom: 12,
                ...cardStyle,
                padding: '10px 12px',
                display: 'flex',
                gap: 12,
                fontSize: 12,
                color: '#374151',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
              }}
            >
              <span>{visibleCounts.total} sellers shown</span>
              <span>{visibleCounts.pending} pending</span>
              <span>{visibleCounts.approved} approved</span>
              <span>{visibleCounts.rejected} rejected</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <button
          type="button"
          onClick={() => setShowNoLocation((current) => !current)}
          style={{ ...buttonStyle, marginBottom: 10 }}
        >
          {showNoLocation ? 'Hide' : 'Show'} {visibleNoLocation.length} sellers without map coordinates
        </button>

        {showNoLocation ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px 12px' }}>Seller</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px' }}>Location</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px' }}>Received</th>
                </tr>
              </thead>
              <tbody>
                {visibleNoLocation.map((seller) => {
                  const badge = statusColors[seller.status] ?? { fill: '#f59e0b', text: '#92400e' };

                  return (
                    <tr key={seller.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 600, color: '#1f2937' }}>{seller.businessName}</div>
                        <div style={{ marginTop: 4, color: '#6b7280', fontSize: 13 }}>{seller.sellerName}</div>
                      </td>
                      <td style={{ padding: '12px', fontSize: 13, color: '#374151' }}>
                        {seller.location.city}, {seller.location.state} {seller.location.pincode}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Badge label={seller.status} background={`${badge.fill}22`} color={badge.text} />
                      </td>
                      <td style={{ padding: '12px', fontSize: 13, color: '#6b7280' }}>{formatDate(seller.receivedAt)}</td>
                    </tr>
                  );
                })}
                {visibleNoLocation.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '16px 12px', color: '#6b7280' }}>
                      All sellers currently have map coordinates for the active filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
};

const SellerMapPage = () => {
  const { data, loading, error } = usePageData<SellerMapPayload>('seller-map');

  if (loading) {
    return <LoadingState label="Loading seller map..." />;
  }

  if (error || !data) {
    return <ErrorState message={error ?? 'Seller map data is unavailable'} />;
  }

  return (
    <div style={pageStyle}>
      <SellerMapPanel payload={data} standalone />
    </div>
  );
};

export { SellerMapPanel };
export default SellerMapPage;
