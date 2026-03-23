(function (React, adminjs) {
  'use strict';

  function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

  var React__default = /*#__PURE__*/_interopDefault(React);

  const api = new adminjs.ApiClient();
  const cardStyle = {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
  };
  const sectionHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginBottom: 18
  };
  const sectionTitleStyle = {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    color: '#1f2937'
  };
  const sectionSubtitleStyle = {
    margin: '6px 0 0',
    fontSize: 13,
    color: '#6b7280'
  };
  const pageStyle = {
    display: 'grid',
    gap: 20,
    padding: 24,
    background: '#f4f6f9',
    minHeight: 'calc(100vh - 56px)'
  };
  const statusColors = {
    pending: {
      fill: '#f59e0b',
      text: '#92400e'
    },
    approved: {
      fill: '#10b981',
      text: '#065f46'
    },
    rejected: {
      fill: '#ef4444',
      text: '#991b1b'
    }
  };
  const actionColors = {
    'seller.approved': '#10b981',
    'seller.rejected': '#ef4444',
    'seller.submitted': '#3b82f6',
    'user.login': '#6b7280',
    'user.logout': '#6b7280',
    'admin.override': '#8b5cf6'
  };
  const formatDateTime = value => new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(new Date(value));
  const formatDate = value => new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));
  const timeAgo = value => {
    const diffMs = new Date(value).getTime() - Date.now();
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    const formatter = new Intl.RelativeTimeFormat('en', {
      numeric: 'auto'
    });
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
  const loadScriptOnce = async (id, src) => new Promise((resolve, reject) => {
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
  const loadStyleOnce = (id, href) => {
    if (document.getElementById(id)) {
      return;
    }
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };
  const usePageData = pageName => {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    React.useEffect(() => {
      let active = true;
      api.getPage({
        pageName
      }).then(response => {
        if (!active) {
          return;
        }
        setData(response.data ?? null);
        setLoading(false);
      }).catch(caughtError => {
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
    return {
      data,
      loading,
      error
    };
  };
  const useDashboardData = () => {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    React.useEffect(() => {
      let active = true;
      api.getDashboard().then(response => {
        if (!active) {
          return;
        }
        setData(response.data ?? null);
        setLoading(false);
      }).catch(caughtError => {
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
    return {
      data,
      loading,
      error
    };
  };
  const LoadingState = ({
    label
  }) => /*#__PURE__*/React__default.default.createElement("div", {
    style: {
      ...cardStyle,
      padding: 24,
      color: '#6b7280'
    }
  }, label);
  const ErrorState = ({
    message
  }) => /*#__PURE__*/React__default.default.createElement("div", {
    style: {
      ...cardStyle,
      padding: 24,
      color: '#b91c1c'
    }
  }, message);
  const Badge = ({
    label,
    background,
    color
  }) => /*#__PURE__*/React__default.default.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: 999,
      background,
      color,
      fontSize: 11,
      fontWeight: 600
    }
  }, label);
  const useChartJs = () => {
    const [chartConstructor, setChartConstructor] = React.useState(null);
    React.useEffect(() => {
      let active = true;
      loadScriptOnce('adminjs-chartjs', 'https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js').then(() => {
        const chart = window.Chart ?? null;
        if (active && chart) {
          setChartConstructor(() => chart);
        }
      }).catch(() => {
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
  const useLeaflet = () => {
    const [leaflet, setLeaflet] = React.useState(null);
    React.useEffect(() => {
      let active = true;
      loadStyleOnce('leaflet-style', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
      loadStyleOnce('leaflet-cluster-style', 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css');
      loadStyleOnce('leaflet-cluster-default-style', 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css');
      Promise.all([loadScriptOnce('leaflet-script', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'), loadScriptOnce('leaflet-cluster-script', 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js'), loadScriptOnce('leaflet-heat-script', 'https://unpkg.com/leaflet.heat/dist/leaflet-heat.js')]).then(() => {
        const loadedLeaflet = window.L ?? null;
        if (active && loadedLeaflet) {
          setLeaflet(loadedLeaflet);
        }
      }).catch(() => {
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

  const defaultFilters = {
    status: 'all',
    states: [],
    city: '',
    pincode: '',
    from: '',
    to: ''
  };
  const legendItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 12,
    color: '#374151'
  };
  const buttonStyle = {
    borderRadius: 8,
    border: '1px solid #d1d5db',
    background: '#ffffff',
    color: '#1f2937',
    fontWeight: 600,
    padding: '9px 12px',
    cursor: 'pointer'
  };
  const inputStyle$1 = {
    width: '100%',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    padding: '10px 12px',
    fontSize: 13,
    color: '#1f2937',
    boxSizing: 'border-box'
  };
  const isWithinDateRange = (receivedAt, from, to) => {
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
  const matchesBaseFilters = (seller, filters) => {
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
  const matchesCity = (seller, city) => city.trim().length === 0 || seller.location.city.toLowerCase().includes(city.trim().toLowerCase());
  const groupByState = sellers => Object.entries(sellers.reduce((accumulator, seller) => {
    const key = seller.location.state || 'Unknown';
    accumulator[key] ??= [];
    accumulator[key].push([seller.location.lat, seller.location.lng]);
    return accumulator;
  }, {})).map(([state, coordinates]) => {
    const total = coordinates.length;
    const [lat, lng] = coordinates.reduce((sum, coordinate) => [sum[0] + coordinate[0], sum[1] + coordinate[1]], [0, 0]);
    return {
      state,
      total,
      center: [lat / total, lng / total]
    };
  });
  const buildPopup = seller => {
    const badge = statusColors[seller.status] ?? {
      fill: '#f59e0b'};
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
      <div style="margin-top:10px;color:#6b7280;font-size:11px">Seller ID: ${seller.id}</div>
    </div>
  `;
  };
  const SellerMapPanel = ({
    payload,
    standalone = false
  }) => {
    const leaflet = useLeaflet();
    const mapRef = React.useRef(null);
    const mapInstanceRef = React.useRef(null);
    const [mode, setMode] = React.useState('markers');
    const [draftFilters, setDraftFilters] = React.useState(defaultFilters);
    const [appliedFilters, setAppliedFilters] = React.useState(defaultFilters);
    const [showNoLocation, setShowNoLocation] = React.useState(false);
    const allSellerRecords = React.useMemo(() => [...payload.sellers, ...payload.noLocation], [payload.noLocation, payload.sellers]);
    const availableStates = React.useMemo(() => [...new Set(allSellerRecords.map(seller => seller.location.state).filter(Boolean))].sort((left, right) => left.localeCompare(right)), [allSellerRecords]);
    const baseMatchedMarkers = React.useMemo(() => payload.sellers.filter(seller => matchesBaseFilters(seller, {
      status: appliedFilters.status,
      states: appliedFilters.states,
      pincode: appliedFilters.pincode,
      from: appliedFilters.from,
      to: appliedFilters.to
    })), [appliedFilters.from, appliedFilters.pincode, appliedFilters.states, appliedFilters.status, appliedFilters.to, payload.sellers]);
    const visibleMarkers = React.useMemo(() => baseMatchedMarkers.filter(seller => matchesCity(seller, draftFilters.city)), [baseMatchedMarkers, draftFilters.city]);
    const visibleNoLocation = React.useMemo(() => payload.noLocation.filter(seller => matchesBaseFilters(seller, {
      status: appliedFilters.status,
      states: appliedFilters.states,
      pincode: appliedFilters.pincode,
      from: appliedFilters.from,
      to: appliedFilters.to
    }) && matchesCity(seller, draftFilters.city)), [appliedFilters.from, appliedFilters.pincode, appliedFilters.states, appliedFilters.status, appliedFilters.to, draftFilters.city, payload.noLocation]);
    const visibleCounts = React.useMemo(() => ({
      total: visibleMarkers.length + visibleNoLocation.length,
      pending: visibleMarkers.filter(seller => seller.status === 'pending').length + visibleNoLocation.filter(seller => seller.status === 'pending').length,
      approved: visibleMarkers.filter(seller => seller.status === 'approved').length + visibleNoLocation.filter(seller => seller.status === 'approved').length,
      rejected: visibleMarkers.filter(seller => seller.status === 'rejected').length + visibleNoLocation.filter(seller => seller.status === 'rejected').length
    }), [visibleMarkers, visibleNoLocation]);
    React.useEffect(() => {
      const handleFilterLinkClick = event => {
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
          setDraftFilters(current => ({
            ...current,
            city
          }));
        }
        if (state) {
          const next = {
            ...draftFilters,
            states: [state],
            city: city ?? draftFilters.city
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
    React.useEffect(() => {
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
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      const markerLayer = leaflet.markerClusterGroup ? leaflet.markerClusterGroup() : null;
      const stateLayer = leaflet.markerClusterGroup ? leaflet.markerClusterGroup() : null;
      const cityQuery = draftFilters.city.trim().toLowerCase();
      baseMatchedMarkers.forEach(seller => {
        const badge = statusColors[seller.status] ?? {
          fill: '#f59e0b'};
        const matchesCurrentCity = cityQuery.length === 0 || seller.location.city.toLowerCase().includes(cityQuery);
        const marker = leaflet.circleMarker([seller.location.lat, seller.location.lng], {
          radius: 8,
          color: '#ffffff',
          weight: matchesCurrentCity ? 2 : 1,
          fillColor: badge.fill,
          fillOpacity: matchesCurrentCity ? 0.9 : 0.15,
          opacity: matchesCurrentCity ? 1 : 0.2
        });
        marker.bindPopup(buildPopup(seller));
        if (matchesCurrentCity && cityQuery.length > 0) {
          marker.setStyle({
            radius: 10
          });
        }
        if (markerLayer) {
          markerLayer.addLayer(marker);
        } else {
          marker.addTo(map);
        }
      });
      if (appliedFilters.states.length === 0) {
        groupByState(baseMatchedMarkers).forEach(stateGroup => {
          const circle = leaflet.circleMarker(stateGroup.center, {
            radius: Math.min(26, 12 + stateGroup.total),
            color: '#ffffff',
            weight: 2,
            fillColor: '#3b82f6',
            fillOpacity: 0.45
          });
          circle.bindPopup(`<div style="font-family:Inter,sans-serif"><strong>${stateGroup.state}</strong><div style="margin-top:4px;color:#6b7280">${stateGroup.total} sellers</div></div>`);
          circle.on('click', () => {
            const nextFilters = {
              ...draftFilters,
              states: [stateGroup.state]
            };
            setDraftFilters(nextFilters);
            setAppliedFilters(nextFilters);
            map.flyTo(stateGroup.center, 8, {
              duration: 1
            });
          });
          if (stateLayer) {
            stateLayer.addLayer(circle);
          } else {
            circle.addTo(map);
          }
        });
      }
      const heatLayer = mode === 'heatmap' && leaflet.heatLayer ? leaflet.heatLayer(visibleMarkers.map(seller => [seller.location.lat, seller.location.lng, 0.9]), {
        radius: 26,
        blur: 20,
        gradient: {
          0.2: '#3b82f6',
          0.5: '#f59e0b',
          0.9: '#ef4444'
        }
      }) : null;
      if (mode === 'markers') {
        markerLayer?.addTo(map);
        stateLayer?.addTo(map);
      } else if (heatLayer) {
        map.addLayer(heatLayer);
      }
      const focusCoordinates = visibleMarkers.length > 0 ? visibleMarkers.map(seller => [seller.location.lat, seller.location.lng]) : [];
      if (focusCoordinates.length > 0) {
        const bounds = leaflet.latLngBounds(focusCoordinates);
        if (bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [30, 30]
          });
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
      return /*#__PURE__*/React__default.default.createElement("section", {
        style: {
          ...cardStyle,
          padding: 20
        }
      }, /*#__PURE__*/React__default.default.createElement("div", {
        style: sectionHeaderStyle
      }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("h2", {
        style: sectionTitleStyle
      }, "Seller distribution map"), /*#__PURE__*/React__default.default.createElement("p", {
        style: sectionSubtitleStyle
      }, "Plot of geocoded seller locations from the upstream seller account data."))), /*#__PURE__*/React__default.default.createElement("div", {
        ref: mapRef,
        style: {
          width: '100%',
          height: 420,
          borderRadius: 8,
          overflow: 'hidden'
        }
      }));
    }
    return /*#__PURE__*/React__default.default.createElement("section", {
      style: {
        ...cardStyle,
        padding: 20
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: sectionHeaderStyle
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("h2", {
      style: sectionTitleStyle
    }, "Seller distribution map"), /*#__PURE__*/React__default.default.createElement("p", {
      style: sectionSubtitleStyle
    }, "Filter sellers by status, location, and submission window directly from the map view."))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'grid',
        gap: 20,
        gridTemplateColumns: '280px minmax(0, 1fr)'
      }
    }, /*#__PURE__*/React__default.default.createElement("aside", {
      style: {
        ...cardStyle,
        padding: 16,
        alignSelf: 'start'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        ...sectionTitleStyle,
        fontSize: 14,
        marginBottom: 12
      }
    }, "Map filters"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: '#6b7280',
        marginBottom: 8
      }
    }, "Status"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'grid',
        gap: 6
      }
    }, ['all', 'pending', 'approved', 'rejected'].map(status => /*#__PURE__*/React__default.default.createElement("label", {
      key: status,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 13
      }
    }, /*#__PURE__*/React__default.default.createElement("input", {
      type: "radio",
      checked: draftFilters.status === status,
      onChange: () => setDraftFilters(current => ({
        ...current,
        status
      }))
    }), status.charAt(0).toUpperCase() + status.slice(1))))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: '#6b7280',
        marginBottom: 8
      }
    }, "States"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        maxHeight: 160,
        overflowY: 'auto',
        display: 'grid',
        gap: 6
      }
    }, availableStates.map(state => /*#__PURE__*/React__default.default.createElement("label", {
      key: state,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 13
      }
    }, /*#__PURE__*/React__default.default.createElement("input", {
      type: "checkbox",
      checked: draftFilters.states.includes(state),
      onChange: event => setDraftFilters(current => ({
        ...current,
        states: event.target.checked ? [...current.states, state] : current.states.filter(item => item !== state)
      }))
    }), state)))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: '#6b7280',
        marginBottom: 8
      }
    }, "City"), /*#__PURE__*/React__default.default.createElement("input", {
      value: draftFilters.city,
      onChange: event => setDraftFilters(current => ({
        ...current,
        city: event.target.value
      })),
      placeholder: "Type a city",
      style: inputStyle$1
    })), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: '#6b7280',
        marginBottom: 8
      }
    }, "Pincode"), /*#__PURE__*/React__default.default.createElement("input", {
      value: draftFilters.pincode,
      onChange: event => setDraftFilters(current => ({
        ...current,
        pincode: event.target.value.replace(/\D/g, '').slice(0, 6)
      })),
      placeholder: "6-digit pincode",
      style: inputStyle$1
    })), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: '#6b7280',
        marginBottom: 8
      }
    }, "Date range"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'grid',
        gap: 8
      }
    }, /*#__PURE__*/React__default.default.createElement("input", {
      type: "date",
      value: draftFilters.from,
      onChange: event => setDraftFilters(current => ({
        ...current,
        from: event.target.value
      })),
      style: inputStyle$1
    }), /*#__PURE__*/React__default.default.createElement("input", {
      type: "date",
      value: draftFilters.to,
      onChange: event => setDraftFilters(current => ({
        ...current,
        to: event.target.value
      })),
      style: inputStyle$1
    }))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        marginBottom: 16
      }
    }, /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      onClick: applyFilters,
      style: {
        ...buttonStyle,
        background: '#3b82f6',
        color: '#ffffff',
        borderColor: '#3b82f6',
        flex: 1
      }
    }, "Apply Filters"), /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      onClick: clearAll,
      style: {
        ...buttonStyle,
        flex: 1
      }
    }, "Clear All")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        borderTop: '1px solid #e5e7eb',
        paddingTop: 12
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: '#1f2937'
      }
    }, "Showing ", visibleCounts.total, " sellers"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        marginTop: 8,
        display: 'grid',
        gap: 6
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: legendItemStyle
    }, /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: '#f59e0b'
      }
    }), visibleCounts.pending, " pending"), /*#__PURE__*/React__default.default.createElement("div", {
      style: legendItemStyle
    }, /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: '#10b981'
      }
    }), visibleCounts.approved, " approved"), /*#__PURE__*/React__default.default.createElement("div", {
      style: legendItemStyle
    }, /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: '#ef4444'
      }
    }), visibleCounts.rejected, " rejected")))), /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      onClick: () => setMode('markers'),
      style: {
        ...buttonStyle,
        borderRadius: 999,
        background: mode === 'markers' ? '#3b82f6' : '#ffffff',
        color: mode === 'markers' ? '#ffffff' : '#374151'
      }
    }, "Markers"), /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      onClick: () => setMode('heatmap'),
      style: {
        ...buttonStyle,
        borderRadius: 999,
        background: mode === 'heatmap' ? '#3b82f6' : '#ffffff',
        color: mode === 'heatmap' ? '#ffffff' : '#374151'
      }
    }, "Heatmap")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        ...cardStyle,
        padding: 12,
        width: 170,
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        ...sectionTitleStyle,
        fontSize: 13,
        marginBottom: 10
      }
    }, "Legend"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'grid',
        gap: 8
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: legendItemStyle
    }, /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: '#f59e0b'
      }
    }), "Pending"), /*#__PURE__*/React__default.default.createElement("div", {
      style: legendItemStyle
    }, /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: '#10b981'
      }
    }), "Approved"), /*#__PURE__*/React__default.default.createElement("div", {
      style: legendItemStyle
    }, /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: '#ef4444'
      }
    }), "Rejected")))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        position: 'relative'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      ref: mapRef,
      style: {
        width: '100%',
        height: 520,
        borderRadius: 8,
        overflow: 'hidden'
      }
    }), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        position: 'absolute',
        left: 12,
        bottom: 12,
        ...cardStyle,
        padding: '10px 12px',
        display: 'flex',
        gap: 12,
        fontSize: 12,
        color: '#374151',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)'
      }
    }, /*#__PURE__*/React__default.default.createElement("span", null, visibleCounts.total, " sellers shown"), /*#__PURE__*/React__default.default.createElement("span", null, visibleCounts.pending, " pending"), /*#__PURE__*/React__default.default.createElement("span", null, visibleCounts.approved, " approved"), /*#__PURE__*/React__default.default.createElement("span", null, visibleCounts.rejected, " rejected"))))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        marginTop: 18
      }
    }, /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      onClick: () => setShowNoLocation(current => !current),
      style: {
        ...buttonStyle,
        marginBottom: 10
      }
    }, showNoLocation ? 'Hide' : 'Show', " ", visibleNoLocation.length, " sellers without map coordinates"), showNoLocation ? /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        overflowX: 'auto'
      }
    }, /*#__PURE__*/React__default.default.createElement("table", {
      style: {
        width: '100%',
        borderCollapse: 'collapse'
      }
    }, /*#__PURE__*/React__default.default.createElement("thead", null, /*#__PURE__*/React__default.default.createElement("tr", null, /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '10px 12px'
      }
    }, "Seller"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '10px 12px'
      }
    }, "Location"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '10px 12px'
      }
    }, "Status"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '10px 12px'
      }
    }, "Received"))), /*#__PURE__*/React__default.default.createElement("tbody", null, visibleNoLocation.map(seller => {
      const badge = statusColors[seller.status] ?? {
        fill: '#f59e0b',
        text: '#92400e'
      };
      return /*#__PURE__*/React__default.default.createElement("tr", {
        key: seller.id,
        style: {
          borderTop: '1px solid #e5e7eb'
        }
      }, /*#__PURE__*/React__default.default.createElement("td", {
        style: {
          padding: '12px'
        }
      }, /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          fontWeight: 600,
          color: '#1f2937'
        }
      }, seller.businessName), /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          marginTop: 4,
          color: '#6b7280',
          fontSize: 13
        }
      }, seller.sellerName)), /*#__PURE__*/React__default.default.createElement("td", {
        style: {
          padding: '12px',
          fontSize: 13,
          color: '#374151'
        }
      }, seller.location.city, ", ", seller.location.state, " ", seller.location.pincode), /*#__PURE__*/React__default.default.createElement("td", {
        style: {
          padding: '12px'
        }
      }, /*#__PURE__*/React__default.default.createElement(Badge, {
        label: seller.status,
        background: `${badge.fill}22`,
        color: badge.text
      })), /*#__PURE__*/React__default.default.createElement("td", {
        style: {
          padding: '12px',
          fontSize: 13,
          color: '#6b7280'
        }
      }, formatDate(seller.receivedAt)));
    }), visibleNoLocation.length === 0 ? /*#__PURE__*/React__default.default.createElement("tr", null, /*#__PURE__*/React__default.default.createElement("td", {
      colSpan: 4,
      style: {
        padding: '16px 12px',
        color: '#6b7280'
      }
    }, "All sellers currently have map coordinates for the active filters.")) : null))) : null));
  };
  const SellerMapPage = () => {
    const {
      data,
      loading,
      error
    } = usePageData('seller-map');
    if (loading) {
      return /*#__PURE__*/React__default.default.createElement(LoadingState, {
        label: "Loading seller map..."
      });
    }
    if (error || !data) {
      return /*#__PURE__*/React__default.default.createElement(ErrorState, {
        message: error ?? 'Seller map data is unavailable'
      });
    }
    return /*#__PURE__*/React__default.default.createElement("div", {
      style: pageStyle
    }, /*#__PURE__*/React__default.default.createElement(SellerMapPanel, {
      payload: data,
      standalone: true
    }));
  };

  const chartWrapStyle = {
    ...cardStyle,
    padding: 20,
    minHeight: 360
  };
  const DashboardCharts = ({
    payload
  }) => {
    const chartConstructor = useChartJs();
    const barCanvasRef = React.useRef(null);
    const donutCanvasRef = React.useRef(null);
    const [mode, setMode] = React.useState('30d');
    const submissionsSeries = mode === '30d' ? payload.submissions30Days : payload.submissions12Months;
    React.useEffect(() => {
      if (!chartConstructor || !barCanvasRef.current || !donutCanvasRef.current) {
        return;
      }
      const barContext = barCanvasRef.current.getContext('2d');
      const donutContext = donutCanvasRef.current.getContext('2d');
      if (!barContext || !donutContext) {
        return;
      }
      const barChart = new chartConstructor(barContext, {
        type: 'bar',
        data: {
          labels: submissionsSeries.map(point => point.label),
          datasets: [{
            label: 'Submissions',
            data: submissionsSeries.map(point => point.count),
            backgroundColor: '#3b82f6',
            borderRadius: 6
          }]
        },
        options: {
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#6b7280',
                font: {
                  size: 11
                }
              }
            },
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
                color: '#6b7280',
                font: {
                  size: 11
                }
              },
              grid: {
                color: 'rgba(148,163,184,0.16)'
              }
            }
          }
        }
      });
      const donutChart = new chartConstructor(donutContext, {
        type: 'doughnut',
        data: {
          labels: ['Pending', 'Approved', 'Rejected'],
          datasets: [{
            data: [payload.stats.pending, payload.stats.approved, payload.stats.rejected],
            backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
            borderWidth: 0
          }]
        },
        options: {
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
      return () => {
        barChart.destroy();
        donutChart.destroy();
      };
    }, [chartConstructor, mode, payload.stats, submissionsSeries]);
    return /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'grid',
        gap: 20,
        gridTemplateColumns: '1.35fr 1fr'
      }
    }, /*#__PURE__*/React__default.default.createElement("section", {
      style: chartWrapStyle
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: sectionHeaderStyle
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("h2", {
      style: sectionTitleStyle
    }, "Submissions chart"), /*#__PURE__*/React__default.default.createElement("p", {
      style: sectionSubtitleStyle
    }, "Submission volume over the last 30 days or 12 months.")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, ['30d', '12m'].map(value => /*#__PURE__*/React__default.default.createElement("button", {
      key: value,
      type: "button",
      onClick: () => setMode(value),
      style: {
        borderRadius: 999,
        border: '1px solid #d1d5db',
        padding: '7px 12px',
        background: mode === value ? '#3b82f6' : '#ffffff',
        color: mode === value ? '#ffffff' : '#374151',
        fontWeight: 600,
        cursor: 'pointer'
      }
    }, value === '30d' ? '30 days' : '12 months')))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        height: 280
      }
    }, /*#__PURE__*/React__default.default.createElement("canvas", {
      ref: barCanvasRef
    }))), /*#__PURE__*/React__default.default.createElement("section", {
      style: chartWrapStyle
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: sectionHeaderStyle
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("h2", {
      style: sectionTitleStyle
    }, "Status breakdown"), /*#__PURE__*/React__default.default.createElement("p", {
      style: sectionSubtitleStyle
    }, "Current mix of pending, approved, and rejected sellers."))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '220px 1fr',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        position: 'relative',
        height: 220
      }
    }, /*#__PURE__*/React__default.default.createElement("canvas", {
      ref: donutCanvasRef
    }), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        color: '#6b7280',
        fontSize: 12
      }
    }, "Total"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        color: '#1f2937',
        fontSize: 30,
        fontWeight: 700
      }
    }, payload.stats.total))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'grid',
        gap: 10
      }
    }, [{
      label: 'Pending',
      value: payload.stats.pending,
      color: '#f59e0b'
    }, {
      label: 'Approved',
      value: payload.stats.approved,
      color: '#10b981'
    }, {
      label: 'Rejected',
      value: payload.stats.rejected,
      color: '#ef4444'
    }].map(item => {
      const percentage = payload.stats.total > 0 ? Math.round(item.value / payload.stats.total * 100) : 0;
      return /*#__PURE__*/React__default.default.createElement("div", {
        key: item.label,
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }
      }, /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: '#374151',
          fontSize: 13
        }
      }, /*#__PURE__*/React__default.default.createElement("span", {
        style: {
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: item.color
        }
      }), item.label), /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          color: '#6b7280',
          fontSize: 13
        }
      }, item.value, " (", percentage, "%)"));
    })))));
  };
  const Dashboard = () => {
    const {
      data,
      loading,
      error
    } = useDashboardData();
    const stats = React.useMemo(() => data ? [{
      label: 'Total Sellers',
      value: data.stats.total,
      color: '#3b82f6',
      bg: '#dbeafe'
    }, {
      label: 'Pending',
      value: data.stats.pending,
      color: '#f59e0b',
      bg: '#fef3c7'
    }, {
      label: 'Approved',
      value: data.stats.approved,
      color: '#10b981',
      bg: '#d1fae5'
    }, {
      label: 'Rejected',
      value: data.stats.rejected,
      color: '#ef4444',
      bg: '#fee2e2'
    }] : [], [data]);
    if (loading) {
      return /*#__PURE__*/React__default.default.createElement(LoadingState, {
        label: "Loading dashboard..."
      });
    }
    if (error || !data) {
      return /*#__PURE__*/React__default.default.createElement(ErrorState, {
        message: error ?? 'Dashboard data is unavailable'
      });
    }
    return /*#__PURE__*/React__default.default.createElement("div", {
      style: pageStyle
    }, /*#__PURE__*/React__default.default.createElement("section", {
      style: {
        ...cardStyle,
        padding: 24
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 16
      }
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("h1", {
      style: {
        margin: 0,
        fontSize: 28,
        fontWeight: 700,
        color: '#1f2937'
      }
    }, data.greeting, ", ", data.adminName), /*#__PURE__*/React__default.default.createElement("p", {
      style: {
        margin: '6px 0 0',
        color: '#6b7280',
        fontSize: 14
      }
    }, "Zatch Super Admin Panel")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        color: '#6b7280',
        fontSize: 13
      }
    }, data.dateLabel))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 20
      }
    }, stats.map(stat => /*#__PURE__*/React__default.default.createElement("div", {
      key: stat.label,
      style: {
        ...cardStyle,
        borderLeft: `4px solid ${stat.color}`,
        padding: 20,
        position: 'relative'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        position: 'absolute',
        right: 16,
        top: 16,
        color: stat.color
      }
    }, /*#__PURE__*/React__default.default.createElement("svg", {
      width: "22",
      height: "22",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8"
    }, /*#__PURE__*/React__default.default.createElement("path", {
      d: "M5 13h4v6H5z"
    }), /*#__PURE__*/React__default.default.createElement("path", {
      d: "M10 9h4v10h-4z"
    }), /*#__PURE__*/React__default.default.createElement("path", {
      d: "M15 5h4v14h-4z"
    }))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: 32,
        fontWeight: 700,
        color: stat.color
      }
    }, stat.value), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        marginTop: 8,
        fontSize: 14,
        color: '#6b7280'
      }
    }, stat.label)))), /*#__PURE__*/React__default.default.createElement(DashboardCharts, {
      payload: data
    }), /*#__PURE__*/React__default.default.createElement(SellerMapPanel, {
      payload: {
        stats: data.stats,
        sellers: data.map.sellers,
        noLocation: data.map.noLocation
      }
    }), /*#__PURE__*/React__default.default.createElement("section", {
      style: {
        ...cardStyle,
        padding: 20
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: sectionHeaderStyle
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("h2", {
      style: sectionTitleStyle
    }, "Recent activity feed"), /*#__PURE__*/React__default.default.createElement("p", {
      style: sectionSubtitleStyle
    }, "Last 10 audit entries across seller reviews, upstream decisions, and session actions."))), /*#__PURE__*/React__default.default.createElement("div", null, data.recentActivity.map(activity => {
      const actionColor = activity.action === 'seller.approved' ? '#10b981' : activity.action === 'seller.rejected' ? '#ef4444' : activity.action === 'seller.submitted' ? '#3b82f6' : '#8b5cf6';
      const actionLabel = activity.action.split('.').pop() ?? activity.action;
      return /*#__PURE__*/React__default.default.createElement("div", {
        key: activity.id,
        style: {
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          padding: '10px 0',
          borderBottom: '1px solid #e5e7eb'
        }
      }, /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: actionColor
        }
      }), /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          fontSize: 14
        }
      }, /*#__PURE__*/React__default.default.createElement("span", {
        style: {
          fontWeight: 600
        }
      }, activity.sellerName), /*#__PURE__*/React__default.default.createElement("span", {
        style: {
          color: '#6b7280'
        }
      }, " was ", actionLabel.replace('-', ' ')), /*#__PURE__*/React__default.default.createElement("span", {
        style: {
          color: '#9ca3af',
          marginLeft: 8
        }
      }, "by ", activity.actor)), /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          marginLeft: 'auto',
          color: '#9ca3af',
          fontSize: 12
        }
      }, /*#__PURE__*/React__default.default.createElement("div", null, timeAgo(activity.createdAt)), /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          marginTop: 2
        }
      }, formatDateTime(activity.createdAt))));
    }))));
  };

  const inputStyle = {
    width: '100%',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    padding: '10px 12px',
    fontSize: 13,
    color: '#1f2937',
    boxSizing: 'border-box'
  };
  const statusButtonStyle = active => ({
    borderRadius: 999,
    border: `1px solid ${active ? '#3b82f6' : '#d1d5db'}`,
    background: active ? '#3b82f6' : '#ffffff',
    color: active ? '#ffffff' : '#374151',
    fontWeight: 600,
    fontSize: 12,
    padding: '7px 12px',
    cursor: 'pointer'
  });
  const tableHeaderStyle = {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#6b7280',
    fontWeight: 600,
    padding: '12px 16px',
    textAlign: 'left',
    borderBottom: '1px solid #e5e7eb'
  };
  const tableCellStyle = {
    padding: '14px 16px',
    borderBottom: '1px solid #eef2f7',
    verticalAlign: 'top',
    fontSize: 13,
    color: '#1f2937'
  };
  const detailGridStyle = {
    display: 'grid',
    gap: 12
  };
  const detailLabelStyle = {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#9ca3af',
    fontWeight: 700
  };
  const detailValueStyle = {
    fontSize: 13,
    color: '#1f2937'
  };
  const getProfilePicUrl = seller => seller.upstream.profilePicUrl ?? null;
  const buildInitials = label => label.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('');
  const SellerDirectory = () => {
    const {
      data,
      loading,
      error
    } = usePageData('sellers');
    const [query, setQuery] = React.useState('');
    const [status, setStatus] = React.useState('all');
    const [selectedId, setSelectedId] = React.useState(null);
    const filtered = React.useMemo(() => {
      if (!data) {
        return [];
      }
      const normalizedQuery = query.trim().toLowerCase();
      return data.sellers.filter(seller => {
        if (status !== 'all' && seller.status !== status) {
          return false;
        }
        if (!normalizedQuery) {
          return true;
        }
        return [seller.sellerName, seller.businessName, seller.email, seller.phone, seller.gstOrEnrollmentId, seller.location.city, seller.location.state, seller.upstream.username ?? ''].join(' ').toLowerCase().includes(normalizedQuery);
      });
    }, [data, query, status]);
    const selectedSeller = filtered.find(seller => seller.id === selectedId) ?? data?.sellers.find(seller => seller.id === selectedId) ?? filtered[0] ?? null;
    const selectedDetail = selectedSeller ? data?.details[selectedSeller.id] ?? null : null;
    if (loading) {
      return /*#__PURE__*/React__default.default.createElement(LoadingState, {
        label: "Loading sellers..."
      });
    }
    if (error || !data) {
      return /*#__PURE__*/React__default.default.createElement(ErrorState, {
        message: error ?? 'Seller data is unavailable'
      });
    }
    return /*#__PURE__*/React__default.default.createElement("div", {
      style: pageStyle
    }, /*#__PURE__*/React__default.default.createElement("section", {
      style: {
        ...cardStyle,
        padding: 24
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: sectionHeaderStyle
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("h1", {
      style: {
        margin: 0,
        fontSize: 28,
        fontWeight: 700,
        color: '#1f2937'
      }
    }, "Sellers"), /*#__PURE__*/React__default.default.createElement("p", {
      style: {
        margin: '6px 0 0',
        color: '#6b7280',
        fontSize: 14
      }
    }, "Read-only seller directory powered by the upstream Zatch seller source.")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React__default.default.createElement(Badge, {
      label: `${data.stats.total} total`,
      background: "#dbeafe",
      color: "#1d4ed8"
    }), /*#__PURE__*/React__default.default.createElement(Badge, {
      label: `${data.stats.pending} pending`,
      background: "#fef3c7",
      color: "#92400e"
    }), /*#__PURE__*/React__default.default.createElement(Badge, {
      label: `${data.stats.approved} approved`,
      background: "#d1fae5",
      color: "#065f46"
    }), /*#__PURE__*/React__default.default.createElement(Badge, {
      label: `${data.stats.rejected} rejected`,
      background: "#fee2e2",
      color: "#991b1b"
    }))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(240px, 1fr) auto',
        gap: 12,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React__default.default.createElement("input", {
      value: query,
      onChange: event => setQuery(event.target.value),
      placeholder: "Search by name, business, email, GST, city, or username",
      style: inputStyle
    }), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        justifyContent: 'flex-end'
      }
    }, ['all', 'pending', 'approved', 'rejected'].map(value => /*#__PURE__*/React__default.default.createElement("button", {
      key: value,
      type: "button",
      onClick: () => setStatus(value),
      style: statusButtonStyle(status === value)
    }, value === 'all' ? 'All' : value.charAt(0).toUpperCase() + value.slice(1)))))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.35fr) minmax(360px, 1fr)',
        gap: 20,
        alignItems: 'start'
      }
    }, /*#__PURE__*/React__default.default.createElement("section", {
      style: {
        ...cardStyle,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: 20,
        borderBottom: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("h2", {
      style: sectionTitleStyle
    }, "Directory"), /*#__PURE__*/React__default.default.createElement("p", {
      style: sectionSubtitleStyle
    }, "Same seller queue style as the ops portal, with full upstream detail on selection.")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        overflowX: 'auto'
      }
    }, /*#__PURE__*/React__default.default.createElement("table", {
      style: {
        width: '100%',
        borderCollapse: 'collapse'
      }
    }, /*#__PURE__*/React__default.default.createElement("thead", {
      style: {
        background: '#f9fafb'
      }
    }, /*#__PURE__*/React__default.default.createElement("tr", null, /*#__PURE__*/React__default.default.createElement("th", {
      style: tableHeaderStyle
    }, "Seller"), /*#__PURE__*/React__default.default.createElement("th", {
      style: tableHeaderStyle
    }, "Contact"), /*#__PURE__*/React__default.default.createElement("th", {
      style: tableHeaderStyle
    }, "Location"), /*#__PURE__*/React__default.default.createElement("th", {
      style: tableHeaderStyle
    }, "Status"), /*#__PURE__*/React__default.default.createElement("th", {
      style: tableHeaderStyle
    }, "Received"))), /*#__PURE__*/React__default.default.createElement("tbody", null, filtered.map(seller => {
      const colors = statusColors[seller.status] ?? {
        fill: '#f59e0b',
        text: '#92400e'
      };
      return /*#__PURE__*/React__default.default.createElement("tr", {
        key: seller.id,
        onClick: () => setSelectedId(seller.id),
        style: {
          cursor: 'pointer',
          background: selectedSeller?.id === seller.id ? '#eff6ff' : '#ffffff'
        }
      }, /*#__PURE__*/React__default.default.createElement("td", {
        style: tableCellStyle
      }, /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start'
        }
      }, getProfilePicUrl(seller) ? /*#__PURE__*/React__default.default.createElement("img", {
        src: getProfilePicUrl(seller) ?? '',
        alt: seller.sellerName,
        style: {
          width: 42,
          height: 42,
          borderRadius: '50%',
          objectFit: 'cover'
        }
      }) : /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          width: 42,
          height: 42,
          borderRadius: '50%',
          background: '#dbeafe',
          color: '#1d4ed8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: 13,
          flexShrink: 0
        }
      }, buildInitials(seller.sellerName)), /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          fontWeight: 600
        }
      }, seller.sellerName), /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          color: '#6b7280',
          marginTop: 4
        }
      }, seller.businessName), /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          color: '#9ca3af',
          marginTop: 4,
          fontSize: 12
        }
      }, "@", seller.upstream.username ?? 'unknown', " \u2022 ", seller.email || 'No email')))), /*#__PURE__*/React__default.default.createElement("td", {
        style: tableCellStyle
      }, /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          fontWeight: 600
        }
      }, seller.phone || 'Unavailable'), /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          color: '#6b7280',
          marginTop: 4
        }
      }, seller.email || 'Unavailable')), /*#__PURE__*/React__default.default.createElement("td", {
        style: tableCellStyle
      }, /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          fontWeight: 600
        }
      }, [seller.location.city, seller.location.state].filter(Boolean).join(', ') || 'Location unavailable'), /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          color: '#6b7280',
          marginTop: 4,
          fontSize: 12
        }
      }, [seller.location.street, seller.location.pincode].filter(Boolean).join(' • '))), /*#__PURE__*/React__default.default.createElement("td", {
        style: tableCellStyle
      }, /*#__PURE__*/React__default.default.createElement(Badge, {
        label: seller.status,
        background: colors.fill === '#10b981' ? '#d1fae5' : colors.fill === '#ef4444' ? '#fee2e2' : '#fef3c7',
        color: colors.text
      }), /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          color: '#9ca3af',
          marginTop: 6,
          fontSize: 12
        }
      }, "Raw: ", seller.upstream.rawSellerStatus ?? seller.status)), /*#__PURE__*/React__default.default.createElement("td", {
        style: tableCellStyle
      }, /*#__PURE__*/React__default.default.createElement("div", null, formatDateTime(seller.receivedAt)), /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          color: '#9ca3af',
          marginTop: 4,
          fontSize: 12
        }
      }, "Updated ", formatDateTime(seller.updatedAt))));
    }), filtered.length === 0 ? /*#__PURE__*/React__default.default.createElement("tr", null, /*#__PURE__*/React__default.default.createElement("td", {
      colSpan: 5,
      style: {
        ...tableCellStyle,
        color: '#6b7280',
        textAlign: 'center',
        padding: 28
      }
    }, "No sellers matched the current filters.")) : null)))), /*#__PURE__*/React__default.default.createElement("aside", {
      style: {
        ...cardStyle,
        padding: 20,
        position: 'sticky',
        top: 24
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: sectionHeaderStyle
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("h2", {
      style: sectionTitleStyle
    }, "Seller Details"), /*#__PURE__*/React__default.default.createElement("p", {
      style: sectionSubtitleStyle
    }, "Read-only upstream snapshot for super admin review."))), selectedSeller ? /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'grid',
        gap: 18
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        gap: 12,
        alignItems: 'center'
      }
    }, getProfilePicUrl(selectedSeller) ? /*#__PURE__*/React__default.default.createElement("img", {
      src: getProfilePicUrl(selectedSeller) ?? '',
      alt: selectedSeller.sellerName,
      style: {
        width: 52,
        height: 52,
        borderRadius: '50%',
        objectFit: 'cover'
      }
    }) : /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        width: 52,
        height: 52,
        borderRadius: '50%',
        background: '#dbeafe',
        color: '#1d4ed8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700
      }
    }, buildInitials(selectedSeller.sellerName)), /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: 18,
        fontWeight: 700,
        color: '#1f2937'
      }
    }, selectedSeller.sellerName), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        color: '#6b7280',
        marginTop: 4
      }
    }, selectedSeller.businessName))), /*#__PURE__*/React__default.default.createElement("div", {
      style: detailGridStyle
    }, [['Username', selectedSeller.upstream.username ?? 'Unknown'], ['Email', selectedSeller.email || 'Unavailable'], ['Phone', selectedSeller.phone || 'Unavailable'], ['GST / Enrollment', selectedSeller.gstOrEnrollmentId || 'Unavailable'], ['Shipping Method', selectedSeller.upstream.shippingMethod ?? 'Unavailable'], ['Documents', `${selectedSeller.documentsCount}`], ['Address', [selectedSeller.location.street, selectedSeller.location.city, selectedSeller.location.state, selectedSeller.location.pincode].filter(Boolean).join(', ') || 'Unavailable']].map(([label, value]) => /*#__PURE__*/React__default.default.createElement("div", {
      key: label,
      style: {
        display: 'grid',
        gap: 4
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: detailLabelStyle
    }, label), /*#__PURE__*/React__default.default.createElement("div", {
      style: detailValueStyle
    }, value)))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        paddingTop: 14,
        borderTop: '1px solid #e5e7eb',
        display: 'grid',
        gap: 8
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12
      }
    }, /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        color: '#6b7280',
        fontSize: 12
      }
    }, "Current status"), /*#__PURE__*/React__default.default.createElement(Badge, {
      label: selectedSeller.status,
      background: selectedSeller.status === 'approved' ? '#d1fae5' : selectedSeller.status === 'rejected' ? '#fee2e2' : '#fef3c7',
      color: selectedSeller.status === 'approved' ? '#065f46' : selectedSeller.status === 'rejected' ? '#991b1b' : '#92400e'
    })), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        color: '#6b7280',
        fontSize: 12
      }
    }, "Received ", formatDateTime(selectedSeller.receivedAt)), selectedSeller.lastStatusAt ? /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        color: '#6b7280',
        fontSize: 12
      }
    }, "Last status update ", formatDateTime(selectedSeller.lastStatusAt)) : null, selectedSeller.lastStatusNote ? /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        background: '#f8fafc',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 12,
        color: '#475569',
        fontSize: 12
      }
    }, selectedSeller.lastStatusNote) : null), selectedDetail ? /*#__PURE__*/React__default.default.createElement(React__default.default.Fragment, null, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        paddingTop: 14,
        borderTop: '1px solid #e5e7eb',
        display: 'grid',
        gap: 12
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: detailLabelStyle
    }, "Seller Profile"), /*#__PURE__*/React__default.default.createElement("div", {
      style: detailGridStyle
    }, [['Business Name', selectedDetail.sellerProfile.businessName || 'Unavailable'], ['Shipping Method', selectedDetail.sellerProfile.shippingMethod || 'Unavailable'], ['T&C Accepted', selectedDetail.sellerProfile.tcAccepted ? 'Yes' : 'No'], ['Billing Address', selectedDetail.sellerProfile.address.billingAddress || 'Unavailable'], ['Pickup Address', selectedDetail.sellerProfile.address.pickupAddress || 'Unavailable'], ['Pincode', selectedDetail.sellerProfile.address.pinCode || 'Unavailable'], ['State', selectedDetail.sellerProfile.address.state || 'Unavailable']].map(([label, value]) => /*#__PURE__*/React__default.default.createElement("div", {
      key: label,
      style: {
        display: 'grid',
        gap: 4
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: detailLabelStyle
    }, label), /*#__PURE__*/React__default.default.createElement("div", {
      style: detailValueStyle
    }, value))))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        paddingTop: 14,
        borderTop: '1px solid #e5e7eb',
        display: 'grid',
        gap: 12
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: detailLabelStyle
    }, "Bank Details"), /*#__PURE__*/React__default.default.createElement("div", {
      style: detailGridStyle
    }, [['Account Holder', selectedDetail.sellerProfile.bankDetails.accountHolderName || 'Unavailable'], ['Account Number', selectedDetail.sellerProfile.bankDetails.accountNumber || 'Unavailable'], ['Bank', selectedDetail.sellerProfile.bankDetails.bankName || 'Unavailable'], ['IFSC', selectedDetail.sellerProfile.bankDetails.ifscCode || 'Unavailable'], ['UPI', selectedDetail.sellerProfile.bankDetails.upiId || 'Unavailable']].map(([label, value]) => /*#__PURE__*/React__default.default.createElement("div", {
      key: label,
      style: {
        display: 'grid',
        gap: 4
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: detailLabelStyle
    }, label), /*#__PURE__*/React__default.default.createElement("div", {
      style: detailValueStyle
    }, value))))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        paddingTop: 14,
        borderTop: '1px solid #e5e7eb',
        display: 'grid',
        gap: 12
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: detailLabelStyle
    }, "Commerce Snapshot"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 12
      }
    }, [['Followers', selectedDetail.followerCount], ['Reviews', selectedDetail.reviewsCount], ['Products Sold', selectedDetail.productsSoldCount], ['Rating', selectedDetail.customerRating], ['Saved Products', selectedDetail.savedProducts.length], ['Selling Products', selectedDetail.sellingProducts.length], ['Uploaded Bits', selectedDetail.uploadedBits.length], ['Saved Bits', selectedDetail.savedBits.length]].map(([label, value]) => /*#__PURE__*/React__default.default.createElement("div", {
      key: label,
      style: {
        ...cardStyle,
        padding: 12,
        boxShadow: 'none'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: detailLabelStyle
    }, label), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        ...detailValueStyle,
        marginTop: 6,
        fontSize: 18,
        fontWeight: 700
      }
    }, value))))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        paddingTop: 14,
        borderTop: '1px solid #e5e7eb',
        display: 'grid',
        gap: 12
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: detailLabelStyle
    }, "Documents"), selectedDetail.sellerProfile.documents.length > 0 ? /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'grid',
        gap: 8
      }
    }, selectedDetail.sellerProfile.documents.map(document => /*#__PURE__*/React__default.default.createElement("a", {
      key: `${document.publicId}-${document.type}`,
      href: document.url,
      target: "_blank",
      rel: "noreferrer",
      style: {
        textDecoration: 'none',
        color: '#2563eb',
        fontSize: 13,
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 10,
        background: '#f8fafc'
      }
    }, document.type, " \u2022 Open document"))) : /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        color: '#6b7280',
        fontSize: 13
      }
    }, "No seller documents were returned by the upstream API.")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        paddingTop: 14,
        borderTop: '1px solid #e5e7eb',
        display: 'grid',
        gap: 12
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: detailLabelStyle
    }, "Products & Activity"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'grid',
        gap: 8
      }
    }, selectedDetail.sellingProducts.slice(0, 5).map(product => /*#__PURE__*/React__default.default.createElement("div", {
      key: `selling-${product.id}`,
      style: {
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 10
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 13
      }
    }, product.name), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        color: '#6b7280',
        fontSize: 12,
        marginTop: 4
      }
    }, product.category, " \u2022 Rs. ", product.discountedPrice ?? product.price))), selectedDetail.sellingProducts.length === 0 ? /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        color: '#6b7280',
        fontSize: 13
      }
    }, "No selling products available.") : null)), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        paddingTop: 14,
        borderTop: '1px solid #e5e7eb',
        display: 'grid',
        gap: 12
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: detailLabelStyle
    }, "Bargains"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'grid',
        gap: 8
      }
    }, selectedDetail.bargainsWithSeller.slice(0, 5).map(bargain => /*#__PURE__*/React__default.default.createElement("div", {
      key: bargain.id,
      style: {
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 10
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 13
      }
    }, bargain.productName), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        color: '#6b7280',
        fontSize: 12,
        marginTop: 4
      }
    }, bargain.statusLabel, " \u2022 Rs. ", bargain.currentPrice, " \u2022 ", bargain.role))), selectedDetail.bargainsWithSeller.length === 0 ? /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        color: '#6b7280',
        fontSize: 13
      }
    }, "No bargains available.") : null))) : null) : /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        color: '#6b7280',
        fontSize: 13
      }
    }, "Select a seller to inspect their upstream details."))));
  };

  const AnalyticsCharts = ({
    payload
  }) => {
    const chartConstructor = useChartJs();
    const statesCanvasRef = React.useRef(null);
    const approvalCanvasRef = React.useRef(null);
    const hoursCanvasRef = React.useRef(null);
    React.useEffect(() => {
      if (!chartConstructor || !statesCanvasRef.current || !approvalCanvasRef.current || !hoursCanvasRef.current) {
        return;
      }
      const stateContext = statesCanvasRef.current.getContext('2d');
      const approvalContext = approvalCanvasRef.current.getContext('2d');
      const hoursContext = hoursCanvasRef.current.getContext('2d');
      if (!stateContext || !approvalContext || !hoursContext) {
        return;
      }
      const statesChart = new chartConstructor(stateContext, {
        type: 'bar',
        data: {
          labels: payload.topStates.map(item => item.label),
          datasets: [{
            data: payload.topStates.map(item => item.count),
            backgroundColor: '#3b82f6',
            borderRadius: 6
          }]
        },
        options: {
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
      const approvalChart = new chartConstructor(approvalContext, {
        type: 'line',
        data: {
          labels: payload.approvalRate.map(item => item.label),
          datasets: [{
            label: 'Submitted',
            data: payload.approvalRate.map(item => item.submitted),
            borderColor: '#3b82f6',
            backgroundColor: '#3b82f6',
            tension: 0.35
          }, {
            label: 'Approved',
            data: payload.approvalRate.map(item => item.approved),
            borderColor: '#10b981',
            backgroundColor: '#10b981',
            tension: 0.35
          }]
        },
        options: {
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
      const hoursChart = new chartConstructor(hoursContext, {
        type: 'bar',
        data: {
          labels: payload.busiestHours.map(item => item.label),
          datasets: [{
            data: payload.busiestHours.map(item => item.count),
            backgroundColor: '#f59e0b',
            borderRadius: 4
          }]
        },
        options: {
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
      return () => {
        statesChart.destroy();
        approvalChart.destroy();
        hoursChart.destroy();
      };
    }, [chartConstructor, payload]);
    return /*#__PURE__*/React__default.default.createElement(React__default.default.Fragment, null, /*#__PURE__*/React__default.default.createElement("section", {
      style: {
        ...cardStyle,
        padding: 20
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: sectionHeaderStyle
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("h2", {
      style: sectionTitleStyle
    }, "Top states by seller count"), /*#__PURE__*/React__default.default.createElement("p", {
      style: sectionSubtitleStyle
    }, "Seller concentration by state from available location metadata."))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        height: 280
      }
    }, /*#__PURE__*/React__default.default.createElement("canvas", {
      ref: statesCanvasRef
    }))), /*#__PURE__*/React__default.default.createElement("section", {
      style: {
        ...cardStyle,
        padding: 20
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: sectionHeaderStyle
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("h2", {
      style: sectionTitleStyle
    }, "Approval rate over time"), /*#__PURE__*/React__default.default.createElement("p", {
      style: sectionSubtitleStyle
    }, "Submitted vs approved sellers across the last 12 months."))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        height: 320
      }
    }, /*#__PURE__*/React__default.default.createElement("canvas", {
      ref: approvalCanvasRef
    }))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'grid',
        gap: 20,
        gridTemplateColumns: '320px 1fr'
      }
    }, /*#__PURE__*/React__default.default.createElement("section", {
      style: {
        ...cardStyle,
        padding: 20
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: sectionHeaderStyle
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("h2", {
      style: sectionTitleStyle
    }, "Average time to action"), /*#__PURE__*/React__default.default.createElement("p", {
      style: sectionSubtitleStyle
    }, "Time from submission to first approval or rejection."))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: 34,
        fontWeight: 700,
        color: '#1f2937'
      }
    }, payload.averageActionHours === null ? '—' : `${payload.averageActionHours.toFixed(1)}h`)), /*#__PURE__*/React__default.default.createElement("section", {
      style: {
        ...cardStyle,
        padding: 20
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: sectionHeaderStyle
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("h2", {
      style: sectionTitleStyle
    }, "Rejection reasons"), /*#__PURE__*/React__default.default.createElement("p", {
      style: sectionSubtitleStyle
    }, "Most common words extracted from rejection notes."))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10
      }
    }, payload.rejectionWords.map(item => /*#__PURE__*/React__default.default.createElement("span", {
      key: item.word,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        background: '#eef2ff',
        color: '#4338ca',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600
      }
    }, item.word, /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        opacity: 0.75
      }
    }, item.count))), payload.rejectionWords.length === 0 ? /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        color: '#6b7280',
        fontSize: 13
      }
    }, "No rejection notes available yet.") : null))), /*#__PURE__*/React__default.default.createElement("section", {
      style: {
        ...cardStyle,
        padding: 20
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: sectionHeaderStyle
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("h2", {
      style: sectionTitleStyle
    }, "Busiest submission hours"), /*#__PURE__*/React__default.default.createElement("p", {
      style: sectionSubtitleStyle
    }, "What time of day sellers submit most often."))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        height: 280
      }
    }, /*#__PURE__*/React__default.default.createElement("canvas", {
      ref: hoursCanvasRef
    }))));
  };
  const SellerAnalytics = () => {
    const {
      data,
      loading,
      error
    } = usePageData('seller-analytics');
    const statPills = React.useMemo(() => data ? [{
      label: 'Total',
      value: data.stats.total,
      color: '#3b82f6',
      bg: '#dbeafe'
    }, {
      label: 'Pending',
      value: data.stats.pending,
      color: '#f59e0b',
      bg: '#fef3c7'
    }, {
      label: 'Approved',
      value: data.stats.approved,
      color: '#10b981',
      bg: '#d1fae5'
    }, {
      label: 'Rejected',
      value: data.stats.rejected,
      color: '#ef4444',
      bg: '#fee2e2'
    }] : [], [data]);
    if (loading) {
      return /*#__PURE__*/React__default.default.createElement(LoadingState, {
        label: "Loading analytics..."
      });
    }
    if (error || !data) {
      return /*#__PURE__*/React__default.default.createElement(ErrorState, {
        message: error ?? 'Analytics data is unavailable'
      });
    }
    return /*#__PURE__*/React__default.default.createElement("div", {
      style: pageStyle
    }, /*#__PURE__*/React__default.default.createElement("section", {
      style: {
        ...cardStyle,
        padding: 24
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: sectionHeaderStyle
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("h1", {
      style: {
        margin: 0,
        fontSize: 28,
        fontWeight: 700,
        color: '#1f2937'
      }
    }, "Seller Analytics"), /*#__PURE__*/React__default.default.createElement("p", {
      style: {
        margin: '6px 0 0',
        color: '#6b7280',
        fontSize: 14
      }
    }, "Operational trends across seller account volume, approvals, and review behavior."))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10
      }
    }, statPills.map(item => /*#__PURE__*/React__default.default.createElement("span", {
      key: item.label,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        borderRadius: 999,
        background: item.bg,
        color: item.color,
        fontWeight: 700,
        fontSize: 13
      }
    }, item.label, ": ", item.value)))), /*#__PURE__*/React__default.default.createElement(AnalyticsCharts, {
      payload: data
    }));
  };

  const isInRange = (value, fromDate, toDate) => {
    const timestamp = new Date(value).getTime();
    if (fromDate) {
      const fromTimestamp = new Date(`${fromDate}T00:00:00`).getTime();
      if (timestamp < fromTimestamp) {
        return false;
      }
    }
    if (toDate) {
      const toTimestamp = new Date(`${toDate}T23:59:59`).getTime();
      if (timestamp > toTimestamp) {
        return false;
      }
    }
    return true;
  };
  const AuditTimeline = () => {
    const {
      data,
      loading,
      error
    } = usePageData('audit-timeline');
    const [actionFilter, setActionFilter] = React.useState('all');
    const [adminFilter, setAdminFilter] = React.useState('all');
    const [fromDate, setFromDate] = React.useState('');
    const [toDate, setToDate] = React.useState('');
    const [page, setPage] = React.useState(1);
    const pageSize = 25;
    const filteredLogs = React.useMemo(() => {
      if (!data) {
        return [];
      }
      return data.logs.filter(log => {
        const matchesAction = actionFilter === 'all' || log.action === actionFilter;
        const matchesAdmin = adminFilter === 'all' || log.actor === adminFilter;
        const matchesDate = isInRange(log.createdAt, fromDate, toDate);
        return matchesAction && matchesAdmin && matchesDate;
      });
    }, [actionFilter, adminFilter, data, fromDate, toDate]);
    const pagedLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
    if (loading) {
      return /*#__PURE__*/React__default.default.createElement(LoadingState, {
        label: "Loading audit timeline..."
      });
    }
    if (error || !data) {
      return /*#__PURE__*/React__default.default.createElement(ErrorState, {
        message: error ?? 'Audit timeline data is unavailable'
      });
    }
    let lastDateLabel = '';
    return /*#__PURE__*/React__default.default.createElement("div", {
      style: pageStyle
    }, /*#__PURE__*/React__default.default.createElement("section", {
      style: {
        ...cardStyle,
        padding: 24
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: sectionHeaderStyle
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("h1", {
      style: {
        margin: 0,
        fontSize: 28,
        fontWeight: 700,
        color: '#1f2937'
      }
    }, "Audit Timeline"), /*#__PURE__*/React__default.default.createElement("p", {
      style: {
        margin: '6px 0 0',
        color: '#6b7280',
        fontSize: 14
      }
    }, "Visual timeline of audit events across sellers and admin sessions."))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'grid',
        gap: 12,
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))'
      }
    }, /*#__PURE__*/React__default.default.createElement("select", {
      value: actionFilter,
      onChange: event => {
        setActionFilter(event.target.value);
        setPage(1);
      },
      style: {
        borderRadius: 8,
        border: '1px solid #e5e7eb',
        padding: '10px 12px'
      }
    }, /*#__PURE__*/React__default.default.createElement("option", {
      value: "all"
    }, "All actions"), data.actionOptions.map(action => /*#__PURE__*/React__default.default.createElement("option", {
      key: action,
      value: action
    }, action))), /*#__PURE__*/React__default.default.createElement("select", {
      value: adminFilter,
      onChange: event => {
        setAdminFilter(event.target.value);
        setPage(1);
      },
      style: {
        borderRadius: 8,
        border: '1px solid #e5e7eb',
        padding: '10px 12px'
      }
    }, /*#__PURE__*/React__default.default.createElement("option", {
      value: "all"
    }, "All admins"), data.adminOptions.map(admin => /*#__PURE__*/React__default.default.createElement("option", {
      key: admin,
      value: admin
    }, admin))), /*#__PURE__*/React__default.default.createElement("input", {
      type: "date",
      value: fromDate,
      onChange: event => {
        setFromDate(event.target.value);
        setPage(1);
      },
      style: {
        borderRadius: 8,
        border: '1px solid #e5e7eb',
        padding: '10px 12px'
      }
    }), /*#__PURE__*/React__default.default.createElement("input", {
      type: "date",
      value: toDate,
      onChange: event => {
        setToDate(event.target.value);
        setPage(1);
      },
      style: {
        borderRadius: 8,
        border: '1px solid #e5e7eb',
        padding: '10px 12px'
      }
    }))), /*#__PURE__*/React__default.default.createElement("section", {
      style: {
        ...cardStyle,
        padding: 24
      }
    }, pagedLogs.map(log => {
      const dateLabel = new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).format(new Date(log.createdAt));
      const showDate = dateLabel !== lastDateLabel;
      lastDateLabel = dateLabel;
      return /*#__PURE__*/React__default.default.createElement(React__default.default.Fragment, {
        key: log.id
      }, showDate ? /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          margin: '12px 0 8px',
          color: '#6b7280',
          fontWeight: 700,
          fontSize: 12
        }
      }, dateLabel) : null, /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          display: 'grid',
          gridTemplateColumns: '18px minmax(0, 1fr) auto',
          gap: 12,
          alignItems: 'start',
          padding: '10px 0',
          borderBottom: '1px solid #e5e7eb'
        }
      }, /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          marginTop: 7,
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: actionColors[log.action] ?? '#8b5cf6'
        }
      }), /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          minWidth: 0
        }
      }, /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          color: '#1f2937',
          fontWeight: 600,
          fontSize: 14
        }
      }, log.action, /*#__PURE__*/React__default.default.createElement("span", {
        style: {
          color: '#6b7280',
          fontWeight: 400,
          marginLeft: 10
        }
      }, log.sellerName)), /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          marginTop: 4,
          color: '#6b7280',
          fontSize: 12
        }
      }, log.actor, " \xB7 ", log.targetCollection, " \xB7 ", log.targetId), log.note ? /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          marginTop: 6,
          color: '#374151',
          fontSize: 13
        }
      }, log.note) : null), /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          color: '#9ca3af',
          fontSize: 12
        }
      }, formatDateTime(log.createdAt))));
    }), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        color: '#6b7280',
        fontSize: 13
      }
    }, "Showing ", (page - 1) * pageSize + 1, "-", Math.min(page * pageSize, filteredLogs.length), " of ", filteredLogs.length), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      onClick: () => setPage(current => Math.max(1, current - 1)),
      disabled: page === 1,
      style: {
        borderRadius: 8,
        border: '1px solid #d1d5db',
        padding: '8px 12px',
        cursor: 'pointer'
      }
    }, "Previous"), /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      onClick: () => setPage(current => Math.min(totalPages, current + 1)),
      disabled: page === totalPages,
      style: {
        borderRadius: 8,
        border: '1px solid #d1d5db',
        padding: '8px 12px',
        cursor: 'pointer'
      }
    }, "Next")))));
  };

  const getPageTitle = pathname => {
    if (pathname === '/admin' || pathname === '/admin/') {
      return 'Dashboard';
    }
    if (pathname.includes('/pages/home')) {
      return 'Home';
    }
    if (pathname.includes('/pages/seller-map')) {
      return 'Seller Map';
    }
    if (pathname.includes('/pages/seller-analytics')) {
      return 'Analytics';
    }
    if (pathname.includes('/pages/audit-timeline')) {
      return 'Audit Timeline';
    }
    if (pathname.includes('/resources/AuditLog')) {
      return 'Audit Logs';
    }
    if (pathname.includes('/resources/AdminUser')) {
      return 'Admin Users';
    }
    return 'Admin';
  };
  const getPageSubtitle = pathname => {
    if (pathname === '/admin' || pathname === '/admin/') {
      return 'Zatch Admin overview';
    }
    if (pathname.includes('/show')) {
      return 'Record detail';
    }
    if (pathname.includes('/edit')) {
      return 'Edit view';
    }
    if (pathname.includes('/new')) {
      return 'Create new record';
    }
    return pathname.replace('/admin', '') || 'Admin';
  };
  const TopBar = ({
    toggleSidebar
  }) => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/admin';
    const session = typeof window !== 'undefined' ? window.REDUX_STATE?.session : null;
    const title = React.useMemo(() => getPageTitle(pathname), [pathname]);
    const subtitle = React.useMemo(() => getPageSubtitle(pathname), [pathname]);
    return /*#__PURE__*/React__default.default.createElement("header", {
      style: {
        height: 56,
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 30
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minWidth: 0
      }
    }, /*#__PURE__*/React__default.default.createElement("button", {
      type: "button",
      onClick: () => toggleSidebar?.(),
      style: {
        width: 36,
        height: 36,
        borderRadius: 8,
        border: '1px solid #e5e7eb',
        background: '#ffffff',
        color: '#6b7280',
        cursor: 'pointer'
      },
      "aria-label": "Toggle navigation"
    }, "\u2630"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 700,
        color: '#1f2937'
      }
    }, title), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 2,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, subtitle))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        textAlign: 'right'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: '#1f2937'
      }
    }, session?.email ?? 'Admin'), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: 12,
        color: '#9ca3af'
      }
    }, "super admin"))));
  };

  const SidebarBranding = ({
    branding
  }) => /*#__PURE__*/React__default.default.createElement("a", {
    href: "/admin",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '16px 20px',
      textDecoration: 'none',
      borderBottom: '1px solid #3c4f63',
      background: '#243040'
    }
  }, /*#__PURE__*/React__default.default.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 8,
      background: 'rgba(255,255,255,0.1)',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, branding.logo ? /*#__PURE__*/React__default.default.createElement("img", {
    src: branding.logo,
    alt: branding.companyName ?? 'Admin',
    style: {
      width: 40,
      height: 40,
      objectFit: 'cover',
      display: 'block'
    }
  }) : null), /*#__PURE__*/React__default.default.createElement("div", {
    style: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 600,
      letterSpacing: '-0.02em',
      lineHeight: 1.2
    }
  }, branding.companyName ?? 'Admin'));

  const linkBaseStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    minHeight: 40,
    borderRadius: 6,
    margin: '2px 8px',
    padding: '0 12px',
    color: '#c2cfd8',
    textDecoration: 'none',
    cursor: 'pointer',
    borderLeft: '3px solid transparent',
    fontSize: 14,
    fontWeight: 500
  };
  const getPageLabel = pageName => {
    if (pageName === 'seller-map') {
      return 'Seller Map';
    }
    if (pageName === 'seller-analytics') {
      return 'Seller Analytics';
    }
    if (pageName === 'audit-timeline') {
      return 'Audit Timeline';
    }
    return pageName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  };
  const HomeGlyph = () => /*#__PURE__*/React__default.default.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 14,
      display: 'inline-flex',
      justifyContent: 'center'
    }
  }, "\u2302");
  const DotGlyph = () => /*#__PURE__*/React__default.default.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 14,
      display: 'inline-flex',
      justifyContent: 'center'
    }
  }, "\u2022");
  const NavItem = ({
    label,
    href,
    active,
    glyph
  }) => /*#__PURE__*/React__default.default.createElement("a", {
    href: href,
    style: {
      ...linkBaseStyle,
      background: active ? '#3c4f63' : 'transparent',
      color: active ? '#ffffff' : '#c2cfd8',
      borderLeftColor: active ? '#3b82f6' : 'transparent'
    }
  }, glyph, /*#__PURE__*/React__default.default.createElement("span", null, label));
  const SidebarPages = ({
    pages
  }) => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/admin';
    const extraPages = (pages ?? []).filter(page => page.name !== 'home');
    return /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        marginTop: 16
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '0 20px 8px',
        color: '#9ca3af',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase'
      }
    }, "Pages"), /*#__PURE__*/React__default.default.createElement(NavItem, {
      label: "Home",
      href: "/admin",
      active: pathname === '/admin' || pathname === '/admin/',
      glyph: /*#__PURE__*/React__default.default.createElement(HomeGlyph, null)
    }), extraPages.map(page => /*#__PURE__*/React__default.default.createElement(NavItem, {
      key: page.name,
      label: getPageLabel(page.name),
      href: `/admin/pages/${page.name}`,
      active: pathname.includes(`/pages/${page.name}`),
      glyph: /*#__PURE__*/React__default.default.createElement(DotGlyph, null)
    })));
  };

  AdminJS.UserComponents = {};
  AdminJS.UserComponents.Dashboard = Dashboard;
  AdminJS.UserComponents.SellerDirectory = SellerDirectory;
  AdminJS.UserComponents.SellerMap = SellerMapPage;
  AdminJS.UserComponents.SellerAnalytics = SellerAnalytics;
  AdminJS.UserComponents.AuditTimeline = AuditTimeline;
  AdminJS.UserComponents.TopBar = TopBar;
  AdminJS.UserComponents.SidebarBranding = SidebarBranding;
  AdminJS.UserComponents.SidebarPages = SidebarPages;

})(React, AdminJS);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvYWRtaW5qcy9jb21wb25lbnRzL3NoYXJlZC50c3giLCIuLi9zcmMvYWRtaW5qcy9jb21wb25lbnRzL1NlbGxlck1hcC50c3giLCIuLi9zcmMvYWRtaW5qcy9jb21wb25lbnRzL0Rhc2hib2FyZC50c3giLCIuLi9zcmMvYWRtaW5qcy9jb21wb25lbnRzL1NlbGxlckRpcmVjdG9yeS50c3giLCIuLi9zcmMvYWRtaW5qcy9jb21wb25lbnRzL1NlbGxlckFuYWx5dGljcy50c3giLCIuLi9zcmMvYWRtaW5qcy9jb21wb25lbnRzL0F1ZGl0VGltZWxpbmUudHN4IiwiLi4vc3JjL2FkbWluanMvY29tcG9uZW50cy9Ub3BCYXIudHN4IiwiLi4vc3JjL2FkbWluanMvY29tcG9uZW50cy9TaWRlYmFyQnJhbmRpbmcudHN4IiwiLi4vc3JjL2FkbWluanMvY29tcG9uZW50cy9TaWRlYmFyUGFnZXMudHN4IiwiZW50cnkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBBcGlDbGllbnQgfSBmcm9tICdhZG1pbmpzJztcblxuZXhwb3J0IGNvbnN0IGFwaSA9IG5ldyBBcGlDbGllbnQoKTtcblxudHlwZSBTY3JpcHRMb2FkZXJXaW5kb3cgPSBXaW5kb3cgJiB7XG4gIENoYXJ0PzogQ2hhcnRDb25zdHJ1Y3RvcjtcbiAgTD86IExlYWZsZXROYW1lc3BhY2U7XG59O1xuXG5leHBvcnQgdHlwZSBDaGFydENvbmZpZ3VyYXRpb24gPSB7XG4gIHR5cGU6IHN0cmluZztcbiAgZGF0YToge1xuICAgIGxhYmVsczogc3RyaW5nW107XG4gICAgZGF0YXNldHM6IEFycmF5PFJlY29yZDxzdHJpbmcsIHVua25vd24+PjtcbiAgfTtcbiAgb3B0aW9ucz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufTtcblxuZXhwb3J0IHR5cGUgQ2hhcnRJbnN0YW5jZSA9IHtcbiAgZGVzdHJveTogKCkgPT4gdm9pZDtcbn07XG5cbmV4cG9ydCB0eXBlIENoYXJ0Q29uc3RydWN0b3IgPSBuZXcgKFxuICBjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIGNvbmZpZ3VyYXRpb246IENoYXJ0Q29uZmlndXJhdGlvbixcbikgPT4gQ2hhcnRJbnN0YW5jZTtcblxuZXhwb3J0IHR5cGUgTGVhZmxldENpcmNsZU1hcmtlciA9IHtcbiAgYWRkVG86IChtYXA6IExlYWZsZXRNYXApID0+IExlYWZsZXRDaXJjbGVNYXJrZXI7XG4gIGJpbmRQb3B1cDogKGh0bWw6IHN0cmluZykgPT4gTGVhZmxldENpcmNsZU1hcmtlcjtcbiAgc2V0U3R5bGU6IChzdHlsZTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IExlYWZsZXRDaXJjbGVNYXJrZXI7XG4gIG9uOiAoZXZlbnROYW1lOiBzdHJpbmcsIGhhbmRsZXI6ICguLi5hcmdzOiB1bmtub3duW10pID0+IHZvaWQpID0+IExlYWZsZXRDaXJjbGVNYXJrZXI7XG59O1xuXG5leHBvcnQgdHlwZSBMZWFmbGV0VGlsZUxheWVyID0ge1xuICBhZGRUbzogKG1hcDogTGVhZmxldE1hcCkgPT4gTGVhZmxldFRpbGVMYXllcjtcbn07XG5cbmV4cG9ydCB0eXBlIExlYWZsZXRMYXllckdyb3VwID0ge1xuICBhZGRMYXllcjogKGxheWVyOiB1bmtub3duKSA9PiB2b2lkO1xuICBhZGRUbzogKG1hcDogTGVhZmxldE1hcCkgPT4gTGVhZmxldExheWVyR3JvdXA7XG4gIGNsZWFyTGF5ZXJzOiAoKSA9PiB2b2lkO1xufTtcblxuZXhwb3J0IHR5cGUgTGVhZmxldEJvdW5kcyA9IHtcbiAgaXNWYWxpZDogKCkgPT4gYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIExlYWZsZXRNYXAgPSB7XG4gIHNldFZpZXc6IChjb29yZGluYXRlczogW251bWJlciwgbnVtYmVyXSwgem9vbTogbnVtYmVyKSA9PiBMZWFmbGV0TWFwO1xuICBmaXRCb3VuZHM6IChib3VuZHM6IExlYWZsZXRCb3VuZHMsIG9wdGlvbnM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gTGVhZmxldE1hcDtcbiAgZmx5VG86IChjb29yZGluYXRlczogW251bWJlciwgbnVtYmVyXSwgem9vbTogbnVtYmVyLCBvcHRpb25zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IExlYWZsZXRNYXA7XG4gIHJlbW92ZUxheWVyOiAobGF5ZXI6IHVua25vd24pID0+IHZvaWQ7XG4gIGFkZExheWVyOiAobGF5ZXI6IHVua25vd24pID0+IHZvaWQ7XG4gIG9uOiAoZXZlbnROYW1lOiBzdHJpbmcsIGhhbmRsZXI6ICguLi5hcmdzOiB1bmtub3duW10pID0+IHZvaWQpID0+IExlYWZsZXRNYXA7XG4gIHJlbW92ZTogKCkgPT4gdm9pZDtcbn07XG5cbmV4cG9ydCB0eXBlIExlYWZsZXROYW1lc3BhY2UgPSB7XG4gIG1hcDogKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBvcHRpb25zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IExlYWZsZXRNYXA7XG4gIHRpbGVMYXllcjogKHVybDogc3RyaW5nLCBvcHRpb25zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IExlYWZsZXRUaWxlTGF5ZXI7XG4gIGNpcmNsZU1hcmtlcjogKFxuICAgIGNvb3JkaW5hdGVzOiBbbnVtYmVyLCBudW1iZXJdLFxuICAgIG9wdGlvbnM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbiAgKSA9PiBMZWFmbGV0Q2lyY2xlTWFya2VyO1xuICBsYXRMbmdCb3VuZHM6IChjb29yZGluYXRlczogQXJyYXk8W251bWJlciwgbnVtYmVyXT4pID0+IExlYWZsZXRCb3VuZHM7XG4gIG1hcmtlckNsdXN0ZXJHcm91cD86ICgpID0+IExlYWZsZXRMYXllckdyb3VwO1xuICBoZWF0TGF5ZXI/OiAocG9pbnRzOiBBcnJheTxbbnVtYmVyLCBudW1iZXIsIG51bWJlcl0+LCBvcHRpb25zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHVua25vd247XG59O1xuXG5leHBvcnQgY29uc3QgY2FyZFN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0ge1xuICBiYWNrZ3JvdW5kOiAnI2ZmZmZmZicsXG4gIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJyxcbiAgYm9yZGVyUmFkaXVzOiA4LFxuICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjA4KScsXG59O1xuXG5leHBvcnQgY29uc3Qgc2VjdGlvbkhlYWRlclN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0ge1xuICBkaXNwbGF5OiAnZmxleCcsXG4gIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicsXG4gIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICBnYXA6IDE2LFxuICBtYXJnaW5Cb3R0b206IDE4LFxufTtcblxuZXhwb3J0IGNvbnN0IHNlY3Rpb25UaXRsZVN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0ge1xuICBtYXJnaW46IDAsXG4gIGZvbnRTaXplOiAxOCxcbiAgZm9udFdlaWdodDogNjAwLFxuICBjb2xvcjogJyMxZjI5MzcnLFxufTtcblxuZXhwb3J0IGNvbnN0IHNlY3Rpb25TdWJ0aXRsZVN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0ge1xuICBtYXJnaW46ICc2cHggMCAwJyxcbiAgZm9udFNpemU6IDEzLFxuICBjb2xvcjogJyM2YjcyODAnLFxufTtcblxuZXhwb3J0IGNvbnN0IHBhZ2VTdHlsZTogUmVhY3QuQ1NTUHJvcGVydGllcyA9IHtcbiAgZGlzcGxheTogJ2dyaWQnLFxuICBnYXA6IDIwLFxuICBwYWRkaW5nOiAyNCxcbiAgYmFja2dyb3VuZDogJyNmNGY2ZjknLFxuICBtaW5IZWlnaHQ6ICdjYWxjKDEwMHZoIC0gNTZweCknLFxufTtcblxuZXhwb3J0IGNvbnN0IHN0YXR1c0NvbG9yczogUmVjb3JkPHN0cmluZywgeyBmaWxsOiBzdHJpbmc7IHRleHQ6IHN0cmluZyB9PiA9IHtcbiAgcGVuZGluZzogeyBmaWxsOiAnI2Y1OWUwYicsIHRleHQ6ICcjOTI0MDBlJyB9LFxuICBhcHByb3ZlZDogeyBmaWxsOiAnIzEwYjk4MScsIHRleHQ6ICcjMDY1ZjQ2JyB9LFxuICByZWplY3RlZDogeyBmaWxsOiAnI2VmNDQ0NCcsIHRleHQ6ICcjOTkxYjFiJyB9LFxufTtcblxuZXhwb3J0IGNvbnN0IGFjdGlvbkNvbG9yczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgJ3NlbGxlci5hcHByb3ZlZCc6ICcjMTBiOTgxJyxcbiAgJ3NlbGxlci5yZWplY3RlZCc6ICcjZWY0NDQ0JyxcbiAgJ3NlbGxlci5zdWJtaXR0ZWQnOiAnIzNiODJmNicsXG4gICd1c2VyLmxvZ2luJzogJyM2YjcyODAnLFxuICAndXNlci5sb2dvdXQnOiAnIzZiNzI4MCcsXG4gICdhZG1pbi5vdmVycmlkZSc6ICcjOGI1Y2Y2Jyxcbn07XG5cbmV4cG9ydCBjb25zdCBmb3JtYXREYXRlVGltZSA9ICh2YWx1ZTogc3RyaW5nKTogc3RyaW5nID0+XG4gIG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KCdlbi1JTicsIHtcbiAgICBkYXk6ICcyLWRpZ2l0JyxcbiAgICBtb250aDogJ3Nob3J0JyxcbiAgICB5ZWFyOiAnbnVtZXJpYycsXG4gICAgaG91cjogJzItZGlnaXQnLFxuICAgIG1pbnV0ZTogJzItZGlnaXQnLFxuICAgIGhvdXIxMjogdHJ1ZSxcbiAgfSkuZm9ybWF0KG5ldyBEYXRlKHZhbHVlKSk7XG5cbmV4cG9ydCBjb25zdCBmb3JtYXREYXRlID0gKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcgPT5cbiAgbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQoJ2VuLUlOJywge1xuICAgIGRheTogJzItZGlnaXQnLFxuICAgIG1vbnRoOiAnc2hvcnQnLFxuICAgIHllYXI6ICdudW1lcmljJyxcbiAgfSkuZm9ybWF0KG5ldyBEYXRlKHZhbHVlKSk7XG5cbmV4cG9ydCBjb25zdCB0aW1lQWdvID0gKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICBjb25zdCBkaWZmTXMgPSBuZXcgRGF0ZSh2YWx1ZSkuZ2V0VGltZSgpIC0gRGF0ZS5ub3coKTtcbiAgY29uc3QgZGlmZk1pbnV0ZXMgPSBNYXRoLnJvdW5kKGRpZmZNcyAvICgxMDAwICogNjApKTtcbiAgY29uc3QgZm9ybWF0dGVyID0gbmV3IEludGwuUmVsYXRpdmVUaW1lRm9ybWF0KCdlbicsIHsgbnVtZXJpYzogJ2F1dG8nIH0pO1xuXG4gIGlmIChNYXRoLmFicyhkaWZmTWludXRlcykgPCA2MCkge1xuICAgIHJldHVybiBmb3JtYXR0ZXIuZm9ybWF0KGRpZmZNaW51dGVzLCAnbWludXRlJyk7XG4gIH1cblxuICBjb25zdCBkaWZmSG91cnMgPSBNYXRoLnJvdW5kKGRpZmZNaW51dGVzIC8gNjApO1xuICBpZiAoTWF0aC5hYnMoZGlmZkhvdXJzKSA8IDI0KSB7XG4gICAgcmV0dXJuIGZvcm1hdHRlci5mb3JtYXQoZGlmZkhvdXJzLCAnaG91cicpO1xuICB9XG5cbiAgY29uc3QgZGlmZkRheXMgPSBNYXRoLnJvdW5kKGRpZmZIb3VycyAvIDI0KTtcbiAgcmV0dXJuIGZvcm1hdHRlci5mb3JtYXQoZGlmZkRheXMsICdkYXknKTtcbn07XG5cbmV4cG9ydCBjb25zdCBsb2FkU2NyaXB0T25jZSA9IGFzeW5jIChpZDogc3RyaW5nLCBzcmM6IHN0cmluZyk6IFByb21pc2U8dm9pZD4gPT5cbiAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGV4aXN0aW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgIGlmIChleGlzdGluZykge1xuICAgICAgcmVzb2x2ZSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgIHNjcmlwdC5pZCA9IGlkO1xuICAgIHNjcmlwdC5zcmMgPSBzcmM7XG4gICAgc2NyaXB0LmFzeW5jID0gdHJ1ZTtcbiAgICBzY3JpcHQub25sb2FkID0gKCkgPT4gcmVzb2x2ZSgpO1xuICAgIHNjcmlwdC5vbmVycm9yID0gKCkgPT4gcmVqZWN0KG5ldyBFcnJvcihgRmFpbGVkIHRvIGxvYWQgc2NyaXB0OiAke3NyY31gKSk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICB9KTtcblxuZXhwb3J0IGNvbnN0IGxvYWRTdHlsZU9uY2UgPSAoaWQ6IHN0cmluZywgaHJlZjogc3RyaW5nKTogdm9pZCA9PiB7XG4gIGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpO1xuICBsaW5rLmlkID0gaWQ7XG4gIGxpbmsucmVsID0gJ3N0eWxlc2hlZXQnO1xuICBsaW5rLmhyZWYgPSBocmVmO1xuICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGxpbmspO1xufTtcblxuZXhwb3J0IGNvbnN0IHVzZVBhZ2VEYXRhID0gPFQsPihwYWdlTmFtZTogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IFtkYXRhLCBzZXREYXRhXSA9IHVzZVN0YXRlPFQgfCBudWxsPihudWxsKTtcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSk7XG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbCk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBsZXQgYWN0aXZlID0gdHJ1ZTtcblxuICAgIGFwaVxuICAgICAgLmdldFBhZ2UoeyBwYWdlTmFtZSB9KVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmICghYWN0aXZlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc2V0RGF0YSgocmVzcG9uc2UuZGF0YSBhcyBUIHwgdW5kZWZpbmVkKSA/PyBudWxsKTtcbiAgICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChjYXVnaHRFcnJvcjogdW5rbm93bikgPT4ge1xuICAgICAgICBpZiAoIWFjdGl2ZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNldEVycm9yKGNhdWdodEVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBjYXVnaHRFcnJvci5tZXNzYWdlIDogJ0ZhaWxlZCB0byBsb2FkIHBhZ2UnKTtcbiAgICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgICB9KTtcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBhY3RpdmUgPSBmYWxzZTtcbiAgICB9O1xuICB9LCBbcGFnZU5hbWVdKTtcblxuICByZXR1cm4geyBkYXRhLCBsb2FkaW5nLCBlcnJvciB9O1xufTtcblxuZXhwb3J0IGNvbnN0IHVzZURhc2hib2FyZERhdGEgPSA8VCw+KCkgPT4ge1xuICBjb25zdCBbZGF0YSwgc2V0RGF0YV0gPSB1c2VTdGF0ZTxUIHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgbGV0IGFjdGl2ZSA9IHRydWU7XG5cbiAgICBhcGlcbiAgICAgIC5nZXREYXNoYm9hcmQoKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmICghYWN0aXZlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc2V0RGF0YSgocmVzcG9uc2UuZGF0YSBhcyBUIHwgdW5kZWZpbmVkKSA/PyBudWxsKTtcbiAgICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChjYXVnaHRFcnJvcjogdW5rbm93bikgPT4ge1xuICAgICAgICBpZiAoIWFjdGl2ZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNldEVycm9yKGNhdWdodEVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBjYXVnaHRFcnJvci5tZXNzYWdlIDogJ0ZhaWxlZCB0byBsb2FkIGRhc2hib2FyZCcpO1xuICAgICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGFjdGl2ZSA9IGZhbHNlO1xuICAgIH07XG4gIH0sIFtdKTtcblxuICByZXR1cm4geyBkYXRhLCBsb2FkaW5nLCBlcnJvciB9O1xufTtcblxuZXhwb3J0IGNvbnN0IExvYWRpbmdTdGF0ZSA9ICh7IGxhYmVsIH06IHsgbGFiZWw6IHN0cmluZyB9KSA9PiAoXG4gIDxkaXYgc3R5bGU9e3sgLi4uY2FyZFN0eWxlLCBwYWRkaW5nOiAyNCwgY29sb3I6ICcjNmI3MjgwJyB9fT57bGFiZWx9PC9kaXY+XG4pO1xuXG5leHBvcnQgY29uc3QgRXJyb3JTdGF0ZSA9ICh7IG1lc3NhZ2UgfTogeyBtZXNzYWdlOiBzdHJpbmcgfSkgPT4gKFxuICA8ZGl2IHN0eWxlPXt7IC4uLmNhcmRTdHlsZSwgcGFkZGluZzogMjQsIGNvbG9yOiAnI2I5MWMxYycgfX0+e21lc3NhZ2V9PC9kaXY+XG4pO1xuXG5leHBvcnQgY29uc3QgQmFkZ2UgPSAoeyBsYWJlbCwgYmFja2dyb3VuZCwgY29sb3IgfTogeyBsYWJlbDogc3RyaW5nOyBiYWNrZ3JvdW5kOiBzdHJpbmc7IGNvbG9yOiBzdHJpbmcgfSkgPT4gKFxuICA8c3BhblxuICAgIHN0eWxlPXt7XG4gICAgICBkaXNwbGF5OiAnaW5saW5lLWZsZXgnLFxuICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICBwYWRkaW5nOiAnM3B4IDEwcHgnLFxuICAgICAgYm9yZGVyUmFkaXVzOiA5OTksXG4gICAgICBiYWNrZ3JvdW5kLFxuICAgICAgY29sb3IsXG4gICAgICBmb250U2l6ZTogMTEsXG4gICAgICBmb250V2VpZ2h0OiA2MDAsXG4gICAgfX1cbiAgPlxuICAgIHtsYWJlbH1cbiAgPC9zcGFuPlxuKTtcblxuZXhwb3J0IGNvbnN0IHVzZUNoYXJ0SnMgPSAoKTogQ2hhcnRDb25zdHJ1Y3RvciB8IG51bGwgPT4ge1xuICBjb25zdCBbY2hhcnRDb25zdHJ1Y3Rvciwgc2V0Q2hhcnRDb25zdHJ1Y3Rvcl0gPSB1c2VTdGF0ZTxDaGFydENvbnN0cnVjdG9yIHwgbnVsbD4obnVsbCk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBsZXQgYWN0aXZlID0gdHJ1ZTtcblxuICAgIGxvYWRTY3JpcHRPbmNlKCdhZG1pbmpzLWNoYXJ0anMnLCAnaHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L25wbS9jaGFydC5qc0A0LjQuNy9kaXN0L2NoYXJ0LnVtZC5taW4uanMnKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICBjb25zdCBjaGFydCA9ICh3aW5kb3cgYXMgU2NyaXB0TG9hZGVyV2luZG93KS5DaGFydCA/PyBudWxsO1xuICAgICAgICBpZiAoYWN0aXZlICYmIGNoYXJ0KSB7XG4gICAgICAgICAgc2V0Q2hhcnRDb25zdHJ1Y3RvcigoKSA9PiBjaGFydCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICBpZiAoYWN0aXZlKSB7XG4gICAgICAgICAgc2V0Q2hhcnRDb25zdHJ1Y3RvcihudWxsKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgYWN0aXZlID0gZmFsc2U7XG4gICAgfTtcbiAgfSwgW10pO1xuXG4gIHJldHVybiBjaGFydENvbnN0cnVjdG9yO1xufTtcblxuZXhwb3J0IGNvbnN0IHVzZUxlYWZsZXQgPSAoKTogTGVhZmxldE5hbWVzcGFjZSB8IG51bGwgPT4ge1xuICBjb25zdCBbbGVhZmxldCwgc2V0TGVhZmxldF0gPSB1c2VTdGF0ZTxMZWFmbGV0TmFtZXNwYWNlIHwgbnVsbD4obnVsbCk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBsZXQgYWN0aXZlID0gdHJ1ZTtcblxuICAgIGxvYWRTdHlsZU9uY2UoJ2xlYWZsZXQtc3R5bGUnLCAnaHR0cHM6Ly91bnBrZy5jb20vbGVhZmxldEAxLjkuNC9kaXN0L2xlYWZsZXQuY3NzJyk7XG4gICAgbG9hZFN0eWxlT25jZShcbiAgICAgICdsZWFmbGV0LWNsdXN0ZXItc3R5bGUnLFxuICAgICAgJ2h0dHBzOi8vdW5wa2cuY29tL2xlYWZsZXQubWFya2VyY2x1c3RlckAxLjUuMy9kaXN0L01hcmtlckNsdXN0ZXIuY3NzJyxcbiAgICApO1xuICAgIGxvYWRTdHlsZU9uY2UoXG4gICAgICAnbGVhZmxldC1jbHVzdGVyLWRlZmF1bHQtc3R5bGUnLFxuICAgICAgJ2h0dHBzOi8vdW5wa2cuY29tL2xlYWZsZXQubWFya2VyY2x1c3RlckAxLjUuMy9kaXN0L01hcmtlckNsdXN0ZXIuRGVmYXVsdC5jc3MnLFxuICAgICk7XG5cbiAgICBQcm9taXNlLmFsbChbXG4gICAgICBsb2FkU2NyaXB0T25jZSgnbGVhZmxldC1zY3JpcHQnLCAnaHR0cHM6Ly91bnBrZy5jb20vbGVhZmxldEAxLjkuNC9kaXN0L2xlYWZsZXQuanMnKSxcbiAgICAgIGxvYWRTY3JpcHRPbmNlKFxuICAgICAgICAnbGVhZmxldC1jbHVzdGVyLXNjcmlwdCcsXG4gICAgICAgICdodHRwczovL3VucGtnLmNvbS9sZWFmbGV0Lm1hcmtlcmNsdXN0ZXJAMS41LjMvZGlzdC9sZWFmbGV0Lm1hcmtlcmNsdXN0ZXIuanMnLFxuICAgICAgKSxcbiAgICAgIGxvYWRTY3JpcHRPbmNlKCdsZWFmbGV0LWhlYXQtc2NyaXB0JywgJ2h0dHBzOi8vdW5wa2cuY29tL2xlYWZsZXQuaGVhdC9kaXN0L2xlYWZsZXQtaGVhdC5qcycpLFxuICAgIF0pXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIGNvbnN0IGxvYWRlZExlYWZsZXQgPSAod2luZG93IGFzIFNjcmlwdExvYWRlcldpbmRvdykuTCA/PyBudWxsO1xuICAgICAgICBpZiAoYWN0aXZlICYmIGxvYWRlZExlYWZsZXQpIHtcbiAgICAgICAgICBzZXRMZWFmbGV0KGxvYWRlZExlYWZsZXQpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgaWYgKGFjdGl2ZSkge1xuICAgICAgICAgIHNldExlYWZsZXQobnVsbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGFjdGl2ZSA9IGZhbHNlO1xuICAgIH07XG4gIH0sIFtdKTtcblxuICByZXR1cm4gbGVhZmxldDtcbn07XG5cbmV4cG9ydCBjb25zdCB1c2VEYXRlTGFiZWwgPSAoKSA9PlxuICB1c2VNZW1vKFxuICAgICgpID0+XG4gICAgICBuZXcgSW50bC5EYXRlVGltZUZvcm1hdCgnZW4tSU4nLCB7XG4gICAgICAgIHdlZWtkYXk6ICdsb25nJyxcbiAgICAgICAgZGF5OiAnMi1kaWdpdCcsXG4gICAgICAgIG1vbnRoOiAnc2hvcnQnLFxuICAgICAgICB5ZWFyOiAnbnVtZXJpYycsXG4gICAgICB9KS5mb3JtYXQobmV3IERhdGUoKSksXG4gICAgW10sXG4gICk7XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgdHlwZSB7IE5vTG9jYXRpb25TZWxsZXJSZWNvcmQsIFNlbGxlck1hcFBheWxvYWQsIFNlbGxlck1hcFJlY29yZCB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7XG4gIEJhZGdlLFxuICBFcnJvclN0YXRlLFxuICBMb2FkaW5nU3RhdGUsXG4gIGNhcmRTdHlsZSxcbiAgZm9ybWF0RGF0ZSxcbiAgcGFnZVN0eWxlLFxuICBzZWN0aW9uSGVhZGVyU3R5bGUsXG4gIHNlY3Rpb25TdWJ0aXRsZVN0eWxlLFxuICBzZWN0aW9uVGl0bGVTdHlsZSxcbiAgc3RhdHVzQ29sb3JzLFxuICB1c2VMZWFmbGV0LFxuICB1c2VQYWdlRGF0YSxcbn0gZnJvbSAnLi9zaGFyZWQnO1xuXG50eXBlIFNlbGxlck1hcFBhbmVsUHJvcHMgPSB7XG4gIHBheWxvYWQ6IFNlbGxlck1hcFBheWxvYWQ7XG4gIHN0YW5kYWxvbmU/OiBib29sZWFuO1xufTtcblxudHlwZSBNYXBGaWx0ZXJzID0ge1xuICBzdGF0dXM6ICdhbGwnIHwgJ3BlbmRpbmcnIHwgJ2FwcHJvdmVkJyB8ICdyZWplY3RlZCc7XG4gIHN0YXRlczogc3RyaW5nW107XG4gIGNpdHk6IHN0cmluZztcbiAgcGluY29kZTogc3RyaW5nO1xuICBmcm9tOiBzdHJpbmc7XG4gIHRvOiBzdHJpbmc7XG59O1xuXG50eXBlIFNlbGxlck1hcExpa2VSZWNvcmQgPSBTZWxsZXJNYXBSZWNvcmQgfCBOb0xvY2F0aW9uU2VsbGVyUmVjb3JkO1xuXG5jb25zdCBkZWZhdWx0RmlsdGVyczogTWFwRmlsdGVycyA9IHtcbiAgc3RhdHVzOiAnYWxsJyxcbiAgc3RhdGVzOiBbXSxcbiAgY2l0eTogJycsXG4gIHBpbmNvZGU6ICcnLFxuICBmcm9tOiAnJyxcbiAgdG86ICcnLFxufTtcblxuY29uc3QgbGVnZW5kSXRlbVN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0ge1xuICBkaXNwbGF5OiAnZmxleCcsXG4gIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICBnYXA6IDEwLFxuICBmb250U2l6ZTogMTIsXG4gIGNvbG9yOiAnIzM3NDE1MScsXG59O1xuXG5jb25zdCBidXR0b25TdHlsZTogUmVhY3QuQ1NTUHJvcGVydGllcyA9IHtcbiAgYm9yZGVyUmFkaXVzOiA4LFxuICBib3JkZXI6ICcxcHggc29saWQgI2QxZDVkYicsXG4gIGJhY2tncm91bmQ6ICcjZmZmZmZmJyxcbiAgY29sb3I6ICcjMWYyOTM3JyxcbiAgZm9udFdlaWdodDogNjAwLFxuICBwYWRkaW5nOiAnOXB4IDEycHgnLFxuICBjdXJzb3I6ICdwb2ludGVyJyxcbn07XG5cbmNvbnN0IGlucHV0U3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7XG4gIHdpZHRoOiAnMTAwJScsXG4gIGJvcmRlclJhZGl1czogOCxcbiAgYm9yZGVyOiAnMXB4IHNvbGlkICNkMWQ1ZGInLFxuICBwYWRkaW5nOiAnMTBweCAxMnB4JyxcbiAgZm9udFNpemU6IDEzLFxuICBjb2xvcjogJyMxZjI5MzcnLFxuICBib3hTaXppbmc6ICdib3JkZXItYm94Jyxcbn07XG5cbmNvbnN0IGlzV2l0aGluRGF0ZVJhbmdlID0gKHJlY2VpdmVkQXQ6IHN0cmluZywgZnJvbTogc3RyaW5nLCB0bzogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKHJlY2VpdmVkQXQpLmdldFRpbWUoKTtcblxuICBpZiAoZnJvbSkge1xuICAgIGNvbnN0IGZyb21UaW1lc3RhbXAgPSBuZXcgRGF0ZShgJHtmcm9tfVQwMDowMDowMGApLmdldFRpbWUoKTtcbiAgICBpZiAodGltZXN0YW1wIDwgZnJvbVRpbWVzdGFtcCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0bykge1xuICAgIGNvbnN0IHRvVGltZXN0YW1wID0gbmV3IERhdGUoYCR7dG99VDIzOjU5OjU5YCkuZ2V0VGltZSgpO1xuICAgIGlmICh0aW1lc3RhbXAgPiB0b1RpbWVzdGFtcCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuY29uc3QgbWF0Y2hlc0Jhc2VGaWx0ZXJzID0gKFxuICBzZWxsZXI6IFNlbGxlck1hcExpa2VSZWNvcmQsXG4gIGZpbHRlcnM6IE9taXQ8TWFwRmlsdGVycywgJ2NpdHknPixcbik6IGJvb2xlYW4gPT4ge1xuICBpZiAoZmlsdGVycy5zdGF0dXMgIT09ICdhbGwnICYmIHNlbGxlci5zdGF0dXMgIT09IGZpbHRlcnMuc3RhdHVzKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGZpbHRlcnMuc3RhdGVzLmxlbmd0aCA+IDAgJiYgIWZpbHRlcnMuc3RhdGVzLmluY2x1ZGVzKHNlbGxlci5sb2NhdGlvbi5zdGF0ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoZmlsdGVycy5waW5jb2RlICYmIHNlbGxlci5sb2NhdGlvbi5waW5jb2RlICE9PSBmaWx0ZXJzLnBpbmNvZGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gaXNXaXRoaW5EYXRlUmFuZ2Uoc2VsbGVyLnJlY2VpdmVkQXQsIGZpbHRlcnMuZnJvbSwgZmlsdGVycy50byk7XG59O1xuXG5jb25zdCBtYXRjaGVzQ2l0eSA9IChzZWxsZXI6IFNlbGxlck1hcExpa2VSZWNvcmQsIGNpdHk6IHN0cmluZyk6IGJvb2xlYW4gPT5cbiAgY2l0eS50cmltKCkubGVuZ3RoID09PSAwIHx8XG4gIHNlbGxlci5sb2NhdGlvbi5jaXR5LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoY2l0eS50cmltKCkudG9Mb3dlckNhc2UoKSk7XG5cbmNvbnN0IGdyb3VwQnlTdGF0ZSA9IChzZWxsZXJzOiBTZWxsZXJNYXBSZWNvcmRbXSkgPT5cbiAgT2JqZWN0LmVudHJpZXMoXG4gICAgc2VsbGVycy5yZWR1Y2U8UmVjb3JkPHN0cmluZywgQXJyYXk8W251bWJlciwgbnVtYmVyXT4+PigoYWNjdW11bGF0b3IsIHNlbGxlcikgPT4ge1xuICAgICAgY29uc3Qga2V5ID0gc2VsbGVyLmxvY2F0aW9uLnN0YXRlIHx8ICdVbmtub3duJztcbiAgICAgIGFjY3VtdWxhdG9yW2tleV0gPz89IFtdO1xuICAgICAgYWNjdW11bGF0b3Jba2V5XS5wdXNoKFtzZWxsZXIubG9jYXRpb24ubGF0LCBzZWxsZXIubG9jYXRpb24ubG5nXSk7XG4gICAgICByZXR1cm4gYWNjdW11bGF0b3I7XG4gICAgfSwge30pLFxuICApLm1hcCgoW3N0YXRlLCBjb29yZGluYXRlc10pID0+IHtcbiAgICBjb25zdCB0b3RhbCA9IGNvb3JkaW5hdGVzLmxlbmd0aDtcbiAgICBjb25zdCBbbGF0LCBsbmddID0gY29vcmRpbmF0ZXMucmVkdWNlPFtudW1iZXIsIG51bWJlcl0+KFxuICAgICAgKHN1bSwgY29vcmRpbmF0ZSkgPT4gW3N1bVswXSArIGNvb3JkaW5hdGVbMF0sIHN1bVsxXSArIGNvb3JkaW5hdGVbMV1dLFxuICAgICAgWzAsIDBdLFxuICAgICk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgc3RhdGUsXG4gICAgICB0b3RhbCxcbiAgICAgIGNlbnRlcjogW2xhdCAvIHRvdGFsLCBsbmcgLyB0b3RhbF0gYXMgW251bWJlciwgbnVtYmVyXSxcbiAgICB9O1xuICB9KTtcblxuY29uc3QgYnVpbGRQb3B1cCA9IChzZWxsZXI6IFNlbGxlck1hcFJlY29yZCk6IHN0cmluZyA9PiB7XG4gIGNvbnN0IGJhZGdlID0gc3RhdHVzQ29sb3JzW3NlbGxlci5zdGF0dXNdID8/IHsgZmlsbDogJyNmNTllMGInLCB0ZXh0OiAnIzkyNDAwZScgfTtcblxuICByZXR1cm4gYFxuICAgIDxkaXYgc3R5bGU9XCJtaW4td2lkdGg6MjIwcHg7Zm9udC1mYW1pbHk6SW50ZXIsc2Fucy1zZXJpZlwiPlxuICAgICAgPGRpdiBzdHlsZT1cImZvbnQtd2VpZ2h0OjYwMDtjb2xvcjojMWYyOTM3XCI+JHtzZWxsZXIuYnVzaW5lc3NOYW1lfTwvZGl2PlxuICAgICAgPGRpdiBzdHlsZT1cIm1hcmdpbi10b3A6NHB4O2NvbG9yOiM2YjcyODBcIj4ke3NlbGxlci5zZWxsZXJOYW1lfTwvZGl2PlxuICAgICAgPGRpdiBzdHlsZT1cIm1hcmdpbi10b3A6OHB4O2NvbG9yOiMzNzQxNTFcIj5TdGF0dXM6IDxzcGFuIHN0eWxlPVwiY29sb3I6JHtiYWRnZS5maWxsfTtmb250LXdlaWdodDo2MDBcIj4ke3NlbGxlci5zdGF0dXN9PC9zcGFuPjwvZGl2PlxuICAgICAgPGRpdiBzdHlsZT1cIm1hcmdpbi10b3A6NHB4O2NvbG9yOiMzNzQxNTFcIj4ke3NlbGxlci5sb2NhdGlvbi5jaXR5fSwgJHtzZWxsZXIubG9jYXRpb24uc3RhdGV9ICR7c2VsbGVyLmxvY2F0aW9uLnBpbmNvZGV9PC9kaXY+XG4gICAgICA8ZGl2IHN0eWxlPVwibWFyZ2luLXRvcDo0cHg7Y29sb3I6IzM3NDE1MVwiPlJlY2VpdmVkOiAke2Zvcm1hdERhdGUoc2VsbGVyLnJlY2VpdmVkQXQpfTwvZGl2PlxuICAgICAgPGRpdiBzdHlsZT1cIm1hcmdpbi10b3A6OHB4O2Rpc3BsYXk6ZmxleDtnYXA6MTBweDtmbGV4LXdyYXA6d3JhcFwiPlxuICAgICAgICA8YSBocmVmPVwiI1wiIGRhdGEtZmlsdGVyLWNpdHk9XCIke3NlbGxlci5sb2NhdGlvbi5jaXR5fVwiIHN0eWxlPVwiY29sb3I6IzI1NjNlYjtmb250LXNpemU6MTFweDt0ZXh0LWRlY29yYXRpb246bm9uZVwiPkZpbHRlcjogJHtzZWxsZXIubG9jYXRpb24uY2l0eX08L2E+XG4gICAgICAgIDxhIGhyZWY9XCIjXCIgZGF0YS1maWx0ZXItc3RhdGU9XCIke3NlbGxlci5sb2NhdGlvbi5zdGF0ZX1cIiBzdHlsZT1cImNvbG9yOiMyNTYzZWI7Zm9udC1zaXplOjExcHg7dGV4dC1kZWNvcmF0aW9uOm5vbmVcIj5GaWx0ZXI6ICR7c2VsbGVyLmxvY2F0aW9uLnN0YXRlfTwvYT5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBzdHlsZT1cIm1hcmdpbi10b3A6MTBweDtjb2xvcjojNmI3MjgwO2ZvbnQtc2l6ZToxMXB4XCI+U2VsbGVyIElEOiAke3NlbGxlci5pZH08L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcbn07XG5cbmNvbnN0IFNlbGxlck1hcFBhbmVsID0gKHsgcGF5bG9hZCwgc3RhbmRhbG9uZSA9IGZhbHNlIH06IFNlbGxlck1hcFBhbmVsUHJvcHMpID0+IHtcbiAgY29uc3QgbGVhZmxldCA9IHVzZUxlYWZsZXQoKTtcbiAgY29uc3QgbWFwUmVmID0gdXNlUmVmPEhUTUxEaXZFbGVtZW50IHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IG1hcEluc3RhbmNlUmVmID0gdXNlUmVmPFJldHVyblR5cGU8Tm9uTnVsbGFibGU8dHlwZW9mIGxlYWZsZXQ+WydtYXAnXT4gfCBudWxsPihudWxsKTtcbiAgY29uc3QgW21vZGUsIHNldE1vZGVdID0gdXNlU3RhdGU8J21hcmtlcnMnIHwgJ2hlYXRtYXAnPignbWFya2VycycpO1xuICBjb25zdCBbZHJhZnRGaWx0ZXJzLCBzZXREcmFmdEZpbHRlcnNdID0gdXNlU3RhdGU8TWFwRmlsdGVycz4oZGVmYXVsdEZpbHRlcnMpO1xuICBjb25zdCBbYXBwbGllZEZpbHRlcnMsIHNldEFwcGxpZWRGaWx0ZXJzXSA9IHVzZVN0YXRlPE1hcEZpbHRlcnM+KGRlZmF1bHRGaWx0ZXJzKTtcbiAgY29uc3QgW3Nob3dOb0xvY2F0aW9uLCBzZXRTaG93Tm9Mb2NhdGlvbl0gPSB1c2VTdGF0ZShmYWxzZSk7XG5cbiAgY29uc3QgYWxsU2VsbGVyUmVjb3JkcyA9IHVzZU1lbW88QXJyYXk8U2VsbGVyTWFwTGlrZVJlY29yZD4+KFxuICAgICgpID0+IFsuLi5wYXlsb2FkLnNlbGxlcnMsIC4uLnBheWxvYWQubm9Mb2NhdGlvbl0sXG4gICAgW3BheWxvYWQubm9Mb2NhdGlvbiwgcGF5bG9hZC5zZWxsZXJzXSxcbiAgKTtcblxuICBjb25zdCBhdmFpbGFibGVTdGF0ZXMgPSB1c2VNZW1vKFxuICAgICgpID0+XG4gICAgICBbLi4ubmV3IFNldChhbGxTZWxsZXJSZWNvcmRzLm1hcCgoc2VsbGVyKSA9PiBzZWxsZXIubG9jYXRpb24uc3RhdGUpLmZpbHRlcihCb29sZWFuKSldLnNvcnQoKGxlZnQsIHJpZ2h0KSA9PlxuICAgICAgICBsZWZ0LmxvY2FsZUNvbXBhcmUocmlnaHQpLFxuICAgICAgKSxcbiAgICBbYWxsU2VsbGVyUmVjb3Jkc10sXG4gICk7XG5cbiAgY29uc3QgYmFzZU1hdGNoZWRNYXJrZXJzID0gdXNlTWVtbyhcbiAgICAoKSA9PlxuICAgICAgcGF5bG9hZC5zZWxsZXJzLmZpbHRlcigoc2VsbGVyKSA9PlxuICAgICAgICBtYXRjaGVzQmFzZUZpbHRlcnMoc2VsbGVyLCB7XG4gICAgICAgICAgc3RhdHVzOiBhcHBsaWVkRmlsdGVycy5zdGF0dXMsXG4gICAgICAgICAgc3RhdGVzOiBhcHBsaWVkRmlsdGVycy5zdGF0ZXMsXG4gICAgICAgICAgcGluY29kZTogYXBwbGllZEZpbHRlcnMucGluY29kZSxcbiAgICAgICAgICBmcm9tOiBhcHBsaWVkRmlsdGVycy5mcm9tLFxuICAgICAgICAgIHRvOiBhcHBsaWVkRmlsdGVycy50byxcbiAgICAgICAgfSksXG4gICAgICApLFxuICAgIFthcHBsaWVkRmlsdGVycy5mcm9tLCBhcHBsaWVkRmlsdGVycy5waW5jb2RlLCBhcHBsaWVkRmlsdGVycy5zdGF0ZXMsIGFwcGxpZWRGaWx0ZXJzLnN0YXR1cywgYXBwbGllZEZpbHRlcnMudG8sIHBheWxvYWQuc2VsbGVyc10sXG4gICk7XG5cbiAgY29uc3QgdmlzaWJsZU1hcmtlcnMgPSB1c2VNZW1vKFxuICAgICgpID0+IGJhc2VNYXRjaGVkTWFya2Vycy5maWx0ZXIoKHNlbGxlcikgPT4gbWF0Y2hlc0NpdHkoc2VsbGVyLCBkcmFmdEZpbHRlcnMuY2l0eSkpLFxuICAgIFtiYXNlTWF0Y2hlZE1hcmtlcnMsIGRyYWZ0RmlsdGVycy5jaXR5XSxcbiAgKTtcblxuICBjb25zdCB2aXNpYmxlTm9Mb2NhdGlvbiA9IHVzZU1lbW8oXG4gICAgKCkgPT5cbiAgICAgIHBheWxvYWQubm9Mb2NhdGlvbi5maWx0ZXIoXG4gICAgICAgIChzZWxsZXIpID0+XG4gICAgICAgICAgbWF0Y2hlc0Jhc2VGaWx0ZXJzKHNlbGxlciwge1xuICAgICAgICAgICAgc3RhdHVzOiBhcHBsaWVkRmlsdGVycy5zdGF0dXMsXG4gICAgICAgICAgICBzdGF0ZXM6IGFwcGxpZWRGaWx0ZXJzLnN0YXRlcyxcbiAgICAgICAgICAgIHBpbmNvZGU6IGFwcGxpZWRGaWx0ZXJzLnBpbmNvZGUsXG4gICAgICAgICAgICBmcm9tOiBhcHBsaWVkRmlsdGVycy5mcm9tLFxuICAgICAgICAgICAgdG86IGFwcGxpZWRGaWx0ZXJzLnRvLFxuICAgICAgICAgIH0pICYmIG1hdGNoZXNDaXR5KHNlbGxlciwgZHJhZnRGaWx0ZXJzLmNpdHkpLFxuICAgICAgKSxcbiAgICBbYXBwbGllZEZpbHRlcnMuZnJvbSwgYXBwbGllZEZpbHRlcnMucGluY29kZSwgYXBwbGllZEZpbHRlcnMuc3RhdGVzLCBhcHBsaWVkRmlsdGVycy5zdGF0dXMsIGFwcGxpZWRGaWx0ZXJzLnRvLCBkcmFmdEZpbHRlcnMuY2l0eSwgcGF5bG9hZC5ub0xvY2F0aW9uXSxcbiAgKTtcblxuICBjb25zdCB2aXNpYmxlQ291bnRzID0gdXNlTWVtbyhcbiAgICAoKSA9PiAoe1xuICAgICAgdG90YWw6IHZpc2libGVNYXJrZXJzLmxlbmd0aCArIHZpc2libGVOb0xvY2F0aW9uLmxlbmd0aCxcbiAgICAgIHBlbmRpbmc6XG4gICAgICAgIHZpc2libGVNYXJrZXJzLmZpbHRlcigoc2VsbGVyKSA9PiBzZWxsZXIuc3RhdHVzID09PSAncGVuZGluZycpLmxlbmd0aCArXG4gICAgICAgIHZpc2libGVOb0xvY2F0aW9uLmZpbHRlcigoc2VsbGVyKSA9PiBzZWxsZXIuc3RhdHVzID09PSAncGVuZGluZycpLmxlbmd0aCxcbiAgICAgIGFwcHJvdmVkOlxuICAgICAgICB2aXNpYmxlTWFya2Vycy5maWx0ZXIoKHNlbGxlcikgPT4gc2VsbGVyLnN0YXR1cyA9PT0gJ2FwcHJvdmVkJykubGVuZ3RoICtcbiAgICAgICAgdmlzaWJsZU5vTG9jYXRpb24uZmlsdGVyKChzZWxsZXIpID0+IHNlbGxlci5zdGF0dXMgPT09ICdhcHByb3ZlZCcpLmxlbmd0aCxcbiAgICAgIHJlamVjdGVkOlxuICAgICAgICB2aXNpYmxlTWFya2Vycy5maWx0ZXIoKHNlbGxlcikgPT4gc2VsbGVyLnN0YXR1cyA9PT0gJ3JlamVjdGVkJykubGVuZ3RoICtcbiAgICAgICAgdmlzaWJsZU5vTG9jYXRpb24uZmlsdGVyKChzZWxsZXIpID0+IHNlbGxlci5zdGF0dXMgPT09ICdyZWplY3RlZCcpLmxlbmd0aCxcbiAgICB9KSxcbiAgICBbdmlzaWJsZU1hcmtlcnMsIHZpc2libGVOb0xvY2F0aW9uXSxcbiAgKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGhhbmRsZUZpbHRlckxpbmtDbGljayA9IChldmVudDogTW91c2VFdmVudCkgPT4ge1xuICAgICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgaWYgKCEodGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY2l0eSA9IHRhcmdldC5kYXRhc2V0LmZpbHRlckNpdHk7XG4gICAgICBjb25zdCBzdGF0ZSA9IHRhcmdldC5kYXRhc2V0LmZpbHRlclN0YXRlO1xuXG4gICAgICBpZiAoIWNpdHkgJiYgIXN0YXRlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgaWYgKGNpdHkpIHtcbiAgICAgICAgc2V0RHJhZnRGaWx0ZXJzKChjdXJyZW50KSA9PiAoeyAuLi5jdXJyZW50LCBjaXR5IH0pKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXRlKSB7XG4gICAgICAgIGNvbnN0IG5leHQgPSB7XG4gICAgICAgICAgLi4uZHJhZnRGaWx0ZXJzLFxuICAgICAgICAgIHN0YXRlczogW3N0YXRlXSxcbiAgICAgICAgICBjaXR5OiBjaXR5ID8/IGRyYWZ0RmlsdGVycy5jaXR5LFxuICAgICAgICB9O1xuICAgICAgICBzZXREcmFmdEZpbHRlcnMobmV4dCk7XG4gICAgICAgIHNldEFwcGxpZWRGaWx0ZXJzKG5leHQpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUZpbHRlckxpbmtDbGljayk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlRmlsdGVyTGlua0NsaWNrKTtcbiAgICB9O1xuICB9LCBbZHJhZnRGaWx0ZXJzXSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIWxlYWZsZXQgfHwgIW1hcFJlZi5jdXJyZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG1hcEluc3RhbmNlUmVmLmN1cnJlbnQpIHtcbiAgICAgIG1hcEluc3RhbmNlUmVmLmN1cnJlbnQucmVtb3ZlKCk7XG4gICAgICBtYXBJbnN0YW5jZVJlZi5jdXJyZW50ID0gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBtYXAgPSBsZWFmbGV0Lm1hcChtYXBSZWYuY3VycmVudCkuc2V0VmlldyhbMjAuNTkzNywgNzguOTYyOV0sIDUpO1xuICAgIG1hcEluc3RhbmNlUmVmLmN1cnJlbnQgPSBtYXA7XG5cbiAgICBsZWFmbGV0LnRpbGVMYXllcignaHR0cHM6Ly97c30udGlsZS5vcGVuc3RyZWV0bWFwLm9yZy97en0ve3h9L3t5fS5wbmcnLCB7XG4gICAgICBhdHRyaWJ1dGlvbjogJyZjb3B5OyBPcGVuU3RyZWV0TWFwIGNvbnRyaWJ1dG9ycycsXG4gICAgfSkuYWRkVG8obWFwKTtcblxuICAgIGNvbnN0IG1hcmtlckxheWVyID0gbGVhZmxldC5tYXJrZXJDbHVzdGVyR3JvdXAgPyBsZWFmbGV0Lm1hcmtlckNsdXN0ZXJHcm91cCgpIDogbnVsbDtcbiAgICBjb25zdCBzdGF0ZUxheWVyID0gbGVhZmxldC5tYXJrZXJDbHVzdGVyR3JvdXAgPyBsZWFmbGV0Lm1hcmtlckNsdXN0ZXJHcm91cCgpIDogbnVsbDtcblxuICAgIGNvbnN0IGNpdHlRdWVyeSA9IGRyYWZ0RmlsdGVycy5jaXR5LnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgYmFzZU1hdGNoZWRNYXJrZXJzLmZvckVhY2goKHNlbGxlcikgPT4ge1xuICAgICAgY29uc3QgYmFkZ2UgPSBzdGF0dXNDb2xvcnNbc2VsbGVyLnN0YXR1c10gPz8geyBmaWxsOiAnI2Y1OWUwYicsIHRleHQ6ICcjOTI0MDBlJyB9O1xuICAgICAgY29uc3QgbWF0Y2hlc0N1cnJlbnRDaXR5ID1cbiAgICAgICAgY2l0eVF1ZXJ5Lmxlbmd0aCA9PT0gMCB8fCBzZWxsZXIubG9jYXRpb24uY2l0eS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGNpdHlRdWVyeSk7XG4gICAgICBjb25zdCBtYXJrZXIgPSBsZWFmbGV0LmNpcmNsZU1hcmtlcihbc2VsbGVyLmxvY2F0aW9uLmxhdCwgc2VsbGVyLmxvY2F0aW9uLmxuZ10sIHtcbiAgICAgICAgcmFkaXVzOiA4LFxuICAgICAgICBjb2xvcjogJyNmZmZmZmYnLFxuICAgICAgICB3ZWlnaHQ6IG1hdGNoZXNDdXJyZW50Q2l0eSA/IDIgOiAxLFxuICAgICAgICBmaWxsQ29sb3I6IGJhZGdlLmZpbGwsXG4gICAgICAgIGZpbGxPcGFjaXR5OiBtYXRjaGVzQ3VycmVudENpdHkgPyAwLjkgOiAwLjE1LFxuICAgICAgICBvcGFjaXR5OiBtYXRjaGVzQ3VycmVudENpdHkgPyAxIDogMC4yLFxuICAgICAgfSk7XG5cbiAgICAgIG1hcmtlci5iaW5kUG9wdXAoYnVpbGRQb3B1cChzZWxsZXIpKTtcbiAgICAgIGlmIChtYXRjaGVzQ3VycmVudENpdHkgJiYgY2l0eVF1ZXJ5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgbWFya2VyLnNldFN0eWxlKHsgcmFkaXVzOiAxMCB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKG1hcmtlckxheWVyKSB7XG4gICAgICAgIG1hcmtlckxheWVyLmFkZExheWVyKG1hcmtlcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXJrZXIuYWRkVG8obWFwKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChhcHBsaWVkRmlsdGVycy5zdGF0ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBncm91cEJ5U3RhdGUoYmFzZU1hdGNoZWRNYXJrZXJzKS5mb3JFYWNoKChzdGF0ZUdyb3VwKSA9PiB7XG4gICAgICAgIGNvbnN0IGNpcmNsZSA9IGxlYWZsZXQuY2lyY2xlTWFya2VyKHN0YXRlR3JvdXAuY2VudGVyLCB7XG4gICAgICAgICAgcmFkaXVzOiBNYXRoLm1pbigyNiwgMTIgKyBzdGF0ZUdyb3VwLnRvdGFsKSxcbiAgICAgICAgICBjb2xvcjogJyNmZmZmZmYnLFxuICAgICAgICAgIHdlaWdodDogMixcbiAgICAgICAgICBmaWxsQ29sb3I6ICcjM2I4MmY2JyxcbiAgICAgICAgICBmaWxsT3BhY2l0eTogMC40NSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY2lyY2xlLmJpbmRQb3B1cChcbiAgICAgICAgICBgPGRpdiBzdHlsZT1cImZvbnQtZmFtaWx5OkludGVyLHNhbnMtc2VyaWZcIj48c3Ryb25nPiR7c3RhdGVHcm91cC5zdGF0ZX08L3N0cm9uZz48ZGl2IHN0eWxlPVwibWFyZ2luLXRvcDo0cHg7Y29sb3I6IzZiNzI4MFwiPiR7c3RhdGVHcm91cC50b3RhbH0gc2VsbGVyczwvZGl2PjwvZGl2PmAsXG4gICAgICAgICk7XG4gICAgICAgIGNpcmNsZS5vbignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgbmV4dEZpbHRlcnMgPSB7XG4gICAgICAgICAgICAuLi5kcmFmdEZpbHRlcnMsXG4gICAgICAgICAgICBzdGF0ZXM6IFtzdGF0ZUdyb3VwLnN0YXRlXSxcbiAgICAgICAgICB9O1xuICAgICAgICAgIHNldERyYWZ0RmlsdGVycyhuZXh0RmlsdGVycyk7XG4gICAgICAgICAgc2V0QXBwbGllZEZpbHRlcnMobmV4dEZpbHRlcnMpO1xuICAgICAgICAgIG1hcC5mbHlUbyhzdGF0ZUdyb3VwLmNlbnRlciwgOCwgeyBkdXJhdGlvbjogMSB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHN0YXRlTGF5ZXIpIHtcbiAgICAgICAgICBzdGF0ZUxheWVyLmFkZExheWVyKGNpcmNsZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2lyY2xlLmFkZFRvKG1hcCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IGhlYXRMYXllciA9XG4gICAgICBtb2RlID09PSAnaGVhdG1hcCcgJiYgbGVhZmxldC5oZWF0TGF5ZXJcbiAgICAgICAgPyBsZWFmbGV0LmhlYXRMYXllcihcbiAgICAgICAgICAgIHZpc2libGVNYXJrZXJzLm1hcCgoc2VsbGVyKSA9PiBbc2VsbGVyLmxvY2F0aW9uLmxhdCwgc2VsbGVyLmxvY2F0aW9uLmxuZywgMC45XSksXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHJhZGl1czogMjYsXG4gICAgICAgICAgICAgIGJsdXI6IDIwLFxuICAgICAgICAgICAgICBncmFkaWVudDoge1xuICAgICAgICAgICAgICAgIDAuMjogJyMzYjgyZjYnLFxuICAgICAgICAgICAgICAgIDAuNTogJyNmNTllMGInLFxuICAgICAgICAgICAgICAgIDAuOTogJyNlZjQ0NDQnLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICApXG4gICAgICAgIDogbnVsbDtcblxuICAgIGlmIChtb2RlID09PSAnbWFya2VycycpIHtcbiAgICAgIG1hcmtlckxheWVyPy5hZGRUbyhtYXApO1xuICAgICAgc3RhdGVMYXllcj8uYWRkVG8obWFwKTtcbiAgICB9IGVsc2UgaWYgKGhlYXRMYXllcikge1xuICAgICAgbWFwLmFkZExheWVyKGhlYXRMYXllcik7XG4gICAgfVxuXG4gICAgY29uc3QgZm9jdXNDb29yZGluYXRlcyA9XG4gICAgICB2aXNpYmxlTWFya2Vycy5sZW5ndGggPiAwXG4gICAgICAgID8gdmlzaWJsZU1hcmtlcnMubWFwKChzZWxsZXIpID0+IFtzZWxsZXIubG9jYXRpb24ubGF0LCBzZWxsZXIubG9jYXRpb24ubG5nXSBhcyBbbnVtYmVyLCBudW1iZXJdKVxuICAgICAgICA6IFtdO1xuXG4gICAgaWYgKGZvY3VzQ29vcmRpbmF0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgYm91bmRzID0gbGVhZmxldC5sYXRMbmdCb3VuZHMoZm9jdXNDb29yZGluYXRlcyk7XG4gICAgICBpZiAoYm91bmRzLmlzVmFsaWQoKSkge1xuICAgICAgICBtYXAuZml0Qm91bmRzKGJvdW5kcywgeyBwYWRkaW5nOiBbMzAsIDMwXSB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgbWFwLnJlbW92ZSgpO1xuICAgICAgbWFwSW5zdGFuY2VSZWYuY3VycmVudCA9IG51bGw7XG4gICAgfTtcbiAgfSwgW2FwcGxpZWRGaWx0ZXJzLnN0YXRlcywgYXBwbGllZEZpbHRlcnMuc3RhdHVzLCBhcHBsaWVkRmlsdGVycy5waW5jb2RlLCBhcHBsaWVkRmlsdGVycy5mcm9tLCBhcHBsaWVkRmlsdGVycy50bywgYmFzZU1hdGNoZWRNYXJrZXJzLCBkcmFmdEZpbHRlcnMsIGxlYWZsZXQsIG1vZGUsIHZpc2libGVNYXJrZXJzXSk7XG5cbiAgY29uc3QgYXBwbHlGaWx0ZXJzID0gKCkgPT4ge1xuICAgIHNldEFwcGxpZWRGaWx0ZXJzKGRyYWZ0RmlsdGVycyk7XG4gIH07XG5cbiAgY29uc3QgY2xlYXJBbGwgPSAoKSA9PiB7XG4gICAgc2V0RHJhZnRGaWx0ZXJzKGRlZmF1bHRGaWx0ZXJzKTtcbiAgICBzZXRBcHBsaWVkRmlsdGVycyhkZWZhdWx0RmlsdGVycyk7XG4gIH07XG5cbiAgaWYgKCFzdGFuZGFsb25lKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxzZWN0aW9uIHN0eWxlPXt7IC4uLmNhcmRTdHlsZSwgcGFkZGluZzogMjAgfX0+XG4gICAgICAgIDxkaXYgc3R5bGU9e3NlY3Rpb25IZWFkZXJTdHlsZX0+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxoMiBzdHlsZT17c2VjdGlvblRpdGxlU3R5bGV9PlNlbGxlciBkaXN0cmlidXRpb24gbWFwPC9oMj5cbiAgICAgICAgICAgIDxwIHN0eWxlPXtzZWN0aW9uU3VidGl0bGVTdHlsZX0+UGxvdCBvZiBnZW9jb2RlZCBzZWxsZXIgbG9jYXRpb25zIGZyb20gdGhlIHVwc3RyZWFtIHNlbGxlciBhY2NvdW50IGRhdGEuPC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiByZWY9e21hcFJlZn0gc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgaGVpZ2h0OiA0MjAsIGJvcmRlclJhZGl1czogOCwgb3ZlcmZsb3c6ICdoaWRkZW4nIH19IC8+XG4gICAgICA8L3NlY3Rpb24+XG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPHNlY3Rpb24gc3R5bGU9e3sgLi4uY2FyZFN0eWxlLCBwYWRkaW5nOiAyMCB9fT5cbiAgICAgIDxkaXYgc3R5bGU9e3NlY3Rpb25IZWFkZXJTdHlsZX0+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGgyIHN0eWxlPXtzZWN0aW9uVGl0bGVTdHlsZX0+U2VsbGVyIGRpc3RyaWJ1dGlvbiBtYXA8L2gyPlxuICAgICAgICAgIDxwIHN0eWxlPXtzZWN0aW9uU3VidGl0bGVTdHlsZX0+XG4gICAgICAgICAgICBGaWx0ZXIgc2VsbGVycyBieSBzdGF0dXMsIGxvY2F0aW9uLCBhbmQgc3VibWlzc2lvbiB3aW5kb3cgZGlyZWN0bHkgZnJvbSB0aGUgbWFwIHZpZXcuXG4gICAgICAgICAgPC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdncmlkJywgZ2FwOiAyMCwgZ3JpZFRlbXBsYXRlQ29sdW1uczogJzI4MHB4IG1pbm1heCgwLCAxZnIpJyB9fT5cbiAgICAgICAgPGFzaWRlIHN0eWxlPXt7IC4uLmNhcmRTdHlsZSwgcGFkZGluZzogMTYsIGFsaWduU2VsZjogJ3N0YXJ0JyB9fT5cbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IC4uLnNlY3Rpb25UaXRsZVN0eWxlLCBmb250U2l6ZTogMTQsIG1hcmdpbkJvdHRvbTogMTIgfX0+TWFwIGZpbHRlcnM8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAxNCB9fT5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBmb250V2VpZ2h0OiA2MDAsIGNvbG9yOiAnIzZiNzI4MCcsIG1hcmdpbkJvdHRvbTogOCB9fT5TdGF0dXM8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2dyaWQnLCBnYXA6IDYgfX0+XG4gICAgICAgICAgICAgIHsoWydhbGwnLCAncGVuZGluZycsICdhcHByb3ZlZCcsICdyZWplY3RlZCddIGFzIGNvbnN0KS5tYXAoKHN0YXR1cykgPT4gKFxuICAgICAgICAgICAgICAgIDxsYWJlbCBrZXk9e3N0YXR1c30gc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiA4LCBmb250U2l6ZTogMTMgfX0+XG4gICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cInJhZGlvXCJcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17ZHJhZnRGaWx0ZXJzLnN0YXR1cyA9PT0gc3RhdHVzfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KCkgPT4gc2V0RHJhZnRGaWx0ZXJzKChjdXJyZW50KSA9PiAoeyAuLi5jdXJyZW50LCBzdGF0dXMgfSkpfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIHtzdGF0dXMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdGF0dXMuc2xpY2UoMSl9XG4gICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAxNCB9fT5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBmb250V2VpZ2h0OiA2MDAsIGNvbG9yOiAnIzZiNzI4MCcsIG1hcmdpbkJvdHRvbTogOCB9fT5TdGF0ZXM8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWF4SGVpZ2h0OiAxNjAsIG92ZXJmbG93WTogJ2F1dG8nLCBkaXNwbGF5OiAnZ3JpZCcsIGdhcDogNiB9fT5cbiAgICAgICAgICAgICAge2F2YWlsYWJsZVN0YXRlcy5tYXAoKHN0YXRlKSA9PiAoXG4gICAgICAgICAgICAgICAgPGxhYmVsIGtleT17c3RhdGV9IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogOCwgZm9udFNpemU6IDEzIH19PlxuICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ9e2RyYWZ0RmlsdGVycy5zdGF0ZXMuaW5jbHVkZXMoc3RhdGUpfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PlxuICAgICAgICAgICAgICAgICAgICAgIHNldERyYWZ0RmlsdGVycygoY3VycmVudCkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLmN1cnJlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZXM6IGV2ZW50LnRhcmdldC5jaGVja2VkXG4gICAgICAgICAgICAgICAgICAgICAgICAgID8gWy4uLmN1cnJlbnQuc3RhdGVzLCBzdGF0ZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBjdXJyZW50LnN0YXRlcy5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0gIT09IHN0YXRlKSxcbiAgICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIHtzdGF0ZX1cbiAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Cb3R0b206IDE0IH19PlxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogMTIsIGZvbnRXZWlnaHQ6IDYwMCwgY29sb3I6ICcjNmI3MjgwJywgbWFyZ2luQm90dG9tOiA4IH19PkNpdHk8L2Rpdj5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICB2YWx1ZT17ZHJhZnRGaWx0ZXJzLmNpdHl9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldERyYWZ0RmlsdGVycygoY3VycmVudCkgPT4gKHsgLi4uY3VycmVudCwgY2l0eTogZXZlbnQudGFyZ2V0LnZhbHVlIH0pKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJUeXBlIGEgY2l0eVwiXG4gICAgICAgICAgICAgIHN0eWxlPXtpbnB1dFN0eWxlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAxNCB9fT5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBmb250V2VpZ2h0OiA2MDAsIGNvbG9yOiAnIzZiNzI4MCcsIG1hcmdpbkJvdHRvbTogOCB9fT5QaW5jb2RlPC9kaXY+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgdmFsdWU9e2RyYWZ0RmlsdGVycy5waW5jb2RlfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PlxuICAgICAgICAgICAgICAgIHNldERyYWZ0RmlsdGVycygoY3VycmVudCkgPT4gKHtcbiAgICAgICAgICAgICAgICAgIC4uLmN1cnJlbnQsXG4gICAgICAgICAgICAgICAgICBwaW5jb2RlOiBldmVudC50YXJnZXQudmFsdWUucmVwbGFjZSgvXFxEL2csICcnKS5zbGljZSgwLCA2KSxcbiAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIjYtZGlnaXQgcGluY29kZVwiXG4gICAgICAgICAgICAgIHN0eWxlPXtpbnB1dFN0eWxlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAxNCB9fT5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBmb250V2VpZ2h0OiA2MDAsIGNvbG9yOiAnIzZiNzI4MCcsIG1hcmdpbkJvdHRvbTogOCB9fT5EYXRlIHJhbmdlPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdncmlkJywgZ2FwOiA4IH19PlxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICB0eXBlPVwiZGF0ZVwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e2RyYWZ0RmlsdGVycy5mcm9tfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldERyYWZ0RmlsdGVycygoY3VycmVudCkgPT4gKHsgLi4uY3VycmVudCwgZnJvbTogZXZlbnQudGFyZ2V0LnZhbHVlIH0pKX1cbiAgICAgICAgICAgICAgICBzdHlsZT17aW5wdXRTdHlsZX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgdHlwZT1cImRhdGVcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtkcmFmdEZpbHRlcnMudG99XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RHJhZnRGaWx0ZXJzKChjdXJyZW50KSA9PiAoeyAuLi5jdXJyZW50LCB0bzogZXZlbnQudGFyZ2V0LnZhbHVlIH0pKX1cbiAgICAgICAgICAgICAgICBzdHlsZT17aW5wdXRTdHlsZX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGdhcDogOCwgbWFyZ2luQm90dG9tOiAxNiB9fT5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e2FwcGx5RmlsdGVyc30gc3R5bGU9e3sgLi4uYnV0dG9uU3R5bGUsIGJhY2tncm91bmQ6ICcjM2I4MmY2JywgY29sb3I6ICcjZmZmZmZmJywgYm9yZGVyQ29sb3I6ICcjM2I4MmY2JywgZmxleDogMSB9fT5cbiAgICAgICAgICAgICAgQXBwbHkgRmlsdGVyc1xuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXtjbGVhckFsbH0gc3R5bGU9e3sgLi4uYnV0dG9uU3R5bGUsIGZsZXg6IDEgfX0+XG4gICAgICAgICAgICAgIENsZWFyIEFsbFxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGJvcmRlclRvcDogJzFweCBzb2xpZCAjZTVlN2ViJywgcGFkZGluZ1RvcDogMTIgfX0+XG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAxMywgZm9udFdlaWdodDogNjAwLCBjb2xvcjogJyMxZjI5MzcnIH19PlxuICAgICAgICAgICAgICBTaG93aW5nIHt2aXNpYmxlQ291bnRzLnRvdGFsfSBzZWxsZXJzXG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiA4LCBkaXNwbGF5OiAnZ3JpZCcsIGdhcDogNiB9fT5cbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17bGVnZW5kSXRlbVN0eWxlfT5cbiAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyB3aWR0aDogOCwgaGVpZ2h0OiA4LCBib3JkZXJSYWRpdXM6ICc1MCUnLCBiYWNrZ3JvdW5kOiAnI2Y1OWUwYicgfX0gLz5cbiAgICAgICAgICAgICAgICB7dmlzaWJsZUNvdW50cy5wZW5kaW5nfSBwZW5kaW5nXG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtsZWdlbmRJdGVtU3R5bGV9PlxuICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IHdpZHRoOiA4LCBoZWlnaHQ6IDgsIGJvcmRlclJhZGl1czogJzUwJScsIGJhY2tncm91bmQ6ICcjMTBiOTgxJyB9fSAvPlxuICAgICAgICAgICAgICAgIHt2aXNpYmxlQ291bnRzLmFwcHJvdmVkfSBhcHByb3ZlZFxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17bGVnZW5kSXRlbVN0eWxlfT5cbiAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyB3aWR0aDogOCwgaGVpZ2h0OiA4LCBib3JkZXJSYWRpdXM6ICc1MCUnLCBiYWNrZ3JvdW5kOiAnI2VmNDQ0NCcgfX0gLz5cbiAgICAgICAgICAgICAgICB7dmlzaWJsZUNvdW50cy5yZWplY3RlZH0gcmVqZWN0ZWRcbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9hc2lkZT5cblxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgbWFyZ2luQm90dG9tOiAxMiB9fT5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBnYXA6IDggfX0+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRNb2RlKCdtYXJrZXJzJyl9XG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgIC4uLmJ1dHRvblN0eWxlLFxuICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiA5OTksXG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBtb2RlID09PSAnbWFya2VycycgPyAnIzNiODJmNicgOiAnI2ZmZmZmZicsXG4gICAgICAgICAgICAgICAgICBjb2xvcjogbW9kZSA9PT0gJ21hcmtlcnMnID8gJyNmZmZmZmYnIDogJyMzNzQxNTEnLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBNYXJrZXJzXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0TW9kZSgnaGVhdG1hcCcpfVxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAuLi5idXR0b25TdHlsZSxcbiAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogOTk5LFxuICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogbW9kZSA9PT0gJ2hlYXRtYXAnID8gJyMzYjgyZjYnIDogJyNmZmZmZmYnLFxuICAgICAgICAgICAgICAgICAgY29sb3I6IG1vZGUgPT09ICdoZWF0bWFwJyA/ICcjZmZmZmZmJyA6ICcjMzc0MTUxJyxcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgSGVhdG1hcFxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IC4uLmNhcmRTdHlsZSwgcGFkZGluZzogMTIsIHdpZHRoOiAxNzAsIGJveFNoYWRvdzogJzAgOHB4IDI0cHggcmdiYSgxNSwgMjMsIDQyLCAwLjEyKScgfX0+XG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgLi4uc2VjdGlvblRpdGxlU3R5bGUsIGZvbnRTaXplOiAxMywgbWFyZ2luQm90dG9tOiAxMCB9fT5MZWdlbmQ8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZ3JpZCcsIGdhcDogOCB9fT5cbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtsZWdlbmRJdGVtU3R5bGV9PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgd2lkdGg6IDEwLCBoZWlnaHQ6IDEwLCBib3JkZXJSYWRpdXM6ICc1MCUnLCBiYWNrZ3JvdW5kOiAnI2Y1OWUwYicgfX0gLz5cbiAgICAgICAgICAgICAgICAgIFBlbmRpbmdcbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtsZWdlbmRJdGVtU3R5bGV9PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgd2lkdGg6IDEwLCBoZWlnaHQ6IDEwLCBib3JkZXJSYWRpdXM6ICc1MCUnLCBiYWNrZ3JvdW5kOiAnIzEwYjk4MScgfX0gLz5cbiAgICAgICAgICAgICAgICAgIEFwcHJvdmVkXG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17bGVnZW5kSXRlbVN0eWxlfT5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IHdpZHRoOiAxMCwgaGVpZ2h0OiAxMCwgYm9yZGVyUmFkaXVzOiAnNTAlJywgYmFja2dyb3VuZDogJyNlZjQ0NDQnIH19IC8+XG4gICAgICAgICAgICAgICAgICBSZWplY3RlZFxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBwb3NpdGlvbjogJ3JlbGF0aXZlJyB9fT5cbiAgICAgICAgICAgIDxkaXYgcmVmPXttYXBSZWZ9IHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIGhlaWdodDogNTIwLCBib3JkZXJSYWRpdXM6IDgsIG92ZXJmbG93OiAnaGlkZGVuJyB9fSAvPlxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgICAgIGxlZnQ6IDEyLFxuICAgICAgICAgICAgICAgIGJvdHRvbTogMTIsXG4gICAgICAgICAgICAgICAgLi4uY2FyZFN0eWxlLFxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMHB4IDEycHgnLFxuICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICAgICAgICAgICAgICBnYXA6IDEyLFxuICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMixcbiAgICAgICAgICAgICAgICBjb2xvcjogJyMzNzQxNTEnLFxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgOHB4IDI0cHggcmdiYSgxNSwgMjMsIDQyLCAwLjEyKScsXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxzcGFuPnt2aXNpYmxlQ291bnRzLnRvdGFsfSBzZWxsZXJzIHNob3duPC9zcGFuPlxuICAgICAgICAgICAgICA8c3Bhbj57dmlzaWJsZUNvdW50cy5wZW5kaW5nfSBwZW5kaW5nPC9zcGFuPlxuICAgICAgICAgICAgICA8c3Bhbj57dmlzaWJsZUNvdW50cy5hcHByb3ZlZH0gYXBwcm92ZWQ8L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuPnt2aXNpYmxlQ291bnRzLnJlamVjdGVkfSByZWplY3RlZDwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogMTggfX0+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTaG93Tm9Mb2NhdGlvbigoY3VycmVudCkgPT4gIWN1cnJlbnQpfVxuICAgICAgICAgIHN0eWxlPXt7IC4uLmJ1dHRvblN0eWxlLCBtYXJnaW5Cb3R0b206IDEwIH19XG4gICAgICAgID5cbiAgICAgICAgICB7c2hvd05vTG9jYXRpb24gPyAnSGlkZScgOiAnU2hvdyd9IHt2aXNpYmxlTm9Mb2NhdGlvbi5sZW5ndGh9IHNlbGxlcnMgd2l0aG91dCBtYXAgY29vcmRpbmF0ZXNcbiAgICAgICAgPC9idXR0b24+XG5cbiAgICAgICAge3Nob3dOb0xvY2F0aW9uID8gKFxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgb3ZlcmZsb3dYOiAnYXV0bycgfX0+XG4gICAgICAgICAgICA8dGFibGUgc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgYm9yZGVyQ29sbGFwc2U6ICdjb2xsYXBzZScgfX0+XG4gICAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiAnbGVmdCcsIHBhZGRpbmc6ICcxMHB4IDEycHgnIH19PlNlbGxlcjwvdGg+XG4gICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiAnbGVmdCcsIHBhZGRpbmc6ICcxMHB4IDEycHgnIH19PkxvY2F0aW9uPC90aD5cbiAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzEwcHggMTJweCcgfX0+U3RhdHVzPC90aD5cbiAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzEwcHggMTJweCcgfX0+UmVjZWl2ZWQ8L3RoPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICB7dmlzaWJsZU5vTG9jYXRpb24ubWFwKChzZWxsZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGJhZGdlID0gc3RhdHVzQ29sb3JzW3NlbGxlci5zdGF0dXNdID8/IHsgZmlsbDogJyNmNTllMGInLCB0ZXh0OiAnIzkyNDAwZScgfTtcblxuICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPHRyIGtleT17c2VsbGVyLmlkfSBzdHlsZT17eyBib3JkZXJUb3A6ICcxcHggc29saWQgI2U1ZTdlYicgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcxMnB4JyB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFdlaWdodDogNjAwLCBjb2xvcjogJyMxZjI5MzcnIH19PntzZWxsZXIuYnVzaW5lc3NOYW1lfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Ub3A6IDQsIGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRTaXplOiAxMyB9fT57c2VsbGVyLnNlbGxlck5hbWV9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzEycHgnLCBmb250U2l6ZTogMTMsIGNvbG9yOiAnIzM3NDE1MScgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7c2VsbGVyLmxvY2F0aW9uLmNpdHl9LCB7c2VsbGVyLmxvY2F0aW9uLnN0YXRlfSB7c2VsbGVyLmxvY2F0aW9uLnBpbmNvZGV9XG4gICAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzEycHgnIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgPEJhZGdlIGxhYmVsPXtzZWxsZXIuc3RhdHVzfSBiYWNrZ3JvdW5kPXtgJHtiYWRnZS5maWxsfTIyYH0gY29sb3I9e2JhZGdlLnRleHR9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzEycHgnLCBmb250U2l6ZTogMTMsIGNvbG9yOiAnIzZiNzI4MCcgfX0+e2Zvcm1hdERhdGUoc2VsbGVyLnJlY2VpdmVkQXQpfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICAgIHt2aXNpYmxlTm9Mb2NhdGlvbi5sZW5ndGggPT09IDAgPyAoXG4gICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0ZCBjb2xTcGFuPXs0fSBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCAxMnB4JywgY29sb3I6ICcjNmI3MjgwJyB9fT5cbiAgICAgICAgICAgICAgICAgICAgICBBbGwgc2VsbGVycyBjdXJyZW50bHkgaGF2ZSBtYXAgY29vcmRpbmF0ZXMgZm9yIHRoZSBhY3RpdmUgZmlsdGVycy5cbiAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogbnVsbH1cbiAgICAgIDwvZGl2PlxuICAgIDwvc2VjdGlvbj5cbiAgKTtcbn07XG5cbmNvbnN0IFNlbGxlck1hcFBhZ2UgPSAoKSA9PiB7XG4gIGNvbnN0IHsgZGF0YSwgbG9hZGluZywgZXJyb3IgfSA9IHVzZVBhZ2VEYXRhPFNlbGxlck1hcFBheWxvYWQ+KCdzZWxsZXItbWFwJyk7XG5cbiAgaWYgKGxvYWRpbmcpIHtcbiAgICByZXR1cm4gPExvYWRpbmdTdGF0ZSBsYWJlbD1cIkxvYWRpbmcgc2VsbGVyIG1hcC4uLlwiIC8+O1xuICB9XG5cbiAgaWYgKGVycm9yIHx8ICFkYXRhKSB7XG4gICAgcmV0dXJuIDxFcnJvclN0YXRlIG1lc3NhZ2U9e2Vycm9yID8/ICdTZWxsZXIgbWFwIGRhdGEgaXMgdW5hdmFpbGFibGUnfSAvPjtcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBzdHlsZT17cGFnZVN0eWxlfT5cbiAgICAgIDxTZWxsZXJNYXBQYW5lbCBwYXlsb2FkPXtkYXRhfSBzdGFuZGFsb25lIC8+XG4gICAgPC9kaXY+XG4gICk7XG59O1xuXG5leHBvcnQgeyBTZWxsZXJNYXBQYW5lbCB9O1xuZXhwb3J0IGRlZmF1bHQgU2VsbGVyTWFwUGFnZTtcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCB0eXBlIHsgRGFzaGJvYXJkUGF5bG9hZCB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7XG4gIEVycm9yU3RhdGUsXG4gIExvYWRpbmdTdGF0ZSxcbiAgY2FyZFN0eWxlLFxuICBmb3JtYXREYXRlVGltZSxcbiAgcGFnZVN0eWxlLFxuICBzZWN0aW9uSGVhZGVyU3R5bGUsXG4gIHNlY3Rpb25TdWJ0aXRsZVN0eWxlLFxuICBzZWN0aW9uVGl0bGVTdHlsZSxcbiAgdGltZUFnbyxcbiAgdXNlQ2hhcnRKcyxcbiAgdXNlRGFzaGJvYXJkRGF0YSxcbn0gZnJvbSAnLi9zaGFyZWQnO1xuaW1wb3J0IHsgU2VsbGVyTWFwUGFuZWwgfSBmcm9tICcuL1NlbGxlck1hcCc7XG5cbmNvbnN0IGNoYXJ0V3JhcFN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0ge1xuICAuLi5jYXJkU3R5bGUsXG4gIHBhZGRpbmc6IDIwLFxuICBtaW5IZWlnaHQ6IDM2MCxcbn07XG5cbmNvbnN0IERhc2hib2FyZENoYXJ0cyA9ICh7IHBheWxvYWQgfTogeyBwYXlsb2FkOiBEYXNoYm9hcmRQYXlsb2FkIH0pID0+IHtcbiAgY29uc3QgY2hhcnRDb25zdHJ1Y3RvciA9IHVzZUNoYXJ0SnMoKTtcbiAgY29uc3QgYmFyQ2FudmFzUmVmID0gdXNlUmVmPEhUTUxDYW52YXNFbGVtZW50IHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IGRvbnV0Q2FudmFzUmVmID0gdXNlUmVmPEhUTUxDYW52YXNFbGVtZW50IHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IFttb2RlLCBzZXRNb2RlXSA9IHVzZVN0YXRlPCczMGQnIHwgJzEybSc+KCczMGQnKTtcblxuICBjb25zdCBzdWJtaXNzaW9uc1NlcmllcyA9IG1vZGUgPT09ICczMGQnID8gcGF5bG9hZC5zdWJtaXNzaW9uczMwRGF5cyA6IHBheWxvYWQuc3VibWlzc2lvbnMxMk1vbnRocztcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghY2hhcnRDb25zdHJ1Y3RvciB8fCAhYmFyQ2FudmFzUmVmLmN1cnJlbnQgfHwgIWRvbnV0Q2FudmFzUmVmLmN1cnJlbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBiYXJDb250ZXh0ID0gYmFyQ2FudmFzUmVmLmN1cnJlbnQuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBjb25zdCBkb251dENvbnRleHQgPSBkb251dENhbnZhc1JlZi5jdXJyZW50LmdldENvbnRleHQoJzJkJyk7XG5cbiAgICBpZiAoIWJhckNvbnRleHQgfHwgIWRvbnV0Q29udGV4dCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGJhckNoYXJ0ID0gbmV3IGNoYXJ0Q29uc3RydWN0b3IoYmFyQ29udGV4dCwge1xuICAgICAgdHlwZTogJ2JhcicsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGxhYmVsczogc3VibWlzc2lvbnNTZXJpZXMubWFwKChwb2ludCkgPT4gcG9pbnQubGFiZWwpLFxuICAgICAgICBkYXRhc2V0czogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiAnU3VibWlzc2lvbnMnLFxuICAgICAgICAgICAgZGF0YTogc3VibWlzc2lvbnNTZXJpZXMubWFwKChwb2ludCkgPT4gcG9pbnQuY291bnQpLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzNiODJmNicsXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6IDYsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgICBvcHRpb25zOiB7XG4gICAgICAgIG1haW50YWluQXNwZWN0UmF0aW86IGZhbHNlLFxuICAgICAgICBwbHVnaW5zOiB7XG4gICAgICAgICAgbGVnZW5kOiB7IGRpc3BsYXk6IGZhbHNlIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHNjYWxlczoge1xuICAgICAgICAgIHg6IHtcbiAgICAgICAgICAgIGdyaWQ6IHsgZGlzcGxheTogZmFsc2UgfSxcbiAgICAgICAgICAgIHRpY2tzOiB7IGNvbG9yOiAnIzZiNzI4MCcsIGZvbnQ6IHsgc2l6ZTogMTEgfSB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgeToge1xuICAgICAgICAgICAgYmVnaW5BdFplcm86IHRydWUsXG4gICAgICAgICAgICB0aWNrczogeyBwcmVjaXNpb246IDAsIGNvbG9yOiAnIzZiNzI4MCcsIGZvbnQ6IHsgc2l6ZTogMTEgfSB9LFxuICAgICAgICAgICAgZ3JpZDogeyBjb2xvcjogJ3JnYmEoMTQ4LDE2MywxODQsMC4xNiknIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBkb251dENoYXJ0ID0gbmV3IGNoYXJ0Q29uc3RydWN0b3IoZG9udXRDb250ZXh0LCB7XG4gICAgICB0eXBlOiAnZG91Z2hudXQnLFxuICAgICAgZGF0YToge1xuICAgICAgICBsYWJlbHM6IFsnUGVuZGluZycsICdBcHByb3ZlZCcsICdSZWplY3RlZCddLFxuICAgICAgICBkYXRhc2V0czogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGRhdGE6IFtwYXlsb2FkLnN0YXRzLnBlbmRpbmcsIHBheWxvYWQuc3RhdHMuYXBwcm92ZWQsIHBheWxvYWQuc3RhdHMucmVqZWN0ZWRdLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBbJyNmNTllMGInLCAnIzEwYjk4MScsICcjZWY0NDQ0J10sXG4gICAgICAgICAgICBib3JkZXJXaWR0aDogMCxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgbWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXG4gICAgICAgIGN1dG91dDogJzcyJScsXG4gICAgICAgIHBsdWdpbnM6IHtcbiAgICAgICAgICBsZWdlbmQ6IHsgZGlzcGxheTogZmFsc2UgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgYmFyQ2hhcnQuZGVzdHJveSgpO1xuICAgICAgZG9udXRDaGFydC5kZXN0cm95KCk7XG4gICAgfTtcbiAgfSwgW2NoYXJ0Q29uc3RydWN0b3IsIG1vZGUsIHBheWxvYWQuc3RhdHMsIHN1Ym1pc3Npb25zU2VyaWVzXSk7XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdncmlkJywgZ2FwOiAyMCwgZ3JpZFRlbXBsYXRlQ29sdW1uczogJzEuMzVmciAxZnInIH19PlxuICAgICAgPHNlY3Rpb24gc3R5bGU9e2NoYXJ0V3JhcFN0eWxlfT5cbiAgICAgICAgPGRpdiBzdHlsZT17c2VjdGlvbkhlYWRlclN0eWxlfT5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgyIHN0eWxlPXtzZWN0aW9uVGl0bGVTdHlsZX0+U3VibWlzc2lvbnMgY2hhcnQ8L2gyPlxuICAgICAgICAgICAgPHAgc3R5bGU9e3NlY3Rpb25TdWJ0aXRsZVN0eWxlfT5TdWJtaXNzaW9uIHZvbHVtZSBvdmVyIHRoZSBsYXN0IDMwIGRheXMgb3IgMTIgbW9udGhzLjwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiA4IH19PlxuICAgICAgICAgICAgeyhbJzMwZCcsICcxMm0nXSBhcyBjb25zdCkubWFwKCh2YWx1ZSkgPT4gKFxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAga2V5PXt2YWx1ZX1cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRNb2RlKHZhbHVlKX1cbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiA5OTksXG4gICAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2QxZDVkYicsXG4gICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnN3B4IDEycHgnLFxuICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogbW9kZSA9PT0gdmFsdWUgPyAnIzNiODJmNicgOiAnI2ZmZmZmZicsXG4gICAgICAgICAgICAgICAgICBjb2xvcjogbW9kZSA9PT0gdmFsdWUgPyAnI2ZmZmZmZicgOiAnIzM3NDE1MScsXG4gICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiA2MDAsXG4gICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge3ZhbHVlID09PSAnMzBkJyA/ICczMCBkYXlzJyA6ICcxMiBtb250aHMnfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBzdHlsZT17eyBoZWlnaHQ6IDI4MCB9fT5cbiAgICAgICAgICA8Y2FudmFzIHJlZj17YmFyQ2FudmFzUmVmfSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gc3R5bGU9e2NoYXJ0V3JhcFN0eWxlfT5cbiAgICAgICAgPGRpdiBzdHlsZT17c2VjdGlvbkhlYWRlclN0eWxlfT5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgyIHN0eWxlPXtzZWN0aW9uVGl0bGVTdHlsZX0+U3RhdHVzIGJyZWFrZG93bjwvaDI+XG4gICAgICAgICAgICA8cCBzdHlsZT17c2VjdGlvblN1YnRpdGxlU3R5bGV9PkN1cnJlbnQgbWl4IG9mIHBlbmRpbmcsIGFwcHJvdmVkLCBhbmQgcmVqZWN0ZWQgc2VsbGVycy48L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdncmlkJywgZ3JpZFRlbXBsYXRlQ29sdW1uczogJzIyMHB4IDFmcicsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6IDEyIH19PlxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcG9zaXRpb246ICdyZWxhdGl2ZScsIGhlaWdodDogMjIwIH19PlxuICAgICAgICAgICAgPGNhbnZhcyByZWY9e2RvbnV0Q2FudmFzUmVmfSAvPlxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgICAgIGluc2V0OiAwLFxuICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgcG9pbnRlckV2ZW50czogJ25vbmUnLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRTaXplOiAxMiB9fT5Ub3RhbDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGNvbG9yOiAnIzFmMjkzNycsIGZvbnRTaXplOiAzMCwgZm9udFdlaWdodDogNzAwIH19PntwYXlsb2FkLnN0YXRzLnRvdGFsfTwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZ3JpZCcsIGdhcDogMTAgfX0+XG4gICAgICAgICAgICB7W1xuICAgICAgICAgICAgICB7IGxhYmVsOiAnUGVuZGluZycsIHZhbHVlOiBwYXlsb2FkLnN0YXRzLnBlbmRpbmcsIGNvbG9yOiAnI2Y1OWUwYicgfSxcbiAgICAgICAgICAgICAgeyBsYWJlbDogJ0FwcHJvdmVkJywgdmFsdWU6IHBheWxvYWQuc3RhdHMuYXBwcm92ZWQsIGNvbG9yOiAnIzEwYjk4MScgfSxcbiAgICAgICAgICAgICAgeyBsYWJlbDogJ1JlamVjdGVkJywgdmFsdWU6IHBheWxvYWQuc3RhdHMucmVqZWN0ZWQsIGNvbG9yOiAnI2VmNDQ0NCcgfSxcbiAgICAgICAgICAgIF0ubWFwKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHBlcmNlbnRhZ2UgPSBwYXlsb2FkLnN0YXRzLnRvdGFsID4gMCA/IE1hdGgucm91bmQoKGl0ZW0udmFsdWUgLyBwYXlsb2FkLnN0YXRzLnRvdGFsKSAqIDEwMCkgOiAwO1xuXG4gICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBrZXk9e2l0ZW0ubGFiZWx9IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicgfX0+XG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogMTAsIGNvbG9yOiAnIzM3NDE1MScsIGZvbnRTaXplOiAxMyB9fT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgd2lkdGg6IDEwLCBoZWlnaHQ6IDEwLCBib3JkZXJSYWRpdXM6ICc1MCUnLCBiYWNrZ3JvdW5kOiBpdGVtLmNvbG9yIH19IC8+XG4gICAgICAgICAgICAgICAgICAgIHtpdGVtLmxhYmVsfVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRTaXplOiAxMyB9fT5cbiAgICAgICAgICAgICAgICAgICAge2l0ZW0udmFsdWV9ICh7cGVyY2VudGFnZX0lKVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L3NlY3Rpb24+XG4gICAgPC9kaXY+XG4gICk7XG59O1xuXG5jb25zdCBEYXNoYm9hcmQgPSAoKSA9PiB7XG4gIGNvbnN0IHsgZGF0YSwgbG9hZGluZywgZXJyb3IgfSA9IHVzZURhc2hib2FyZERhdGE8RGFzaGJvYXJkUGF5bG9hZD4oKTtcblxuICBjb25zdCBzdGF0cyA9IHVzZU1lbW8oXG4gICAgKCkgPT5cbiAgICAgIGRhdGFcbiAgICAgICAgPyBbXG4gICAgICAgICAgICB7IGxhYmVsOiAnVG90YWwgU2VsbGVycycsIHZhbHVlOiBkYXRhLnN0YXRzLnRvdGFsLCBjb2xvcjogJyMzYjgyZjYnLCBiZzogJyNkYmVhZmUnIH0sXG4gICAgICAgICAgICB7IGxhYmVsOiAnUGVuZGluZycsIHZhbHVlOiBkYXRhLnN0YXRzLnBlbmRpbmcsIGNvbG9yOiAnI2Y1OWUwYicsIGJnOiAnI2ZlZjNjNycgfSxcbiAgICAgICAgICAgIHsgbGFiZWw6ICdBcHByb3ZlZCcsIHZhbHVlOiBkYXRhLnN0YXRzLmFwcHJvdmVkLCBjb2xvcjogJyMxMGI5ODEnLCBiZzogJyNkMWZhZTUnIH0sXG4gICAgICAgICAgICB7IGxhYmVsOiAnUmVqZWN0ZWQnLCB2YWx1ZTogZGF0YS5zdGF0cy5yZWplY3RlZCwgY29sb3I6ICcjZWY0NDQ0JywgYmc6ICcjZmVlMmUyJyB9LFxuICAgICAgICAgIF1cbiAgICAgICAgOiBbXSxcbiAgICBbZGF0YV0sXG4gICk7XG5cbiAgaWYgKGxvYWRpbmcpIHtcbiAgICByZXR1cm4gPExvYWRpbmdTdGF0ZSBsYWJlbD1cIkxvYWRpbmcgZGFzaGJvYXJkLi4uXCIgLz47XG4gIH1cblxuICBpZiAoZXJyb3IgfHwgIWRhdGEpIHtcbiAgICByZXR1cm4gPEVycm9yU3RhdGUgbWVzc2FnZT17ZXJyb3IgPz8gJ0Rhc2hib2FyZCBkYXRhIGlzIHVuYXZhaWxhYmxlJ30gLz47XG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgc3R5bGU9e3BhZ2VTdHlsZX0+XG4gICAgICA8c2VjdGlvbiBzdHlsZT17eyAuLi5jYXJkU3R5bGUsIHBhZGRpbmc6IDI0IH19PlxuICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywganVzdGlmeUNvbnRlbnQ6ICdzcGFjZS1iZXR3ZWVuJywgYWxpZ25JdGVtczogJ2ZsZXgtc3RhcnQnLCBnYXA6IDE2IH19PlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aDEgc3R5bGU9e3sgbWFyZ2luOiAwLCBmb250U2l6ZTogMjgsIGZvbnRXZWlnaHQ6IDcwMCwgY29sb3I6ICcjMWYyOTM3JyB9fT5cbiAgICAgICAgICAgICAge2RhdGEuZ3JlZXRpbmd9LCB7ZGF0YS5hZG1pbk5hbWV9XG4gICAgICAgICAgICA8L2gxPlxuICAgICAgICAgICAgPHAgc3R5bGU9e3sgbWFyZ2luOiAnNnB4IDAgMCcsIGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRTaXplOiAxNCB9fT5aYXRjaCBTdXBlciBBZG1pbiBQYW5lbDwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRTaXplOiAxMyB9fT57ZGF0YS5kYXRlTGFiZWx9PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdncmlkJywgZ3JpZFRlbXBsYXRlQ29sdW1uczogJ3JlcGVhdCg0LCBtaW5tYXgoMCwgMWZyKSknLCBnYXA6IDIwIH19PlxuICAgICAgICB7c3RhdHMubWFwKChzdGF0KSA9PiAoXG4gICAgICAgICAgPGRpdlxuICAgICAgICAgICAga2V5PXtzdGF0LmxhYmVsfVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgLi4uY2FyZFN0eWxlLFxuICAgICAgICAgICAgICBib3JkZXJMZWZ0OiBgNHB4IHNvbGlkICR7c3RhdC5jb2xvcn1gLFxuICAgICAgICAgICAgICBwYWRkaW5nOiAyMCxcbiAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcG9zaXRpb246ICdhYnNvbHV0ZScsIHJpZ2h0OiAxNiwgdG9wOiAxNiwgY29sb3I6IHN0YXQuY29sb3IgfX0+XG4gICAgICAgICAgICAgIDxzdmcgd2lkdGg9XCIyMlwiIGhlaWdodD1cIjIyXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIxLjhcIj5cbiAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTUgMTNoNHY2SDV6XCIgLz5cbiAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTEwIDloNHYxMGgtNHpcIiAvPlxuICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMTUgNWg0djE0aC00elwiIC8+XG4gICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAzMiwgZm9udFdlaWdodDogNzAwLCBjb2xvcjogc3RhdC5jb2xvciB9fT57c3RhdC52YWx1ZX08L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiA4LCBmb250U2l6ZTogMTQsIGNvbG9yOiAnIzZiNzI4MCcgfX0+e3N0YXQubGFiZWx9PC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkpfVxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxEYXNoYm9hcmRDaGFydHMgcGF5bG9hZD17ZGF0YX0gLz5cblxuICAgICAgPFNlbGxlck1hcFBhbmVsXG4gICAgICAgIHBheWxvYWQ9e3tcbiAgICAgICAgICBzdGF0czogZGF0YS5zdGF0cyxcbiAgICAgICAgICBzZWxsZXJzOiBkYXRhLm1hcC5zZWxsZXJzLFxuICAgICAgICAgIG5vTG9jYXRpb246IGRhdGEubWFwLm5vTG9jYXRpb24sXG4gICAgICAgIH19XG4gICAgICAvPlxuXG4gICAgICA8c2VjdGlvbiBzdHlsZT17eyAuLi5jYXJkU3R5bGUsIHBhZGRpbmc6IDIwIH19PlxuICAgICAgICA8ZGl2IHN0eWxlPXtzZWN0aW9uSGVhZGVyU3R5bGV9PlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aDIgc3R5bGU9e3NlY3Rpb25UaXRsZVN0eWxlfT5SZWNlbnQgYWN0aXZpdHkgZmVlZDwvaDI+XG4gICAgICAgICAgICA8cCBzdHlsZT17c2VjdGlvblN1YnRpdGxlU3R5bGV9Pkxhc3QgMTAgYXVkaXQgZW50cmllcyBhY3Jvc3Mgc2VsbGVyIHJldmlld3MsIHVwc3RyZWFtIGRlY2lzaW9ucywgYW5kIHNlc3Npb24gYWN0aW9ucy48L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIHtkYXRhLnJlY2VudEFjdGl2aXR5Lm1hcCgoYWN0aXZpdHkpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFjdGlvbkNvbG9yID1cbiAgICAgICAgICAgICAgYWN0aXZpdHkuYWN0aW9uID09PSAnc2VsbGVyLmFwcHJvdmVkJ1xuICAgICAgICAgICAgICAgID8gJyMxMGI5ODEnXG4gICAgICAgICAgICAgICAgOiBhY3Rpdml0eS5hY3Rpb24gPT09ICdzZWxsZXIucmVqZWN0ZWQnXG4gICAgICAgICAgICAgICAgICA/ICcjZWY0NDQ0J1xuICAgICAgICAgICAgICAgICAgOiBhY3Rpdml0eS5hY3Rpb24gPT09ICdzZWxsZXIuc3VibWl0dGVkJ1xuICAgICAgICAgICAgICAgICAgICA/ICcjM2I4MmY2J1xuICAgICAgICAgICAgICAgICAgICA6ICcjOGI1Y2Y2JztcblxuICAgICAgICAgICAgY29uc3QgYWN0aW9uTGFiZWwgPSBhY3Rpdml0eS5hY3Rpb24uc3BsaXQoJy4nKS5wb3AoKSA/PyBhY3Rpdml0eS5hY3Rpb247XG5cbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICBrZXk9e2FjdGl2aXR5LmlkfVxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgICAgICAgICAgICAgICBnYXA6IDEyLFxuICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTBweCAwJyxcbiAgICAgICAgICAgICAgICAgIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjZTVlN2ViJyxcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyB3aWR0aDogOCwgaGVpZ2h0OiA4LCBib3JkZXJSYWRpdXM6ICc1MCUnLCBiYWNrZ3JvdW5kOiBhY3Rpb25Db2xvciB9fSAvPlxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDE0IH19PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFdlaWdodDogNjAwIH19PnthY3Rpdml0eS5zZWxsZXJOYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGNvbG9yOiAnIzZiNzI4MCcgfX0+IHdhcyB7YWN0aW9uTGFiZWwucmVwbGFjZSgnLScsICcgJyl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgY29sb3I6ICcjOWNhM2FmJywgbWFyZ2luTGVmdDogOCB9fT5ieSB7YWN0aXZpdHkuYWN0b3J9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luTGVmdDogJ2F1dG8nLCBjb2xvcjogJyM5Y2EzYWYnLCBmb250U2l6ZTogMTIgfX0+XG4gICAgICAgICAgICAgICAgICA8ZGl2Pnt0aW1lQWdvKGFjdGl2aXR5LmNyZWF0ZWRBdCl9PC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogMiB9fT57Zm9ybWF0RGF0ZVRpbWUoYWN0aXZpdHkuY3JlYXRlZEF0KX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvc2VjdGlvbj5cbiAgICA8L2Rpdj5cbiAgKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IERhc2hib2FyZDtcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VNZW1vLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IHR5cGUgeyBBZG1pblNlbGxlclJlY29yZCwgU2VsbGVyRGlyZWN0b3J5UGF5bG9hZCB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7XG4gIEJhZGdlLFxuICBFcnJvclN0YXRlLFxuICBMb2FkaW5nU3RhdGUsXG4gIGNhcmRTdHlsZSxcbiAgZm9ybWF0RGF0ZVRpbWUsXG4gIHBhZ2VTdHlsZSxcbiAgc2VjdGlvbkhlYWRlclN0eWxlLFxuICBzZWN0aW9uU3VidGl0bGVTdHlsZSxcbiAgc2VjdGlvblRpdGxlU3R5bGUsXG4gIHN0YXR1c0NvbG9ycyxcbiAgdXNlUGFnZURhdGEsXG59IGZyb20gJy4vc2hhcmVkJztcblxuY29uc3QgaW5wdXRTdHlsZTogUmVhY3QuQ1NTUHJvcGVydGllcyA9IHtcbiAgd2lkdGg6ICcxMDAlJyxcbiAgYm9yZGVyUmFkaXVzOiA4LFxuICBib3JkZXI6ICcxcHggc29saWQgI2QxZDVkYicsXG4gIHBhZGRpbmc6ICcxMHB4IDEycHgnLFxuICBmb250U2l6ZTogMTMsXG4gIGNvbG9yOiAnIzFmMjkzNycsXG4gIGJveFNpemluZzogJ2JvcmRlci1ib3gnLFxufTtcblxuY29uc3Qgc3RhdHVzQnV0dG9uU3R5bGUgPSAoYWN0aXZlOiBib29sZWFuKTogUmVhY3QuQ1NTUHJvcGVydGllcyA9PiAoe1xuICBib3JkZXJSYWRpdXM6IDk5OSxcbiAgYm9yZGVyOiBgMXB4IHNvbGlkICR7YWN0aXZlID8gJyMzYjgyZjYnIDogJyNkMWQ1ZGInfWAsXG4gIGJhY2tncm91bmQ6IGFjdGl2ZSA/ICcjM2I4MmY2JyA6ICcjZmZmZmZmJyxcbiAgY29sb3I6IGFjdGl2ZSA/ICcjZmZmZmZmJyA6ICcjMzc0MTUxJyxcbiAgZm9udFdlaWdodDogNjAwLFxuICBmb250U2l6ZTogMTIsXG4gIHBhZGRpbmc6ICc3cHggMTJweCcsXG4gIGN1cnNvcjogJ3BvaW50ZXInLFxufSk7XG5cbmNvbnN0IHRhYmxlSGVhZGVyU3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7XG4gIGZvbnRTaXplOiAxMSxcbiAgdGV4dFRyYW5zZm9ybTogJ3VwcGVyY2FzZScsXG4gIGxldHRlclNwYWNpbmc6ICcwLjA2ZW0nLFxuICBjb2xvcjogJyM2YjcyODAnLFxuICBmb250V2VpZ2h0OiA2MDAsXG4gIHBhZGRpbmc6ICcxMnB4IDE2cHgnLFxuICB0ZXh0QWxpZ246ICdsZWZ0JyxcbiAgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNlNWU3ZWInLFxufTtcblxuY29uc3QgdGFibGVDZWxsU3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7XG4gIHBhZGRpbmc6ICcxNHB4IDE2cHgnLFxuICBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2VlZjJmNycsXG4gIHZlcnRpY2FsQWxpZ246ICd0b3AnLFxuICBmb250U2l6ZTogMTMsXG4gIGNvbG9yOiAnIzFmMjkzNycsXG59O1xuXG5jb25zdCBkZXRhaWxHcmlkU3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7XG4gIGRpc3BsYXk6ICdncmlkJyxcbiAgZ2FwOiAxMixcbn07XG5cbmNvbnN0IGRldGFpbExhYmVsU3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7XG4gIGZvbnRTaXplOiAxMSxcbiAgdGV4dFRyYW5zZm9ybTogJ3VwcGVyY2FzZScsXG4gIGxldHRlclNwYWNpbmc6ICcwLjA2ZW0nLFxuICBjb2xvcjogJyM5Y2EzYWYnLFxuICBmb250V2VpZ2h0OiA3MDAsXG59O1xuXG5jb25zdCBkZXRhaWxWYWx1ZVN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0ge1xuICBmb250U2l6ZTogMTMsXG4gIGNvbG9yOiAnIzFmMjkzNycsXG59O1xuXG5jb25zdCBnZXRQcm9maWxlUGljVXJsID0gKHNlbGxlcjogQWRtaW5TZWxsZXJSZWNvcmQpOiBzdHJpbmcgfCBudWxsID0+IHNlbGxlci51cHN0cmVhbS5wcm9maWxlUGljVXJsID8/IG51bGw7XG5cbmNvbnN0IGJ1aWxkSW5pdGlhbHMgPSAobGFiZWw6IHN0cmluZyk6IHN0cmluZyA9PlxuICBsYWJlbFxuICAgIC5zcGxpdCgvXFxzKy8pXG4gICAgLmZpbHRlcihCb29sZWFuKVxuICAgIC5zbGljZSgwLCAyKVxuICAgIC5tYXAoKHBhcnQpID0+IHBhcnQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkpXG4gICAgLmpvaW4oJycpO1xuXG5jb25zdCBTZWxsZXJEaXJlY3RvcnkgPSAoKSA9PiB7XG4gIGNvbnN0IHsgZGF0YSwgbG9hZGluZywgZXJyb3IgfSA9IHVzZVBhZ2VEYXRhPFNlbGxlckRpcmVjdG9yeVBheWxvYWQ+KCdzZWxsZXJzJyk7XG4gIGNvbnN0IFtxdWVyeSwgc2V0UXVlcnldID0gdXNlU3RhdGUoJycpO1xuICBjb25zdCBbc3RhdHVzLCBzZXRTdGF0dXNdID0gdXNlU3RhdGU8J2FsbCcgfCAncGVuZGluZycgfCAnYXBwcm92ZWQnIHwgJ3JlamVjdGVkJz4oJ2FsbCcpO1xuICBjb25zdCBbc2VsZWN0ZWRJZCwgc2V0U2VsZWN0ZWRJZF0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKTtcblxuICBjb25zdCBmaWx0ZXJlZCA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIGlmICghZGF0YSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGNvbnN0IG5vcm1hbGl6ZWRRdWVyeSA9IHF1ZXJ5LnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgcmV0dXJuIGRhdGEuc2VsbGVycy5maWx0ZXIoKHNlbGxlcikgPT4ge1xuICAgICAgaWYgKHN0YXR1cyAhPT0gJ2FsbCcgJiYgc2VsbGVyLnN0YXR1cyAhPT0gc3RhdHVzKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFub3JtYWxpemVkUXVlcnkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBbXG4gICAgICAgIHNlbGxlci5zZWxsZXJOYW1lLFxuICAgICAgICBzZWxsZXIuYnVzaW5lc3NOYW1lLFxuICAgICAgICBzZWxsZXIuZW1haWwsXG4gICAgICAgIHNlbGxlci5waG9uZSxcbiAgICAgICAgc2VsbGVyLmdzdE9yRW5yb2xsbWVudElkLFxuICAgICAgICBzZWxsZXIubG9jYXRpb24uY2l0eSxcbiAgICAgICAgc2VsbGVyLmxvY2F0aW9uLnN0YXRlLFxuICAgICAgICBzZWxsZXIudXBzdHJlYW0udXNlcm5hbWUgPz8gJycsXG4gICAgICBdXG4gICAgICAgIC5qb2luKCcgJylcbiAgICAgICAgLnRvTG93ZXJDYXNlKClcbiAgICAgICAgLmluY2x1ZGVzKG5vcm1hbGl6ZWRRdWVyeSk7XG4gICAgfSk7XG4gIH0sIFtkYXRhLCBxdWVyeSwgc3RhdHVzXSk7XG5cbiAgY29uc3Qgc2VsZWN0ZWRTZWxsZXIgPVxuICAgIGZpbHRlcmVkLmZpbmQoKHNlbGxlcikgPT4gc2VsbGVyLmlkID09PSBzZWxlY3RlZElkKSA/P1xuICAgIGRhdGE/LnNlbGxlcnMuZmluZCgoc2VsbGVyKSA9PiBzZWxsZXIuaWQgPT09IHNlbGVjdGVkSWQpID8/XG4gICAgZmlsdGVyZWRbMF0gPz9cbiAgICBudWxsO1xuICBjb25zdCBzZWxlY3RlZERldGFpbCA9IHNlbGVjdGVkU2VsbGVyID8gZGF0YT8uZGV0YWlsc1tzZWxlY3RlZFNlbGxlci5pZF0gPz8gbnVsbCA6IG51bGw7XG5cbiAgaWYgKGxvYWRpbmcpIHtcbiAgICByZXR1cm4gPExvYWRpbmdTdGF0ZSBsYWJlbD1cIkxvYWRpbmcgc2VsbGVycy4uLlwiIC8+O1xuICB9XG5cbiAgaWYgKGVycm9yIHx8ICFkYXRhKSB7XG4gICAgcmV0dXJuIDxFcnJvclN0YXRlIG1lc3NhZ2U9e2Vycm9yID8/ICdTZWxsZXIgZGF0YSBpcyB1bmF2YWlsYWJsZSd9IC8+O1xuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IHN0eWxlPXtwYWdlU3R5bGV9PlxuICAgICAgPHNlY3Rpb24gc3R5bGU9e3sgLi4uY2FyZFN0eWxlLCBwYWRkaW5nOiAyNCB9fT5cbiAgICAgICAgPGRpdiBzdHlsZT17c2VjdGlvbkhlYWRlclN0eWxlfT5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgxIHN0eWxlPXt7IG1hcmdpbjogMCwgZm9udFNpemU6IDI4LCBmb250V2VpZ2h0OiA3MDAsIGNvbG9yOiAnIzFmMjkzNycgfX0+U2VsbGVyczwvaDE+XG4gICAgICAgICAgICA8cCBzdHlsZT17eyBtYXJnaW46ICc2cHggMCAwJywgY29sb3I6ICcjNmI3MjgwJywgZm9udFNpemU6IDE0IH19PlxuICAgICAgICAgICAgICBSZWFkLW9ubHkgc2VsbGVyIGRpcmVjdG9yeSBwb3dlcmVkIGJ5IHRoZSB1cHN0cmVhbSBaYXRjaCBzZWxsZXIgc291cmNlLlxuICAgICAgICAgICAgPC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBnYXA6IDEwLCBmbGV4V3JhcDogJ3dyYXAnIH19PlxuICAgICAgICAgICAgPEJhZGdlIGxhYmVsPXtgJHtkYXRhLnN0YXRzLnRvdGFsfSB0b3RhbGB9IGJhY2tncm91bmQ9XCIjZGJlYWZlXCIgY29sb3I9XCIjMWQ0ZWQ4XCIgLz5cbiAgICAgICAgICAgIDxCYWRnZSBsYWJlbD17YCR7ZGF0YS5zdGF0cy5wZW5kaW5nfSBwZW5kaW5nYH0gYmFja2dyb3VuZD1cIiNmZWYzYzdcIiBjb2xvcj1cIiM5MjQwMGVcIiAvPlxuICAgICAgICAgICAgPEJhZGdlIGxhYmVsPXtgJHtkYXRhLnN0YXRzLmFwcHJvdmVkfSBhcHByb3ZlZGB9IGJhY2tncm91bmQ9XCIjZDFmYWU1XCIgY29sb3I9XCIjMDY1ZjQ2XCIgLz5cbiAgICAgICAgICAgIDxCYWRnZSBsYWJlbD17YCR7ZGF0YS5zdGF0cy5yZWplY3RlZH0gcmVqZWN0ZWRgfSBiYWNrZ3JvdW5kPVwiI2ZlZTJlMlwiIGNvbG9yPVwiIzk5MWIxYlwiIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2dyaWQnLCBncmlkVGVtcGxhdGVDb2x1bW5zOiAnbWlubWF4KDI0MHB4LCAxZnIpIGF1dG8nLCBnYXA6IDEyLCBhbGlnbkl0ZW1zOiAnY2VudGVyJyB9fT5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIHZhbHVlPXtxdWVyeX1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldFF1ZXJ5KGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNlYXJjaCBieSBuYW1lLCBidXNpbmVzcywgZW1haWwsIEdTVCwgY2l0eSwgb3IgdXNlcm5hbWVcIlxuICAgICAgICAgICAgc3R5bGU9e2lucHV0U3R5bGV9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiA4LCBmbGV4V3JhcDogJ3dyYXAnLCBqdXN0aWZ5Q29udGVudDogJ2ZsZXgtZW5kJyB9fT5cbiAgICAgICAgICAgIHsoWydhbGwnLCAncGVuZGluZycsICdhcHByb3ZlZCcsICdyZWplY3RlZCddIGFzIGNvbnN0KS5tYXAoKHZhbHVlKSA9PiAoXG4gICAgICAgICAgICAgIDxidXR0b24ga2V5PXt2YWx1ZX0gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldFN0YXR1cyh2YWx1ZSl9IHN0eWxlPXtzdGF0dXNCdXR0b25TdHlsZShzdGF0dXMgPT09IHZhbHVlKX0+XG4gICAgICAgICAgICAgICAge3ZhbHVlID09PSAnYWxsJyA/ICdBbGwnIDogdmFsdWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB2YWx1ZS5zbGljZSgxKX1cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2dyaWQnLCBncmlkVGVtcGxhdGVDb2x1bW5zOiAnbWlubWF4KDAsIDEuMzVmcikgbWlubWF4KDM2MHB4LCAxZnIpJywgZ2FwOiAyMCwgYWxpZ25JdGVtczogJ3N0YXJ0JyB9fT5cbiAgICAgICAgPHNlY3Rpb24gc3R5bGU9e3sgLi4uY2FyZFN0eWxlLCBvdmVyZmxvdzogJ2hpZGRlbicgfX0+XG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBwYWRkaW5nOiAyMCwgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNlNWU3ZWInIH19PlxuICAgICAgICAgICAgPGgyIHN0eWxlPXtzZWN0aW9uVGl0bGVTdHlsZX0+RGlyZWN0b3J5PC9oMj5cbiAgICAgICAgICAgIDxwIHN0eWxlPXtzZWN0aW9uU3VidGl0bGVTdHlsZX0+U2FtZSBzZWxsZXIgcXVldWUgc3R5bGUgYXMgdGhlIG9wcyBwb3J0YWwsIHdpdGggZnVsbCB1cHN0cmVhbSBkZXRhaWwgb24gc2VsZWN0aW9uLjwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG92ZXJmbG93WDogJ2F1dG8nIH19PlxuICAgICAgICAgICAgPHRhYmxlIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIGJvcmRlckNvbGxhcHNlOiAnY29sbGFwc2UnIH19PlxuICAgICAgICAgICAgICA8dGhlYWQgc3R5bGU9e3sgYmFja2dyb3VuZDogJyNmOWZhZmInIH19PlxuICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17dGFibGVIZWFkZXJTdHlsZX0+U2VsbGVyPC90aD5cbiAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17dGFibGVIZWFkZXJTdHlsZX0+Q29udGFjdDwvdGg+XG4gICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3RhYmxlSGVhZGVyU3R5bGV9PkxvY2F0aW9uPC90aD5cbiAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17dGFibGVIZWFkZXJTdHlsZX0+U3RhdHVzPC90aD5cbiAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17dGFibGVIZWFkZXJTdHlsZX0+UmVjZWl2ZWQ8L3RoPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICB7ZmlsdGVyZWQubWFwKChzZWxsZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9ycyA9XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvbG9yc1tzZWxsZXIuc3RhdHVzXSA/PyB7XG4gICAgICAgICAgICAgICAgICAgICAgZmlsbDogJyNmNTllMGInLFxuICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICcjOTI0MDBlJyxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDx0clxuICAgICAgICAgICAgICAgICAgICAgIGtleT17c2VsbGVyLmlkfVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNlbGVjdGVkSWQoc2VsbGVyLmlkKX1cbiAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBzZWxlY3RlZFNlbGxlcj8uaWQgPT09IHNlbGxlci5pZCA/ICcjZWZmNmZmJyA6ICcjZmZmZmZmJyxcbiAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt0YWJsZUNlbGxTdHlsZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiAxMiwgYWxpZ25JdGVtczogJ2ZsZXgtc3RhcnQnIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7Z2V0UHJvZmlsZVBpY1VybChzZWxsZXIpID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbWdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyYz17Z2V0UHJvZmlsZVBpY1VybChzZWxsZXIpID8/ICcnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0PXtzZWxsZXIuc2VsbGVyTmFtZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiA0MiwgaGVpZ2h0OiA0MiwgYm9yZGVyUmFkaXVzOiAnNTAlJywgb2JqZWN0Rml0OiAnY292ZXInIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogNDIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogNDIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzUwJScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjZGJlYWZlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjMWQ0ZWQ4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiA3MDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmxleFNocmluazogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2J1aWxkSW5pdGlhbHMoc2VsbGVyLnNlbGxlck5hbWUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFdlaWdodDogNjAwIH19PntzZWxsZXIuc2VsbGVyTmFtZX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGNvbG9yOiAnIzZiNzI4MCcsIG1hcmdpblRvcDogNCB9fT57c2VsbGVyLmJ1c2luZXNzTmFtZX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGNvbG9yOiAnIzljYTNhZicsIG1hcmdpblRvcDogNCwgZm9udFNpemU6IDEyIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQHtzZWxsZXIudXBzdHJlYW0udXNlcm5hbWUgPz8gJ3Vua25vd24nfSDigKIge3NlbGxlci5lbWFpbCB8fCAnTm8gZW1haWwnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt0YWJsZUNlbGxTdHlsZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDYwMCB9fT57c2VsbGVyLnBob25lIHx8ICdVbmF2YWlsYWJsZSd9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGNvbG9yOiAnIzZiNzI4MCcsIG1hcmdpblRvcDogNCB9fT57c2VsbGVyLmVtYWlsIHx8ICdVbmF2YWlsYWJsZSd9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3RhYmxlQ2VsbFN0eWxlfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFdlaWdodDogNjAwIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7W3NlbGxlci5sb2NhdGlvbi5jaXR5LCBzZWxsZXIubG9jYXRpb24uc3RhdGVdLmZpbHRlcihCb29sZWFuKS5qb2luKCcsICcpIHx8ICdMb2NhdGlvbiB1bmF2YWlsYWJsZSd9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgY29sb3I6ICcjNmI3MjgwJywgbWFyZ2luVG9wOiA0LCBmb250U2l6ZTogMTIgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtbc2VsbGVyLmxvY2F0aW9uLnN0cmVldCwgc2VsbGVyLmxvY2F0aW9uLnBpbmNvZGVdLmZpbHRlcihCb29sZWFuKS5qb2luKCcg4oCiICcpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3RhYmxlQ2VsbFN0eWxlfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxCYWRnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17c2VsbGVyLnN0YXR1c31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZD17Y29sb3JzLmZpbGwgPT09ICcjMTBiOTgxJyA/ICcjZDFmYWU1JyA6IGNvbG9ycy5maWxsID09PSAnI2VmNDQ0NCcgPyAnI2ZlZTJlMicgOiAnI2ZlZjNjNyd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yPXtjb2xvcnMudGV4dH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGNvbG9yOiAnIzljYTNhZicsIG1hcmdpblRvcDogNiwgZm9udFNpemU6IDEyIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICBSYXc6IHtzZWxsZXIudXBzdHJlYW0ucmF3U2VsbGVyU3RhdHVzID8/IHNlbGxlci5zdGF0dXN9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17dGFibGVDZWxsU3R5bGV9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj57Zm9ybWF0RGF0ZVRpbWUoc2VsbGVyLnJlY2VpdmVkQXQpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBjb2xvcjogJyM5Y2EzYWYnLCBtYXJnaW5Ub3A6IDQsIGZvbnRTaXplOiAxMiB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgVXBkYXRlZCB7Zm9ybWF0RGF0ZVRpbWUoc2VsbGVyLnVwZGF0ZWRBdCl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAgICB7ZmlsdGVyZWQubGVuZ3RoID09PSAwID8gKFxuICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGQgY29sU3Bhbj17NX0gc3R5bGU9e3sgLi4udGFibGVDZWxsU3R5bGUsIGNvbG9yOiAnIzZiNzI4MCcsIHRleHRBbGlnbjogJ2NlbnRlcicsIHBhZGRpbmc6IDI4IH19PlxuICAgICAgICAgICAgICAgICAgICAgIE5vIHNlbGxlcnMgbWF0Y2hlZCB0aGUgY3VycmVudCBmaWx0ZXJzLlxuICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8YXNpZGUgc3R5bGU9e3sgLi4uY2FyZFN0eWxlLCBwYWRkaW5nOiAyMCwgcG9zaXRpb246ICdzdGlja3knLCB0b3A6IDI0IH19PlxuICAgICAgICAgIDxkaXYgc3R5bGU9e3NlY3Rpb25IZWFkZXJTdHlsZX0+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8aDIgc3R5bGU9e3NlY3Rpb25UaXRsZVN0eWxlfT5TZWxsZXIgRGV0YWlsczwvaDI+XG4gICAgICAgICAgICAgIDxwIHN0eWxlPXtzZWN0aW9uU3VidGl0bGVTdHlsZX0+UmVhZC1vbmx5IHVwc3RyZWFtIHNuYXBzaG90IGZvciBzdXBlciBhZG1pbiByZXZpZXcuPC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICB7c2VsZWN0ZWRTZWxsZXIgPyAoXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdncmlkJywgZ2FwOiAxOCB9fT5cbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGdhcDogMTIsIGFsaWduSXRlbXM6ICdjZW50ZXInIH19PlxuICAgICAgICAgICAgICAgIHtnZXRQcm9maWxlUGljVXJsKHNlbGVjdGVkU2VsbGVyKSA/IChcbiAgICAgICAgICAgICAgICAgIDxpbWdcbiAgICAgICAgICAgICAgICAgICAgc3JjPXtnZXRQcm9maWxlUGljVXJsKHNlbGVjdGVkU2VsbGVyKSA/PyAnJ31cbiAgICAgICAgICAgICAgICAgICAgYWx0PXtzZWxlY3RlZFNlbGxlci5zZWxsZXJOYW1lfVxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyB3aWR0aDogNTIsIGhlaWdodDogNTIsIGJvcmRlclJhZGl1czogJzUwJScsIG9iamVjdEZpdDogJ2NvdmVyJyB9fVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiA1MixcbiAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IDUyLFxuICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzUwJScsXG4gICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNkYmVhZmUnLFxuICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzFkNGVkOCcsXG4gICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxuICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiA3MDAsXG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHtidWlsZEluaXRpYWxzKHNlbGVjdGVkU2VsbGVyLnNlbGxlck5hbWUpfVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogMTgsIGZvbnRXZWlnaHQ6IDcwMCwgY29sb3I6ICcjMWYyOTM3JyB9fT57c2VsZWN0ZWRTZWxsZXIuc2VsbGVyTmFtZX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgY29sb3I6ICcjNmI3MjgwJywgbWFyZ2luVG9wOiA0IH19PntzZWxlY3RlZFNlbGxlci5idXNpbmVzc05hbWV9PC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e2RldGFpbEdyaWRTdHlsZX0+XG4gICAgICAgICAgICAgICAge1tcbiAgICAgICAgICAgICAgICAgIFsnVXNlcm5hbWUnLCBzZWxlY3RlZFNlbGxlci51cHN0cmVhbS51c2VybmFtZSA/PyAnVW5rbm93biddLFxuICAgICAgICAgICAgICAgICAgWydFbWFpbCcsIHNlbGVjdGVkU2VsbGVyLmVtYWlsIHx8ICdVbmF2YWlsYWJsZSddLFxuICAgICAgICAgICAgICAgICAgWydQaG9uZScsIHNlbGVjdGVkU2VsbGVyLnBob25lIHx8ICdVbmF2YWlsYWJsZSddLFxuICAgICAgICAgICAgICAgICAgWydHU1QgLyBFbnJvbGxtZW50Jywgc2VsZWN0ZWRTZWxsZXIuZ3N0T3JFbnJvbGxtZW50SWQgfHwgJ1VuYXZhaWxhYmxlJ10sXG4gICAgICAgICAgICAgICAgICBbJ1NoaXBwaW5nIE1ldGhvZCcsIHNlbGVjdGVkU2VsbGVyLnVwc3RyZWFtLnNoaXBwaW5nTWV0aG9kID8/ICdVbmF2YWlsYWJsZSddLFxuICAgICAgICAgICAgICAgICAgWydEb2N1bWVudHMnLCBgJHtzZWxlY3RlZFNlbGxlci5kb2N1bWVudHNDb3VudH1gXSxcbiAgICAgICAgICAgICAgICAgIFsnQWRkcmVzcycsIFtzZWxlY3RlZFNlbGxlci5sb2NhdGlvbi5zdHJlZXQsIHNlbGVjdGVkU2VsbGVyLmxvY2F0aW9uLmNpdHksIHNlbGVjdGVkU2VsbGVyLmxvY2F0aW9uLnN0YXRlLCBzZWxlY3RlZFNlbGxlci5sb2NhdGlvbi5waW5jb2RlXS5maWx0ZXIoQm9vbGVhbikuam9pbignLCAnKSB8fCAnVW5hdmFpbGFibGUnXSxcbiAgICAgICAgICAgICAgICBdLm1hcCgoW2xhYmVsLCB2YWx1ZV0pID0+IChcbiAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtsYWJlbH0gc3R5bGU9e3sgZGlzcGxheTogJ2dyaWQnLCBnYXA6IDQgfX0+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e2RldGFpbExhYmVsU3R5bGV9PntsYWJlbH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17ZGV0YWlsVmFsdWVTdHlsZX0+e3ZhbHVlfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZ1RvcDogMTQsIGJvcmRlclRvcDogJzFweCBzb2xpZCAjZTVlN2ViJywgZGlzcGxheTogJ2dyaWQnLCBnYXA6IDggfX0+XG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nLCBnYXA6IDEyIH19PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgY29sb3I6ICcjNmI3MjgwJywgZm9udFNpemU6IDEyIH19PkN1cnJlbnQgc3RhdHVzPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPEJhZGdlXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPXtzZWxlY3RlZFNlbGxlci5zdGF0dXN9XG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ9e1xuICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkU2VsbGVyLnN0YXR1cyA9PT0gJ2FwcHJvdmVkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgPyAnI2QxZmFlNSdcbiAgICAgICAgICAgICAgICAgICAgICAgIDogc2VsZWN0ZWRTZWxsZXIuc3RhdHVzID09PSAncmVqZWN0ZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgID8gJyNmZWUyZTInXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogJyNmZWYzYzcnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29sb3I9e1xuICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkU2VsbGVyLnN0YXR1cyA9PT0gJ2FwcHJvdmVkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgPyAnIzA2NWY0NidcbiAgICAgICAgICAgICAgICAgICAgICAgIDogc2VsZWN0ZWRTZWxsZXIuc3RhdHVzID09PSAncmVqZWN0ZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgID8gJyM5OTFiMWInXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogJyM5MjQwMGUnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBjb2xvcjogJyM2YjcyODAnLCBmb250U2l6ZTogMTIgfX0+XG4gICAgICAgICAgICAgICAgICBSZWNlaXZlZCB7Zm9ybWF0RGF0ZVRpbWUoc2VsZWN0ZWRTZWxsZXIucmVjZWl2ZWRBdCl9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAge3NlbGVjdGVkU2VsbGVyLmxhc3RTdGF0dXNBdCA/IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgY29sb3I6ICcjNmI3MjgwJywgZm9udFNpemU6IDEyIH19PlxuICAgICAgICAgICAgICAgICAgICBMYXN0IHN0YXR1cyB1cGRhdGUge2Zvcm1hdERhdGVUaW1lKHNlbGVjdGVkU2VsbGVyLmxhc3RTdGF0dXNBdCl9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICB7c2VsZWN0ZWRTZWxsZXIubGFzdFN0YXR1c05vdGUgPyAoXG4gICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNmOGZhZmMnLFxuICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJyxcbiAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6IDgsXG4gICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogMTIsXG4gICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjNDc1NTY5JyxcbiAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZFNlbGxlci5sYXN0U3RhdHVzTm90ZX1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICB7c2VsZWN0ZWREZXRhaWwgPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZ1RvcDogMTQsIGJvcmRlclRvcDogJzFweCBzb2xpZCAjZTVlN2ViJywgZGlzcGxheTogJ2dyaWQnLCBnYXA6IDEyIH19PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtkZXRhaWxMYWJlbFN0eWxlfT5TZWxsZXIgUHJvZmlsZTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtkZXRhaWxHcmlkU3R5bGV9PlxuICAgICAgICAgICAgICAgICAgICAgIHtbXG4gICAgICAgICAgICAgICAgICAgICAgICBbJ0J1c2luZXNzIE5hbWUnLCBzZWxlY3RlZERldGFpbC5zZWxsZXJQcm9maWxlLmJ1c2luZXNzTmFtZSB8fCAnVW5hdmFpbGFibGUnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFsnU2hpcHBpbmcgTWV0aG9kJywgc2VsZWN0ZWREZXRhaWwuc2VsbGVyUHJvZmlsZS5zaGlwcGluZ01ldGhvZCB8fCAnVW5hdmFpbGFibGUnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFsnVCZDIEFjY2VwdGVkJywgc2VsZWN0ZWREZXRhaWwuc2VsbGVyUHJvZmlsZS50Y0FjY2VwdGVkID8gJ1llcycgOiAnTm8nXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFsnQmlsbGluZyBBZGRyZXNzJywgc2VsZWN0ZWREZXRhaWwuc2VsbGVyUHJvZmlsZS5hZGRyZXNzLmJpbGxpbmdBZGRyZXNzIHx8ICdVbmF2YWlsYWJsZSddLFxuICAgICAgICAgICAgICAgICAgICAgICAgWydQaWNrdXAgQWRkcmVzcycsIHNlbGVjdGVkRGV0YWlsLnNlbGxlclByb2ZpbGUuYWRkcmVzcy5waWNrdXBBZGRyZXNzIHx8ICdVbmF2YWlsYWJsZSddLFxuICAgICAgICAgICAgICAgICAgICAgICAgWydQaW5jb2RlJywgc2VsZWN0ZWREZXRhaWwuc2VsbGVyUHJvZmlsZS5hZGRyZXNzLnBpbkNvZGUgfHwgJ1VuYXZhaWxhYmxlJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICBbJ1N0YXRlJywgc2VsZWN0ZWREZXRhaWwuc2VsbGVyUHJvZmlsZS5hZGRyZXNzLnN0YXRlIHx8ICdVbmF2YWlsYWJsZSddLFxuICAgICAgICAgICAgICAgICAgICAgIF0ubWFwKChbbGFiZWwsIHZhbHVlXSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e2xhYmVsfSBzdHlsZT17eyBkaXNwbGF5OiAnZ3JpZCcsIGdhcDogNCB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17ZGV0YWlsTGFiZWxTdHlsZX0+e2xhYmVsfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtkZXRhaWxWYWx1ZVN0eWxlfT57dmFsdWV9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBwYWRkaW5nVG9wOiAxNCwgYm9yZGVyVG9wOiAnMXB4IHNvbGlkICNlNWU3ZWInLCBkaXNwbGF5OiAnZ3JpZCcsIGdhcDogMTIgfX0+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e2RldGFpbExhYmVsU3R5bGV9PkJhbmsgRGV0YWlsczwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtkZXRhaWxHcmlkU3R5bGV9PlxuICAgICAgICAgICAgICAgICAgICAgIHtbXG4gICAgICAgICAgICAgICAgICAgICAgICBbJ0FjY291bnQgSG9sZGVyJywgc2VsZWN0ZWREZXRhaWwuc2VsbGVyUHJvZmlsZS5iYW5rRGV0YWlscy5hY2NvdW50SG9sZGVyTmFtZSB8fCAnVW5hdmFpbGFibGUnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFsnQWNjb3VudCBOdW1iZXInLCBzZWxlY3RlZERldGFpbC5zZWxsZXJQcm9maWxlLmJhbmtEZXRhaWxzLmFjY291bnROdW1iZXIgfHwgJ1VuYXZhaWxhYmxlJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICBbJ0JhbmsnLCBzZWxlY3RlZERldGFpbC5zZWxsZXJQcm9maWxlLmJhbmtEZXRhaWxzLmJhbmtOYW1lIHx8ICdVbmF2YWlsYWJsZSddLFxuICAgICAgICAgICAgICAgICAgICAgICAgWydJRlNDJywgc2VsZWN0ZWREZXRhaWwuc2VsbGVyUHJvZmlsZS5iYW5rRGV0YWlscy5pZnNjQ29kZSB8fCAnVW5hdmFpbGFibGUnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFsnVVBJJywgc2VsZWN0ZWREZXRhaWwuc2VsbGVyUHJvZmlsZS5iYW5rRGV0YWlscy51cGlJZCB8fCAnVW5hdmFpbGFibGUnXSxcbiAgICAgICAgICAgICAgICAgICAgICBdLm1hcCgoW2xhYmVsLCB2YWx1ZV0pID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtsYWJlbH0gc3R5bGU9e3sgZGlzcGxheTogJ2dyaWQnLCBnYXA6IDQgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e2RldGFpbExhYmVsU3R5bGV9PntsYWJlbH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17ZGV0YWlsVmFsdWVTdHlsZX0+e3ZhbHVlfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZ1RvcDogMTQsIGJvcmRlclRvcDogJzFweCBzb2xpZCAjZTVlN2ViJywgZGlzcGxheTogJ2dyaWQnLCBnYXA6IDEyIH19PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtkZXRhaWxMYWJlbFN0eWxlfT5Db21tZXJjZSBTbmFwc2hvdDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdncmlkJywgZ3JpZFRlbXBsYXRlQ29sdW1uczogJ3JlcGVhdCgyLCBtaW5tYXgoMCwgMWZyKSknLCBnYXA6IDEyIH19PlxuICAgICAgICAgICAgICAgICAgICAgIHtbXG4gICAgICAgICAgICAgICAgICAgICAgICBbJ0ZvbGxvd2VycycsIHNlbGVjdGVkRGV0YWlsLmZvbGxvd2VyQ291bnRdLFxuICAgICAgICAgICAgICAgICAgICAgICAgWydSZXZpZXdzJywgc2VsZWN0ZWREZXRhaWwucmV2aWV3c0NvdW50XSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFsnUHJvZHVjdHMgU29sZCcsIHNlbGVjdGVkRGV0YWlsLnByb2R1Y3RzU29sZENvdW50XSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFsnUmF0aW5nJywgc2VsZWN0ZWREZXRhaWwuY3VzdG9tZXJSYXRpbmddLFxuICAgICAgICAgICAgICAgICAgICAgICAgWydTYXZlZCBQcm9kdWN0cycsIHNlbGVjdGVkRGV0YWlsLnNhdmVkUHJvZHVjdHMubGVuZ3RoXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFsnU2VsbGluZyBQcm9kdWN0cycsIHNlbGVjdGVkRGV0YWlsLnNlbGxpbmdQcm9kdWN0cy5sZW5ndGhdLFxuICAgICAgICAgICAgICAgICAgICAgICAgWydVcGxvYWRlZCBCaXRzJywgc2VsZWN0ZWREZXRhaWwudXBsb2FkZWRCaXRzLmxlbmd0aF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBbJ1NhdmVkIEJpdHMnLCBzZWxlY3RlZERldGFpbC5zYXZlZEJpdHMubGVuZ3RoXSxcbiAgICAgICAgICAgICAgICAgICAgICBdLm1hcCgoW2xhYmVsLCB2YWx1ZV0pID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtsYWJlbH0gc3R5bGU9e3sgLi4uY2FyZFN0eWxlLCBwYWRkaW5nOiAxMiwgYm94U2hhZG93OiAnbm9uZScgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e2RldGFpbExhYmVsU3R5bGV9PntsYWJlbH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyAuLi5kZXRhaWxWYWx1ZVN0eWxlLCBtYXJnaW5Ub3A6IDYsIGZvbnRTaXplOiAxOCwgZm9udFdlaWdodDogNzAwIH19Pnt2YWx1ZX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmdUb3A6IDE0LCBib3JkZXJUb3A6ICcxcHggc29saWQgI2U1ZTdlYicsIGRpc3BsYXk6ICdncmlkJywgZ2FwOiAxMiB9fT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17ZGV0YWlsTGFiZWxTdHlsZX0+RG9jdW1lbnRzPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZERldGFpbC5zZWxsZXJQcm9maWxlLmRvY3VtZW50cy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2dyaWQnLCBnYXA6IDggfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWREZXRhaWwuc2VsbGVyUHJvZmlsZS5kb2N1bWVudHMubWFwKChkb2N1bWVudCkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8YVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleT17YCR7ZG9jdW1lbnQucHVibGljSWR9LSR7ZG9jdW1lbnQudHlwZX1gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhyZWY9e2RvY3VtZW50LnVybH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbD1cIm5vcmVmZXJyZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0RGVjb3JhdGlvbjogJ25vbmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjMjU2M2ViJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogOCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6IDEwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNmOGZhZmMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ZG9jdW1lbnQudHlwZX0g4oCiIE9wZW4gZG9jdW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBjb2xvcjogJyM2YjcyODAnLCBmb250U2l6ZTogMTMgfX0+Tm8gc2VsbGVyIGRvY3VtZW50cyB3ZXJlIHJldHVybmVkIGJ5IHRoZSB1cHN0cmVhbSBBUEkuPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBwYWRkaW5nVG9wOiAxNCwgYm9yZGVyVG9wOiAnMXB4IHNvbGlkICNlNWU3ZWInLCBkaXNwbGF5OiAnZ3JpZCcsIGdhcDogMTIgfX0+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e2RldGFpbExhYmVsU3R5bGV9PlByb2R1Y3RzICYgQWN0aXZpdHk8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZ3JpZCcsIGdhcDogOCB9fT5cbiAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWREZXRhaWwuc2VsbGluZ1Byb2R1Y3RzLnNsaWNlKDAsIDUpLm1hcCgocHJvZHVjdCkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e2BzZWxsaW5nLSR7cHJvZHVjdC5pZH1gfSBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYicsIGJvcmRlclJhZGl1czogOCwgcGFkZGluZzogMTAgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFdlaWdodDogNjAwLCBmb250U2l6ZTogMTMgfX0+e3Byb2R1Y3QubmFtZX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBjb2xvcjogJyM2YjcyODAnLCBmb250U2l6ZTogMTIsIG1hcmdpblRvcDogNCB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cHJvZHVjdC5jYXRlZ29yeX0g4oCiIFJzLiB7cHJvZHVjdC5kaXNjb3VudGVkUHJpY2UgPz8gcHJvZHVjdC5wcmljZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWREZXRhaWwuc2VsbGluZ1Byb2R1Y3RzLmxlbmd0aCA9PT0gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgY29sb3I6ICcjNmI3MjgwJywgZm9udFNpemU6IDEzIH19Pk5vIHNlbGxpbmcgcHJvZHVjdHMgYXZhaWxhYmxlLjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmdUb3A6IDE0LCBib3JkZXJUb3A6ICcxcHggc29saWQgI2U1ZTdlYicsIGRpc3BsYXk6ICdncmlkJywgZ2FwOiAxMiB9fT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17ZGV0YWlsTGFiZWxTdHlsZX0+QmFyZ2FpbnM8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZ3JpZCcsIGdhcDogOCB9fT5cbiAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWREZXRhaWwuYmFyZ2FpbnNXaXRoU2VsbGVyLnNsaWNlKDAsIDUpLm1hcCgoYmFyZ2FpbikgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e2JhcmdhaW4uaWR9IHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJywgYm9yZGVyUmFkaXVzOiA4LCBwYWRkaW5nOiAxMCB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250V2VpZ2h0OiA2MDAsIGZvbnRTaXplOiAxMyB9fT57YmFyZ2Fpbi5wcm9kdWN0TmFtZX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBjb2xvcjogJyM2YjcyODAnLCBmb250U2l6ZTogMTIsIG1hcmdpblRvcDogNCB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YmFyZ2Fpbi5zdGF0dXNMYWJlbH0g4oCiIFJzLiB7YmFyZ2Fpbi5jdXJyZW50UHJpY2V9IOKAoiB7YmFyZ2Fpbi5yb2xlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZERldGFpbC5iYXJnYWluc1dpdGhTZWxsZXIubGVuZ3RoID09PSAwID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBjb2xvcjogJyM2YjcyODAnLCBmb250U2l6ZTogMTMgfX0+Tm8gYmFyZ2FpbnMgYXZhaWxhYmxlLjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRTaXplOiAxMyB9fT5TZWxlY3QgYSBzZWxsZXIgdG8gaW5zcGVjdCB0aGVpciB1cHN0cmVhbSBkZXRhaWxzLjwvZGl2PlxuICAgICAgICAgICl9XG4gICAgICAgIDwvYXNpZGU+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFNlbGxlckRpcmVjdG9yeTtcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVJlZiB9IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IHR5cGUgeyBBbmFseXRpY3NQYXlsb2FkIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHtcbiAgRXJyb3JTdGF0ZSxcbiAgTG9hZGluZ1N0YXRlLFxuICBjYXJkU3R5bGUsXG4gIHBhZ2VTdHlsZSxcbiAgc2VjdGlvbkhlYWRlclN0eWxlLFxuICBzZWN0aW9uU3VidGl0bGVTdHlsZSxcbiAgc2VjdGlvblRpdGxlU3R5bGUsXG4gIHVzZUNoYXJ0SnMsXG4gIHVzZVBhZ2VEYXRhLFxufSBmcm9tICcuL3NoYXJlZCc7XG5cbmNvbnN0IEFuYWx5dGljc0NoYXJ0cyA9ICh7IHBheWxvYWQgfTogeyBwYXlsb2FkOiBBbmFseXRpY3NQYXlsb2FkIH0pID0+IHtcbiAgY29uc3QgY2hhcnRDb25zdHJ1Y3RvciA9IHVzZUNoYXJ0SnMoKTtcbiAgY29uc3Qgc3RhdGVzQ2FudmFzUmVmID0gdXNlUmVmPEhUTUxDYW52YXNFbGVtZW50IHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IGFwcHJvdmFsQ2FudmFzUmVmID0gdXNlUmVmPEhUTUxDYW52YXNFbGVtZW50IHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IGhvdXJzQ2FudmFzUmVmID0gdXNlUmVmPEhUTUxDYW52YXNFbGVtZW50IHwgbnVsbD4obnVsbCk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIWNoYXJ0Q29uc3RydWN0b3IgfHwgIXN0YXRlc0NhbnZhc1JlZi5jdXJyZW50IHx8ICFhcHByb3ZhbENhbnZhc1JlZi5jdXJyZW50IHx8ICFob3Vyc0NhbnZhc1JlZi5jdXJyZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhdGVDb250ZXh0ID0gc3RhdGVzQ2FudmFzUmVmLmN1cnJlbnQuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBjb25zdCBhcHByb3ZhbENvbnRleHQgPSBhcHByb3ZhbENhbnZhc1JlZi5jdXJyZW50LmdldENvbnRleHQoJzJkJyk7XG4gICAgY29uc3QgaG91cnNDb250ZXh0ID0gaG91cnNDYW52YXNSZWYuY3VycmVudC5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgaWYgKCFzdGF0ZUNvbnRleHQgfHwgIWFwcHJvdmFsQ29udGV4dCB8fCAhaG91cnNDb250ZXh0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhdGVzQ2hhcnQgPSBuZXcgY2hhcnRDb25zdHJ1Y3RvcihzdGF0ZUNvbnRleHQsIHtcbiAgICAgIHR5cGU6ICdiYXInLFxuICAgICAgZGF0YToge1xuICAgICAgICBsYWJlbHM6IHBheWxvYWQudG9wU3RhdGVzLm1hcCgoaXRlbSkgPT4gaXRlbS5sYWJlbCksXG4gICAgICAgIGRhdGFzZXRzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgZGF0YTogcGF5bG9hZC50b3BTdGF0ZXMubWFwKChpdGVtKSA9PiBpdGVtLmNvdW50KSxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyMzYjgyZjYnLFxuICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiA2LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgICAgb3B0aW9uczoge1xuICAgICAgICBtYWludGFpbkFzcGVjdFJhdGlvOiBmYWxzZSxcbiAgICAgICAgaW5kZXhBeGlzOiAneScsXG4gICAgICAgIHBsdWdpbnM6IHsgbGVnZW5kOiB7IGRpc3BsYXk6IGZhbHNlIH0gfSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBhcHByb3ZhbENoYXJ0ID0gbmV3IGNoYXJ0Q29uc3RydWN0b3IoYXBwcm92YWxDb250ZXh0LCB7XG4gICAgICB0eXBlOiAnbGluZScsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGxhYmVsczogcGF5bG9hZC5hcHByb3ZhbFJhdGUubWFwKChpdGVtKSA9PiBpdGVtLmxhYmVsKSxcbiAgICAgICAgZGF0YXNldHM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogJ1N1Ym1pdHRlZCcsXG4gICAgICAgICAgICBkYXRhOiBwYXlsb2FkLmFwcHJvdmFsUmF0ZS5tYXAoKGl0ZW0pID0+IGl0ZW0uc3VibWl0dGVkKSxcbiAgICAgICAgICAgIGJvcmRlckNvbG9yOiAnIzNiODJmNicsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjM2I4MmY2JyxcbiAgICAgICAgICAgIHRlbnNpb246IDAuMzUsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogJ0FwcHJvdmVkJyxcbiAgICAgICAgICAgIGRhdGE6IHBheWxvYWQuYXBwcm92YWxSYXRlLm1hcCgoaXRlbSkgPT4gaXRlbS5hcHByb3ZlZCksXG4gICAgICAgICAgICBib3JkZXJDb2xvcjogJyMxMGI5ODEnLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzEwYjk4MScsXG4gICAgICAgICAgICB0ZW5zaW9uOiAwLjM1LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgICAgb3B0aW9uczoge1xuICAgICAgICBtYWludGFpbkFzcGVjdFJhdGlvOiBmYWxzZSxcbiAgICAgICAgcGx1Z2luczoge1xuICAgICAgICAgIGxlZ2VuZDogeyBwb3NpdGlvbjogJ2JvdHRvbScgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBob3Vyc0NoYXJ0ID0gbmV3IGNoYXJ0Q29uc3RydWN0b3IoaG91cnNDb250ZXh0LCB7XG4gICAgICB0eXBlOiAnYmFyJyxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgbGFiZWxzOiBwYXlsb2FkLmJ1c2llc3RIb3Vycy5tYXAoKGl0ZW0pID0+IGl0ZW0ubGFiZWwpLFxuICAgICAgICBkYXRhc2V0czogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGRhdGE6IHBheWxvYWQuYnVzaWVzdEhvdXJzLm1hcCgoaXRlbSkgPT4gaXRlbS5jb3VudCksXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZjU5ZTBiJyxcbiAgICAgICAgICAgIGJvcmRlclJhZGl1czogNCxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgbWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXG4gICAgICAgIHBsdWdpbnM6IHsgbGVnZW5kOiB7IGRpc3BsYXk6IGZhbHNlIH0gfSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgc3RhdGVzQ2hhcnQuZGVzdHJveSgpO1xuICAgICAgYXBwcm92YWxDaGFydC5kZXN0cm95KCk7XG4gICAgICBob3Vyc0NoYXJ0LmRlc3Ryb3koKTtcbiAgICB9O1xuICB9LCBbY2hhcnRDb25zdHJ1Y3RvciwgcGF5bG9hZF0pO1xuXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxzZWN0aW9uIHN0eWxlPXt7IC4uLmNhcmRTdHlsZSwgcGFkZGluZzogMjAgfX0+XG4gICAgICAgIDxkaXYgc3R5bGU9e3NlY3Rpb25IZWFkZXJTdHlsZX0+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxoMiBzdHlsZT17c2VjdGlvblRpdGxlU3R5bGV9PlRvcCBzdGF0ZXMgYnkgc2VsbGVyIGNvdW50PC9oMj5cbiAgICAgICAgICAgIDxwIHN0eWxlPXtzZWN0aW9uU3VidGl0bGVTdHlsZX0+U2VsbGVyIGNvbmNlbnRyYXRpb24gYnkgc3RhdGUgZnJvbSBhdmFpbGFibGUgbG9jYXRpb24gbWV0YWRhdGEuPC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBzdHlsZT17eyBoZWlnaHQ6IDI4MCB9fT5cbiAgICAgICAgICA8Y2FudmFzIHJlZj17c3RhdGVzQ2FudmFzUmVmfSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gc3R5bGU9e3sgLi4uY2FyZFN0eWxlLCBwYWRkaW5nOiAyMCB9fT5cbiAgICAgICAgPGRpdiBzdHlsZT17c2VjdGlvbkhlYWRlclN0eWxlfT5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgyIHN0eWxlPXtzZWN0aW9uVGl0bGVTdHlsZX0+QXBwcm92YWwgcmF0ZSBvdmVyIHRpbWU8L2gyPlxuICAgICAgICAgICAgPHAgc3R5bGU9e3NlY3Rpb25TdWJ0aXRsZVN0eWxlfT5TdWJtaXR0ZWQgdnMgYXBwcm92ZWQgc2VsbGVycyBhY3Jvc3MgdGhlIGxhc3QgMTIgbW9udGhzLjwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgc3R5bGU9e3sgaGVpZ2h0OiAzMjAgfX0+XG4gICAgICAgICAgPGNhbnZhcyByZWY9e2FwcHJvdmFsQ2FudmFzUmVmfSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZ3JpZCcsIGdhcDogMjAsIGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICczMjBweCAxZnInIH19PlxuICAgICAgICA8c2VjdGlvbiBzdHlsZT17eyAuLi5jYXJkU3R5bGUsIHBhZGRpbmc6IDIwIH19PlxuICAgICAgICAgIDxkaXYgc3R5bGU9e3NlY3Rpb25IZWFkZXJTdHlsZX0+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8aDIgc3R5bGU9e3NlY3Rpb25UaXRsZVN0eWxlfT5BdmVyYWdlIHRpbWUgdG8gYWN0aW9uPC9oMj5cbiAgICAgICAgICAgICAgPHAgc3R5bGU9e3NlY3Rpb25TdWJ0aXRsZVN0eWxlfT5UaW1lIGZyb20gc3VibWlzc2lvbiB0byBmaXJzdCBhcHByb3ZhbCBvciByZWplY3Rpb24uPC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogMzQsIGZvbnRXZWlnaHQ6IDcwMCwgY29sb3I6ICcjMWYyOTM3JyB9fT5cbiAgICAgICAgICAgIHtwYXlsb2FkLmF2ZXJhZ2VBY3Rpb25Ib3VycyA9PT0gbnVsbCA/ICfigJQnIDogYCR7cGF5bG9hZC5hdmVyYWdlQWN0aW9uSG91cnMudG9GaXhlZCgxKX1oYH1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIHN0eWxlPXt7IC4uLmNhcmRTdHlsZSwgcGFkZGluZzogMjAgfX0+XG4gICAgICAgICAgPGRpdiBzdHlsZT17c2VjdGlvbkhlYWRlclN0eWxlfT5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgIDxoMiBzdHlsZT17c2VjdGlvblRpdGxlU3R5bGV9PlJlamVjdGlvbiByZWFzb25zPC9oMj5cbiAgICAgICAgICAgICAgPHAgc3R5bGU9e3NlY3Rpb25TdWJ0aXRsZVN0eWxlfT5Nb3N0IGNvbW1vbiB3b3JkcyBleHRyYWN0ZWQgZnJvbSByZWplY3Rpb24gbm90ZXMuPC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGZsZXhXcmFwOiAnd3JhcCcsIGdhcDogMTAgfX0+XG4gICAgICAgICAgICB7cGF5bG9hZC5yZWplY3Rpb25Xb3Jkcy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgICAgICAgPHNwYW5cbiAgICAgICAgICAgICAgICBrZXk9e2l0ZW0ud29yZH1cbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1mbGV4JyxcbiAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgZ2FwOiA4LFxuICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzhweCAxMnB4JyxcbiAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjZWVmMmZmJyxcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzQzMzhjYScsXG4gICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6IDk5OSxcbiAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMixcbiAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IDYwMCxcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge2l0ZW0ud29yZH1cbiAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBvcGFjaXR5OiAwLjc1IH19PntpdGVtLmNvdW50fTwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICB7cGF5bG9hZC5yZWplY3Rpb25Xb3Jkcy5sZW5ndGggPT09IDAgPyAoXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgY29sb3I6ICcjNmI3MjgwJywgZm9udFNpemU6IDEzIH19Pk5vIHJlamVjdGlvbiBub3RlcyBhdmFpbGFibGUgeWV0LjwvZGl2PlxuICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8c2VjdGlvbiBzdHlsZT17eyAuLi5jYXJkU3R5bGUsIHBhZGRpbmc6IDIwIH19PlxuICAgICAgICA8ZGl2IHN0eWxlPXtzZWN0aW9uSGVhZGVyU3R5bGV9PlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aDIgc3R5bGU9e3NlY3Rpb25UaXRsZVN0eWxlfT5CdXNpZXN0IHN1Ym1pc3Npb24gaG91cnM8L2gyPlxuICAgICAgICAgICAgPHAgc3R5bGU9e3NlY3Rpb25TdWJ0aXRsZVN0eWxlfT5XaGF0IHRpbWUgb2YgZGF5IHNlbGxlcnMgc3VibWl0IG1vc3Qgb2Z0ZW4uPC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBzdHlsZT17eyBoZWlnaHQ6IDI4MCB9fT5cbiAgICAgICAgICA8Y2FudmFzIHJlZj17aG91cnNDYW52YXNSZWZ9IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuICAgIDwvPlxuICApO1xufTtcblxuY29uc3QgU2VsbGVyQW5hbHl0aWNzID0gKCkgPT4ge1xuICBjb25zdCB7IGRhdGEsIGxvYWRpbmcsIGVycm9yIH0gPSB1c2VQYWdlRGF0YTxBbmFseXRpY3NQYXlsb2FkPignc2VsbGVyLWFuYWx5dGljcycpO1xuXG4gIGNvbnN0IHN0YXRQaWxscyA9IHVzZU1lbW8oXG4gICAgKCkgPT5cbiAgICAgIGRhdGFcbiAgICAgICAgPyBbXG4gICAgICAgICAgICB7IGxhYmVsOiAnVG90YWwnLCB2YWx1ZTogZGF0YS5zdGF0cy50b3RhbCwgY29sb3I6ICcjM2I4MmY2JywgYmc6ICcjZGJlYWZlJyB9LFxuICAgICAgICAgICAgeyBsYWJlbDogJ1BlbmRpbmcnLCB2YWx1ZTogZGF0YS5zdGF0cy5wZW5kaW5nLCBjb2xvcjogJyNmNTllMGInLCBiZzogJyNmZWYzYzcnIH0sXG4gICAgICAgICAgICB7IGxhYmVsOiAnQXBwcm92ZWQnLCB2YWx1ZTogZGF0YS5zdGF0cy5hcHByb3ZlZCwgY29sb3I6ICcjMTBiOTgxJywgYmc6ICcjZDFmYWU1JyB9LFxuICAgICAgICAgICAgeyBsYWJlbDogJ1JlamVjdGVkJywgdmFsdWU6IGRhdGEuc3RhdHMucmVqZWN0ZWQsIGNvbG9yOiAnI2VmNDQ0NCcsIGJnOiAnI2ZlZTJlMicgfSxcbiAgICAgICAgICBdXG4gICAgICAgIDogW10sXG4gICAgW2RhdGFdLFxuICApO1xuXG4gIGlmIChsb2FkaW5nKSB7XG4gICAgcmV0dXJuIDxMb2FkaW5nU3RhdGUgbGFiZWw9XCJMb2FkaW5nIGFuYWx5dGljcy4uLlwiIC8+O1xuICB9XG5cbiAgaWYgKGVycm9yIHx8ICFkYXRhKSB7XG4gICAgcmV0dXJuIDxFcnJvclN0YXRlIG1lc3NhZ2U9e2Vycm9yID8/ICdBbmFseXRpY3MgZGF0YSBpcyB1bmF2YWlsYWJsZSd9IC8+O1xuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IHN0eWxlPXtwYWdlU3R5bGV9PlxuICAgICAgPHNlY3Rpb24gc3R5bGU9e3sgLi4uY2FyZFN0eWxlLCBwYWRkaW5nOiAyNCB9fT5cbiAgICAgICAgPGRpdiBzdHlsZT17c2VjdGlvbkhlYWRlclN0eWxlfT5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgxIHN0eWxlPXt7IG1hcmdpbjogMCwgZm9udFNpemU6IDI4LCBmb250V2VpZ2h0OiA3MDAsIGNvbG9yOiAnIzFmMjkzNycgfX0+U2VsbGVyIEFuYWx5dGljczwvaDE+XG4gICAgICAgICAgICA8cCBzdHlsZT17eyBtYXJnaW46ICc2cHggMCAwJywgY29sb3I6ICcjNmI3MjgwJywgZm9udFNpemU6IDE0IH19PlxuICAgICAgICAgICAgICBPcGVyYXRpb25hbCB0cmVuZHMgYWNyb3NzIHNlbGxlciBhY2NvdW50IHZvbHVtZSwgYXBwcm92YWxzLCBhbmQgcmV2aWV3IGJlaGF2aW9yLlxuICAgICAgICAgICAgPC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGZsZXhXcmFwOiAnd3JhcCcsIGdhcDogMTAgfX0+XG4gICAgICAgICAge3N0YXRQaWxscy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICAgIGtleT17aXRlbS5sYWJlbH1cbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWZsZXgnLFxuICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgIGdhcDogOCxcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnOHB4IDEycHgnLFxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogOTk5LFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IGl0ZW0uYmcsXG4gICAgICAgICAgICAgICAgY29sb3I6IGl0ZW0uY29sb3IsXG4gICAgICAgICAgICAgICAgZm9udFdlaWdodDogNzAwLFxuICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMyxcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge2l0ZW0ubGFiZWx9OiB7aXRlbS52YWx1ZX1cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L3NlY3Rpb24+XG4gICAgICA8QW5hbHl0aWNzQ2hhcnRzIHBheWxvYWQ9e2RhdGF9IC8+XG4gICAgPC9kaXY+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBTZWxsZXJBbmFseXRpY3M7XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlTWVtbywgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCB0eXBlIHsgQXVkaXRUaW1lbGluZVBheWxvYWQgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQge1xuICBFcnJvclN0YXRlLFxuICBMb2FkaW5nU3RhdGUsXG4gIGFjdGlvbkNvbG9ycyxcbiAgY2FyZFN0eWxlLFxuICBmb3JtYXREYXRlVGltZSxcbiAgcGFnZVN0eWxlLFxuICBzZWN0aW9uSGVhZGVyU3R5bGUsXG4gIHNlY3Rpb25TdWJ0aXRsZVN0eWxlLFxuICBzZWN0aW9uVGl0bGVTdHlsZSxcbiAgdXNlUGFnZURhdGEsXG59IGZyb20gJy4vc2hhcmVkJztcblxuY29uc3QgaXNJblJhbmdlID0gKHZhbHVlOiBzdHJpbmcsIGZyb21EYXRlOiBzdHJpbmcsIHRvRGF0ZTogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKHZhbHVlKS5nZXRUaW1lKCk7XG5cbiAgaWYgKGZyb21EYXRlKSB7XG4gICAgY29uc3QgZnJvbVRpbWVzdGFtcCA9IG5ldyBEYXRlKGAke2Zyb21EYXRlfVQwMDowMDowMGApLmdldFRpbWUoKTtcbiAgICBpZiAodGltZXN0YW1wIDwgZnJvbVRpbWVzdGFtcCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0b0RhdGUpIHtcbiAgICBjb25zdCB0b1RpbWVzdGFtcCA9IG5ldyBEYXRlKGAke3RvRGF0ZX1UMjM6NTk6NTlgKS5nZXRUaW1lKCk7XG4gICAgaWYgKHRpbWVzdGFtcCA+IHRvVGltZXN0YW1wKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5jb25zdCBBdWRpdFRpbWVsaW5lID0gKCkgPT4ge1xuICBjb25zdCB7IGRhdGEsIGxvYWRpbmcsIGVycm9yIH0gPSB1c2VQYWdlRGF0YTxBdWRpdFRpbWVsaW5lUGF5bG9hZD4oJ2F1ZGl0LXRpbWVsaW5lJyk7XG4gIGNvbnN0IFthY3Rpb25GaWx0ZXIsIHNldEFjdGlvbkZpbHRlcl0gPSB1c2VTdGF0ZSgnYWxsJyk7XG4gIGNvbnN0IFthZG1pbkZpbHRlciwgc2V0QWRtaW5GaWx0ZXJdID0gdXNlU3RhdGUoJ2FsbCcpO1xuICBjb25zdCBbZnJvbURhdGUsIHNldEZyb21EYXRlXSA9IHVzZVN0YXRlKCcnKTtcbiAgY29uc3QgW3RvRGF0ZSwgc2V0VG9EYXRlXSA9IHVzZVN0YXRlKCcnKTtcbiAgY29uc3QgW3BhZ2UsIHNldFBhZ2VdID0gdXNlU3RhdGUoMSk7XG4gIGNvbnN0IHBhZ2VTaXplID0gMjU7XG5cbiAgY29uc3QgZmlsdGVyZWRMb2dzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgaWYgKCFkYXRhKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGEubG9ncy5maWx0ZXIoKGxvZykgPT4ge1xuICAgICAgY29uc3QgbWF0Y2hlc0FjdGlvbiA9IGFjdGlvbkZpbHRlciA9PT0gJ2FsbCcgfHwgbG9nLmFjdGlvbiA9PT0gYWN0aW9uRmlsdGVyO1xuICAgICAgY29uc3QgbWF0Y2hlc0FkbWluID0gYWRtaW5GaWx0ZXIgPT09ICdhbGwnIHx8IGxvZy5hY3RvciA9PT0gYWRtaW5GaWx0ZXI7XG4gICAgICBjb25zdCBtYXRjaGVzRGF0ZSA9IGlzSW5SYW5nZShsb2cuY3JlYXRlZEF0LCBmcm9tRGF0ZSwgdG9EYXRlKTtcblxuICAgICAgcmV0dXJuIG1hdGNoZXNBY3Rpb24gJiYgbWF0Y2hlc0FkbWluICYmIG1hdGNoZXNEYXRlO1xuICAgIH0pO1xuICB9LCBbYWN0aW9uRmlsdGVyLCBhZG1pbkZpbHRlciwgZGF0YSwgZnJvbURhdGUsIHRvRGF0ZV0pO1xuXG4gIGNvbnN0IHBhZ2VkTG9ncyA9IGZpbHRlcmVkTG9ncy5zbGljZSgocGFnZSAtIDEpICogcGFnZVNpemUsIHBhZ2UgKiBwYWdlU2l6ZSk7XG4gIGNvbnN0IHRvdGFsUGFnZXMgPSBNYXRoLm1heCgxLCBNYXRoLmNlaWwoZmlsdGVyZWRMb2dzLmxlbmd0aCAvIHBhZ2VTaXplKSk7XG5cbiAgaWYgKGxvYWRpbmcpIHtcbiAgICByZXR1cm4gPExvYWRpbmdTdGF0ZSBsYWJlbD1cIkxvYWRpbmcgYXVkaXQgdGltZWxpbmUuLi5cIiAvPjtcbiAgfVxuXG4gIGlmIChlcnJvciB8fCAhZGF0YSkge1xuICAgIHJldHVybiA8RXJyb3JTdGF0ZSBtZXNzYWdlPXtlcnJvciA/PyAnQXVkaXQgdGltZWxpbmUgZGF0YSBpcyB1bmF2YWlsYWJsZSd9IC8+O1xuICB9XG5cbiAgbGV0IGxhc3REYXRlTGFiZWwgPSAnJztcblxuICByZXR1cm4gKFxuICAgIDxkaXYgc3R5bGU9e3BhZ2VTdHlsZX0+XG4gICAgICA8c2VjdGlvbiBzdHlsZT17eyAuLi5jYXJkU3R5bGUsIHBhZGRpbmc6IDI0IH19PlxuICAgICAgICA8ZGl2IHN0eWxlPXtzZWN0aW9uSGVhZGVyU3R5bGV9PlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aDEgc3R5bGU9e3sgbWFyZ2luOiAwLCBmb250U2l6ZTogMjgsIGZvbnRXZWlnaHQ6IDcwMCwgY29sb3I6ICcjMWYyOTM3JyB9fT5BdWRpdCBUaW1lbGluZTwvaDE+XG4gICAgICAgICAgICA8cCBzdHlsZT17eyBtYXJnaW46ICc2cHggMCAwJywgY29sb3I6ICcjNmI3MjgwJywgZm9udFNpemU6IDE0IH19PlxuICAgICAgICAgICAgICBWaXN1YWwgdGltZWxpbmUgb2YgYXVkaXQgZXZlbnRzIGFjcm9zcyBzZWxsZXJzIGFuZCBhZG1pbiBzZXNzaW9ucy5cbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZ3JpZCcsIGdhcDogMTIsIGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICdyZXBlYXQoNCwgbWlubWF4KDAsIDFmcikpJyB9fT5cbiAgICAgICAgICA8c2VsZWN0XG4gICAgICAgICAgICB2YWx1ZT17YWN0aW9uRmlsdGVyfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICBzZXRBY3Rpb25GaWx0ZXIoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgICAgICAgc2V0UGFnZSgxKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBzdHlsZT17eyBib3JkZXJSYWRpdXM6IDgsIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJywgcGFkZGluZzogJzEwcHggMTJweCcgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiYWxsXCI+QWxsIGFjdGlvbnM8L29wdGlvbj5cbiAgICAgICAgICAgIHtkYXRhLmFjdGlvbk9wdGlvbnMubWFwKChhY3Rpb24pID0+IChcbiAgICAgICAgICAgICAgPG9wdGlvbiBrZXk9e2FjdGlvbn0gdmFsdWU9e2FjdGlvbn0+XG4gICAgICAgICAgICAgICAge2FjdGlvbn1cbiAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L3NlbGVjdD5cblxuICAgICAgICAgIDxzZWxlY3RcbiAgICAgICAgICAgIHZhbHVlPXthZG1pbkZpbHRlcn1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgc2V0QWRtaW5GaWx0ZXIoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgICAgICAgc2V0UGFnZSgxKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBzdHlsZT17eyBib3JkZXJSYWRpdXM6IDgsIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJywgcGFkZGluZzogJzEwcHggMTJweCcgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiYWxsXCI+QWxsIGFkbWluczwvb3B0aW9uPlxuICAgICAgICAgICAge2RhdGEuYWRtaW5PcHRpb25zLm1hcCgoYWRtaW4pID0+IChcbiAgICAgICAgICAgICAgPG9wdGlvbiBrZXk9e2FkbWlufSB2YWx1ZT17YWRtaW59PlxuICAgICAgICAgICAgICAgIHthZG1pbn1cbiAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L3NlbGVjdD5cblxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgdHlwZT1cImRhdGVcIlxuICAgICAgICAgICAgdmFsdWU9e2Zyb21EYXRlfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICBzZXRGcm9tRGF0ZShldmVudC50YXJnZXQudmFsdWUpO1xuICAgICAgICAgICAgICBzZXRQYWdlKDEpO1xuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIHN0eWxlPXt7IGJvcmRlclJhZGl1czogOCwgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInLCBwYWRkaW5nOiAnMTBweCAxMnB4JyB9fVxuICAgICAgICAgIC8+XG5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIHR5cGU9XCJkYXRlXCJcbiAgICAgICAgICAgIHZhbHVlPXt0b0RhdGV9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIHNldFRvRGF0ZShldmVudC50YXJnZXQudmFsdWUpO1xuICAgICAgICAgICAgICBzZXRQYWdlKDEpO1xuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIHN0eWxlPXt7IGJvcmRlclJhZGl1czogOCwgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInLCBwYWRkaW5nOiAnMTBweCAxMnB4JyB9fVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8c2VjdGlvbiBzdHlsZT17eyAuLi5jYXJkU3R5bGUsIHBhZGRpbmc6IDI0IH19PlxuICAgICAgICB7cGFnZWRMb2dzLm1hcCgobG9nKSA9PiB7XG4gICAgICAgICAgY29uc3QgZGF0ZUxhYmVsID0gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQoJ2VuLUlOJywge1xuICAgICAgICAgICAgZGF5OiAnMi1kaWdpdCcsXG4gICAgICAgICAgICBtb250aDogJ3Nob3J0JyxcbiAgICAgICAgICAgIHllYXI6ICdudW1lcmljJyxcbiAgICAgICAgICB9KS5mb3JtYXQobmV3IERhdGUobG9nLmNyZWF0ZWRBdCkpO1xuXG4gICAgICAgICAgY29uc3Qgc2hvd0RhdGUgPSBkYXRlTGFiZWwgIT09IGxhc3REYXRlTGFiZWw7XG4gICAgICAgICAgbGFzdERhdGVMYWJlbCA9IGRhdGVMYWJlbDtcblxuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8UmVhY3QuRnJhZ21lbnQga2V5PXtsb2cuaWR9PlxuICAgICAgICAgICAgICB7c2hvd0RhdGUgPyAoXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW46ICcxMnB4IDAgOHB4JywgY29sb3I6ICcjNmI3MjgwJywgZm9udFdlaWdodDogNzAwLCBmb250U2l6ZTogMTIgfX0+XG4gICAgICAgICAgICAgICAgICB7ZGF0ZUxhYmVsfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZ3JpZCcsXG4gICAgICAgICAgICAgICAgICBncmlkVGVtcGxhdGVDb2x1bW5zOiAnMThweCBtaW5tYXgoMCwgMWZyKSBhdXRvJyxcbiAgICAgICAgICAgICAgICAgIGdhcDogMTIsXG4gICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnc3RhcnQnLFxuICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEwcHggMCcsXG4gICAgICAgICAgICAgICAgICBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2U1ZTdlYicsXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgIG1hcmdpblRvcDogNyxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDEwLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IDEwLFxuICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc1MCUnLFxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBhY3Rpb25Db2xvcnNbbG9nLmFjdGlvbl0gPz8gJyM4YjVjZjYnLFxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWluV2lkdGg6IDAgfX0+XG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGNvbG9yOiAnIzFmMjkzNycsIGZvbnRXZWlnaHQ6IDYwMCwgZm9udFNpemU6IDE0IH19PlxuICAgICAgICAgICAgICAgICAgICB7bG9nLmFjdGlvbn1cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgY29sb3I6ICcjNmI3MjgwJywgZm9udFdlaWdodDogNDAwLCBtYXJnaW5MZWZ0OiAxMCB9fT57bG9nLnNlbGxlck5hbWV9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogNCwgY29sb3I6ICcjNmI3MjgwJywgZm9udFNpemU6IDEyIH19PlxuICAgICAgICAgICAgICAgICAgICB7bG9nLmFjdG9yfSDCtyB7bG9nLnRhcmdldENvbGxlY3Rpb259IMK3IHtsb2cudGFyZ2V0SWR9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIHtsb2cubm90ZSA/IDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiA2LCBjb2xvcjogJyMzNzQxNTEnLCBmb250U2l6ZTogMTMgfX0+e2xvZy5ub3RlfTwvZGl2PiA6IG51bGx9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBjb2xvcjogJyM5Y2EzYWYnLCBmb250U2l6ZTogMTIgfX0+e2Zvcm1hdERhdGVUaW1lKGxvZy5jcmVhdGVkQXQpfTwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgKTtcbiAgICAgICAgfSl9XG5cbiAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBtYXJnaW5Ub3A6IDE2IH19PlxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgY29sb3I6ICcjNmI3MjgwJywgZm9udFNpemU6IDEzIH19PlxuICAgICAgICAgICAgU2hvd2luZyB7KHBhZ2UgLSAxKSAqIHBhZ2VTaXplICsgMX0te01hdGgubWluKHBhZ2UgKiBwYWdlU2l6ZSwgZmlsdGVyZWRMb2dzLmxlbmd0aCl9IG9mIHtmaWx0ZXJlZExvZ3MubGVuZ3RofVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBnYXA6IDggfX0+XG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRQYWdlKChjdXJyZW50KSA9PiBNYXRoLm1heCgxLCBjdXJyZW50IC0gMSkpfVxuICAgICAgICAgICAgICBkaXNhYmxlZD17cGFnZSA9PT0gMX1cbiAgICAgICAgICAgICAgc3R5bGU9e3sgYm9yZGVyUmFkaXVzOiA4LCBib3JkZXI6ICcxcHggc29saWQgI2QxZDVkYicsIHBhZGRpbmc6ICc4cHggMTJweCcsIGN1cnNvcjogJ3BvaW50ZXInIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIFByZXZpb3VzXG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFBhZ2UoKGN1cnJlbnQpID0+IE1hdGgubWluKHRvdGFsUGFnZXMsIGN1cnJlbnQgKyAxKSl9XG4gICAgICAgICAgICAgIGRpc2FibGVkPXtwYWdlID09PSB0b3RhbFBhZ2VzfVxuICAgICAgICAgICAgICBzdHlsZT17eyBib3JkZXJSYWRpdXM6IDgsIGJvcmRlcjogJzFweCBzb2xpZCAjZDFkNWRiJywgcGFkZGluZzogJzhweCAxMnB4JywgY3Vyc29yOiAncG9pbnRlcicgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgTmV4dFxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuICAgIDwvZGl2PlxuICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgQXVkaXRUaW1lbGluZTtcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VNZW1vIH0gZnJvbSAncmVhY3QnO1xuXG50eXBlIFRvcEJhclByb3BzID0ge1xuICB0b2dnbGVTaWRlYmFyPzogKCkgPT4gdm9pZDtcbn07XG5cbnR5cGUgUmVkdXhTZXNzaW9uID0ge1xuICBlbWFpbD86IHN0cmluZztcbn07XG5cbnR5cGUgUmVkdXhTdGF0ZSA9IHtcbiAgc2Vzc2lvbj86IFJlZHV4U2Vzc2lvbiB8IG51bGw7XG59O1xuXG50eXBlIEFkbWluV2luZG93ID0gV2luZG93ICYge1xuICBSRURVWF9TVEFURT86IFJlZHV4U3RhdGU7XG59O1xuXG5jb25zdCBnZXRQYWdlVGl0bGUgPSAocGF0aG5hbWU6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gIGlmIChwYXRobmFtZSA9PT0gJy9hZG1pbicgfHwgcGF0aG5hbWUgPT09ICcvYWRtaW4vJykge1xuICAgIHJldHVybiAnRGFzaGJvYXJkJztcbiAgfVxuXG4gIGlmIChwYXRobmFtZS5pbmNsdWRlcygnL3BhZ2VzL2hvbWUnKSkge1xuICAgIHJldHVybiAnSG9tZSc7XG4gIH1cblxuICBpZiAocGF0aG5hbWUuaW5jbHVkZXMoJy9wYWdlcy9zZWxsZXItbWFwJykpIHtcbiAgICByZXR1cm4gJ1NlbGxlciBNYXAnO1xuICB9XG5cbiAgaWYgKHBhdGhuYW1lLmluY2x1ZGVzKCcvcGFnZXMvc2VsbGVyLWFuYWx5dGljcycpKSB7XG4gICAgcmV0dXJuICdBbmFseXRpY3MnO1xuICB9XG5cbiAgaWYgKHBhdGhuYW1lLmluY2x1ZGVzKCcvcGFnZXMvYXVkaXQtdGltZWxpbmUnKSkge1xuICAgIHJldHVybiAnQXVkaXQgVGltZWxpbmUnO1xuICB9XG5cbiAgaWYgKHBhdGhuYW1lLmluY2x1ZGVzKCcvcmVzb3VyY2VzL0F1ZGl0TG9nJykpIHtcbiAgICByZXR1cm4gJ0F1ZGl0IExvZ3MnO1xuICB9XG5cbiAgaWYgKHBhdGhuYW1lLmluY2x1ZGVzKCcvcmVzb3VyY2VzL0FkbWluVXNlcicpKSB7XG4gICAgcmV0dXJuICdBZG1pbiBVc2Vycyc7XG4gIH1cblxuICByZXR1cm4gJ0FkbWluJztcbn07XG5cbmNvbnN0IGdldFBhZ2VTdWJ0aXRsZSA9IChwYXRobmFtZTogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgaWYgKHBhdGhuYW1lID09PSAnL2FkbWluJyB8fCBwYXRobmFtZSA9PT0gJy9hZG1pbi8nKSB7XG4gICAgcmV0dXJuICdaYXRjaCBBZG1pbiBvdmVydmlldyc7XG4gIH1cblxuICBpZiAocGF0aG5hbWUuaW5jbHVkZXMoJy9zaG93JykpIHtcbiAgICByZXR1cm4gJ1JlY29yZCBkZXRhaWwnO1xuICB9XG5cbiAgaWYgKHBhdGhuYW1lLmluY2x1ZGVzKCcvZWRpdCcpKSB7XG4gICAgcmV0dXJuICdFZGl0IHZpZXcnO1xuICB9XG5cbiAgaWYgKHBhdGhuYW1lLmluY2x1ZGVzKCcvbmV3JykpIHtcbiAgICByZXR1cm4gJ0NyZWF0ZSBuZXcgcmVjb3JkJztcbiAgfVxuXG4gIHJldHVybiBwYXRobmFtZS5yZXBsYWNlKCcvYWRtaW4nLCAnJykgfHwgJ0FkbWluJztcbn07XG5cbmNvbnN0IFRvcEJhciA9ICh7IHRvZ2dsZVNpZGViYXIgfTogVG9wQmFyUHJvcHMpID0+IHtcbiAgY29uc3QgcGF0aG5hbWUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA6ICcvYWRtaW4nO1xuICBjb25zdCBzZXNzaW9uID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyAod2luZG93IGFzIEFkbWluV2luZG93KS5SRURVWF9TVEFURT8uc2Vzc2lvbiA6IG51bGw7XG5cbiAgY29uc3QgdGl0bGUgPSB1c2VNZW1vKCgpID0+IGdldFBhZ2VUaXRsZShwYXRobmFtZSksIFtwYXRobmFtZV0pO1xuICBjb25zdCBzdWJ0aXRsZSA9IHVzZU1lbW8oKCkgPT4gZ2V0UGFnZVN1YnRpdGxlKHBhdGhuYW1lKSwgW3BhdGhuYW1lXSk7XG5cbiAgcmV0dXJuIChcbiAgICA8aGVhZGVyXG4gICAgICBzdHlsZT17e1xuICAgICAgICBoZWlnaHQ6IDU2LFxuICAgICAgICBiYWNrZ3JvdW5kOiAnI2ZmZmZmZicsXG4gICAgICAgIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjZTVlN2ViJyxcbiAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxuICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdzcGFjZS1iZXR3ZWVuJyxcbiAgICAgICAgcGFkZGluZzogJzAgMjBweCcsXG4gICAgICAgIHBvc2l0aW9uOiAnc3RpY2t5JyxcbiAgICAgICAgdG9wOiAwLFxuICAgICAgICB6SW5kZXg6IDMwLFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogMTIsIG1pbldpZHRoOiAwIH19PlxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgb25DbGljaz17KCkgPT4gdG9nZ2xlU2lkZWJhcj8uKCl9XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHdpZHRoOiAzNixcbiAgICAgICAgICAgIGhlaWdodDogMzYsXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6IDgsXG4gICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYicsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2ZmZmZmZicsXG4gICAgICAgICAgICBjb2xvcjogJyM2YjcyODAnLFxuICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXG4gICAgICAgICAgfX1cbiAgICAgICAgICBhcmlhLWxhYmVsPVwiVG9nZ2xlIG5hdmlnYXRpb25cIlxuICAgICAgICA+XG4gICAgICAgICAg4piwXG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8ZGl2IHN0eWxlPXt7IG1pbldpZHRoOiAwIH19PlxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDE1LCBmb250V2VpZ2h0OiA3MDAsIGNvbG9yOiAnIzFmMjkzNycgfX0+e3RpdGxlfTwvZGl2PlxuICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIGZvbnRTaXplOiAxMixcbiAgICAgICAgICAgICAgY29sb3I6ICcjOWNhM2FmJyxcbiAgICAgICAgICAgICAgbWFyZ2luVG9wOiAyLFxuICAgICAgICAgICAgICB3aGl0ZVNwYWNlOiAnbm93cmFwJyxcbiAgICAgICAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgICAgICAgICB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcycsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtzdWJ0aXRsZX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6IDEyIH19PlxuICAgICAgICA8ZGl2IHN0eWxlPXt7IHRleHRBbGlnbjogJ3JpZ2h0JyB9fT5cbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAxNCwgZm9udFdlaWdodDogNjAwLCBjb2xvcjogJyMxZjI5MzcnIH19PlxuICAgICAgICAgICAge3Nlc3Npb24/LmVtYWlsID8/ICdBZG1pbid9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogMTIsIGNvbG9yOiAnIzljYTNhZicgfX0+c3VwZXIgYWRtaW48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2hlYWRlcj5cbiAgKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFRvcEJhcjtcbiIsImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbnR5cGUgQnJhbmRpbmdPcHRpb25zID0ge1xuICBsb2dvPzogc3RyaW5nO1xuICBjb21wYW55TmFtZT86IHN0cmluZztcbn07XG5cbnR5cGUgU2lkZWJhckJyYW5kaW5nUHJvcHMgPSB7XG4gIGJyYW5kaW5nOiBCcmFuZGluZ09wdGlvbnM7XG59O1xuXG5jb25zdCBTaWRlYmFyQnJhbmRpbmcgPSAoeyBicmFuZGluZyB9OiBTaWRlYmFyQnJhbmRpbmdQcm9wcykgPT4gKFxuICA8YVxuICAgIGhyZWY9XCIvYWRtaW5cIlxuICAgIHN0eWxlPXt7XG4gICAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgIGdhcDogMTIsXG4gICAgICBwYWRkaW5nOiAnMTZweCAyMHB4JyxcbiAgICAgIHRleHREZWNvcmF0aW9uOiAnbm9uZScsXG4gICAgICBib3JkZXJCb3R0b206ICcxcHggc29saWQgIzNjNGY2MycsXG4gICAgICBiYWNrZ3JvdW5kOiAnIzI0MzA0MCcsXG4gICAgfX1cbiAgPlxuICAgIDxkaXZcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHdpZHRoOiA0MCxcbiAgICAgICAgaGVpZ2h0OiA0MCxcbiAgICAgICAgYm9yZGVyUmFkaXVzOiA4LFxuICAgICAgICBiYWNrZ3JvdW5kOiAncmdiYSgyNTUsMjU1LDI1NSwwLjEpJyxcbiAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgIGZsZXhTaHJpbms6IDAsXG4gICAgICB9fVxuICAgID5cbiAgICAgIHticmFuZGluZy5sb2dvID8gKFxuICAgICAgICA8aW1nXG4gICAgICAgICAgc3JjPXticmFuZGluZy5sb2dvfVxuICAgICAgICAgIGFsdD17YnJhbmRpbmcuY29tcGFueU5hbWUgPz8gJ0FkbWluJ31cbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgd2lkdGg6IDQwLFxuICAgICAgICAgICAgaGVpZ2h0OiA0MCxcbiAgICAgICAgICAgIG9iamVjdEZpdDogJ2NvdmVyJyxcbiAgICAgICAgICAgIGRpc3BsYXk6ICdibG9jaycsXG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICAgIDxkaXZcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIGNvbG9yOiAnI2ZmZmZmZicsXG4gICAgICAgIGZvbnRTaXplOiAxNixcbiAgICAgICAgZm9udFdlaWdodDogNjAwLFxuICAgICAgICBsZXR0ZXJTcGFjaW5nOiAnLTAuMDJlbScsXG4gICAgICAgIGxpbmVIZWlnaHQ6IDEuMixcbiAgICAgIH19XG4gICAgPlxuICAgICAge2JyYW5kaW5nLmNvbXBhbnlOYW1lID8/ICdBZG1pbid9XG4gICAgPC9kaXY+XG4gIDwvYT5cbik7XG5cbmV4cG9ydCBkZWZhdWx0IFNpZGViYXJCcmFuZGluZztcbiIsImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbnR5cGUgQWRtaW5QYWdlID0ge1xuICBuYW1lOiBzdHJpbmc7XG59O1xuXG50eXBlIFNpZGViYXJQYWdlc1Byb3BzID0ge1xuICBwYWdlcz86IEFkbWluUGFnZVtdO1xufTtcblxuY29uc3QgbGlua0Jhc2VTdHlsZTogUmVhY3QuQ1NTUHJvcGVydGllcyA9IHtcbiAgZGlzcGxheTogJ2ZsZXgnLFxuICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgZ2FwOiAxMCxcbiAgbWluSGVpZ2h0OiA0MCxcbiAgYm9yZGVyUmFkaXVzOiA2LFxuICBtYXJnaW46ICcycHggOHB4JyxcbiAgcGFkZGluZzogJzAgMTJweCcsXG4gIGNvbG9yOiAnI2MyY2ZkOCcsXG4gIHRleHREZWNvcmF0aW9uOiAnbm9uZScsXG4gIGN1cnNvcjogJ3BvaW50ZXInLFxuICBib3JkZXJMZWZ0OiAnM3B4IHNvbGlkIHRyYW5zcGFyZW50JyxcbiAgZm9udFNpemU6IDE0LFxuICBmb250V2VpZ2h0OiA1MDAsXG59O1xuXG5jb25zdCBnZXRQYWdlTGFiZWwgPSAocGFnZU5hbWU6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gIGlmIChwYWdlTmFtZSA9PT0gJ3NlbGxlci1tYXAnKSB7XG4gICAgcmV0dXJuICdTZWxsZXIgTWFwJztcbiAgfVxuXG4gIGlmIChwYWdlTmFtZSA9PT0gJ3NlbGxlci1hbmFseXRpY3MnKSB7XG4gICAgcmV0dXJuICdTZWxsZXIgQW5hbHl0aWNzJztcbiAgfVxuXG4gIGlmIChwYWdlTmFtZSA9PT0gJ2F1ZGl0LXRpbWVsaW5lJykge1xuICAgIHJldHVybiAnQXVkaXQgVGltZWxpbmUnO1xuICB9XG5cbiAgcmV0dXJuIHBhZ2VOYW1lXG4gICAgLnNwbGl0KCctJylcbiAgICAubWFwKChwYXJ0KSA9PiBwYXJ0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcGFydC5zbGljZSgxKSlcbiAgICAuam9pbignICcpO1xufTtcblxuY29uc3QgSG9tZUdseXBoID0gKCkgPT4gKFxuICA8c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIiBzdHlsZT17eyB3aWR0aDogMTQsIGRpc3BsYXk6ICdpbmxpbmUtZmxleCcsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyB9fT5cbiAgICDijIJcbiAgPC9zcGFuPlxuKTtcblxuY29uc3QgRG90R2x5cGggPSAoKSA9PiAoXG4gIDxzcGFuIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIHN0eWxlPXt7IHdpZHRoOiAxNCwgZGlzcGxheTogJ2lubGluZS1mbGV4JywganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInIH19PlxuICAgIOKAolxuICA8L3NwYW4+XG4pO1xuXG5jb25zdCBOYXZJdGVtID0gKHtcbiAgbGFiZWwsXG4gIGhyZWYsXG4gIGFjdGl2ZSxcbiAgZ2x5cGgsXG59OiB7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIGhyZWY6IHN0cmluZztcbiAgYWN0aXZlOiBib29sZWFuO1xuICBnbHlwaDogUmVhY3QuUmVhY3ROb2RlO1xufSkgPT4gKFxuICA8YVxuICAgIGhyZWY9e2hyZWZ9XG4gICAgc3R5bGU9e3tcbiAgICAgIC4uLmxpbmtCYXNlU3R5bGUsXG4gICAgICBiYWNrZ3JvdW5kOiBhY3RpdmUgPyAnIzNjNGY2MycgOiAndHJhbnNwYXJlbnQnLFxuICAgICAgY29sb3I6IGFjdGl2ZSA/ICcjZmZmZmZmJyA6ICcjYzJjZmQ4JyxcbiAgICAgIGJvcmRlckxlZnRDb2xvcjogYWN0aXZlID8gJyMzYjgyZjYnIDogJ3RyYW5zcGFyZW50JyxcbiAgICB9fVxuICA+XG4gICAge2dseXBofVxuICAgIDxzcGFuPntsYWJlbH08L3NwYW4+XG4gIDwvYT5cbik7XG5cbmNvbnN0IFNpZGViYXJQYWdlcyA9ICh7IHBhZ2VzIH06IFNpZGViYXJQYWdlc1Byb3BzKSA9PiB7XG4gIGNvbnN0IHBhdGhuYW1lID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgOiAnL2FkbWluJztcblxuICBjb25zdCBleHRyYVBhZ2VzID0gKHBhZ2VzID8/IFtdKS5maWx0ZXIoKHBhZ2UpID0+IHBhZ2UubmFtZSAhPT0gJ2hvbWUnKTtcblxuICByZXR1cm4gKFxuICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiAxNiB9fT5cbiAgICAgIDxkaXZcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwYWRkaW5nOiAnMCAyMHB4IDhweCcsXG4gICAgICAgICAgY29sb3I6ICcjOWNhM2FmJyxcbiAgICAgICAgICBmb250U2l6ZTogMTEsXG4gICAgICAgICAgZm9udFdlaWdodDogNjAwLFxuICAgICAgICAgIGxldHRlclNwYWNpbmc6ICcwLjA4ZW0nLFxuICAgICAgICAgIHRleHRUcmFuc2Zvcm06ICd1cHBlcmNhc2UnLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICBQYWdlc1xuICAgICAgPC9kaXY+XG5cbiAgICAgIDxOYXZJdGVtXG4gICAgICAgIGxhYmVsPVwiSG9tZVwiXG4gICAgICAgIGhyZWY9XCIvYWRtaW5cIlxuICAgICAgICBhY3RpdmU9e3BhdGhuYW1lID09PSAnL2FkbWluJyB8fCBwYXRobmFtZSA9PT0gJy9hZG1pbi8nfVxuICAgICAgICBnbHlwaD17PEhvbWVHbHlwaCAvPn1cbiAgICAgIC8+XG5cbiAgICAgIHtleHRyYVBhZ2VzLm1hcCgocGFnZSkgPT4gKFxuICAgICAgICA8TmF2SXRlbVxuICAgICAgICAgIGtleT17cGFnZS5uYW1lfVxuICAgICAgICAgIGxhYmVsPXtnZXRQYWdlTGFiZWwocGFnZS5uYW1lKX1cbiAgICAgICAgICBocmVmPXtgL2FkbWluL3BhZ2VzLyR7cGFnZS5uYW1lfWB9XG4gICAgICAgICAgYWN0aXZlPXtwYXRobmFtZS5pbmNsdWRlcyhgL3BhZ2VzLyR7cGFnZS5uYW1lfWApfVxuICAgICAgICAgIGdseXBoPXs8RG90R2x5cGggLz59XG4gICAgICAgIC8+XG4gICAgICApKX1cbiAgICA8L2Rpdj5cbiAgKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFNpZGViYXJQYWdlcztcbiIsIkFkbWluSlMuVXNlckNvbXBvbmVudHMgPSB7fVxuaW1wb3J0IERhc2hib2FyZCBmcm9tICcuLi9zcmMvYWRtaW5qcy9jb21wb25lbnRzL0Rhc2hib2FyZCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuRGFzaGJvYXJkID0gRGFzaGJvYXJkXG5pbXBvcnQgU2VsbGVyRGlyZWN0b3J5IGZyb20gJy4uL3NyYy9hZG1pbmpzL2NvbXBvbmVudHMvU2VsbGVyRGlyZWN0b3J5J1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5TZWxsZXJEaXJlY3RvcnkgPSBTZWxsZXJEaXJlY3RvcnlcbmltcG9ydCBTZWxsZXJNYXAgZnJvbSAnLi4vc3JjL2FkbWluanMvY29tcG9uZW50cy9TZWxsZXJNYXAnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlNlbGxlck1hcCA9IFNlbGxlck1hcFxuaW1wb3J0IFNlbGxlckFuYWx5dGljcyBmcm9tICcuLi9zcmMvYWRtaW5qcy9jb21wb25lbnRzL1NlbGxlckFuYWx5dGljcydcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuU2VsbGVyQW5hbHl0aWNzID0gU2VsbGVyQW5hbHl0aWNzXG5pbXBvcnQgQXVkaXRUaW1lbGluZSBmcm9tICcuLi9zcmMvYWRtaW5qcy9jb21wb25lbnRzL0F1ZGl0VGltZWxpbmUnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkF1ZGl0VGltZWxpbmUgPSBBdWRpdFRpbWVsaW5lXG5pbXBvcnQgVG9wQmFyIGZyb20gJy4uL3NyYy9hZG1pbmpzL2NvbXBvbmVudHMvVG9wQmFyJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5Ub3BCYXIgPSBUb3BCYXJcbmltcG9ydCBTaWRlYmFyQnJhbmRpbmcgZnJvbSAnLi4vc3JjL2FkbWluanMvY29tcG9uZW50cy9TaWRlYmFyQnJhbmRpbmcnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlNpZGViYXJCcmFuZGluZyA9IFNpZGViYXJCcmFuZGluZ1xuaW1wb3J0IFNpZGViYXJQYWdlcyBmcm9tICcuLi9zcmMvYWRtaW5qcy9jb21wb25lbnRzL1NpZGViYXJQYWdlcydcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuU2lkZWJhclBhZ2VzID0gU2lkZWJhclBhZ2VzIl0sIm5hbWVzIjpbImFwaSIsIkFwaUNsaWVudCIsImNhcmRTdHlsZSIsImJhY2tncm91bmQiLCJib3JkZXIiLCJib3JkZXJSYWRpdXMiLCJib3hTaGFkb3ciLCJzZWN0aW9uSGVhZGVyU3R5bGUiLCJkaXNwbGF5IiwianVzdGlmeUNvbnRlbnQiLCJhbGlnbkl0ZW1zIiwiZ2FwIiwibWFyZ2luQm90dG9tIiwic2VjdGlvblRpdGxlU3R5bGUiLCJtYXJnaW4iLCJmb250U2l6ZSIsImZvbnRXZWlnaHQiLCJjb2xvciIsInNlY3Rpb25TdWJ0aXRsZVN0eWxlIiwicGFnZVN0eWxlIiwicGFkZGluZyIsIm1pbkhlaWdodCIsInN0YXR1c0NvbG9ycyIsInBlbmRpbmciLCJmaWxsIiwidGV4dCIsImFwcHJvdmVkIiwicmVqZWN0ZWQiLCJhY3Rpb25Db2xvcnMiLCJmb3JtYXREYXRlVGltZSIsInZhbHVlIiwiSW50bCIsIkRhdGVUaW1lRm9ybWF0IiwiZGF5IiwibW9udGgiLCJ5ZWFyIiwiaG91ciIsIm1pbnV0ZSIsImhvdXIxMiIsImZvcm1hdCIsIkRhdGUiLCJmb3JtYXREYXRlIiwidGltZUFnbyIsImRpZmZNcyIsImdldFRpbWUiLCJub3ciLCJkaWZmTWludXRlcyIsIk1hdGgiLCJyb3VuZCIsImZvcm1hdHRlciIsIlJlbGF0aXZlVGltZUZvcm1hdCIsIm51bWVyaWMiLCJhYnMiLCJkaWZmSG91cnMiLCJkaWZmRGF5cyIsImxvYWRTY3JpcHRPbmNlIiwiaWQiLCJzcmMiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImV4aXN0aW5nIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsInNjcmlwdCIsImNyZWF0ZUVsZW1lbnQiLCJhc3luYyIsIm9ubG9hZCIsIm9uZXJyb3IiLCJFcnJvciIsImJvZHkiLCJhcHBlbmRDaGlsZCIsImxvYWRTdHlsZU9uY2UiLCJocmVmIiwibGluayIsInJlbCIsImhlYWQiLCJ1c2VQYWdlRGF0YSIsInBhZ2VOYW1lIiwiZGF0YSIsInNldERhdGEiLCJ1c2VTdGF0ZSIsImxvYWRpbmciLCJzZXRMb2FkaW5nIiwiZXJyb3IiLCJzZXRFcnJvciIsInVzZUVmZmVjdCIsImFjdGl2ZSIsImdldFBhZ2UiLCJ0aGVuIiwicmVzcG9uc2UiLCJjYXRjaCIsImNhdWdodEVycm9yIiwibWVzc2FnZSIsInVzZURhc2hib2FyZERhdGEiLCJnZXREYXNoYm9hcmQiLCJMb2FkaW5nU3RhdGUiLCJsYWJlbCIsIlJlYWN0Iiwic3R5bGUiLCJFcnJvclN0YXRlIiwiQmFkZ2UiLCJ1c2VDaGFydEpzIiwiY2hhcnRDb25zdHJ1Y3RvciIsInNldENoYXJ0Q29uc3RydWN0b3IiLCJjaGFydCIsIndpbmRvdyIsIkNoYXJ0IiwidXNlTGVhZmxldCIsImxlYWZsZXQiLCJzZXRMZWFmbGV0IiwiYWxsIiwibG9hZGVkTGVhZmxldCIsIkwiLCJkZWZhdWx0RmlsdGVycyIsInN0YXR1cyIsInN0YXRlcyIsImNpdHkiLCJwaW5jb2RlIiwiZnJvbSIsInRvIiwibGVnZW5kSXRlbVN0eWxlIiwiYnV0dG9uU3R5bGUiLCJjdXJzb3IiLCJpbnB1dFN0eWxlIiwid2lkdGgiLCJib3hTaXppbmciLCJpc1dpdGhpbkRhdGVSYW5nZSIsInJlY2VpdmVkQXQiLCJ0aW1lc3RhbXAiLCJmcm9tVGltZXN0YW1wIiwidG9UaW1lc3RhbXAiLCJtYXRjaGVzQmFzZUZpbHRlcnMiLCJzZWxsZXIiLCJmaWx0ZXJzIiwibGVuZ3RoIiwiaW5jbHVkZXMiLCJsb2NhdGlvbiIsInN0YXRlIiwibWF0Y2hlc0NpdHkiLCJ0cmltIiwidG9Mb3dlckNhc2UiLCJncm91cEJ5U3RhdGUiLCJzZWxsZXJzIiwiT2JqZWN0IiwiZW50cmllcyIsInJlZHVjZSIsImFjY3VtdWxhdG9yIiwia2V5IiwicHVzaCIsImxhdCIsImxuZyIsIm1hcCIsImNvb3JkaW5hdGVzIiwidG90YWwiLCJzdW0iLCJjb29yZGluYXRlIiwiY2VudGVyIiwiYnVpbGRQb3B1cCIsImJhZGdlIiwiYnVzaW5lc3NOYW1lIiwic2VsbGVyTmFtZSIsIlNlbGxlck1hcFBhbmVsIiwicGF5bG9hZCIsInN0YW5kYWxvbmUiLCJtYXBSZWYiLCJ1c2VSZWYiLCJtYXBJbnN0YW5jZVJlZiIsIm1vZGUiLCJzZXRNb2RlIiwiZHJhZnRGaWx0ZXJzIiwic2V0RHJhZnRGaWx0ZXJzIiwiYXBwbGllZEZpbHRlcnMiLCJzZXRBcHBsaWVkRmlsdGVycyIsInNob3dOb0xvY2F0aW9uIiwic2V0U2hvd05vTG9jYXRpb24iLCJhbGxTZWxsZXJSZWNvcmRzIiwidXNlTWVtbyIsIm5vTG9jYXRpb24iLCJhdmFpbGFibGVTdGF0ZXMiLCJTZXQiLCJmaWx0ZXIiLCJCb29sZWFuIiwic29ydCIsImxlZnQiLCJyaWdodCIsImxvY2FsZUNvbXBhcmUiLCJiYXNlTWF0Y2hlZE1hcmtlcnMiLCJ2aXNpYmxlTWFya2VycyIsInZpc2libGVOb0xvY2F0aW9uIiwidmlzaWJsZUNvdW50cyIsImhhbmRsZUZpbHRlckxpbmtDbGljayIsImV2ZW50IiwidGFyZ2V0IiwiSFRNTEVsZW1lbnQiLCJkYXRhc2V0IiwiZmlsdGVyQ2l0eSIsImZpbHRlclN0YXRlIiwicHJldmVudERlZmF1bHQiLCJjdXJyZW50IiwibmV4dCIsImFkZEV2ZW50TGlzdGVuZXIiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwicmVtb3ZlIiwic2V0VmlldyIsInRpbGVMYXllciIsImF0dHJpYnV0aW9uIiwiYWRkVG8iLCJtYXJrZXJMYXllciIsIm1hcmtlckNsdXN0ZXJHcm91cCIsInN0YXRlTGF5ZXIiLCJjaXR5UXVlcnkiLCJmb3JFYWNoIiwibWF0Y2hlc0N1cnJlbnRDaXR5IiwibWFya2VyIiwiY2lyY2xlTWFya2VyIiwicmFkaXVzIiwid2VpZ2h0IiwiZmlsbENvbG9yIiwiZmlsbE9wYWNpdHkiLCJvcGFjaXR5IiwiYmluZFBvcHVwIiwic2V0U3R5bGUiLCJhZGRMYXllciIsInN0YXRlR3JvdXAiLCJjaXJjbGUiLCJtaW4iLCJvbiIsIm5leHRGaWx0ZXJzIiwiZmx5VG8iLCJkdXJhdGlvbiIsImhlYXRMYXllciIsImJsdXIiLCJncmFkaWVudCIsImZvY3VzQ29vcmRpbmF0ZXMiLCJib3VuZHMiLCJsYXRMbmdCb3VuZHMiLCJpc1ZhbGlkIiwiZml0Qm91bmRzIiwiYXBwbHlGaWx0ZXJzIiwiY2xlYXJBbGwiLCJyZWYiLCJoZWlnaHQiLCJvdmVyZmxvdyIsImdyaWRUZW1wbGF0ZUNvbHVtbnMiLCJhbGlnblNlbGYiLCJ0eXBlIiwiY2hlY2tlZCIsIm9uQ2hhbmdlIiwiY2hhckF0IiwidG9VcHBlckNhc2UiLCJzbGljZSIsIm1heEhlaWdodCIsIm92ZXJmbG93WSIsIml0ZW0iLCJwbGFjZWhvbGRlciIsInJlcGxhY2UiLCJvbkNsaWNrIiwiYm9yZGVyQ29sb3IiLCJmbGV4IiwiYm9yZGVyVG9wIiwicGFkZGluZ1RvcCIsIm1hcmdpblRvcCIsInBvc2l0aW9uIiwiYm90dG9tIiwib3ZlcmZsb3dYIiwiYm9yZGVyQ29sbGFwc2UiLCJ0ZXh0QWxpZ24iLCJjb2xTcGFuIiwiU2VsbGVyTWFwUGFnZSIsImNoYXJ0V3JhcFN0eWxlIiwiRGFzaGJvYXJkQ2hhcnRzIiwiYmFyQ2FudmFzUmVmIiwiZG9udXRDYW52YXNSZWYiLCJzdWJtaXNzaW9uc1NlcmllcyIsInN1Ym1pc3Npb25zMzBEYXlzIiwic3VibWlzc2lvbnMxMk1vbnRocyIsImJhckNvbnRleHQiLCJnZXRDb250ZXh0IiwiZG9udXRDb250ZXh0IiwiYmFyQ2hhcnQiLCJsYWJlbHMiLCJwb2ludCIsImRhdGFzZXRzIiwiY291bnQiLCJiYWNrZ3JvdW5kQ29sb3IiLCJvcHRpb25zIiwibWFpbnRhaW5Bc3BlY3RSYXRpbyIsInBsdWdpbnMiLCJsZWdlbmQiLCJzY2FsZXMiLCJ4IiwiZ3JpZCIsInRpY2tzIiwiZm9udCIsInNpemUiLCJ5IiwiYmVnaW5BdFplcm8iLCJwcmVjaXNpb24iLCJkb251dENoYXJ0Iiwic3RhdHMiLCJib3JkZXJXaWR0aCIsImN1dG91dCIsImRlc3Ryb3kiLCJpbnNldCIsImZsZXhEaXJlY3Rpb24iLCJwb2ludGVyRXZlbnRzIiwicGVyY2VudGFnZSIsIkRhc2hib2FyZCIsImJnIiwiZ3JlZXRpbmciLCJhZG1pbk5hbWUiLCJkYXRlTGFiZWwiLCJzdGF0IiwiYm9yZGVyTGVmdCIsInRvcCIsInZpZXdCb3giLCJzdHJva2UiLCJzdHJva2VXaWR0aCIsImQiLCJyZWNlbnRBY3Rpdml0eSIsImFjdGl2aXR5IiwiYWN0aW9uQ29sb3IiLCJhY3Rpb24iLCJhY3Rpb25MYWJlbCIsInNwbGl0IiwicG9wIiwiYm9yZGVyQm90dG9tIiwibWFyZ2luTGVmdCIsImFjdG9yIiwiY3JlYXRlZEF0Iiwic3RhdHVzQnV0dG9uU3R5bGUiLCJ0YWJsZUhlYWRlclN0eWxlIiwidGV4dFRyYW5zZm9ybSIsImxldHRlclNwYWNpbmciLCJ0YWJsZUNlbGxTdHlsZSIsInZlcnRpY2FsQWxpZ24iLCJkZXRhaWxHcmlkU3R5bGUiLCJkZXRhaWxMYWJlbFN0eWxlIiwiZGV0YWlsVmFsdWVTdHlsZSIsImdldFByb2ZpbGVQaWNVcmwiLCJ1cHN0cmVhbSIsInByb2ZpbGVQaWNVcmwiLCJidWlsZEluaXRpYWxzIiwicGFydCIsImpvaW4iLCJTZWxsZXJEaXJlY3RvcnkiLCJxdWVyeSIsInNldFF1ZXJ5Iiwic2V0U3RhdHVzIiwic2VsZWN0ZWRJZCIsInNldFNlbGVjdGVkSWQiLCJmaWx0ZXJlZCIsIm5vcm1hbGl6ZWRRdWVyeSIsImVtYWlsIiwicGhvbmUiLCJnc3RPckVucm9sbG1lbnRJZCIsInVzZXJuYW1lIiwic2VsZWN0ZWRTZWxsZXIiLCJmaW5kIiwic2VsZWN0ZWREZXRhaWwiLCJkZXRhaWxzIiwiZmxleFdyYXAiLCJjb2xvcnMiLCJhbHQiLCJvYmplY3RGaXQiLCJmbGV4U2hyaW5rIiwic3RyZWV0IiwicmF3U2VsbGVyU3RhdHVzIiwidXBkYXRlZEF0Iiwic2hpcHBpbmdNZXRob2QiLCJkb2N1bWVudHNDb3VudCIsImxhc3RTdGF0dXNBdCIsImxhc3RTdGF0dXNOb3RlIiwiRnJhZ21lbnQiLCJzZWxsZXJQcm9maWxlIiwidGNBY2NlcHRlZCIsImFkZHJlc3MiLCJiaWxsaW5nQWRkcmVzcyIsInBpY2t1cEFkZHJlc3MiLCJwaW5Db2RlIiwiYmFua0RldGFpbHMiLCJhY2NvdW50SG9sZGVyTmFtZSIsImFjY291bnROdW1iZXIiLCJiYW5rTmFtZSIsImlmc2NDb2RlIiwidXBpSWQiLCJmb2xsb3dlckNvdW50IiwicmV2aWV3c0NvdW50IiwicHJvZHVjdHNTb2xkQ291bnQiLCJjdXN0b21lclJhdGluZyIsInNhdmVkUHJvZHVjdHMiLCJzZWxsaW5nUHJvZHVjdHMiLCJ1cGxvYWRlZEJpdHMiLCJzYXZlZEJpdHMiLCJkb2N1bWVudHMiLCJwdWJsaWNJZCIsInVybCIsInRleHREZWNvcmF0aW9uIiwicHJvZHVjdCIsIm5hbWUiLCJjYXRlZ29yeSIsImRpc2NvdW50ZWRQcmljZSIsInByaWNlIiwiYmFyZ2FpbnNXaXRoU2VsbGVyIiwiYmFyZ2FpbiIsInByb2R1Y3ROYW1lIiwic3RhdHVzTGFiZWwiLCJjdXJyZW50UHJpY2UiLCJyb2xlIiwiQW5hbHl0aWNzQ2hhcnRzIiwic3RhdGVzQ2FudmFzUmVmIiwiYXBwcm92YWxDYW52YXNSZWYiLCJob3Vyc0NhbnZhc1JlZiIsInN0YXRlQ29udGV4dCIsImFwcHJvdmFsQ29udGV4dCIsImhvdXJzQ29udGV4dCIsInN0YXRlc0NoYXJ0IiwidG9wU3RhdGVzIiwiaW5kZXhBeGlzIiwiYXBwcm92YWxDaGFydCIsImFwcHJvdmFsUmF0ZSIsInN1Ym1pdHRlZCIsInRlbnNpb24iLCJob3Vyc0NoYXJ0IiwiYnVzaWVzdEhvdXJzIiwiYXZlcmFnZUFjdGlvbkhvdXJzIiwidG9GaXhlZCIsInJlamVjdGlvbldvcmRzIiwid29yZCIsIlNlbGxlckFuYWx5dGljcyIsInN0YXRQaWxscyIsImlzSW5SYW5nZSIsImZyb21EYXRlIiwidG9EYXRlIiwiQXVkaXRUaW1lbGluZSIsImFjdGlvbkZpbHRlciIsInNldEFjdGlvbkZpbHRlciIsImFkbWluRmlsdGVyIiwic2V0QWRtaW5GaWx0ZXIiLCJzZXRGcm9tRGF0ZSIsInNldFRvRGF0ZSIsInBhZ2UiLCJzZXRQYWdlIiwicGFnZVNpemUiLCJmaWx0ZXJlZExvZ3MiLCJsb2dzIiwibG9nIiwibWF0Y2hlc0FjdGlvbiIsIm1hdGNoZXNBZG1pbiIsIm1hdGNoZXNEYXRlIiwicGFnZWRMb2dzIiwidG90YWxQYWdlcyIsIm1heCIsImNlaWwiLCJsYXN0RGF0ZUxhYmVsIiwiYWN0aW9uT3B0aW9ucyIsImFkbWluT3B0aW9ucyIsImFkbWluIiwic2hvd0RhdGUiLCJtaW5XaWR0aCIsInRhcmdldENvbGxlY3Rpb24iLCJ0YXJnZXRJZCIsIm5vdGUiLCJkaXNhYmxlZCIsImdldFBhZ2VUaXRsZSIsInBhdGhuYW1lIiwiZ2V0UGFnZVN1YnRpdGxlIiwiVG9wQmFyIiwidG9nZ2xlU2lkZWJhciIsInNlc3Npb24iLCJSRURVWF9TVEFURSIsInRpdGxlIiwic3VidGl0bGUiLCJ6SW5kZXgiLCJ3aGl0ZVNwYWNlIiwidGV4dE92ZXJmbG93IiwiU2lkZWJhckJyYW5kaW5nIiwiYnJhbmRpbmciLCJsb2dvIiwiY29tcGFueU5hbWUiLCJsaW5lSGVpZ2h0IiwibGlua0Jhc2VTdHlsZSIsImdldFBhZ2VMYWJlbCIsIkhvbWVHbHlwaCIsIkRvdEdseXBoIiwiTmF2SXRlbSIsImdseXBoIiwiYm9yZGVyTGVmdENvbG9yIiwiU2lkZWJhclBhZ2VzIiwicGFnZXMiLCJleHRyYVBhZ2VzIiwiQWRtaW5KUyIsIlVzZXJDb21wb25lbnRzIiwiU2VsbGVyTWFwIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0VBR08sTUFBTUEsR0FBRyxHQUFHLElBQUlDLGlCQUFTLEVBQUU7RUFvRTNCLE1BQU1DLFNBQThCLEdBQUc7RUFDNUNDLEVBQUFBLFVBQVUsRUFBRSxTQUFTO0VBQ3JCQyxFQUFBQSxNQUFNLEVBQUUsbUJBQW1CO0VBQzNCQyxFQUFBQSxZQUFZLEVBQUUsQ0FBQztFQUNmQyxFQUFBQSxTQUFTLEVBQUU7RUFDYixDQUFDO0VBRU0sTUFBTUMsa0JBQXVDLEdBQUc7RUFDckRDLEVBQUFBLE9BQU8sRUFBRSxNQUFNO0VBQ2ZDLEVBQUFBLGNBQWMsRUFBRSxlQUFlO0VBQy9CQyxFQUFBQSxVQUFVLEVBQUUsUUFBUTtFQUNwQkMsRUFBQUEsR0FBRyxFQUFFLEVBQUU7RUFDUEMsRUFBQUEsWUFBWSxFQUFFO0VBQ2hCLENBQUM7RUFFTSxNQUFNQyxpQkFBc0MsR0FBRztFQUNwREMsRUFBQUEsTUFBTSxFQUFFLENBQUM7RUFDVEMsRUFBQUEsUUFBUSxFQUFFLEVBQUU7RUFDWkMsRUFBQUEsVUFBVSxFQUFFLEdBQUc7RUFDZkMsRUFBQUEsS0FBSyxFQUFFO0VBQ1QsQ0FBQztFQUVNLE1BQU1DLG9CQUF5QyxHQUFHO0VBQ3ZESixFQUFBQSxNQUFNLEVBQUUsU0FBUztFQUNqQkMsRUFBQUEsUUFBUSxFQUFFLEVBQUU7RUFDWkUsRUFBQUEsS0FBSyxFQUFF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
