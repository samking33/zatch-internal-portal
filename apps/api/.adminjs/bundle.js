(function (React, adminjs, reactRouterDom, reactRouter) {
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
  const inputStyle = {
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
      <a href="/admin/resources/Seller/records/${seller.id}/show" style="display:inline-block;margin-top:10px;color:#2563eb;font-weight:600;text-decoration:none">View in Admin →</a>
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
      }, "Plot of geocoded seller locations from the intake flow."))), /*#__PURE__*/React__default.default.createElement("div", {
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
      style: inputStyle
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
      style: inputStyle
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
      style: inputStyle
    }), /*#__PURE__*/React__default.default.createElement("input", {
      type: "date",
      value: draftFilters.to,
      onChange: event => setDraftFilters(current => ({
        ...current,
        to: event.target.value
      })),
      style: inputStyle
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
    }, "Last 10 audit entries across intake, review, and session actions."))), /*#__PURE__*/React__default.default.createElement("div", null, data.recentActivity.map(activity => {
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
    }, "Operational trends across seller intake volume, approvals, and review behavior."))), /*#__PURE__*/React__default.default.createElement("div", {
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
    if (pathname.includes('/resources/Seller')) {
      return 'Sellers';
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
  }) => /*#__PURE__*/React__default.default.createElement(reactRouterDom.Link, {
    to: "/admin",
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
    onNavigate,
    glyph
  }) => /*#__PURE__*/React__default.default.createElement("a", {
    href: href,
    onClick: event => {
      event.preventDefault();
      onNavigate(href);
    },
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
    const location = reactRouter.useLocation();
    const navigate = reactRouter.useNavigate();
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
      active: location.pathname === '/admin' || location.pathname === '/admin/',
      onNavigate: href => navigate(href),
      glyph: /*#__PURE__*/React__default.default.createElement(HomeGlyph, null)
    }), extraPages.map(page => /*#__PURE__*/React__default.default.createElement(NavItem, {
      key: page.name,
      label: getPageLabel(page.name),
      href: `/admin/pages/${page.name}`,
      active: location.pathname.includes(`/pages/${page.name}`),
      onNavigate: href => navigate(href),
      glyph: /*#__PURE__*/React__default.default.createElement(DotGlyph, null)
    })));
  };

  AdminJS.UserComponents = {};
  AdminJS.UserComponents.Dashboard = Dashboard;
  AdminJS.UserComponents.SellerMap = SellerMapPage;
  AdminJS.UserComponents.SellerAnalytics = SellerAnalytics;
  AdminJS.UserComponents.AuditTimeline = AuditTimeline;
  AdminJS.UserComponents.TopBar = TopBar;
  AdminJS.UserComponents.SidebarBranding = SidebarBranding;
  AdminJS.UserComponents.SidebarPages = SidebarPages;

})(React, AdminJS, ReactRouterDOM, ReactRouter);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvYWRtaW5qcy9jb21wb25lbnRzL3NoYXJlZC50c3giLCIuLi9zcmMvYWRtaW5qcy9jb21wb25lbnRzL1NlbGxlck1hcC50c3giLCIuLi9zcmMvYWRtaW5qcy9jb21wb25lbnRzL0Rhc2hib2FyZC50c3giLCIuLi9zcmMvYWRtaW5qcy9jb21wb25lbnRzL1NlbGxlckFuYWx5dGljcy50c3giLCIuLi9zcmMvYWRtaW5qcy9jb21wb25lbnRzL0F1ZGl0VGltZWxpbmUudHN4IiwiLi4vc3JjL2FkbWluanMvY29tcG9uZW50cy9Ub3BCYXIudHN4IiwiLi4vc3JjL2FkbWluanMvY29tcG9uZW50cy9TaWRlYmFyQnJhbmRpbmcudHN4IiwiLi4vc3JjL2FkbWluanMvY29tcG9uZW50cy9TaWRlYmFyUGFnZXMudHN4IiwiZW50cnkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBBcGlDbGllbnQgfSBmcm9tICdhZG1pbmpzJztcblxuZXhwb3J0IGNvbnN0IGFwaSA9IG5ldyBBcGlDbGllbnQoKTtcblxudHlwZSBTY3JpcHRMb2FkZXJXaW5kb3cgPSBXaW5kb3cgJiB7XG4gIENoYXJ0PzogQ2hhcnRDb25zdHJ1Y3RvcjtcbiAgTD86IExlYWZsZXROYW1lc3BhY2U7XG59O1xuXG5leHBvcnQgdHlwZSBDaGFydENvbmZpZ3VyYXRpb24gPSB7XG4gIHR5cGU6IHN0cmluZztcbiAgZGF0YToge1xuICAgIGxhYmVsczogc3RyaW5nW107XG4gICAgZGF0YXNldHM6IEFycmF5PFJlY29yZDxzdHJpbmcsIHVua25vd24+PjtcbiAgfTtcbiAgb3B0aW9ucz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufTtcblxuZXhwb3J0IHR5cGUgQ2hhcnRJbnN0YW5jZSA9IHtcbiAgZGVzdHJveTogKCkgPT4gdm9pZDtcbn07XG5cbmV4cG9ydCB0eXBlIENoYXJ0Q29uc3RydWN0b3IgPSBuZXcgKFxuICBjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIGNvbmZpZ3VyYXRpb246IENoYXJ0Q29uZmlndXJhdGlvbixcbikgPT4gQ2hhcnRJbnN0YW5jZTtcblxuZXhwb3J0IHR5cGUgTGVhZmxldENpcmNsZU1hcmtlciA9IHtcbiAgYWRkVG86IChtYXA6IExlYWZsZXRNYXApID0+IExlYWZsZXRDaXJjbGVNYXJrZXI7XG4gIGJpbmRQb3B1cDogKGh0bWw6IHN0cmluZykgPT4gTGVhZmxldENpcmNsZU1hcmtlcjtcbiAgc2V0U3R5bGU6IChzdHlsZTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IExlYWZsZXRDaXJjbGVNYXJrZXI7XG4gIG9uOiAoZXZlbnROYW1lOiBzdHJpbmcsIGhhbmRsZXI6ICguLi5hcmdzOiB1bmtub3duW10pID0+IHZvaWQpID0+IExlYWZsZXRDaXJjbGVNYXJrZXI7XG59O1xuXG5leHBvcnQgdHlwZSBMZWFmbGV0VGlsZUxheWVyID0ge1xuICBhZGRUbzogKG1hcDogTGVhZmxldE1hcCkgPT4gTGVhZmxldFRpbGVMYXllcjtcbn07XG5cbmV4cG9ydCB0eXBlIExlYWZsZXRMYXllckdyb3VwID0ge1xuICBhZGRMYXllcjogKGxheWVyOiB1bmtub3duKSA9PiB2b2lkO1xuICBhZGRUbzogKG1hcDogTGVhZmxldE1hcCkgPT4gTGVhZmxldExheWVyR3JvdXA7XG4gIGNsZWFyTGF5ZXJzOiAoKSA9PiB2b2lkO1xufTtcblxuZXhwb3J0IHR5cGUgTGVhZmxldEJvdW5kcyA9IHtcbiAgaXNWYWxpZDogKCkgPT4gYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIExlYWZsZXRNYXAgPSB7XG4gIHNldFZpZXc6IChjb29yZGluYXRlczogW251bWJlciwgbnVtYmVyXSwgem9vbTogbnVtYmVyKSA9PiBMZWFmbGV0TWFwO1xuICBmaXRCb3VuZHM6IChib3VuZHM6IExlYWZsZXRCb3VuZHMsIG9wdGlvbnM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gTGVhZmxldE1hcDtcbiAgZmx5VG86IChjb29yZGluYXRlczogW251bWJlciwgbnVtYmVyXSwgem9vbTogbnVtYmVyLCBvcHRpb25zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IExlYWZsZXRNYXA7XG4gIHJlbW92ZUxheWVyOiAobGF5ZXI6IHVua25vd24pID0+IHZvaWQ7XG4gIGFkZExheWVyOiAobGF5ZXI6IHVua25vd24pID0+IHZvaWQ7XG4gIG9uOiAoZXZlbnROYW1lOiBzdHJpbmcsIGhhbmRsZXI6ICguLi5hcmdzOiB1bmtub3duW10pID0+IHZvaWQpID0+IExlYWZsZXRNYXA7XG4gIHJlbW92ZTogKCkgPT4gdm9pZDtcbn07XG5cbmV4cG9ydCB0eXBlIExlYWZsZXROYW1lc3BhY2UgPSB7XG4gIG1hcDogKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBvcHRpb25zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IExlYWZsZXRNYXA7XG4gIHRpbGVMYXllcjogKHVybDogc3RyaW5nLCBvcHRpb25zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IExlYWZsZXRUaWxlTGF5ZXI7XG4gIGNpcmNsZU1hcmtlcjogKFxuICAgIGNvb3JkaW5hdGVzOiBbbnVtYmVyLCBudW1iZXJdLFxuICAgIG9wdGlvbnM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbiAgKSA9PiBMZWFmbGV0Q2lyY2xlTWFya2VyO1xuICBsYXRMbmdCb3VuZHM6IChjb29yZGluYXRlczogQXJyYXk8W251bWJlciwgbnVtYmVyXT4pID0+IExlYWZsZXRCb3VuZHM7XG4gIG1hcmtlckNsdXN0ZXJHcm91cD86ICgpID0+IExlYWZsZXRMYXllckdyb3VwO1xuICBoZWF0TGF5ZXI/OiAocG9pbnRzOiBBcnJheTxbbnVtYmVyLCBudW1iZXIsIG51bWJlcl0+LCBvcHRpb25zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHVua25vd247XG59O1xuXG5leHBvcnQgY29uc3QgY2FyZFN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0ge1xuICBiYWNrZ3JvdW5kOiAnI2ZmZmZmZicsXG4gIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJyxcbiAgYm9yZGVyUmFkaXVzOiA4LFxuICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjA4KScsXG59O1xuXG5leHBvcnQgY29uc3Qgc2VjdGlvbkhlYWRlclN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0ge1xuICBkaXNwbGF5OiAnZmxleCcsXG4gIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicsXG4gIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICBnYXA6IDE2LFxuICBtYXJnaW5Cb3R0b206IDE4LFxufTtcblxuZXhwb3J0IGNvbnN0IHNlY3Rpb25UaXRsZVN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0ge1xuICBtYXJnaW46IDAsXG4gIGZvbnRTaXplOiAxOCxcbiAgZm9udFdlaWdodDogNjAwLFxuICBjb2xvcjogJyMxZjI5MzcnLFxufTtcblxuZXhwb3J0IGNvbnN0IHNlY3Rpb25TdWJ0aXRsZVN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0ge1xuICBtYXJnaW46ICc2cHggMCAwJyxcbiAgZm9udFNpemU6IDEzLFxuICBjb2xvcjogJyM2YjcyODAnLFxufTtcblxuZXhwb3J0IGNvbnN0IHBhZ2VTdHlsZTogUmVhY3QuQ1NTUHJvcGVydGllcyA9IHtcbiAgZGlzcGxheTogJ2dyaWQnLFxuICBnYXA6IDIwLFxuICBwYWRkaW5nOiAyNCxcbiAgYmFja2dyb3VuZDogJyNmNGY2ZjknLFxuICBtaW5IZWlnaHQ6ICdjYWxjKDEwMHZoIC0gNTZweCknLFxufTtcblxuZXhwb3J0IGNvbnN0IHN0YXR1c0NvbG9yczogUmVjb3JkPHN0cmluZywgeyBmaWxsOiBzdHJpbmc7IHRleHQ6IHN0cmluZyB9PiA9IHtcbiAgcGVuZGluZzogeyBmaWxsOiAnI2Y1OWUwYicsIHRleHQ6ICcjOTI0MDBlJyB9LFxuICBhcHByb3ZlZDogeyBmaWxsOiAnIzEwYjk4MScsIHRleHQ6ICcjMDY1ZjQ2JyB9LFxuICByZWplY3RlZDogeyBmaWxsOiAnI2VmNDQ0NCcsIHRleHQ6ICcjOTkxYjFiJyB9LFxufTtcblxuZXhwb3J0IGNvbnN0IGFjdGlvbkNvbG9yczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgJ3NlbGxlci5hcHByb3ZlZCc6ICcjMTBiOTgxJyxcbiAgJ3NlbGxlci5yZWplY3RlZCc6ICcjZWY0NDQ0JyxcbiAgJ3NlbGxlci5zdWJtaXR0ZWQnOiAnIzNiODJmNicsXG4gICd1c2VyLmxvZ2luJzogJyM2YjcyODAnLFxuICAndXNlci5sb2dvdXQnOiAnIzZiNzI4MCcsXG4gICdhZG1pbi5vdmVycmlkZSc6ICcjOGI1Y2Y2Jyxcbn07XG5cbmV4cG9ydCBjb25zdCBmb3JtYXREYXRlVGltZSA9ICh2YWx1ZTogc3RyaW5nKTogc3RyaW5nID0+XG4gIG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KCdlbi1JTicsIHtcbiAgICBkYXk6ICcyLWRpZ2l0JyxcbiAgICBtb250aDogJ3Nob3J0JyxcbiAgICB5ZWFyOiAnbnVtZXJpYycsXG4gICAgaG91cjogJzItZGlnaXQnLFxuICAgIG1pbnV0ZTogJzItZGlnaXQnLFxuICAgIGhvdXIxMjogdHJ1ZSxcbiAgfSkuZm9ybWF0KG5ldyBEYXRlKHZhbHVlKSk7XG5cbmV4cG9ydCBjb25zdCBmb3JtYXREYXRlID0gKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcgPT5cbiAgbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQoJ2VuLUlOJywge1xuICAgIGRheTogJzItZGlnaXQnLFxuICAgIG1vbnRoOiAnc2hvcnQnLFxuICAgIHllYXI6ICdudW1lcmljJyxcbiAgfSkuZm9ybWF0KG5ldyBEYXRlKHZhbHVlKSk7XG5cbmV4cG9ydCBjb25zdCB0aW1lQWdvID0gKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICBjb25zdCBkaWZmTXMgPSBuZXcgRGF0ZSh2YWx1ZSkuZ2V0VGltZSgpIC0gRGF0ZS5ub3coKTtcbiAgY29uc3QgZGlmZk1pbnV0ZXMgPSBNYXRoLnJvdW5kKGRpZmZNcyAvICgxMDAwICogNjApKTtcbiAgY29uc3QgZm9ybWF0dGVyID0gbmV3IEludGwuUmVsYXRpdmVUaW1lRm9ybWF0KCdlbicsIHsgbnVtZXJpYzogJ2F1dG8nIH0pO1xuXG4gIGlmIChNYXRoLmFicyhkaWZmTWludXRlcykgPCA2MCkge1xuICAgIHJldHVybiBmb3JtYXR0ZXIuZm9ybWF0KGRpZmZNaW51dGVzLCAnbWludXRlJyk7XG4gIH1cblxuICBjb25zdCBkaWZmSG91cnMgPSBNYXRoLnJvdW5kKGRpZmZNaW51dGVzIC8gNjApO1xuICBpZiAoTWF0aC5hYnMoZGlmZkhvdXJzKSA8IDI0KSB7XG4gICAgcmV0dXJuIGZvcm1hdHRlci5mb3JtYXQoZGlmZkhvdXJzLCAnaG91cicpO1xuICB9XG5cbiAgY29uc3QgZGlmZkRheXMgPSBNYXRoLnJvdW5kKGRpZmZIb3VycyAvIDI0KTtcbiAgcmV0dXJuIGZvcm1hdHRlci5mb3JtYXQoZGlmZkRheXMsICdkYXknKTtcbn07XG5cbmV4cG9ydCBjb25zdCBsb2FkU2NyaXB0T25jZSA9IGFzeW5jIChpZDogc3RyaW5nLCBzcmM6IHN0cmluZyk6IFByb21pc2U8dm9pZD4gPT5cbiAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGV4aXN0aW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgIGlmIChleGlzdGluZykge1xuICAgICAgcmVzb2x2ZSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgIHNjcmlwdC5pZCA9IGlkO1xuICAgIHNjcmlwdC5zcmMgPSBzcmM7XG4gICAgc2NyaXB0LmFzeW5jID0gdHJ1ZTtcbiAgICBzY3JpcHQub25sb2FkID0gKCkgPT4gcmVzb2x2ZSgpO1xuICAgIHNjcmlwdC5vbmVycm9yID0gKCkgPT4gcmVqZWN0KG5ldyBFcnJvcihgRmFpbGVkIHRvIGxvYWQgc2NyaXB0OiAke3NyY31gKSk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICB9KTtcblxuZXhwb3J0IGNvbnN0IGxvYWRTdHlsZU9uY2UgPSAoaWQ6IHN0cmluZywgaHJlZjogc3RyaW5nKTogdm9pZCA9PiB7XG4gIGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpO1xuICBsaW5rLmlkID0gaWQ7XG4gIGxpbmsucmVsID0gJ3N0eWxlc2hlZXQnO1xuICBsaW5rLmhyZWYgPSBocmVmO1xuICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGxpbmspO1xufTtcblxuZXhwb3J0IGNvbnN0IHVzZVBhZ2VEYXRhID0gPFQsPihwYWdlTmFtZTogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IFtkYXRhLCBzZXREYXRhXSA9IHVzZVN0YXRlPFQgfCBudWxsPihudWxsKTtcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSk7XG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbCk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBsZXQgYWN0aXZlID0gdHJ1ZTtcblxuICAgIGFwaVxuICAgICAgLmdldFBhZ2UoeyBwYWdlTmFtZSB9KVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmICghYWN0aXZlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc2V0RGF0YSgocmVzcG9uc2UuZGF0YSBhcyBUIHwgdW5kZWZpbmVkKSA/PyBudWxsKTtcbiAgICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChjYXVnaHRFcnJvcjogdW5rbm93bikgPT4ge1xuICAgICAgICBpZiAoIWFjdGl2ZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNldEVycm9yKGNhdWdodEVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBjYXVnaHRFcnJvci5tZXNzYWdlIDogJ0ZhaWxlZCB0byBsb2FkIHBhZ2UnKTtcbiAgICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgICB9KTtcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBhY3RpdmUgPSBmYWxzZTtcbiAgICB9O1xuICB9LCBbcGFnZU5hbWVdKTtcblxuICByZXR1cm4geyBkYXRhLCBsb2FkaW5nLCBlcnJvciB9O1xufTtcblxuZXhwb3J0IGNvbnN0IHVzZURhc2hib2FyZERhdGEgPSA8VCw+KCkgPT4ge1xuICBjb25zdCBbZGF0YSwgc2V0RGF0YV0gPSB1c2VTdGF0ZTxUIHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgbGV0IGFjdGl2ZSA9IHRydWU7XG5cbiAgICBhcGlcbiAgICAgIC5nZXREYXNoYm9hcmQoKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmICghYWN0aXZlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc2V0RGF0YSgocmVzcG9uc2UuZGF0YSBhcyBUIHwgdW5kZWZpbmVkKSA/PyBudWxsKTtcbiAgICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChjYXVnaHRFcnJvcjogdW5rbm93bikgPT4ge1xuICAgICAgICBpZiAoIWFjdGl2ZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNldEVycm9yKGNhdWdodEVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBjYXVnaHRFcnJvci5tZXNzYWdlIDogJ0ZhaWxlZCB0byBsb2FkIGRhc2hib2FyZCcpO1xuICAgICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGFjdGl2ZSA9IGZhbHNlO1xuICAgIH07XG4gIH0sIFtdKTtcblxuICByZXR1cm4geyBkYXRhLCBsb2FkaW5nLCBlcnJvciB9O1xufTtcblxuZXhwb3J0IGNvbnN0IExvYWRpbmdTdGF0ZSA9ICh7IGxhYmVsIH06IHsgbGFiZWw6IHN0cmluZyB9KSA9PiAoXG4gIDxkaXYgc3R5bGU9e3sgLi4uY2FyZFN0eWxlLCBwYWRkaW5nOiAyNCwgY29sb3I6ICcjNmI3MjgwJyB9fT57bGFiZWx9PC9kaXY+XG4pO1xuXG5leHBvcnQgY29uc3QgRXJyb3JTdGF0ZSA9ICh7IG1lc3NhZ2UgfTogeyBtZXNzYWdlOiBzdHJpbmcgfSkgPT4gKFxuICA8ZGl2IHN0eWxlPXt7IC4uLmNhcmRTdHlsZSwgcGFkZGluZzogMjQsIGNvbG9yOiAnI2I5MWMxYycgfX0+e21lc3NhZ2V9PC9kaXY+XG4pO1xuXG5leHBvcnQgY29uc3QgQmFkZ2UgPSAoeyBsYWJlbCwgYmFja2dyb3VuZCwgY29sb3IgfTogeyBsYWJlbDogc3RyaW5nOyBiYWNrZ3JvdW5kOiBzdHJpbmc7IGNvbG9yOiBzdHJpbmcgfSkgPT4gKFxuICA8c3BhblxuICAgIHN0eWxlPXt7XG4gICAgICBkaXNwbGF5OiAnaW5saW5lLWZsZXgnLFxuICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICBwYWRkaW5nOiAnM3B4IDEwcHgnLFxuICAgICAgYm9yZGVyUmFkaXVzOiA5OTksXG4gICAgICBiYWNrZ3JvdW5kLFxuICAgICAgY29sb3IsXG4gICAgICBmb250U2l6ZTogMTEsXG4gICAgICBmb250V2VpZ2h0OiA2MDAsXG4gICAgfX1cbiAgPlxuICAgIHtsYWJlbH1cbiAgPC9zcGFuPlxuKTtcblxuZXhwb3J0IGNvbnN0IHVzZUNoYXJ0SnMgPSAoKTogQ2hhcnRDb25zdHJ1Y3RvciB8IG51bGwgPT4ge1xuICBjb25zdCBbY2hhcnRDb25zdHJ1Y3Rvciwgc2V0Q2hhcnRDb25zdHJ1Y3Rvcl0gPSB1c2VTdGF0ZTxDaGFydENvbnN0cnVjdG9yIHwgbnVsbD4obnVsbCk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBsZXQgYWN0aXZlID0gdHJ1ZTtcblxuICAgIGxvYWRTY3JpcHRPbmNlKCdhZG1pbmpzLWNoYXJ0anMnLCAnaHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L25wbS9jaGFydC5qc0A0LjQuNy9kaXN0L2NoYXJ0LnVtZC5taW4uanMnKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICBjb25zdCBjaGFydCA9ICh3aW5kb3cgYXMgU2NyaXB0TG9hZGVyV2luZG93KS5DaGFydCA/PyBudWxsO1xuICAgICAgICBpZiAoYWN0aXZlICYmIGNoYXJ0KSB7XG4gICAgICAgICAgc2V0Q2hhcnRDb25zdHJ1Y3RvcigoKSA9PiBjaGFydCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICBpZiAoYWN0aXZlKSB7XG4gICAgICAgICAgc2V0Q2hhcnRDb25zdHJ1Y3RvcihudWxsKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgYWN0aXZlID0gZmFsc2U7XG4gICAgfTtcbiAgfSwgW10pO1xuXG4gIHJldHVybiBjaGFydENvbnN0cnVjdG9yO1xufTtcblxuZXhwb3J0IGNvbnN0IHVzZUxlYWZsZXQgPSAoKTogTGVhZmxldE5hbWVzcGFjZSB8IG51bGwgPT4ge1xuICBjb25zdCBbbGVhZmxldCwgc2V0TGVhZmxldF0gPSB1c2VTdGF0ZTxMZWFmbGV0TmFtZXNwYWNlIHwgbnVsbD4obnVsbCk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBsZXQgYWN0aXZlID0gdHJ1ZTtcblxuICAgIGxvYWRTdHlsZU9uY2UoJ2xlYWZsZXQtc3R5bGUnLCAnaHR0cHM6Ly91bnBrZy5jb20vbGVhZmxldEAxLjkuNC9kaXN0L2xlYWZsZXQuY3NzJyk7XG4gICAgbG9hZFN0eWxlT25jZShcbiAgICAgICdsZWFmbGV0LWNsdXN0ZXItc3R5bGUnLFxuICAgICAgJ2h0dHBzOi8vdW5wa2cuY29tL2xlYWZsZXQubWFya2VyY2x1c3RlckAxLjUuMy9kaXN0L01hcmtlckNsdXN0ZXIuY3NzJyxcbiAgICApO1xuICAgIGxvYWRTdHlsZU9uY2UoXG4gICAgICAnbGVhZmxldC1jbHVzdGVyLWRlZmF1bHQtc3R5bGUnLFxuICAgICAgJ2h0dHBzOi8vdW5wa2cuY29tL2xlYWZsZXQubWFya2VyY2x1c3RlckAxLjUuMy9kaXN0L01hcmtlckNsdXN0ZXIuRGVmYXVsdC5jc3MnLFxuICAgICk7XG5cbiAgICBQcm9taXNlLmFsbChbXG4gICAgICBsb2FkU2NyaXB0T25jZSgnbGVhZmxldC1zY3JpcHQnLCAnaHR0cHM6Ly91bnBrZy5jb20vbGVhZmxldEAxLjkuNC9kaXN0L2xlYWZsZXQuanMnKSxcbiAgICAgIGxvYWRTY3JpcHRPbmNlKFxuICAgICAgICAnbGVhZmxldC1jbHVzdGVyLXNjcmlwdCcsXG4gICAgICAgICdodHRwczovL3VucGtnLmNvbS9sZWFmbGV0Lm1hcmtlcmNsdXN0ZXJAMS41LjMvZGlzdC9sZWFmbGV0Lm1hcmtlcmNsdXN0ZXIuanMnLFxuICAgICAgKSxcbiAgICAgIGxvYWRTY3JpcHRPbmNlKCdsZWFmbGV0LWhlYXQtc2NyaXB0JywgJ2h0dHBzOi8vdW5wa2cuY29tL2xlYWZsZXQuaGVhdC9kaXN0L2xlYWZsZXQtaGVhdC5qcycpLFxuICAgIF0pXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIGNvbnN0IGxvYWRlZExlYWZsZXQgPSAod2luZG93IGFzIFNjcmlwdExvYWRlcldpbmRvdykuTCA/PyBudWxsO1xuICAgICAgICBpZiAoYWN0aXZlICYmIGxvYWRlZExlYWZsZXQpIHtcbiAgICAgICAgICBzZXRMZWFmbGV0KGxvYWRlZExlYWZsZXQpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgaWYgKGFjdGl2ZSkge1xuICAgICAgICAgIHNldExlYWZsZXQobnVsbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGFjdGl2ZSA9IGZhbHNlO1xuICAgIH07XG4gIH0sIFtdKTtcblxuICByZXR1cm4gbGVhZmxldDtcbn07XG5cbmV4cG9ydCBjb25zdCB1c2VEYXRlTGFiZWwgPSAoKSA9PlxuICB1c2VNZW1vKFxuICAgICgpID0+XG4gICAgICBuZXcgSW50bC5EYXRlVGltZUZvcm1hdCgnZW4tSU4nLCB7XG4gICAgICAgIHdlZWtkYXk6ICdsb25nJyxcbiAgICAgICAgZGF5OiAnMi1kaWdpdCcsXG4gICAgICAgIG1vbnRoOiAnc2hvcnQnLFxuICAgICAgICB5ZWFyOiAnbnVtZXJpYycsXG4gICAgICB9KS5mb3JtYXQobmV3IERhdGUoKSksXG4gICAgW10sXG4gICk7XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgdHlwZSB7IE5vTG9jYXRpb25TZWxsZXJSZWNvcmQsIFNlbGxlck1hcFBheWxvYWQsIFNlbGxlck1hcFJlY29yZCB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7XG4gIEJhZGdlLFxuICBFcnJvclN0YXRlLFxuICBMb2FkaW5nU3RhdGUsXG4gIGNhcmRTdHlsZSxcbiAgZm9ybWF0RGF0ZSxcbiAgcGFnZVN0eWxlLFxuICBzZWN0aW9uSGVhZGVyU3R5bGUsXG4gIHNlY3Rpb25TdWJ0aXRsZVN0eWxlLFxuICBzZWN0aW9uVGl0bGVTdHlsZSxcbiAgc3RhdHVzQ29sb3JzLFxuICB1c2VMZWFmbGV0LFxuICB1c2VQYWdlRGF0YSxcbn0gZnJvbSAnLi9zaGFyZWQnO1xuXG50eXBlIFNlbGxlck1hcFBhbmVsUHJvcHMgPSB7XG4gIHBheWxvYWQ6IFNlbGxlck1hcFBheWxvYWQ7XG4gIHN0YW5kYWxvbmU/OiBib29sZWFuO1xufTtcblxudHlwZSBNYXBGaWx0ZXJzID0ge1xuICBzdGF0dXM6ICdhbGwnIHwgJ3BlbmRpbmcnIHwgJ2FwcHJvdmVkJyB8ICdyZWplY3RlZCc7XG4gIHN0YXRlczogc3RyaW5nW107XG4gIGNpdHk6IHN0cmluZztcbiAgcGluY29kZTogc3RyaW5nO1xuICBmcm9tOiBzdHJpbmc7XG4gIHRvOiBzdHJpbmc7XG59O1xuXG50eXBlIFNlbGxlck1hcExpa2VSZWNvcmQgPSBTZWxsZXJNYXBSZWNvcmQgfCBOb0xvY2F0aW9uU2VsbGVyUmVjb3JkO1xuXG5jb25zdCBkZWZhdWx0RmlsdGVyczogTWFwRmlsdGVycyA9IHtcbiAgc3RhdHVzOiAnYWxsJyxcbiAgc3RhdGVzOiBbXSxcbiAgY2l0eTogJycsXG4gIHBpbmNvZGU6ICcnLFxuICBmcm9tOiAnJyxcbiAgdG86ICcnLFxufTtcblxuY29uc3QgbGVnZW5kSXRlbVN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0ge1xuICBkaXNwbGF5OiAnZmxleCcsXG4gIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICBnYXA6IDEwLFxuICBmb250U2l6ZTogMTIsXG4gIGNvbG9yOiAnIzM3NDE1MScsXG59O1xuXG5jb25zdCBidXR0b25TdHlsZTogUmVhY3QuQ1NTUHJvcGVydGllcyA9IHtcbiAgYm9yZGVyUmFkaXVzOiA4LFxuICBib3JkZXI6ICcxcHggc29saWQgI2QxZDVkYicsXG4gIGJhY2tncm91bmQ6ICcjZmZmZmZmJyxcbiAgY29sb3I6ICcjMWYyOTM3JyxcbiAgZm9udFdlaWdodDogNjAwLFxuICBwYWRkaW5nOiAnOXB4IDEycHgnLFxuICBjdXJzb3I6ICdwb2ludGVyJyxcbn07XG5cbmNvbnN0IGlucHV0U3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7XG4gIHdpZHRoOiAnMTAwJScsXG4gIGJvcmRlclJhZGl1czogOCxcbiAgYm9yZGVyOiAnMXB4IHNvbGlkICNkMWQ1ZGInLFxuICBwYWRkaW5nOiAnMTBweCAxMnB4JyxcbiAgZm9udFNpemU6IDEzLFxuICBjb2xvcjogJyMxZjI5MzcnLFxuICBib3hTaXppbmc6ICdib3JkZXItYm94Jyxcbn07XG5cbmNvbnN0IGlzV2l0aGluRGF0ZVJhbmdlID0gKHJlY2VpdmVkQXQ6IHN0cmluZywgZnJvbTogc3RyaW5nLCB0bzogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKHJlY2VpdmVkQXQpLmdldFRpbWUoKTtcblxuICBpZiAoZnJvbSkge1xuICAgIGNvbnN0IGZyb21UaW1lc3RhbXAgPSBuZXcgRGF0ZShgJHtmcm9tfVQwMDowMDowMGApLmdldFRpbWUoKTtcbiAgICBpZiAodGltZXN0YW1wIDwgZnJvbVRpbWVzdGFtcCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0bykge1xuICAgIGNvbnN0IHRvVGltZXN0YW1wID0gbmV3IERhdGUoYCR7dG99VDIzOjU5OjU5YCkuZ2V0VGltZSgpO1xuICAgIGlmICh0aW1lc3RhbXAgPiB0b1RpbWVzdGFtcCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuY29uc3QgbWF0Y2hlc0Jhc2VGaWx0ZXJzID0gKFxuICBzZWxsZXI6IFNlbGxlck1hcExpa2VSZWNvcmQsXG4gIGZpbHRlcnM6IE9taXQ8TWFwRmlsdGVycywgJ2NpdHknPixcbik6IGJvb2xlYW4gPT4ge1xuICBpZiAoZmlsdGVycy5zdGF0dXMgIT09ICdhbGwnICYmIHNlbGxlci5zdGF0dXMgIT09IGZpbHRlcnMuc3RhdHVzKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGZpbHRlcnMuc3RhdGVzLmxlbmd0aCA+IDAgJiYgIWZpbHRlcnMuc3RhdGVzLmluY2x1ZGVzKHNlbGxlci5sb2NhdGlvbi5zdGF0ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoZmlsdGVycy5waW5jb2RlICYmIHNlbGxlci5sb2NhdGlvbi5waW5jb2RlICE9PSBmaWx0ZXJzLnBpbmNvZGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gaXNXaXRoaW5EYXRlUmFuZ2Uoc2VsbGVyLnJlY2VpdmVkQXQsIGZpbHRlcnMuZnJvbSwgZmlsdGVycy50byk7XG59O1xuXG5jb25zdCBtYXRjaGVzQ2l0eSA9IChzZWxsZXI6IFNlbGxlck1hcExpa2VSZWNvcmQsIGNpdHk6IHN0cmluZyk6IGJvb2xlYW4gPT5cbiAgY2l0eS50cmltKCkubGVuZ3RoID09PSAwIHx8XG4gIHNlbGxlci5sb2NhdGlvbi5jaXR5LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoY2l0eS50cmltKCkudG9Mb3dlckNhc2UoKSk7XG5cbmNvbnN0IGdyb3VwQnlTdGF0ZSA9IChzZWxsZXJzOiBTZWxsZXJNYXBSZWNvcmRbXSkgPT5cbiAgT2JqZWN0LmVudHJpZXMoXG4gICAgc2VsbGVycy5yZWR1Y2U8UmVjb3JkPHN0cmluZywgQXJyYXk8W251bWJlciwgbnVtYmVyXT4+PigoYWNjdW11bGF0b3IsIHNlbGxlcikgPT4ge1xuICAgICAgY29uc3Qga2V5ID0gc2VsbGVyLmxvY2F0aW9uLnN0YXRlIHx8ICdVbmtub3duJztcbiAgICAgIGFjY3VtdWxhdG9yW2tleV0gPz89IFtdO1xuICAgICAgYWNjdW11bGF0b3Jba2V5XS5wdXNoKFtzZWxsZXIubG9jYXRpb24ubGF0LCBzZWxsZXIubG9jYXRpb24ubG5nXSk7XG4gICAgICByZXR1cm4gYWNjdW11bGF0b3I7XG4gICAgfSwge30pLFxuICApLm1hcCgoW3N0YXRlLCBjb29yZGluYXRlc10pID0+IHtcbiAgICBjb25zdCB0b3RhbCA9IGNvb3JkaW5hdGVzLmxlbmd0aDtcbiAgICBjb25zdCBbbGF0LCBsbmddID0gY29vcmRpbmF0ZXMucmVkdWNlPFtudW1iZXIsIG51bWJlcl0+KFxuICAgICAgKHN1bSwgY29vcmRpbmF0ZSkgPT4gW3N1bVswXSArIGNvb3JkaW5hdGVbMF0sIHN1bVsxXSArIGNvb3JkaW5hdGVbMV1dLFxuICAgICAgWzAsIDBdLFxuICAgICk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgc3RhdGUsXG4gICAgICB0b3RhbCxcbiAgICAgIGNlbnRlcjogW2xhdCAvIHRvdGFsLCBsbmcgLyB0b3RhbF0gYXMgW251bWJlciwgbnVtYmVyXSxcbiAgICB9O1xuICB9KTtcblxuY29uc3QgYnVpbGRQb3B1cCA9IChzZWxsZXI6IFNlbGxlck1hcFJlY29yZCk6IHN0cmluZyA9PiB7XG4gIGNvbnN0IGJhZGdlID0gc3RhdHVzQ29sb3JzW3NlbGxlci5zdGF0dXNdID8/IHsgZmlsbDogJyNmNTllMGInLCB0ZXh0OiAnIzkyNDAwZScgfTtcblxuICByZXR1cm4gYFxuICAgIDxkaXYgc3R5bGU9XCJtaW4td2lkdGg6MjIwcHg7Zm9udC1mYW1pbHk6SW50ZXIsc2Fucy1zZXJpZlwiPlxuICAgICAgPGRpdiBzdHlsZT1cImZvbnQtd2VpZ2h0OjYwMDtjb2xvcjojMWYyOTM3XCI+JHtzZWxsZXIuYnVzaW5lc3NOYW1lfTwvZGl2PlxuICAgICAgPGRpdiBzdHlsZT1cIm1hcmdpbi10b3A6NHB4O2NvbG9yOiM2YjcyODBcIj4ke3NlbGxlci5zZWxsZXJOYW1lfTwvZGl2PlxuICAgICAgPGRpdiBzdHlsZT1cIm1hcmdpbi10b3A6OHB4O2NvbG9yOiMzNzQxNTFcIj5TdGF0dXM6IDxzcGFuIHN0eWxlPVwiY29sb3I6JHtiYWRnZS5maWxsfTtmb250LXdlaWdodDo2MDBcIj4ke3NlbGxlci5zdGF0dXN9PC9zcGFuPjwvZGl2PlxuICAgICAgPGRpdiBzdHlsZT1cIm1hcmdpbi10b3A6NHB4O2NvbG9yOiMzNzQxNTFcIj4ke3NlbGxlci5sb2NhdGlvbi5jaXR5fSwgJHtzZWxsZXIubG9jYXRpb24uc3RhdGV9ICR7c2VsbGVyLmxvY2F0aW9uLnBpbmNvZGV9PC9kaXY+XG4gICAgICA8ZGl2IHN0eWxlPVwibWFyZ2luLXRvcDo0cHg7Y29sb3I6IzM3NDE1MVwiPlJlY2VpdmVkOiAke2Zvcm1hdERhdGUoc2VsbGVyLnJlY2VpdmVkQXQpfTwvZGl2PlxuICAgICAgPGRpdiBzdHlsZT1cIm1hcmdpbi10b3A6OHB4O2Rpc3BsYXk6ZmxleDtnYXA6MTBweDtmbGV4LXdyYXA6d3JhcFwiPlxuICAgICAgICA8YSBocmVmPVwiI1wiIGRhdGEtZmlsdGVyLWNpdHk9XCIke3NlbGxlci5sb2NhdGlvbi5jaXR5fVwiIHN0eWxlPVwiY29sb3I6IzI1NjNlYjtmb250LXNpemU6MTFweDt0ZXh0LWRlY29yYXRpb246bm9uZVwiPkZpbHRlcjogJHtzZWxsZXIubG9jYXRpb24uY2l0eX08L2E+XG4gICAgICAgIDxhIGhyZWY9XCIjXCIgZGF0YS1maWx0ZXItc3RhdGU9XCIke3NlbGxlci5sb2NhdGlvbi5zdGF0ZX1cIiBzdHlsZT1cImNvbG9yOiMyNTYzZWI7Zm9udC1zaXplOjExcHg7dGV4dC1kZWNvcmF0aW9uOm5vbmVcIj5GaWx0ZXI6ICR7c2VsbGVyLmxvY2F0aW9uLnN0YXRlfTwvYT5cbiAgICAgIDwvZGl2PlxuICAgICAgPGEgaHJlZj1cIi9hZG1pbi9yZXNvdXJjZXMvU2VsbGVyL3JlY29yZHMvJHtzZWxsZXIuaWR9L3Nob3dcIiBzdHlsZT1cImRpc3BsYXk6aW5saW5lLWJsb2NrO21hcmdpbi10b3A6MTBweDtjb2xvcjojMjU2M2ViO2ZvbnQtd2VpZ2h0OjYwMDt0ZXh0LWRlY29yYXRpb246bm9uZVwiPlZpZXcgaW4gQWRtaW4g4oaSPC9hPlxuICAgIDwvZGl2PlxuICBgO1xufTtcblxuY29uc3QgU2VsbGVyTWFwUGFuZWwgPSAoeyBwYXlsb2FkLCBzdGFuZGFsb25lID0gZmFsc2UgfTogU2VsbGVyTWFwUGFuZWxQcm9wcykgPT4ge1xuICBjb25zdCBsZWFmbGV0ID0gdXNlTGVhZmxldCgpO1xuICBjb25zdCBtYXBSZWYgPSB1c2VSZWY8SFRNTERpdkVsZW1lbnQgfCBudWxsPihudWxsKTtcbiAgY29uc3QgbWFwSW5zdGFuY2VSZWYgPSB1c2VSZWY8UmV0dXJuVHlwZTxOb25OdWxsYWJsZTx0eXBlb2YgbGVhZmxldD5bJ21hcCddPiB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbbW9kZSwgc2V0TW9kZV0gPSB1c2VTdGF0ZTwnbWFya2VycycgfCAnaGVhdG1hcCc+KCdtYXJrZXJzJyk7XG4gIGNvbnN0IFtkcmFmdEZpbHRlcnMsIHNldERyYWZ0RmlsdGVyc10gPSB1c2VTdGF0ZTxNYXBGaWx0ZXJzPihkZWZhdWx0RmlsdGVycyk7XG4gIGNvbnN0IFthcHBsaWVkRmlsdGVycywgc2V0QXBwbGllZEZpbHRlcnNdID0gdXNlU3RhdGU8TWFwRmlsdGVycz4oZGVmYXVsdEZpbHRlcnMpO1xuICBjb25zdCBbc2hvd05vTG9jYXRpb24sIHNldFNob3dOb0xvY2F0aW9uXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICBjb25zdCBhbGxTZWxsZXJSZWNvcmRzID0gdXNlTWVtbzxBcnJheTxTZWxsZXJNYXBMaWtlUmVjb3JkPj4oXG4gICAgKCkgPT4gWy4uLnBheWxvYWQuc2VsbGVycywgLi4ucGF5bG9hZC5ub0xvY2F0aW9uXSxcbiAgICBbcGF5bG9hZC5ub0xvY2F0aW9uLCBwYXlsb2FkLnNlbGxlcnNdLFxuICApO1xuXG4gIGNvbnN0IGF2YWlsYWJsZVN0YXRlcyA9IHVzZU1lbW8oXG4gICAgKCkgPT5cbiAgICAgIFsuLi5uZXcgU2V0KGFsbFNlbGxlclJlY29yZHMubWFwKChzZWxsZXIpID0+IHNlbGxlci5sb2NhdGlvbi5zdGF0ZSkuZmlsdGVyKEJvb2xlYW4pKV0uc29ydCgobGVmdCwgcmlnaHQpID0+XG4gICAgICAgIGxlZnQubG9jYWxlQ29tcGFyZShyaWdodCksXG4gICAgICApLFxuICAgIFthbGxTZWxsZXJSZWNvcmRzXSxcbiAgKTtcblxuICBjb25zdCBiYXNlTWF0Y2hlZE1hcmtlcnMgPSB1c2VNZW1vKFxuICAgICgpID0+XG4gICAgICBwYXlsb2FkLnNlbGxlcnMuZmlsdGVyKChzZWxsZXIpID0+XG4gICAgICAgIG1hdGNoZXNCYXNlRmlsdGVycyhzZWxsZXIsIHtcbiAgICAgICAgICBzdGF0dXM6IGFwcGxpZWRGaWx0ZXJzLnN0YXR1cyxcbiAgICAgICAgICBzdGF0ZXM6IGFwcGxpZWRGaWx0ZXJzLnN0YXRlcyxcbiAgICAgICAgICBwaW5jb2RlOiBhcHBsaWVkRmlsdGVycy5waW5jb2RlLFxuICAgICAgICAgIGZyb206IGFwcGxpZWRGaWx0ZXJzLmZyb20sXG4gICAgICAgICAgdG86IGFwcGxpZWRGaWx0ZXJzLnRvLFxuICAgICAgICB9KSxcbiAgICAgICksXG4gICAgW2FwcGxpZWRGaWx0ZXJzLmZyb20sIGFwcGxpZWRGaWx0ZXJzLnBpbmNvZGUsIGFwcGxpZWRGaWx0ZXJzLnN0YXRlcywgYXBwbGllZEZpbHRlcnMuc3RhdHVzLCBhcHBsaWVkRmlsdGVycy50bywgcGF5bG9hZC5zZWxsZXJzXSxcbiAgKTtcblxuICBjb25zdCB2aXNpYmxlTWFya2VycyA9IHVzZU1lbW8oXG4gICAgKCkgPT4gYmFzZU1hdGNoZWRNYXJrZXJzLmZpbHRlcigoc2VsbGVyKSA9PiBtYXRjaGVzQ2l0eShzZWxsZXIsIGRyYWZ0RmlsdGVycy5jaXR5KSksXG4gICAgW2Jhc2VNYXRjaGVkTWFya2VycywgZHJhZnRGaWx0ZXJzLmNpdHldLFxuICApO1xuXG4gIGNvbnN0IHZpc2libGVOb0xvY2F0aW9uID0gdXNlTWVtbyhcbiAgICAoKSA9PlxuICAgICAgcGF5bG9hZC5ub0xvY2F0aW9uLmZpbHRlcihcbiAgICAgICAgKHNlbGxlcikgPT5cbiAgICAgICAgICBtYXRjaGVzQmFzZUZpbHRlcnMoc2VsbGVyLCB7XG4gICAgICAgICAgICBzdGF0dXM6IGFwcGxpZWRGaWx0ZXJzLnN0YXR1cyxcbiAgICAgICAgICAgIHN0YXRlczogYXBwbGllZEZpbHRlcnMuc3RhdGVzLFxuICAgICAgICAgICAgcGluY29kZTogYXBwbGllZEZpbHRlcnMucGluY29kZSxcbiAgICAgICAgICAgIGZyb206IGFwcGxpZWRGaWx0ZXJzLmZyb20sXG4gICAgICAgICAgICB0bzogYXBwbGllZEZpbHRlcnMudG8sXG4gICAgICAgICAgfSkgJiYgbWF0Y2hlc0NpdHkoc2VsbGVyLCBkcmFmdEZpbHRlcnMuY2l0eSksXG4gICAgICApLFxuICAgIFthcHBsaWVkRmlsdGVycy5mcm9tLCBhcHBsaWVkRmlsdGVycy5waW5jb2RlLCBhcHBsaWVkRmlsdGVycy5zdGF0ZXMsIGFwcGxpZWRGaWx0ZXJzLnN0YXR1cywgYXBwbGllZEZpbHRlcnMudG8sIGRyYWZ0RmlsdGVycy5jaXR5LCBwYXlsb2FkLm5vTG9jYXRpb25dLFxuICApO1xuXG4gIGNvbnN0IHZpc2libGVDb3VudHMgPSB1c2VNZW1vKFxuICAgICgpID0+ICh7XG4gICAgICB0b3RhbDogdmlzaWJsZU1hcmtlcnMubGVuZ3RoICsgdmlzaWJsZU5vTG9jYXRpb24ubGVuZ3RoLFxuICAgICAgcGVuZGluZzpcbiAgICAgICAgdmlzaWJsZU1hcmtlcnMuZmlsdGVyKChzZWxsZXIpID0+IHNlbGxlci5zdGF0dXMgPT09ICdwZW5kaW5nJykubGVuZ3RoICtcbiAgICAgICAgdmlzaWJsZU5vTG9jYXRpb24uZmlsdGVyKChzZWxsZXIpID0+IHNlbGxlci5zdGF0dXMgPT09ICdwZW5kaW5nJykubGVuZ3RoLFxuICAgICAgYXBwcm92ZWQ6XG4gICAgICAgIHZpc2libGVNYXJrZXJzLmZpbHRlcigoc2VsbGVyKSA9PiBzZWxsZXIuc3RhdHVzID09PSAnYXBwcm92ZWQnKS5sZW5ndGggK1xuICAgICAgICB2aXNpYmxlTm9Mb2NhdGlvbi5maWx0ZXIoKHNlbGxlcikgPT4gc2VsbGVyLnN0YXR1cyA9PT0gJ2FwcHJvdmVkJykubGVuZ3RoLFxuICAgICAgcmVqZWN0ZWQ6XG4gICAgICAgIHZpc2libGVNYXJrZXJzLmZpbHRlcigoc2VsbGVyKSA9PiBzZWxsZXIuc3RhdHVzID09PSAncmVqZWN0ZWQnKS5sZW5ndGggK1xuICAgICAgICB2aXNpYmxlTm9Mb2NhdGlvbi5maWx0ZXIoKHNlbGxlcikgPT4gc2VsbGVyLnN0YXR1cyA9PT0gJ3JlamVjdGVkJykubGVuZ3RoLFxuICAgIH0pLFxuICAgIFt2aXNpYmxlTWFya2VycywgdmlzaWJsZU5vTG9jYXRpb25dLFxuICApO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgaGFuZGxlRmlsdGVyTGlua0NsaWNrID0gKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICBjb25zdCB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgICBpZiAoISh0YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBjaXR5ID0gdGFyZ2V0LmRhdGFzZXQuZmlsdGVyQ2l0eTtcbiAgICAgIGNvbnN0IHN0YXRlID0gdGFyZ2V0LmRhdGFzZXQuZmlsdGVyU3RhdGU7XG5cbiAgICAgIGlmICghY2l0eSAmJiAhc3RhdGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBpZiAoY2l0eSkge1xuICAgICAgICBzZXREcmFmdEZpbHRlcnMoKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIGNpdHkgfSkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdGUpIHtcbiAgICAgICAgY29uc3QgbmV4dCA9IHtcbiAgICAgICAgICAuLi5kcmFmdEZpbHRlcnMsXG4gICAgICAgICAgc3RhdGVzOiBbc3RhdGVdLFxuICAgICAgICAgIGNpdHk6IGNpdHkgPz8gZHJhZnRGaWx0ZXJzLmNpdHksXG4gICAgICAgIH07XG4gICAgICAgIHNldERyYWZ0RmlsdGVycyhuZXh0KTtcbiAgICAgICAgc2V0QXBwbGllZEZpbHRlcnMobmV4dCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlRmlsdGVyTGlua0NsaWNrKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVGaWx0ZXJMaW5rQ2xpY2spO1xuICAgIH07XG4gIH0sIFtkcmFmdEZpbHRlcnNdKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghbGVhZmxldCB8fCAhbWFwUmVmLmN1cnJlbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobWFwSW5zdGFuY2VSZWYuY3VycmVudCkge1xuICAgICAgbWFwSW5zdGFuY2VSZWYuY3VycmVudC5yZW1vdmUoKTtcbiAgICAgIG1hcEluc3RhbmNlUmVmLmN1cnJlbnQgPSBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IG1hcCA9IGxlYWZsZXQubWFwKG1hcFJlZi5jdXJyZW50KS5zZXRWaWV3KFsyMC41OTM3LCA3OC45NjI5XSwgNSk7XG4gICAgbWFwSW5zdGFuY2VSZWYuY3VycmVudCA9IG1hcDtcblxuICAgIGxlYWZsZXQudGlsZUxheWVyKCdodHRwczovL3tzfS50aWxlLm9wZW5zdHJlZXRtYXAub3JnL3t6fS97eH0ve3l9LnBuZycsIHtcbiAgICAgIGF0dHJpYnV0aW9uOiAnJmNvcHk7IE9wZW5TdHJlZXRNYXAgY29udHJpYnV0b3JzJyxcbiAgICB9KS5hZGRUbyhtYXApO1xuXG4gICAgY29uc3QgbWFya2VyTGF5ZXIgPSBsZWFmbGV0Lm1hcmtlckNsdXN0ZXJHcm91cCA/IGxlYWZsZXQubWFya2VyQ2x1c3Rlckdyb3VwKCkgOiBudWxsO1xuICAgIGNvbnN0IHN0YXRlTGF5ZXIgPSBsZWFmbGV0Lm1hcmtlckNsdXN0ZXJHcm91cCA/IGxlYWZsZXQubWFya2VyQ2x1c3Rlckdyb3VwKCkgOiBudWxsO1xuXG4gICAgY29uc3QgY2l0eVF1ZXJ5ID0gZHJhZnRGaWx0ZXJzLmNpdHkudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG5cbiAgICBiYXNlTWF0Y2hlZE1hcmtlcnMuZm9yRWFjaCgoc2VsbGVyKSA9PiB7XG4gICAgICBjb25zdCBiYWRnZSA9IHN0YXR1c0NvbG9yc1tzZWxsZXIuc3RhdHVzXSA/PyB7IGZpbGw6ICcjZjU5ZTBiJywgdGV4dDogJyM5MjQwMGUnIH07XG4gICAgICBjb25zdCBtYXRjaGVzQ3VycmVudENpdHkgPVxuICAgICAgICBjaXR5UXVlcnkubGVuZ3RoID09PSAwIHx8IHNlbGxlci5sb2NhdGlvbi5jaXR5LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoY2l0eVF1ZXJ5KTtcbiAgICAgIGNvbnN0IG1hcmtlciA9IGxlYWZsZXQuY2lyY2xlTWFya2VyKFtzZWxsZXIubG9jYXRpb24ubGF0LCBzZWxsZXIubG9jYXRpb24ubG5nXSwge1xuICAgICAgICByYWRpdXM6IDgsXG4gICAgICAgIGNvbG9yOiAnI2ZmZmZmZicsXG4gICAgICAgIHdlaWdodDogbWF0Y2hlc0N1cnJlbnRDaXR5ID8gMiA6IDEsXG4gICAgICAgIGZpbGxDb2xvcjogYmFkZ2UuZmlsbCxcbiAgICAgICAgZmlsbE9wYWNpdHk6IG1hdGNoZXNDdXJyZW50Q2l0eSA/IDAuOSA6IDAuMTUsXG4gICAgICAgIG9wYWNpdHk6IG1hdGNoZXNDdXJyZW50Q2l0eSA/IDEgOiAwLjIsXG4gICAgICB9KTtcblxuICAgICAgbWFya2VyLmJpbmRQb3B1cChidWlsZFBvcHVwKHNlbGxlcikpO1xuICAgICAgaWYgKG1hdGNoZXNDdXJyZW50Q2l0eSAmJiBjaXR5UXVlcnkubGVuZ3RoID4gMCkge1xuICAgICAgICBtYXJrZXIuc2V0U3R5bGUoeyByYWRpdXM6IDEwIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAobWFya2VyTGF5ZXIpIHtcbiAgICAgICAgbWFya2VyTGF5ZXIuYWRkTGF5ZXIobWFya2VyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1hcmtlci5hZGRUbyhtYXApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKGFwcGxpZWRGaWx0ZXJzLnN0YXRlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGdyb3VwQnlTdGF0ZShiYXNlTWF0Y2hlZE1hcmtlcnMpLmZvckVhY2goKHN0YXRlR3JvdXApID0+IHtcbiAgICAgICAgY29uc3QgY2lyY2xlID0gbGVhZmxldC5jaXJjbGVNYXJrZXIoc3RhdGVHcm91cC5jZW50ZXIsIHtcbiAgICAgICAgICByYWRpdXM6IE1hdGgubWluKDI2LCAxMiArIHN0YXRlR3JvdXAudG90YWwpLFxuICAgICAgICAgIGNvbG9yOiAnI2ZmZmZmZicsXG4gICAgICAgICAgd2VpZ2h0OiAyLFxuICAgICAgICAgIGZpbGxDb2xvcjogJyMzYjgyZjYnLFxuICAgICAgICAgIGZpbGxPcGFjaXR5OiAwLjQ1LFxuICAgICAgICB9KTtcblxuICAgICAgICBjaXJjbGUuYmluZFBvcHVwKFxuICAgICAgICAgIGA8ZGl2IHN0eWxlPVwiZm9udC1mYW1pbHk6SW50ZXIsc2Fucy1zZXJpZlwiPjxzdHJvbmc+JHtzdGF0ZUdyb3VwLnN0YXRlfTwvc3Ryb25nPjxkaXYgc3R5bGU9XCJtYXJnaW4tdG9wOjRweDtjb2xvcjojNmI3MjgwXCI+JHtzdGF0ZUdyb3VwLnRvdGFsfSBzZWxsZXJzPC9kaXY+PC9kaXY+YCxcbiAgICAgICAgKTtcbiAgICAgICAgY2lyY2xlLm9uKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICBjb25zdCBuZXh0RmlsdGVycyA9IHtcbiAgICAgICAgICAgIC4uLmRyYWZ0RmlsdGVycyxcbiAgICAgICAgICAgIHN0YXRlczogW3N0YXRlR3JvdXAuc3RhdGVdLFxuICAgICAgICAgIH07XG4gICAgICAgICAgc2V0RHJhZnRGaWx0ZXJzKG5leHRGaWx0ZXJzKTtcbiAgICAgICAgICBzZXRBcHBsaWVkRmlsdGVycyhuZXh0RmlsdGVycyk7XG4gICAgICAgICAgbWFwLmZseVRvKHN0YXRlR3JvdXAuY2VudGVyLCA4LCB7IGR1cmF0aW9uOiAxIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoc3RhdGVMYXllcikge1xuICAgICAgICAgIHN0YXRlTGF5ZXIuYWRkTGF5ZXIoY2lyY2xlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjaXJjbGUuYWRkVG8obWFwKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgaGVhdExheWVyID1cbiAgICAgIG1vZGUgPT09ICdoZWF0bWFwJyAmJiBsZWFmbGV0LmhlYXRMYXllclxuICAgICAgICA/IGxlYWZsZXQuaGVhdExheWVyKFxuICAgICAgICAgICAgdmlzaWJsZU1hcmtlcnMubWFwKChzZWxsZXIpID0+IFtzZWxsZXIubG9jYXRpb24ubGF0LCBzZWxsZXIubG9jYXRpb24ubG5nLCAwLjldKSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgcmFkaXVzOiAyNixcbiAgICAgICAgICAgICAgYmx1cjogMjAsXG4gICAgICAgICAgICAgIGdyYWRpZW50OiB7XG4gICAgICAgICAgICAgICAgMC4yOiAnIzNiODJmNicsXG4gICAgICAgICAgICAgICAgMC41OiAnI2Y1OWUwYicsXG4gICAgICAgICAgICAgICAgMC45OiAnI2VmNDQ0NCcsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIClcbiAgICAgICAgOiBudWxsO1xuXG4gICAgaWYgKG1vZGUgPT09ICdtYXJrZXJzJykge1xuICAgICAgbWFya2VyTGF5ZXI/LmFkZFRvKG1hcCk7XG4gICAgICBzdGF0ZUxheWVyPy5hZGRUbyhtYXApO1xuICAgIH0gZWxzZSBpZiAoaGVhdExheWVyKSB7XG4gICAgICBtYXAuYWRkTGF5ZXIoaGVhdExheWVyKTtcbiAgICB9XG5cbiAgICBjb25zdCBmb2N1c0Nvb3JkaW5hdGVzID1cbiAgICAgIHZpc2libGVNYXJrZXJzLmxlbmd0aCA+IDBcbiAgICAgICAgPyB2aXNpYmxlTWFya2Vycy5tYXAoKHNlbGxlcikgPT4gW3NlbGxlci5sb2NhdGlvbi5sYXQsIHNlbGxlci5sb2NhdGlvbi5sbmddIGFzIFtudW1iZXIsIG51bWJlcl0pXG4gICAgICAgIDogW107XG5cbiAgICBpZiAoZm9jdXNDb29yZGluYXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBib3VuZHMgPSBsZWFmbGV0LmxhdExuZ0JvdW5kcyhmb2N1c0Nvb3JkaW5hdGVzKTtcbiAgICAgIGlmIChib3VuZHMuaXNWYWxpZCgpKSB7XG4gICAgICAgIG1hcC5maXRCb3VuZHMoYm91bmRzLCB7IHBhZGRpbmc6IFszMCwgMzBdIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBtYXAucmVtb3ZlKCk7XG4gICAgICBtYXBJbnN0YW5jZVJlZi5jdXJyZW50ID0gbnVsbDtcbiAgICB9O1xuICB9LCBbYXBwbGllZEZpbHRlcnMuc3RhdGVzLCBhcHBsaWVkRmlsdGVycy5zdGF0dXMsIGFwcGxpZWRGaWx0ZXJzLnBpbmNvZGUsIGFwcGxpZWRGaWx0ZXJzLmZyb20sIGFwcGxpZWRGaWx0ZXJzLnRvLCBiYXNlTWF0Y2hlZE1hcmtlcnMsIGRyYWZ0RmlsdGVycywgbGVhZmxldCwgbW9kZSwgdmlzaWJsZU1hcmtlcnNdKTtcblxuICBjb25zdCBhcHBseUZpbHRlcnMgPSAoKSA9PiB7XG4gICAgc2V0QXBwbGllZEZpbHRlcnMoZHJhZnRGaWx0ZXJzKTtcbiAgfTtcblxuICBjb25zdCBjbGVhckFsbCA9ICgpID0+IHtcbiAgICBzZXREcmFmdEZpbHRlcnMoZGVmYXVsdEZpbHRlcnMpO1xuICAgIHNldEFwcGxpZWRGaWx0ZXJzKGRlZmF1bHRGaWx0ZXJzKTtcbiAgfTtcblxuICBpZiAoIXN0YW5kYWxvbmUpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPHNlY3Rpb24gc3R5bGU9e3sgLi4uY2FyZFN0eWxlLCBwYWRkaW5nOiAyMCB9fT5cbiAgICAgICAgPGRpdiBzdHlsZT17c2VjdGlvbkhlYWRlclN0eWxlfT5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgyIHN0eWxlPXtzZWN0aW9uVGl0bGVTdHlsZX0+U2VsbGVyIGRpc3RyaWJ1dGlvbiBtYXA8L2gyPlxuICAgICAgICAgICAgPHAgc3R5bGU9e3NlY3Rpb25TdWJ0aXRsZVN0eWxlfT5QbG90IG9mIGdlb2NvZGVkIHNlbGxlciBsb2NhdGlvbnMgZnJvbSB0aGUgaW50YWtlIGZsb3cuPC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiByZWY9e21hcFJlZn0gc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgaGVpZ2h0OiA0MjAsIGJvcmRlclJhZGl1czogOCwgb3ZlcmZsb3c6ICdoaWRkZW4nIH19IC8+XG4gICAgICA8L3NlY3Rpb24+XG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPHNlY3Rpb24gc3R5bGU9e3sgLi4uY2FyZFN0eWxlLCBwYWRkaW5nOiAyMCB9fT5cbiAgICAgIDxkaXYgc3R5bGU9e3NlY3Rpb25IZWFkZXJTdHlsZX0+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGgyIHN0eWxlPXtzZWN0aW9uVGl0bGVTdHlsZX0+U2VsbGVyIGRpc3RyaWJ1dGlvbiBtYXA8L2gyPlxuICAgICAgICAgIDxwIHN0eWxlPXtzZWN0aW9uU3VidGl0bGVTdHlsZX0+XG4gICAgICAgICAgICBGaWx0ZXIgc2VsbGVycyBieSBzdGF0dXMsIGxvY2F0aW9uLCBhbmQgc3VibWlzc2lvbiB3aW5kb3cgZGlyZWN0bHkgZnJvbSB0aGUgbWFwIHZpZXcuXG4gICAgICAgICAgPC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdncmlkJywgZ2FwOiAyMCwgZ3JpZFRlbXBsYXRlQ29sdW1uczogJzI4MHB4IG1pbm1heCgwLCAxZnIpJyB9fT5cbiAgICAgICAgPGFzaWRlIHN0eWxlPXt7IC4uLmNhcmRTdHlsZSwgcGFkZGluZzogMTYsIGFsaWduU2VsZjogJ3N0YXJ0JyB9fT5cbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IC4uLnNlY3Rpb25UaXRsZVN0eWxlLCBmb250U2l6ZTogMTQsIG1hcmdpbkJvdHRvbTogMTIgfX0+TWFwIGZpbHRlcnM8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAxNCB9fT5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBmb250V2VpZ2h0OiA2MDAsIGNvbG9yOiAnIzZiNzI4MCcsIG1hcmdpbkJvdHRvbTogOCB9fT5TdGF0dXM8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2dyaWQnLCBnYXA6IDYgfX0+XG4gICAgICAgICAgICAgIHsoWydhbGwnLCAncGVuZGluZycsICdhcHByb3ZlZCcsICdyZWplY3RlZCddIGFzIGNvbnN0KS5tYXAoKHN0YXR1cykgPT4gKFxuICAgICAgICAgICAgICAgIDxsYWJlbCBrZXk9e3N0YXR1c30gc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiA4LCBmb250U2l6ZTogMTMgfX0+XG4gICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cInJhZGlvXCJcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17ZHJhZnRGaWx0ZXJzLnN0YXR1cyA9PT0gc3RhdHVzfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KCkgPT4gc2V0RHJhZnRGaWx0ZXJzKChjdXJyZW50KSA9PiAoeyAuLi5jdXJyZW50LCBzdGF0dXMgfSkpfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIHtzdGF0dXMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdGF0dXMuc2xpY2UoMSl9XG4gICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAxNCB9fT5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBmb250V2VpZ2h0OiA2MDAsIGNvbG9yOiAnIzZiNzI4MCcsIG1hcmdpbkJvdHRvbTogOCB9fT5TdGF0ZXM8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWF4SGVpZ2h0OiAxNjAsIG92ZXJmbG93WTogJ2F1dG8nLCBkaXNwbGF5OiAnZ3JpZCcsIGdhcDogNiB9fT5cbiAgICAgICAgICAgICAge2F2YWlsYWJsZVN0YXRlcy5tYXAoKHN0YXRlKSA9PiAoXG4gICAgICAgICAgICAgICAgPGxhYmVsIGtleT17c3RhdGV9IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogOCwgZm9udFNpemU6IDEzIH19PlxuICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ9e2RyYWZ0RmlsdGVycy5zdGF0ZXMuaW5jbHVkZXMoc3RhdGUpfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PlxuICAgICAgICAgICAgICAgICAgICAgIHNldERyYWZ0RmlsdGVycygoY3VycmVudCkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLmN1cnJlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZXM6IGV2ZW50LnRhcmdldC5jaGVja2VkXG4gICAgICAgICAgICAgICAgICAgICAgICAgID8gWy4uLmN1cnJlbnQuc3RhdGVzLCBzdGF0ZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBjdXJyZW50LnN0YXRlcy5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0gIT09IHN0YXRlKSxcbiAgICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIHtzdGF0ZX1cbiAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Cb3R0b206IDE0IH19PlxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogMTIsIGZvbnRXZWlnaHQ6IDYwMCwgY29sb3I6ICcjNmI3MjgwJywgbWFyZ2luQm90dG9tOiA4IH19PkNpdHk8L2Rpdj5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICB2YWx1ZT17ZHJhZnRGaWx0ZXJzLmNpdHl9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldERyYWZ0RmlsdGVycygoY3VycmVudCkgPT4gKHsgLi4uY3VycmVudCwgY2l0eTogZXZlbnQudGFyZ2V0LnZhbHVlIH0pKX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJUeXBlIGEgY2l0eVwiXG4gICAgICAgICAgICAgIHN0eWxlPXtpbnB1dFN0eWxlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAxNCB9fT5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBmb250V2VpZ2h0OiA2MDAsIGNvbG9yOiAnIzZiNzI4MCcsIG1hcmdpbkJvdHRvbTogOCB9fT5QaW5jb2RlPC9kaXY+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgdmFsdWU9e2RyYWZ0RmlsdGVycy5waW5jb2RlfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PlxuICAgICAgICAgICAgICAgIHNldERyYWZ0RmlsdGVycygoY3VycmVudCkgPT4gKHtcbiAgICAgICAgICAgICAgICAgIC4uLmN1cnJlbnQsXG4gICAgICAgICAgICAgICAgICBwaW5jb2RlOiBldmVudC50YXJnZXQudmFsdWUucmVwbGFjZSgvXFxEL2csICcnKS5zbGljZSgwLCA2KSxcbiAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIjYtZGlnaXQgcGluY29kZVwiXG4gICAgICAgICAgICAgIHN0eWxlPXtpbnB1dFN0eWxlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAxNCB9fT5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBmb250V2VpZ2h0OiA2MDAsIGNvbG9yOiAnIzZiNzI4MCcsIG1hcmdpbkJvdHRvbTogOCB9fT5EYXRlIHJhbmdlPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdncmlkJywgZ2FwOiA4IH19PlxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICB0eXBlPVwiZGF0ZVwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e2RyYWZ0RmlsdGVycy5mcm9tfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldERyYWZ0RmlsdGVycygoY3VycmVudCkgPT4gKHsgLi4uY3VycmVudCwgZnJvbTogZXZlbnQudGFyZ2V0LnZhbHVlIH0pKX1cbiAgICAgICAgICAgICAgICBzdHlsZT17aW5wdXRTdHlsZX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgdHlwZT1cImRhdGVcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtkcmFmdEZpbHRlcnMudG99XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RHJhZnRGaWx0ZXJzKChjdXJyZW50KSA9PiAoeyAuLi5jdXJyZW50LCB0bzogZXZlbnQudGFyZ2V0LnZhbHVlIH0pKX1cbiAgICAgICAgICAgICAgICBzdHlsZT17aW5wdXRTdHlsZX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGdhcDogOCwgbWFyZ2luQm90dG9tOiAxNiB9fT5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e2FwcGx5RmlsdGVyc30gc3R5bGU9e3sgLi4uYnV0dG9uU3R5bGUsIGJhY2tncm91bmQ6ICcjM2I4MmY2JywgY29sb3I6ICcjZmZmZmZmJywgYm9yZGVyQ29sb3I6ICcjM2I4MmY2JywgZmxleDogMSB9fT5cbiAgICAgICAgICAgICAgQXBwbHkgRmlsdGVyc1xuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXtjbGVhckFsbH0gc3R5bGU9e3sgLi4uYnV0dG9uU3R5bGUsIGZsZXg6IDEgfX0+XG4gICAgICAgICAgICAgIENsZWFyIEFsbFxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGJvcmRlclRvcDogJzFweCBzb2xpZCAjZTVlN2ViJywgcGFkZGluZ1RvcDogMTIgfX0+XG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAxMywgZm9udFdlaWdodDogNjAwLCBjb2xvcjogJyMxZjI5MzcnIH19PlxuICAgICAgICAgICAgICBTaG93aW5nIHt2aXNpYmxlQ291bnRzLnRvdGFsfSBzZWxsZXJzXG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiA4LCBkaXNwbGF5OiAnZ3JpZCcsIGdhcDogNiB9fT5cbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17bGVnZW5kSXRlbVN0eWxlfT5cbiAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyB3aWR0aDogOCwgaGVpZ2h0OiA4LCBib3JkZXJSYWRpdXM6ICc1MCUnLCBiYWNrZ3JvdW5kOiAnI2Y1OWUwYicgfX0gLz5cbiAgICAgICAgICAgICAgICB7dmlzaWJsZUNvdW50cy5wZW5kaW5nfSBwZW5kaW5nXG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtsZWdlbmRJdGVtU3R5bGV9PlxuICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IHdpZHRoOiA4LCBoZWlnaHQ6IDgsIGJvcmRlclJhZGl1czogJzUwJScsIGJhY2tncm91bmQ6ICcjMTBiOTgxJyB9fSAvPlxuICAgICAgICAgICAgICAgIHt2aXNpYmxlQ291bnRzLmFwcHJvdmVkfSBhcHByb3ZlZFxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17bGVnZW5kSXRlbVN0eWxlfT5cbiAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyB3aWR0aDogOCwgaGVpZ2h0OiA4LCBib3JkZXJSYWRpdXM6ICc1MCUnLCBiYWNrZ3JvdW5kOiAnI2VmNDQ0NCcgfX0gLz5cbiAgICAgICAgICAgICAgICB7dmlzaWJsZUNvdW50cy5yZWplY3RlZH0gcmVqZWN0ZWRcbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9hc2lkZT5cblxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgbWFyZ2luQm90dG9tOiAxMiB9fT5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBnYXA6IDggfX0+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRNb2RlKCdtYXJrZXJzJyl9XG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgIC4uLmJ1dHRvblN0eWxlLFxuICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiA5OTksXG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBtb2RlID09PSAnbWFya2VycycgPyAnIzNiODJmNicgOiAnI2ZmZmZmZicsXG4gICAgICAgICAgICAgICAgICBjb2xvcjogbW9kZSA9PT0gJ21hcmtlcnMnID8gJyNmZmZmZmYnIDogJyMzNzQxNTEnLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBNYXJrZXJzXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0TW9kZSgnaGVhdG1hcCcpfVxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAuLi5idXR0b25TdHlsZSxcbiAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogOTk5LFxuICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogbW9kZSA9PT0gJ2hlYXRtYXAnID8gJyMzYjgyZjYnIDogJyNmZmZmZmYnLFxuICAgICAgICAgICAgICAgICAgY29sb3I6IG1vZGUgPT09ICdoZWF0bWFwJyA/ICcjZmZmZmZmJyA6ICcjMzc0MTUxJyxcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgSGVhdG1hcFxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IC4uLmNhcmRTdHlsZSwgcGFkZGluZzogMTIsIHdpZHRoOiAxNzAsIGJveFNoYWRvdzogJzAgOHB4IDI0cHggcmdiYSgxNSwgMjMsIDQyLCAwLjEyKScgfX0+XG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgLi4uc2VjdGlvblRpdGxlU3R5bGUsIGZvbnRTaXplOiAxMywgbWFyZ2luQm90dG9tOiAxMCB9fT5MZWdlbmQ8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZ3JpZCcsIGdhcDogOCB9fT5cbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtsZWdlbmRJdGVtU3R5bGV9PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgd2lkdGg6IDEwLCBoZWlnaHQ6IDEwLCBib3JkZXJSYWRpdXM6ICc1MCUnLCBiYWNrZ3JvdW5kOiAnI2Y1OWUwYicgfX0gLz5cbiAgICAgICAgICAgICAgICAgIFBlbmRpbmdcbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtsZWdlbmRJdGVtU3R5bGV9PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgd2lkdGg6IDEwLCBoZWlnaHQ6IDEwLCBib3JkZXJSYWRpdXM6ICc1MCUnLCBiYWNrZ3JvdW5kOiAnIzEwYjk4MScgfX0gLz5cbiAgICAgICAgICAgICAgICAgIEFwcHJvdmVkXG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17bGVnZW5kSXRlbVN0eWxlfT5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IHdpZHRoOiAxMCwgaGVpZ2h0OiAxMCwgYm9yZGVyUmFkaXVzOiAnNTAlJywgYmFja2dyb3VuZDogJyNlZjQ0NDQnIH19IC8+XG4gICAgICAgICAgICAgICAgICBSZWplY3RlZFxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBwb3NpdGlvbjogJ3JlbGF0aXZlJyB9fT5cbiAgICAgICAgICAgIDxkaXYgcmVmPXttYXBSZWZ9IHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIGhlaWdodDogNTIwLCBib3JkZXJSYWRpdXM6IDgsIG92ZXJmbG93OiAnaGlkZGVuJyB9fSAvPlxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgICAgIGxlZnQ6IDEyLFxuICAgICAgICAgICAgICAgIGJvdHRvbTogMTIsXG4gICAgICAgICAgICAgICAgLi4uY2FyZFN0eWxlLFxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMHB4IDEycHgnLFxuICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICAgICAgICAgICAgICBnYXA6IDEyLFxuICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMixcbiAgICAgICAgICAgICAgICBjb2xvcjogJyMzNzQxNTEnLFxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgOHB4IDI0cHggcmdiYSgxNSwgMjMsIDQyLCAwLjEyKScsXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxzcGFuPnt2aXNpYmxlQ291bnRzLnRvdGFsfSBzZWxsZXJzIHNob3duPC9zcGFuPlxuICAgICAgICAgICAgICA8c3Bhbj57dmlzaWJsZUNvdW50cy5wZW5kaW5nfSBwZW5kaW5nPC9zcGFuPlxuICAgICAgICAgICAgICA8c3Bhbj57dmlzaWJsZUNvdW50cy5hcHByb3ZlZH0gYXBwcm92ZWQ8L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuPnt2aXNpYmxlQ291bnRzLnJlamVjdGVkfSByZWplY3RlZDwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogMTggfX0+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTaG93Tm9Mb2NhdGlvbigoY3VycmVudCkgPT4gIWN1cnJlbnQpfVxuICAgICAgICAgIHN0eWxlPXt7IC4uLmJ1dHRvblN0eWxlLCBtYXJnaW5Cb3R0b206IDEwIH19XG4gICAgICAgID5cbiAgICAgICAgICB7c2hvd05vTG9jYXRpb24gPyAnSGlkZScgOiAnU2hvdyd9IHt2aXNpYmxlTm9Mb2NhdGlvbi5sZW5ndGh9IHNlbGxlcnMgd2l0aG91dCBtYXAgY29vcmRpbmF0ZXNcbiAgICAgICAgPC9idXR0b24+XG5cbiAgICAgICAge3Nob3dOb0xvY2F0aW9uID8gKFxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgb3ZlcmZsb3dYOiAnYXV0bycgfX0+XG4gICAgICAgICAgICA8dGFibGUgc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgYm9yZGVyQ29sbGFwc2U6ICdjb2xsYXBzZScgfX0+XG4gICAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiAnbGVmdCcsIHBhZGRpbmc6ICcxMHB4IDEycHgnIH19PlNlbGxlcjwvdGg+XG4gICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiAnbGVmdCcsIHBhZGRpbmc6ICcxMHB4IDEycHgnIH19PkxvY2F0aW9uPC90aD5cbiAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzEwcHggMTJweCcgfX0+U3RhdHVzPC90aD5cbiAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzEwcHggMTJweCcgfX0+UmVjZWl2ZWQ8L3RoPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICB7dmlzaWJsZU5vTG9jYXRpb24ubWFwKChzZWxsZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGJhZGdlID0gc3RhdHVzQ29sb3JzW3NlbGxlci5zdGF0dXNdID8/IHsgZmlsbDogJyNmNTllMGInLCB0ZXh0OiAnIzkyNDAwZScgfTtcblxuICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPHRyIGtleT17c2VsbGVyLmlkfSBzdHlsZT17eyBib3JkZXJUb3A6ICcxcHggc29saWQgI2U1ZTdlYicgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcxMnB4JyB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFdlaWdodDogNjAwLCBjb2xvcjogJyMxZjI5MzcnIH19PntzZWxsZXIuYnVzaW5lc3NOYW1lfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Ub3A6IDQsIGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRTaXplOiAxMyB9fT57c2VsbGVyLnNlbGxlck5hbWV9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzEycHgnLCBmb250U2l6ZTogMTMsIGNvbG9yOiAnIzM3NDE1MScgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7c2VsbGVyLmxvY2F0aW9uLmNpdHl9LCB7c2VsbGVyLmxvY2F0aW9uLnN0YXRlfSB7c2VsbGVyLmxvY2F0aW9uLnBpbmNvZGV9XG4gICAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzEycHgnIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgPEJhZGdlIGxhYmVsPXtzZWxsZXIuc3RhdHVzfSBiYWNrZ3JvdW5kPXtgJHtiYWRnZS5maWxsfTIyYH0gY29sb3I9e2JhZGdlLnRleHR9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzEycHgnLCBmb250U2l6ZTogMTMsIGNvbG9yOiAnIzZiNzI4MCcgfX0+e2Zvcm1hdERhdGUoc2VsbGVyLnJlY2VpdmVkQXQpfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICAgIHt2aXNpYmxlTm9Mb2NhdGlvbi5sZW5ndGggPT09IDAgPyAoXG4gICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0ZCBjb2xTcGFuPXs0fSBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCAxMnB4JywgY29sb3I6ICcjNmI3MjgwJyB9fT5cbiAgICAgICAgICAgICAgICAgICAgICBBbGwgc2VsbGVycyBjdXJyZW50bHkgaGF2ZSBtYXAgY29vcmRpbmF0ZXMgZm9yIHRoZSBhY3RpdmUgZmlsdGVycy5cbiAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogbnVsbH1cbiAgICAgIDwvZGl2PlxuICAgIDwvc2VjdGlvbj5cbiAgKTtcbn07XG5cbmNvbnN0IFNlbGxlck1hcFBhZ2UgPSAoKSA9PiB7XG4gIGNvbnN0IHsgZGF0YSwgbG9hZGluZywgZXJyb3IgfSA9IHVzZVBhZ2VEYXRhPFNlbGxlck1hcFBheWxvYWQ+KCdzZWxsZXItbWFwJyk7XG5cbiAgaWYgKGxvYWRpbmcpIHtcbiAgICByZXR1cm4gPExvYWRpbmdTdGF0ZSBsYWJlbD1cIkxvYWRpbmcgc2VsbGVyIG1hcC4uLlwiIC8+O1xuICB9XG5cbiAgaWYgKGVycm9yIHx8ICFkYXRhKSB7XG4gICAgcmV0dXJuIDxFcnJvclN0YXRlIG1lc3NhZ2U9e2Vycm9yID8/ICdTZWxsZXIgbWFwIGRhdGEgaXMgdW5hdmFpbGFibGUnfSAvPjtcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBzdHlsZT17cGFnZVN0eWxlfT5cbiAgICAgIDxTZWxsZXJNYXBQYW5lbCBwYXlsb2FkPXtkYXRhfSBzdGFuZGFsb25lIC8+XG4gICAgPC9kaXY+XG4gICk7XG59O1xuXG5leHBvcnQgeyBTZWxsZXJNYXBQYW5lbCB9O1xuZXhwb3J0IGRlZmF1bHQgU2VsbGVyTWFwUGFnZTtcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCB0eXBlIHsgRGFzaGJvYXJkUGF5bG9hZCB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7XG4gIEVycm9yU3RhdGUsXG4gIExvYWRpbmdTdGF0ZSxcbiAgY2FyZFN0eWxlLFxuICBmb3JtYXREYXRlVGltZSxcbiAgcGFnZVN0eWxlLFxuICBzZWN0aW9uSGVhZGVyU3R5bGUsXG4gIHNlY3Rpb25TdWJ0aXRsZVN0eWxlLFxuICBzZWN0aW9uVGl0bGVTdHlsZSxcbiAgdGltZUFnbyxcbiAgdXNlQ2hhcnRKcyxcbiAgdXNlRGFzaGJvYXJkRGF0YSxcbn0gZnJvbSAnLi9zaGFyZWQnO1xuaW1wb3J0IHsgU2VsbGVyTWFwUGFuZWwgfSBmcm9tICcuL1NlbGxlck1hcCc7XG5cbmNvbnN0IGNoYXJ0V3JhcFN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0ge1xuICAuLi5jYXJkU3R5bGUsXG4gIHBhZGRpbmc6IDIwLFxuICBtaW5IZWlnaHQ6IDM2MCxcbn07XG5cbmNvbnN0IERhc2hib2FyZENoYXJ0cyA9ICh7IHBheWxvYWQgfTogeyBwYXlsb2FkOiBEYXNoYm9hcmRQYXlsb2FkIH0pID0+IHtcbiAgY29uc3QgY2hhcnRDb25zdHJ1Y3RvciA9IHVzZUNoYXJ0SnMoKTtcbiAgY29uc3QgYmFyQ2FudmFzUmVmID0gdXNlUmVmPEhUTUxDYW52YXNFbGVtZW50IHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IGRvbnV0Q2FudmFzUmVmID0gdXNlUmVmPEhUTUxDYW52YXNFbGVtZW50IHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IFttb2RlLCBzZXRNb2RlXSA9IHVzZVN0YXRlPCczMGQnIHwgJzEybSc+KCczMGQnKTtcblxuICBjb25zdCBzdWJtaXNzaW9uc1NlcmllcyA9IG1vZGUgPT09ICczMGQnID8gcGF5bG9hZC5zdWJtaXNzaW9uczMwRGF5cyA6IHBheWxvYWQuc3VibWlzc2lvbnMxMk1vbnRocztcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghY2hhcnRDb25zdHJ1Y3RvciB8fCAhYmFyQ2FudmFzUmVmLmN1cnJlbnQgfHwgIWRvbnV0Q2FudmFzUmVmLmN1cnJlbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBiYXJDb250ZXh0ID0gYmFyQ2FudmFzUmVmLmN1cnJlbnQuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBjb25zdCBkb251dENvbnRleHQgPSBkb251dENhbnZhc1JlZi5jdXJyZW50LmdldENvbnRleHQoJzJkJyk7XG5cbiAgICBpZiAoIWJhckNvbnRleHQgfHwgIWRvbnV0Q29udGV4dCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGJhckNoYXJ0ID0gbmV3IGNoYXJ0Q29uc3RydWN0b3IoYmFyQ29udGV4dCwge1xuICAgICAgdHlwZTogJ2JhcicsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGxhYmVsczogc3VibWlzc2lvbnNTZXJpZXMubWFwKChwb2ludCkgPT4gcG9pbnQubGFiZWwpLFxuICAgICAgICBkYXRhc2V0czogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiAnU3VibWlzc2lvbnMnLFxuICAgICAgICAgICAgZGF0YTogc3VibWlzc2lvbnNTZXJpZXMubWFwKChwb2ludCkgPT4gcG9pbnQuY291bnQpLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzNiODJmNicsXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6IDYsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgICBvcHRpb25zOiB7XG4gICAgICAgIG1haW50YWluQXNwZWN0UmF0aW86IGZhbHNlLFxuICAgICAgICBwbHVnaW5zOiB7XG4gICAgICAgICAgbGVnZW5kOiB7IGRpc3BsYXk6IGZhbHNlIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHNjYWxlczoge1xuICAgICAgICAgIHg6IHtcbiAgICAgICAgICAgIGdyaWQ6IHsgZGlzcGxheTogZmFsc2UgfSxcbiAgICAgICAgICAgIHRpY2tzOiB7IGNvbG9yOiAnIzZiNzI4MCcsIGZvbnQ6IHsgc2l6ZTogMTEgfSB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgeToge1xuICAgICAgICAgICAgYmVnaW5BdFplcm86IHRydWUsXG4gICAgICAgICAgICB0aWNrczogeyBwcmVjaXNpb246IDAsIGNvbG9yOiAnIzZiNzI4MCcsIGZvbnQ6IHsgc2l6ZTogMTEgfSB9LFxuICAgICAgICAgICAgZ3JpZDogeyBjb2xvcjogJ3JnYmEoMTQ4LDE2MywxODQsMC4xNiknIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBkb251dENoYXJ0ID0gbmV3IGNoYXJ0Q29uc3RydWN0b3IoZG9udXRDb250ZXh0LCB7XG4gICAgICB0eXBlOiAnZG91Z2hudXQnLFxuICAgICAgZGF0YToge1xuICAgICAgICBsYWJlbHM6IFsnUGVuZGluZycsICdBcHByb3ZlZCcsICdSZWplY3RlZCddLFxuICAgICAgICBkYXRhc2V0czogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGRhdGE6IFtwYXlsb2FkLnN0YXRzLnBlbmRpbmcsIHBheWxvYWQuc3RhdHMuYXBwcm92ZWQsIHBheWxvYWQuc3RhdHMucmVqZWN0ZWRdLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBbJyNmNTllMGInLCAnIzEwYjk4MScsICcjZWY0NDQ0J10sXG4gICAgICAgICAgICBib3JkZXJXaWR0aDogMCxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgbWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXG4gICAgICAgIGN1dG91dDogJzcyJScsXG4gICAgICAgIHBsdWdpbnM6IHtcbiAgICAgICAgICBsZWdlbmQ6IHsgZGlzcGxheTogZmFsc2UgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgYmFyQ2hhcnQuZGVzdHJveSgpO1xuICAgICAgZG9udXRDaGFydC5kZXN0cm95KCk7XG4gICAgfTtcbiAgfSwgW2NoYXJ0Q29uc3RydWN0b3IsIG1vZGUsIHBheWxvYWQuc3RhdHMsIHN1Ym1pc3Npb25zU2VyaWVzXSk7XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdncmlkJywgZ2FwOiAyMCwgZ3JpZFRlbXBsYXRlQ29sdW1uczogJzEuMzVmciAxZnInIH19PlxuICAgICAgPHNlY3Rpb24gc3R5bGU9e2NoYXJ0V3JhcFN0eWxlfT5cbiAgICAgICAgPGRpdiBzdHlsZT17c2VjdGlvbkhlYWRlclN0eWxlfT5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgyIHN0eWxlPXtzZWN0aW9uVGl0bGVTdHlsZX0+U3VibWlzc2lvbnMgY2hhcnQ8L2gyPlxuICAgICAgICAgICAgPHAgc3R5bGU9e3NlY3Rpb25TdWJ0aXRsZVN0eWxlfT5TdWJtaXNzaW9uIHZvbHVtZSBvdmVyIHRoZSBsYXN0IDMwIGRheXMgb3IgMTIgbW9udGhzLjwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiA4IH19PlxuICAgICAgICAgICAgeyhbJzMwZCcsICcxMm0nXSBhcyBjb25zdCkubWFwKCh2YWx1ZSkgPT4gKFxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAga2V5PXt2YWx1ZX1cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRNb2RlKHZhbHVlKX1cbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiA5OTksXG4gICAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2QxZDVkYicsXG4gICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnN3B4IDEycHgnLFxuICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogbW9kZSA9PT0gdmFsdWUgPyAnIzNiODJmNicgOiAnI2ZmZmZmZicsXG4gICAgICAgICAgICAgICAgICBjb2xvcjogbW9kZSA9PT0gdmFsdWUgPyAnI2ZmZmZmZicgOiAnIzM3NDE1MScsXG4gICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiA2MDAsXG4gICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge3ZhbHVlID09PSAnMzBkJyA/ICczMCBkYXlzJyA6ICcxMiBtb250aHMnfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBzdHlsZT17eyBoZWlnaHQ6IDI4MCB9fT5cbiAgICAgICAgICA8Y2FudmFzIHJlZj17YmFyQ2FudmFzUmVmfSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gc3R5bGU9e2NoYXJ0V3JhcFN0eWxlfT5cbiAgICAgICAgPGRpdiBzdHlsZT17c2VjdGlvbkhlYWRlclN0eWxlfT5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgyIHN0eWxlPXtzZWN0aW9uVGl0bGVTdHlsZX0+U3RhdHVzIGJyZWFrZG93bjwvaDI+XG4gICAgICAgICAgICA8cCBzdHlsZT17c2VjdGlvblN1YnRpdGxlU3R5bGV9PkN1cnJlbnQgbWl4IG9mIHBlbmRpbmcsIGFwcHJvdmVkLCBhbmQgcmVqZWN0ZWQgc2VsbGVycy48L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdncmlkJywgZ3JpZFRlbXBsYXRlQ29sdW1uczogJzIyMHB4IDFmcicsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6IDEyIH19PlxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcG9zaXRpb246ICdyZWxhdGl2ZScsIGhlaWdodDogMjIwIH19PlxuICAgICAgICAgICAgPGNhbnZhcyByZWY9e2RvbnV0Q2FudmFzUmVmfSAvPlxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgICAgIGluc2V0OiAwLFxuICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgcG9pbnRlckV2ZW50czogJ25vbmUnLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRTaXplOiAxMiB9fT5Ub3RhbDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGNvbG9yOiAnIzFmMjkzNycsIGZvbnRTaXplOiAzMCwgZm9udFdlaWdodDogNzAwIH19PntwYXlsb2FkLnN0YXRzLnRvdGFsfTwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZ3JpZCcsIGdhcDogMTAgfX0+XG4gICAgICAgICAgICB7W1xuICAgICAgICAgICAgICB7IGxhYmVsOiAnUGVuZGluZycsIHZhbHVlOiBwYXlsb2FkLnN0YXRzLnBlbmRpbmcsIGNvbG9yOiAnI2Y1OWUwYicgfSxcbiAgICAgICAgICAgICAgeyBsYWJlbDogJ0FwcHJvdmVkJywgdmFsdWU6IHBheWxvYWQuc3RhdHMuYXBwcm92ZWQsIGNvbG9yOiAnIzEwYjk4MScgfSxcbiAgICAgICAgICAgICAgeyBsYWJlbDogJ1JlamVjdGVkJywgdmFsdWU6IHBheWxvYWQuc3RhdHMucmVqZWN0ZWQsIGNvbG9yOiAnI2VmNDQ0NCcgfSxcbiAgICAgICAgICAgIF0ubWFwKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHBlcmNlbnRhZ2UgPSBwYXlsb2FkLnN0YXRzLnRvdGFsID4gMCA/IE1hdGgucm91bmQoKGl0ZW0udmFsdWUgLyBwYXlsb2FkLnN0YXRzLnRvdGFsKSAqIDEwMCkgOiAwO1xuXG4gICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBrZXk9e2l0ZW0ubGFiZWx9IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicgfX0+XG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogMTAsIGNvbG9yOiAnIzM3NDE1MScsIGZvbnRTaXplOiAxMyB9fT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgd2lkdGg6IDEwLCBoZWlnaHQ6IDEwLCBib3JkZXJSYWRpdXM6ICc1MCUnLCBiYWNrZ3JvdW5kOiBpdGVtLmNvbG9yIH19IC8+XG4gICAgICAgICAgICAgICAgICAgIHtpdGVtLmxhYmVsfVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRTaXplOiAxMyB9fT5cbiAgICAgICAgICAgICAgICAgICAge2l0ZW0udmFsdWV9ICh7cGVyY2VudGFnZX0lKVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L3NlY3Rpb24+XG4gICAgPC9kaXY+XG4gICk7XG59O1xuXG5jb25zdCBEYXNoYm9hcmQgPSAoKSA9PiB7XG4gIGNvbnN0IHsgZGF0YSwgbG9hZGluZywgZXJyb3IgfSA9IHVzZURhc2hib2FyZERhdGE8RGFzaGJvYXJkUGF5bG9hZD4oKTtcblxuICBjb25zdCBzdGF0cyA9IHVzZU1lbW8oXG4gICAgKCkgPT5cbiAgICAgIGRhdGFcbiAgICAgICAgPyBbXG4gICAgICAgICAgICB7IGxhYmVsOiAnVG90YWwgU2VsbGVycycsIHZhbHVlOiBkYXRhLnN0YXRzLnRvdGFsLCBjb2xvcjogJyMzYjgyZjYnLCBiZzogJyNkYmVhZmUnIH0sXG4gICAgICAgICAgICB7IGxhYmVsOiAnUGVuZGluZycsIHZhbHVlOiBkYXRhLnN0YXRzLnBlbmRpbmcsIGNvbG9yOiAnI2Y1OWUwYicsIGJnOiAnI2ZlZjNjNycgfSxcbiAgICAgICAgICAgIHsgbGFiZWw6ICdBcHByb3ZlZCcsIHZhbHVlOiBkYXRhLnN0YXRzLmFwcHJvdmVkLCBjb2xvcjogJyMxMGI5ODEnLCBiZzogJyNkMWZhZTUnIH0sXG4gICAgICAgICAgICB7IGxhYmVsOiAnUmVqZWN0ZWQnLCB2YWx1ZTogZGF0YS5zdGF0cy5yZWplY3RlZCwgY29sb3I6ICcjZWY0NDQ0JywgYmc6ICcjZmVlMmUyJyB9LFxuICAgICAgICAgIF1cbiAgICAgICAgOiBbXSxcbiAgICBbZGF0YV0sXG4gICk7XG5cbiAgaWYgKGxvYWRpbmcpIHtcbiAgICByZXR1cm4gPExvYWRpbmdTdGF0ZSBsYWJlbD1cIkxvYWRpbmcgZGFzaGJvYXJkLi4uXCIgLz47XG4gIH1cblxuICBpZiAoZXJyb3IgfHwgIWRhdGEpIHtcbiAgICByZXR1cm4gPEVycm9yU3RhdGUgbWVzc2FnZT17ZXJyb3IgPz8gJ0Rhc2hib2FyZCBkYXRhIGlzIHVuYXZhaWxhYmxlJ30gLz47XG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgc3R5bGU9e3BhZ2VTdHlsZX0+XG4gICAgICA8c2VjdGlvbiBzdHlsZT17eyAuLi5jYXJkU3R5bGUsIHBhZGRpbmc6IDI0IH19PlxuICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywganVzdGlmeUNvbnRlbnQ6ICdzcGFjZS1iZXR3ZWVuJywgYWxpZ25JdGVtczogJ2ZsZXgtc3RhcnQnLCBnYXA6IDE2IH19PlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aDEgc3R5bGU9e3sgbWFyZ2luOiAwLCBmb250U2l6ZTogMjgsIGZvbnRXZWlnaHQ6IDcwMCwgY29sb3I6ICcjMWYyOTM3JyB9fT5cbiAgICAgICAgICAgICAge2RhdGEuZ3JlZXRpbmd9LCB7ZGF0YS5hZG1pbk5hbWV9XG4gICAgICAgICAgICA8L2gxPlxuICAgICAgICAgICAgPHAgc3R5bGU9e3sgbWFyZ2luOiAnNnB4IDAgMCcsIGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRTaXplOiAxNCB9fT5aYXRjaCBTdXBlciBBZG1pbiBQYW5lbDwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRTaXplOiAxMyB9fT57ZGF0YS5kYXRlTGFiZWx9PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdncmlkJywgZ3JpZFRlbXBsYXRlQ29sdW1uczogJ3JlcGVhdCg0LCBtaW5tYXgoMCwgMWZyKSknLCBnYXA6IDIwIH19PlxuICAgICAgICB7c3RhdHMubWFwKChzdGF0KSA9PiAoXG4gICAgICAgICAgPGRpdlxuICAgICAgICAgICAga2V5PXtzdGF0LmxhYmVsfVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgLi4uY2FyZFN0eWxlLFxuICAgICAgICAgICAgICBib3JkZXJMZWZ0OiBgNHB4IHNvbGlkICR7c3RhdC5jb2xvcn1gLFxuICAgICAgICAgICAgICBwYWRkaW5nOiAyMCxcbiAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcG9zaXRpb246ICdhYnNvbHV0ZScsIHJpZ2h0OiAxNiwgdG9wOiAxNiwgY29sb3I6IHN0YXQuY29sb3IgfX0+XG4gICAgICAgICAgICAgIDxzdmcgd2lkdGg9XCIyMlwiIGhlaWdodD1cIjIyXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIxLjhcIj5cbiAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTUgMTNoNHY2SDV6XCIgLz5cbiAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTEwIDloNHYxMGgtNHpcIiAvPlxuICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMTUgNWg0djE0aC00elwiIC8+XG4gICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAzMiwgZm9udFdlaWdodDogNzAwLCBjb2xvcjogc3RhdC5jb2xvciB9fT57c3RhdC52YWx1ZX08L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiA4LCBmb250U2l6ZTogMTQsIGNvbG9yOiAnIzZiNzI4MCcgfX0+e3N0YXQubGFiZWx9PC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkpfVxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxEYXNoYm9hcmRDaGFydHMgcGF5bG9hZD17ZGF0YX0gLz5cblxuICAgICAgPFNlbGxlck1hcFBhbmVsXG4gICAgICAgIHBheWxvYWQ9e3tcbiAgICAgICAgICBzdGF0czogZGF0YS5zdGF0cyxcbiAgICAgICAgICBzZWxsZXJzOiBkYXRhLm1hcC5zZWxsZXJzLFxuICAgICAgICAgIG5vTG9jYXRpb246IGRhdGEubWFwLm5vTG9jYXRpb24sXG4gICAgICAgIH19XG4gICAgICAvPlxuXG4gICAgICA8c2VjdGlvbiBzdHlsZT17eyAuLi5jYXJkU3R5bGUsIHBhZGRpbmc6IDIwIH19PlxuICAgICAgICA8ZGl2IHN0eWxlPXtzZWN0aW9uSGVhZGVyU3R5bGV9PlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aDIgc3R5bGU9e3NlY3Rpb25UaXRsZVN0eWxlfT5SZWNlbnQgYWN0aXZpdHkgZmVlZDwvaDI+XG4gICAgICAgICAgICA8cCBzdHlsZT17c2VjdGlvblN1YnRpdGxlU3R5bGV9Pkxhc3QgMTAgYXVkaXQgZW50cmllcyBhY3Jvc3MgaW50YWtlLCByZXZpZXcsIGFuZCBzZXNzaW9uIGFjdGlvbnMuPC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICB7ZGF0YS5yZWNlbnRBY3Rpdml0eS5tYXAoKGFjdGl2aXR5KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhY3Rpb25Db2xvciA9XG4gICAgICAgICAgICAgIGFjdGl2aXR5LmFjdGlvbiA9PT0gJ3NlbGxlci5hcHByb3ZlZCdcbiAgICAgICAgICAgICAgICA/ICcjMTBiOTgxJ1xuICAgICAgICAgICAgICAgIDogYWN0aXZpdHkuYWN0aW9uID09PSAnc2VsbGVyLnJlamVjdGVkJ1xuICAgICAgICAgICAgICAgICAgPyAnI2VmNDQ0NCdcbiAgICAgICAgICAgICAgICAgIDogYWN0aXZpdHkuYWN0aW9uID09PSAnc2VsbGVyLnN1Ym1pdHRlZCdcbiAgICAgICAgICAgICAgICAgICAgPyAnIzNiODJmNidcbiAgICAgICAgICAgICAgICAgICAgOiAnIzhiNWNmNic7XG5cbiAgICAgICAgICAgIGNvbnN0IGFjdGlvbkxhYmVsID0gYWN0aXZpdHkuYWN0aW9uLnNwbGl0KCcuJykucG9wKCkgPz8gYWN0aXZpdHkuYWN0aW9uO1xuXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAga2V5PXthY3Rpdml0eS5pZH1cbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxuICAgICAgICAgICAgICAgICAgZ2FwOiAxMixcbiAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEwcHggMCcsXG4gICAgICAgICAgICAgICAgICBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2U1ZTdlYicsXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgd2lkdGg6IDgsIGhlaWdodDogOCwgYm9yZGVyUmFkaXVzOiAnNTAlJywgYmFja2dyb3VuZDogYWN0aW9uQ29sb3IgfX0gLz5cbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAxNCB9fT5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDYwMCB9fT57YWN0aXZpdHkuc2VsbGVyTmFtZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBjb2xvcjogJyM2YjcyODAnIH19PiB3YXMge2FjdGlvbkxhYmVsLnJlcGxhY2UoJy0nLCAnICcpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGNvbG9yOiAnIzljYTNhZicsIG1hcmdpbkxlZnQ6IDggfX0+Ynkge2FjdGl2aXR5LmFjdG9yfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpbkxlZnQ6ICdhdXRvJywgY29sb3I6ICcjOWNhM2FmJywgZm9udFNpemU6IDEyIH19PlxuICAgICAgICAgICAgICAgICAgPGRpdj57dGltZUFnbyhhY3Rpdml0eS5jcmVhdGVkQXQpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Ub3A6IDIgfX0+e2Zvcm1hdERhdGVUaW1lKGFjdGl2aXR5LmNyZWF0ZWRBdCl9PC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KX1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L3NlY3Rpb24+XG4gICAgPC9kaXY+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBEYXNoYm9hcmQ7XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VSZWYgfSBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCB0eXBlIHsgQW5hbHl0aWNzUGF5bG9hZCB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7XG4gIEVycm9yU3RhdGUsXG4gIExvYWRpbmdTdGF0ZSxcbiAgY2FyZFN0eWxlLFxuICBwYWdlU3R5bGUsXG4gIHNlY3Rpb25IZWFkZXJTdHlsZSxcbiAgc2VjdGlvblN1YnRpdGxlU3R5bGUsXG4gIHNlY3Rpb25UaXRsZVN0eWxlLFxuICB1c2VDaGFydEpzLFxuICB1c2VQYWdlRGF0YSxcbn0gZnJvbSAnLi9zaGFyZWQnO1xuXG5jb25zdCBBbmFseXRpY3NDaGFydHMgPSAoeyBwYXlsb2FkIH06IHsgcGF5bG9hZDogQW5hbHl0aWNzUGF5bG9hZCB9KSA9PiB7XG4gIGNvbnN0IGNoYXJ0Q29uc3RydWN0b3IgPSB1c2VDaGFydEpzKCk7XG4gIGNvbnN0IHN0YXRlc0NhbnZhc1JlZiA9IHVzZVJlZjxIVE1MQ2FudmFzRWxlbWVudCB8IG51bGw+KG51bGwpO1xuICBjb25zdCBhcHByb3ZhbENhbnZhc1JlZiA9IHVzZVJlZjxIVE1MQ2FudmFzRWxlbWVudCB8IG51bGw+KG51bGwpO1xuICBjb25zdCBob3Vyc0NhbnZhc1JlZiA9IHVzZVJlZjxIVE1MQ2FudmFzRWxlbWVudCB8IG51bGw+KG51bGwpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFjaGFydENvbnN0cnVjdG9yIHx8ICFzdGF0ZXNDYW52YXNSZWYuY3VycmVudCB8fCAhYXBwcm92YWxDYW52YXNSZWYuY3VycmVudCB8fCAhaG91cnNDYW52YXNSZWYuY3VycmVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHN0YXRlQ29udGV4dCA9IHN0YXRlc0NhbnZhc1JlZi5jdXJyZW50LmdldENvbnRleHQoJzJkJyk7XG4gICAgY29uc3QgYXBwcm92YWxDb250ZXh0ID0gYXBwcm92YWxDYW52YXNSZWYuY3VycmVudC5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGNvbnN0IGhvdXJzQ29udGV4dCA9IGhvdXJzQ2FudmFzUmVmLmN1cnJlbnQuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgIGlmICghc3RhdGVDb250ZXh0IHx8ICFhcHByb3ZhbENvbnRleHQgfHwgIWhvdXJzQ29udGV4dCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHN0YXRlc0NoYXJ0ID0gbmV3IGNoYXJ0Q29uc3RydWN0b3Ioc3RhdGVDb250ZXh0LCB7XG4gICAgICB0eXBlOiAnYmFyJyxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgbGFiZWxzOiBwYXlsb2FkLnRvcFN0YXRlcy5tYXAoKGl0ZW0pID0+IGl0ZW0ubGFiZWwpLFxuICAgICAgICBkYXRhc2V0czogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGRhdGE6IHBheWxvYWQudG9wU3RhdGVzLm1hcCgoaXRlbSkgPT4gaXRlbS5jb3VudCksXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjM2I4MmY2JyxcbiAgICAgICAgICAgIGJvcmRlclJhZGl1czogNixcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgbWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXG4gICAgICAgIGluZGV4QXhpczogJ3knLFxuICAgICAgICBwbHVnaW5zOiB7IGxlZ2VuZDogeyBkaXNwbGF5OiBmYWxzZSB9IH0sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc3QgYXBwcm92YWxDaGFydCA9IG5ldyBjaGFydENvbnN0cnVjdG9yKGFwcHJvdmFsQ29udGV4dCwge1xuICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgZGF0YToge1xuICAgICAgICBsYWJlbHM6IHBheWxvYWQuYXBwcm92YWxSYXRlLm1hcCgoaXRlbSkgPT4gaXRlbS5sYWJlbCksXG4gICAgICAgIGRhdGFzZXRzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6ICdTdWJtaXR0ZWQnLFxuICAgICAgICAgICAgZGF0YTogcGF5bG9hZC5hcHByb3ZhbFJhdGUubWFwKChpdGVtKSA9PiBpdGVtLnN1Ym1pdHRlZCksXG4gICAgICAgICAgICBib3JkZXJDb2xvcjogJyMzYjgyZjYnLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzNiODJmNicsXG4gICAgICAgICAgICB0ZW5zaW9uOiAwLjM1LFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6ICdBcHByb3ZlZCcsXG4gICAgICAgICAgICBkYXRhOiBwYXlsb2FkLmFwcHJvdmFsUmF0ZS5tYXAoKGl0ZW0pID0+IGl0ZW0uYXBwcm92ZWQpLFxuICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjMTBiOTgxJyxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyMxMGI5ODEnLFxuICAgICAgICAgICAgdGVuc2lvbjogMC4zNSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgbWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXG4gICAgICAgIHBsdWdpbnM6IHtcbiAgICAgICAgICBsZWdlbmQ6IHsgcG9zaXRpb246ICdib3R0b20nIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc3QgaG91cnNDaGFydCA9IG5ldyBjaGFydENvbnN0cnVjdG9yKGhvdXJzQ29udGV4dCwge1xuICAgICAgdHlwZTogJ2JhcicsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGxhYmVsczogcGF5bG9hZC5idXNpZXN0SG91cnMubWFwKChpdGVtKSA9PiBpdGVtLmxhYmVsKSxcbiAgICAgICAgZGF0YXNldHM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBkYXRhOiBwYXlsb2FkLmJ1c2llc3RIb3Vycy5tYXAoKGl0ZW0pID0+IGl0ZW0uY291bnQpLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2Y1OWUwYicsXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6IDQsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgICBvcHRpb25zOiB7XG4gICAgICAgIG1haW50YWluQXNwZWN0UmF0aW86IGZhbHNlLFxuICAgICAgICBwbHVnaW5zOiB7IGxlZ2VuZDogeyBkaXNwbGF5OiBmYWxzZSB9IH0sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHN0YXRlc0NoYXJ0LmRlc3Ryb3koKTtcbiAgICAgIGFwcHJvdmFsQ2hhcnQuZGVzdHJveSgpO1xuICAgICAgaG91cnNDaGFydC5kZXN0cm95KCk7XG4gICAgfTtcbiAgfSwgW2NoYXJ0Q29uc3RydWN0b3IsIHBheWxvYWRdKTtcblxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8c2VjdGlvbiBzdHlsZT17eyAuLi5jYXJkU3R5bGUsIHBhZGRpbmc6IDIwIH19PlxuICAgICAgICA8ZGl2IHN0eWxlPXtzZWN0aW9uSGVhZGVyU3R5bGV9PlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aDIgc3R5bGU9e3NlY3Rpb25UaXRsZVN0eWxlfT5Ub3Agc3RhdGVzIGJ5IHNlbGxlciBjb3VudDwvaDI+XG4gICAgICAgICAgICA8cCBzdHlsZT17c2VjdGlvblN1YnRpdGxlU3R5bGV9PlNlbGxlciBjb25jZW50cmF0aW9uIGJ5IHN0YXRlIGZyb20gYXZhaWxhYmxlIGxvY2F0aW9uIG1ldGFkYXRhLjwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgc3R5bGU9e3sgaGVpZ2h0OiAyODAgfX0+XG4gICAgICAgICAgPGNhbnZhcyByZWY9e3N0YXRlc0NhbnZhc1JlZn0gLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxzZWN0aW9uIHN0eWxlPXt7IC4uLmNhcmRTdHlsZSwgcGFkZGluZzogMjAgfX0+XG4gICAgICAgIDxkaXYgc3R5bGU9e3NlY3Rpb25IZWFkZXJTdHlsZX0+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxoMiBzdHlsZT17c2VjdGlvblRpdGxlU3R5bGV9PkFwcHJvdmFsIHJhdGUgb3ZlciB0aW1lPC9oMj5cbiAgICAgICAgICAgIDxwIHN0eWxlPXtzZWN0aW9uU3VidGl0bGVTdHlsZX0+U3VibWl0dGVkIHZzIGFwcHJvdmVkIHNlbGxlcnMgYWNyb3NzIHRoZSBsYXN0IDEyIG1vbnRocy48L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IHN0eWxlPXt7IGhlaWdodDogMzIwIH19PlxuICAgICAgICAgIDxjYW52YXMgcmVmPXthcHByb3ZhbENhbnZhc1JlZn0gLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2dyaWQnLCBnYXA6IDIwLCBncmlkVGVtcGxhdGVDb2x1bW5zOiAnMzIwcHggMWZyJyB9fT5cbiAgICAgICAgPHNlY3Rpb24gc3R5bGU9e3sgLi4uY2FyZFN0eWxlLCBwYWRkaW5nOiAyMCB9fT5cbiAgICAgICAgICA8ZGl2IHN0eWxlPXtzZWN0aW9uSGVhZGVyU3R5bGV9PlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgPGgyIHN0eWxlPXtzZWN0aW9uVGl0bGVTdHlsZX0+QXZlcmFnZSB0aW1lIHRvIGFjdGlvbjwvaDI+XG4gICAgICAgICAgICAgIDxwIHN0eWxlPXtzZWN0aW9uU3VidGl0bGVTdHlsZX0+VGltZSBmcm9tIHN1Ym1pc3Npb24gdG8gZmlyc3QgYXBwcm92YWwgb3IgcmVqZWN0aW9uLjwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDM0LCBmb250V2VpZ2h0OiA3MDAsIGNvbG9yOiAnIzFmMjkzNycgfX0+XG4gICAgICAgICAgICB7cGF5bG9hZC5hdmVyYWdlQWN0aW9uSG91cnMgPT09IG51bGwgPyAn4oCUJyA6IGAke3BheWxvYWQuYXZlcmFnZUFjdGlvbkhvdXJzLnRvRml4ZWQoMSl9aGB9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBzdHlsZT17eyAuLi5jYXJkU3R5bGUsIHBhZGRpbmc6IDIwIH19PlxuICAgICAgICAgIDxkaXYgc3R5bGU9e3NlY3Rpb25IZWFkZXJTdHlsZX0+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8aDIgc3R5bGU9e3NlY3Rpb25UaXRsZVN0eWxlfT5SZWplY3Rpb24gcmVhc29uczwvaDI+XG4gICAgICAgICAgICAgIDxwIHN0eWxlPXtzZWN0aW9uU3VidGl0bGVTdHlsZX0+TW9zdCBjb21tb24gd29yZHMgZXh0cmFjdGVkIGZyb20gcmVqZWN0aW9uIG5vdGVzLjwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBmbGV4V3JhcDogJ3dyYXAnLCBnYXA6IDEwIH19PlxuICAgICAgICAgICAge3BheWxvYWQucmVqZWN0aW9uV29yZHMubWFwKChpdGVtKSA9PiAoXG4gICAgICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICAgICAga2V5PXtpdGVtLndvcmR9XG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtZmxleCcsXG4gICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgIGdhcDogOCxcbiAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc4cHggMTJweCcsXG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2VlZjJmZicsXG4gICAgICAgICAgICAgICAgICBjb2xvcjogJyM0MzM4Y2EnLFxuICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiA5OTksXG4gICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiA2MDAsXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtpdGVtLndvcmR9XG4gICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgb3BhY2l0eTogMC43NSB9fT57aXRlbS5jb3VudH08L3NwYW4+XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgICAge3BheWxvYWQucmVqZWN0aW9uV29yZHMubGVuZ3RoID09PSAwID8gKFxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRTaXplOiAxMyB9fT5ObyByZWplY3Rpb24gbm90ZXMgYXZhaWxhYmxlIHlldC48L2Rpdj5cbiAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPHNlY3Rpb24gc3R5bGU9e3sgLi4uY2FyZFN0eWxlLCBwYWRkaW5nOiAyMCB9fT5cbiAgICAgICAgPGRpdiBzdHlsZT17c2VjdGlvbkhlYWRlclN0eWxlfT5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgyIHN0eWxlPXtzZWN0aW9uVGl0bGVTdHlsZX0+QnVzaWVzdCBzdWJtaXNzaW9uIGhvdXJzPC9oMj5cbiAgICAgICAgICAgIDxwIHN0eWxlPXtzZWN0aW9uU3VidGl0bGVTdHlsZX0+V2hhdCB0aW1lIG9mIGRheSBzZWxsZXJzIHN1Ym1pdCBtb3N0IG9mdGVuLjwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgc3R5bGU9e3sgaGVpZ2h0OiAyODAgfX0+XG4gICAgICAgICAgPGNhbnZhcyByZWY9e2hvdXJzQ2FudmFzUmVmfSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvc2VjdGlvbj5cbiAgICA8Lz5cbiAgKTtcbn07XG5cbmNvbnN0IFNlbGxlckFuYWx5dGljcyA9ICgpID0+IHtcbiAgY29uc3QgeyBkYXRhLCBsb2FkaW5nLCBlcnJvciB9ID0gdXNlUGFnZURhdGE8QW5hbHl0aWNzUGF5bG9hZD4oJ3NlbGxlci1hbmFseXRpY3MnKTtcblxuICBjb25zdCBzdGF0UGlsbHMgPSB1c2VNZW1vKFxuICAgICgpID0+XG4gICAgICBkYXRhXG4gICAgICAgID8gW1xuICAgICAgICAgICAgeyBsYWJlbDogJ1RvdGFsJywgdmFsdWU6IGRhdGEuc3RhdHMudG90YWwsIGNvbG9yOiAnIzNiODJmNicsIGJnOiAnI2RiZWFmZScgfSxcbiAgICAgICAgICAgIHsgbGFiZWw6ICdQZW5kaW5nJywgdmFsdWU6IGRhdGEuc3RhdHMucGVuZGluZywgY29sb3I6ICcjZjU5ZTBiJywgYmc6ICcjZmVmM2M3JyB9LFxuICAgICAgICAgICAgeyBsYWJlbDogJ0FwcHJvdmVkJywgdmFsdWU6IGRhdGEuc3RhdHMuYXBwcm92ZWQsIGNvbG9yOiAnIzEwYjk4MScsIGJnOiAnI2QxZmFlNScgfSxcbiAgICAgICAgICAgIHsgbGFiZWw6ICdSZWplY3RlZCcsIHZhbHVlOiBkYXRhLnN0YXRzLnJlamVjdGVkLCBjb2xvcjogJyNlZjQ0NDQnLCBiZzogJyNmZWUyZTInIH0sXG4gICAgICAgICAgXVxuICAgICAgICA6IFtdLFxuICAgIFtkYXRhXSxcbiAgKTtcblxuICBpZiAobG9hZGluZykge1xuICAgIHJldHVybiA8TG9hZGluZ1N0YXRlIGxhYmVsPVwiTG9hZGluZyBhbmFseXRpY3MuLi5cIiAvPjtcbiAgfVxuXG4gIGlmIChlcnJvciB8fCAhZGF0YSkge1xuICAgIHJldHVybiA8RXJyb3JTdGF0ZSBtZXNzYWdlPXtlcnJvciA/PyAnQW5hbHl0aWNzIGRhdGEgaXMgdW5hdmFpbGFibGUnfSAvPjtcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBzdHlsZT17cGFnZVN0eWxlfT5cbiAgICAgIDxzZWN0aW9uIHN0eWxlPXt7IC4uLmNhcmRTdHlsZSwgcGFkZGluZzogMjQgfX0+XG4gICAgICAgIDxkaXYgc3R5bGU9e3NlY3Rpb25IZWFkZXJTdHlsZX0+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxoMSBzdHlsZT17eyBtYXJnaW46IDAsIGZvbnRTaXplOiAyOCwgZm9udFdlaWdodDogNzAwLCBjb2xvcjogJyMxZjI5MzcnIH19PlNlbGxlciBBbmFseXRpY3M8L2gxPlxuICAgICAgICAgICAgPHAgc3R5bGU9e3sgbWFyZ2luOiAnNnB4IDAgMCcsIGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRTaXplOiAxNCB9fT5cbiAgICAgICAgICAgICAgT3BlcmF0aW9uYWwgdHJlbmRzIGFjcm9zcyBzZWxsZXIgaW50YWtlIHZvbHVtZSwgYXBwcm92YWxzLCBhbmQgcmV2aWV3IGJlaGF2aW9yLlxuICAgICAgICAgICAgPC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGZsZXhXcmFwOiAnd3JhcCcsIGdhcDogMTAgfX0+XG4gICAgICAgICAge3N0YXRQaWxscy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICAgIGtleT17aXRlbS5sYWJlbH1cbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWZsZXgnLFxuICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgIGdhcDogOCxcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnOHB4IDEycHgnLFxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogOTk5LFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IGl0ZW0uYmcsXG4gICAgICAgICAgICAgICAgY29sb3I6IGl0ZW0uY29sb3IsXG4gICAgICAgICAgICAgICAgZm9udFdlaWdodDogNzAwLFxuICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMyxcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge2l0ZW0ubGFiZWx9OiB7aXRlbS52YWx1ZX1cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L3NlY3Rpb24+XG4gICAgICA8QW5hbHl0aWNzQ2hhcnRzIHBheWxvYWQ9e2RhdGF9IC8+XG4gICAgPC9kaXY+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBTZWxsZXJBbmFseXRpY3M7XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlTWVtbywgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCB0eXBlIHsgQXVkaXRUaW1lbGluZVBheWxvYWQgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQge1xuICBFcnJvclN0YXRlLFxuICBMb2FkaW5nU3RhdGUsXG4gIGFjdGlvbkNvbG9ycyxcbiAgY2FyZFN0eWxlLFxuICBmb3JtYXREYXRlVGltZSxcbiAgcGFnZVN0eWxlLFxuICBzZWN0aW9uSGVhZGVyU3R5bGUsXG4gIHNlY3Rpb25TdWJ0aXRsZVN0eWxlLFxuICBzZWN0aW9uVGl0bGVTdHlsZSxcbiAgdXNlUGFnZURhdGEsXG59IGZyb20gJy4vc2hhcmVkJztcblxuY29uc3QgaXNJblJhbmdlID0gKHZhbHVlOiBzdHJpbmcsIGZyb21EYXRlOiBzdHJpbmcsIHRvRGF0ZTogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKHZhbHVlKS5nZXRUaW1lKCk7XG5cbiAgaWYgKGZyb21EYXRlKSB7XG4gICAgY29uc3QgZnJvbVRpbWVzdGFtcCA9IG5ldyBEYXRlKGAke2Zyb21EYXRlfVQwMDowMDowMGApLmdldFRpbWUoKTtcbiAgICBpZiAodGltZXN0YW1wIDwgZnJvbVRpbWVzdGFtcCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0b0RhdGUpIHtcbiAgICBjb25zdCB0b1RpbWVzdGFtcCA9IG5ldyBEYXRlKGAke3RvRGF0ZX1UMjM6NTk6NTlgKS5nZXRUaW1lKCk7XG4gICAgaWYgKHRpbWVzdGFtcCA+IHRvVGltZXN0YW1wKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5jb25zdCBBdWRpdFRpbWVsaW5lID0gKCkgPT4ge1xuICBjb25zdCB7IGRhdGEsIGxvYWRpbmcsIGVycm9yIH0gPSB1c2VQYWdlRGF0YTxBdWRpdFRpbWVsaW5lUGF5bG9hZD4oJ2F1ZGl0LXRpbWVsaW5lJyk7XG4gIGNvbnN0IFthY3Rpb25GaWx0ZXIsIHNldEFjdGlvbkZpbHRlcl0gPSB1c2VTdGF0ZSgnYWxsJyk7XG4gIGNvbnN0IFthZG1pbkZpbHRlciwgc2V0QWRtaW5GaWx0ZXJdID0gdXNlU3RhdGUoJ2FsbCcpO1xuICBjb25zdCBbZnJvbURhdGUsIHNldEZyb21EYXRlXSA9IHVzZVN0YXRlKCcnKTtcbiAgY29uc3QgW3RvRGF0ZSwgc2V0VG9EYXRlXSA9IHVzZVN0YXRlKCcnKTtcbiAgY29uc3QgW3BhZ2UsIHNldFBhZ2VdID0gdXNlU3RhdGUoMSk7XG4gIGNvbnN0IHBhZ2VTaXplID0gMjU7XG5cbiAgY29uc3QgZmlsdGVyZWRMb2dzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgaWYgKCFkYXRhKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGEubG9ncy5maWx0ZXIoKGxvZykgPT4ge1xuICAgICAgY29uc3QgbWF0Y2hlc0FjdGlvbiA9IGFjdGlvbkZpbHRlciA9PT0gJ2FsbCcgfHwgbG9nLmFjdGlvbiA9PT0gYWN0aW9uRmlsdGVyO1xuICAgICAgY29uc3QgbWF0Y2hlc0FkbWluID0gYWRtaW5GaWx0ZXIgPT09ICdhbGwnIHx8IGxvZy5hY3RvciA9PT0gYWRtaW5GaWx0ZXI7XG4gICAgICBjb25zdCBtYXRjaGVzRGF0ZSA9IGlzSW5SYW5nZShsb2cuY3JlYXRlZEF0LCBmcm9tRGF0ZSwgdG9EYXRlKTtcblxuICAgICAgcmV0dXJuIG1hdGNoZXNBY3Rpb24gJiYgbWF0Y2hlc0FkbWluICYmIG1hdGNoZXNEYXRlO1xuICAgIH0pO1xuICB9LCBbYWN0aW9uRmlsdGVyLCBhZG1pbkZpbHRlciwgZGF0YSwgZnJvbURhdGUsIHRvRGF0ZV0pO1xuXG4gIGNvbnN0IHBhZ2VkTG9ncyA9IGZpbHRlcmVkTG9ncy5zbGljZSgocGFnZSAtIDEpICogcGFnZVNpemUsIHBhZ2UgKiBwYWdlU2l6ZSk7XG4gIGNvbnN0IHRvdGFsUGFnZXMgPSBNYXRoLm1heCgxLCBNYXRoLmNlaWwoZmlsdGVyZWRMb2dzLmxlbmd0aCAvIHBhZ2VTaXplKSk7XG5cbiAgaWYgKGxvYWRpbmcpIHtcbiAgICByZXR1cm4gPExvYWRpbmdTdGF0ZSBsYWJlbD1cIkxvYWRpbmcgYXVkaXQgdGltZWxpbmUuLi5cIiAvPjtcbiAgfVxuXG4gIGlmIChlcnJvciB8fCAhZGF0YSkge1xuICAgIHJldHVybiA8RXJyb3JTdGF0ZSBtZXNzYWdlPXtlcnJvciA/PyAnQXVkaXQgdGltZWxpbmUgZGF0YSBpcyB1bmF2YWlsYWJsZSd9IC8+O1xuICB9XG5cbiAgbGV0IGxhc3REYXRlTGFiZWwgPSAnJztcblxuICByZXR1cm4gKFxuICAgIDxkaXYgc3R5bGU9e3BhZ2VTdHlsZX0+XG4gICAgICA8c2VjdGlvbiBzdHlsZT17eyAuLi5jYXJkU3R5bGUsIHBhZGRpbmc6IDI0IH19PlxuICAgICAgICA8ZGl2IHN0eWxlPXtzZWN0aW9uSGVhZGVyU3R5bGV9PlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aDEgc3R5bGU9e3sgbWFyZ2luOiAwLCBmb250U2l6ZTogMjgsIGZvbnRXZWlnaHQ6IDcwMCwgY29sb3I6ICcjMWYyOTM3JyB9fT5BdWRpdCBUaW1lbGluZTwvaDE+XG4gICAgICAgICAgICA8cCBzdHlsZT17eyBtYXJnaW46ICc2cHggMCAwJywgY29sb3I6ICcjNmI3MjgwJywgZm9udFNpemU6IDE0IH19PlxuICAgICAgICAgICAgICBWaXN1YWwgdGltZWxpbmUgb2YgYXVkaXQgZXZlbnRzIGFjcm9zcyBzZWxsZXJzIGFuZCBhZG1pbiBzZXNzaW9ucy5cbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZ3JpZCcsIGdhcDogMTIsIGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICdyZXBlYXQoNCwgbWlubWF4KDAsIDFmcikpJyB9fT5cbiAgICAgICAgICA8c2VsZWN0XG4gICAgICAgICAgICB2YWx1ZT17YWN0aW9uRmlsdGVyfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICBzZXRBY3Rpb25GaWx0ZXIoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgICAgICAgc2V0UGFnZSgxKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBzdHlsZT17eyBib3JkZXJSYWRpdXM6IDgsIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJywgcGFkZGluZzogJzEwcHggMTJweCcgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiYWxsXCI+QWxsIGFjdGlvbnM8L29wdGlvbj5cbiAgICAgICAgICAgIHtkYXRhLmFjdGlvbk9wdGlvbnMubWFwKChhY3Rpb24pID0+IChcbiAgICAgICAgICAgICAgPG9wdGlvbiBrZXk9e2FjdGlvbn0gdmFsdWU9e2FjdGlvbn0+XG4gICAgICAgICAgICAgICAge2FjdGlvbn1cbiAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L3NlbGVjdD5cblxuICAgICAgICAgIDxzZWxlY3RcbiAgICAgICAgICAgIHZhbHVlPXthZG1pbkZpbHRlcn1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgc2V0QWRtaW5GaWx0ZXIoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgICAgICAgc2V0UGFnZSgxKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBzdHlsZT17eyBib3JkZXJSYWRpdXM6IDgsIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJywgcGFkZGluZzogJzEwcHggMTJweCcgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiYWxsXCI+QWxsIGFkbWluczwvb3B0aW9uPlxuICAgICAgICAgICAge2RhdGEuYWRtaW5PcHRpb25zLm1hcCgoYWRtaW4pID0+IChcbiAgICAgICAgICAgICAgPG9wdGlvbiBrZXk9e2FkbWlufSB2YWx1ZT17YWRtaW59PlxuICAgICAgICAgICAgICAgIHthZG1pbn1cbiAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L3NlbGVjdD5cblxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgdHlwZT1cImRhdGVcIlxuICAgICAgICAgICAgdmFsdWU9e2Zyb21EYXRlfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICBzZXRGcm9tRGF0ZShldmVudC50YXJnZXQudmFsdWUpO1xuICAgICAgICAgICAgICBzZXRQYWdlKDEpO1xuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIHN0eWxlPXt7IGJvcmRlclJhZGl1czogOCwgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInLCBwYWRkaW5nOiAnMTBweCAxMnB4JyB9fVxuICAgICAgICAgIC8+XG5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIHR5cGU9XCJkYXRlXCJcbiAgICAgICAgICAgIHZhbHVlPXt0b0RhdGV9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIHNldFRvRGF0ZShldmVudC50YXJnZXQudmFsdWUpO1xuICAgICAgICAgICAgICBzZXRQYWdlKDEpO1xuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIHN0eWxlPXt7IGJvcmRlclJhZGl1czogOCwgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInLCBwYWRkaW5nOiAnMTBweCAxMnB4JyB9fVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8c2VjdGlvbiBzdHlsZT17eyAuLi5jYXJkU3R5bGUsIHBhZGRpbmc6IDI0IH19PlxuICAgICAgICB7cGFnZWRMb2dzLm1hcCgobG9nKSA9PiB7XG4gICAgICAgICAgY29uc3QgZGF0ZUxhYmVsID0gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQoJ2VuLUlOJywge1xuICAgICAgICAgICAgZGF5OiAnMi1kaWdpdCcsXG4gICAgICAgICAgICBtb250aDogJ3Nob3J0JyxcbiAgICAgICAgICAgIHllYXI6ICdudW1lcmljJyxcbiAgICAgICAgICB9KS5mb3JtYXQobmV3IERhdGUobG9nLmNyZWF0ZWRBdCkpO1xuXG4gICAgICAgICAgY29uc3Qgc2hvd0RhdGUgPSBkYXRlTGFiZWwgIT09IGxhc3REYXRlTGFiZWw7XG4gICAgICAgICAgbGFzdERhdGVMYWJlbCA9IGRhdGVMYWJlbDtcblxuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8UmVhY3QuRnJhZ21lbnQga2V5PXtsb2cuaWR9PlxuICAgICAgICAgICAgICB7c2hvd0RhdGUgPyAoXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW46ICcxMnB4IDAgOHB4JywgY29sb3I6ICcjNmI3MjgwJywgZm9udFdlaWdodDogNzAwLCBmb250U2l6ZTogMTIgfX0+XG4gICAgICAgICAgICAgICAgICB7ZGF0ZUxhYmVsfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZ3JpZCcsXG4gICAgICAgICAgICAgICAgICBncmlkVGVtcGxhdGVDb2x1bW5zOiAnMThweCBtaW5tYXgoMCwgMWZyKSBhdXRvJyxcbiAgICAgICAgICAgICAgICAgIGdhcDogMTIsXG4gICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnc3RhcnQnLFxuICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEwcHggMCcsXG4gICAgICAgICAgICAgICAgICBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2U1ZTdlYicsXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgIG1hcmdpblRvcDogNyxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDEwLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IDEwLFxuICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc1MCUnLFxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBhY3Rpb25Db2xvcnNbbG9nLmFjdGlvbl0gPz8gJyM4YjVjZjYnLFxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWluV2lkdGg6IDAgfX0+XG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGNvbG9yOiAnIzFmMjkzNycsIGZvbnRXZWlnaHQ6IDYwMCwgZm9udFNpemU6IDE0IH19PlxuICAgICAgICAgICAgICAgICAgICB7bG9nLmFjdGlvbn1cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgY29sb3I6ICcjNmI3MjgwJywgZm9udFdlaWdodDogNDAwLCBtYXJnaW5MZWZ0OiAxMCB9fT57bG9nLnNlbGxlck5hbWV9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogNCwgY29sb3I6ICcjNmI3MjgwJywgZm9udFNpemU6IDEyIH19PlxuICAgICAgICAgICAgICAgICAgICB7bG9nLmFjdG9yfSDCtyB7bG9nLnRhcmdldENvbGxlY3Rpb259IMK3IHtsb2cudGFyZ2V0SWR9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIHtsb2cubm90ZSA/IDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiA2LCBjb2xvcjogJyMzNzQxNTEnLCBmb250U2l6ZTogMTMgfX0+e2xvZy5ub3RlfTwvZGl2PiA6IG51bGx9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBjb2xvcjogJyM5Y2EzYWYnLCBmb250U2l6ZTogMTIgfX0+e2Zvcm1hdERhdGVUaW1lKGxvZy5jcmVhdGVkQXQpfTwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgKTtcbiAgICAgICAgfSl9XG5cbiAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBtYXJnaW5Ub3A6IDE2IH19PlxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgY29sb3I6ICcjNmI3MjgwJywgZm9udFNpemU6IDEzIH19PlxuICAgICAgICAgICAgU2hvd2luZyB7KHBhZ2UgLSAxKSAqIHBhZ2VTaXplICsgMX0te01hdGgubWluKHBhZ2UgKiBwYWdlU2l6ZSwgZmlsdGVyZWRMb2dzLmxlbmd0aCl9IG9mIHtmaWx0ZXJlZExvZ3MubGVuZ3RofVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBnYXA6IDggfX0+XG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRQYWdlKChjdXJyZW50KSA9PiBNYXRoLm1heCgxLCBjdXJyZW50IC0gMSkpfVxuICAgICAgICAgICAgICBkaXNhYmxlZD17cGFnZSA9PT0gMX1cbiAgICAgICAgICAgICAgc3R5bGU9e3sgYm9yZGVyUmFkaXVzOiA4LCBib3JkZXI6ICcxcHggc29saWQgI2QxZDVkYicsIHBhZGRpbmc6ICc4cHggMTJweCcsIGN1cnNvcjogJ3BvaW50ZXInIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIFByZXZpb3VzXG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFBhZ2UoKGN1cnJlbnQpID0+IE1hdGgubWluKHRvdGFsUGFnZXMsIGN1cnJlbnQgKyAxKSl9XG4gICAgICAgICAgICAgIGRpc2FibGVkPXtwYWdlID09PSB0b3RhbFBhZ2VzfVxuICAgICAgICAgICAgICBzdHlsZT17eyBib3JkZXJSYWRpdXM6IDgsIGJvcmRlcjogJzFweCBzb2xpZCAjZDFkNWRiJywgcGFkZGluZzogJzhweCAxMnB4JywgY3Vyc29yOiAncG9pbnRlcicgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgTmV4dFxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuICAgIDwvZGl2PlxuICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgQXVkaXRUaW1lbGluZTtcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VNZW1vIH0gZnJvbSAncmVhY3QnO1xuXG50eXBlIFRvcEJhclByb3BzID0ge1xuICB0b2dnbGVTaWRlYmFyPzogKCkgPT4gdm9pZDtcbn07XG5cbnR5cGUgUmVkdXhTZXNzaW9uID0ge1xuICBlbWFpbD86IHN0cmluZztcbn07XG5cbnR5cGUgUmVkdXhTdGF0ZSA9IHtcbiAgc2Vzc2lvbj86IFJlZHV4U2Vzc2lvbiB8IG51bGw7XG59O1xuXG50eXBlIEFkbWluV2luZG93ID0gV2luZG93ICYge1xuICBSRURVWF9TVEFURT86IFJlZHV4U3RhdGU7XG59O1xuXG5jb25zdCBnZXRQYWdlVGl0bGUgPSAocGF0aG5hbWU6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gIGlmIChwYXRobmFtZSA9PT0gJy9hZG1pbicgfHwgcGF0aG5hbWUgPT09ICcvYWRtaW4vJykge1xuICAgIHJldHVybiAnRGFzaGJvYXJkJztcbiAgfVxuXG4gIGlmIChwYXRobmFtZS5pbmNsdWRlcygnL3BhZ2VzL2hvbWUnKSkge1xuICAgIHJldHVybiAnSG9tZSc7XG4gIH1cblxuICBpZiAocGF0aG5hbWUuaW5jbHVkZXMoJy9wYWdlcy9zZWxsZXItbWFwJykpIHtcbiAgICByZXR1cm4gJ1NlbGxlciBNYXAnO1xuICB9XG5cbiAgaWYgKHBhdGhuYW1lLmluY2x1ZGVzKCcvcGFnZXMvc2VsbGVyLWFuYWx5dGljcycpKSB7XG4gICAgcmV0dXJuICdBbmFseXRpY3MnO1xuICB9XG5cbiAgaWYgKHBhdGhuYW1lLmluY2x1ZGVzKCcvcGFnZXMvYXVkaXQtdGltZWxpbmUnKSkge1xuICAgIHJldHVybiAnQXVkaXQgVGltZWxpbmUnO1xuICB9XG5cbiAgaWYgKHBhdGhuYW1lLmluY2x1ZGVzKCcvcmVzb3VyY2VzL1NlbGxlcicpKSB7XG4gICAgcmV0dXJuICdTZWxsZXJzJztcbiAgfVxuXG4gIGlmIChwYXRobmFtZS5pbmNsdWRlcygnL3Jlc291cmNlcy9BdWRpdExvZycpKSB7XG4gICAgcmV0dXJuICdBdWRpdCBMb2dzJztcbiAgfVxuXG4gIGlmIChwYXRobmFtZS5pbmNsdWRlcygnL3Jlc291cmNlcy9BZG1pblVzZXInKSkge1xuICAgIHJldHVybiAnQWRtaW4gVXNlcnMnO1xuICB9XG5cbiAgcmV0dXJuICdBZG1pbic7XG59O1xuXG5jb25zdCBnZXRQYWdlU3VidGl0bGUgPSAocGF0aG5hbWU6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gIGlmIChwYXRobmFtZSA9PT0gJy9hZG1pbicgfHwgcGF0aG5hbWUgPT09ICcvYWRtaW4vJykge1xuICAgIHJldHVybiAnWmF0Y2ggQWRtaW4gb3ZlcnZpZXcnO1xuICB9XG5cbiAgaWYgKHBhdGhuYW1lLmluY2x1ZGVzKCcvc2hvdycpKSB7XG4gICAgcmV0dXJuICdSZWNvcmQgZGV0YWlsJztcbiAgfVxuXG4gIGlmIChwYXRobmFtZS5pbmNsdWRlcygnL2VkaXQnKSkge1xuICAgIHJldHVybiAnRWRpdCB2aWV3JztcbiAgfVxuXG4gIGlmIChwYXRobmFtZS5pbmNsdWRlcygnL25ldycpKSB7XG4gICAgcmV0dXJuICdDcmVhdGUgbmV3IHJlY29yZCc7XG4gIH1cblxuICByZXR1cm4gcGF0aG5hbWUucmVwbGFjZSgnL2FkbWluJywgJycpIHx8ICdBZG1pbic7XG59O1xuXG5jb25zdCBUb3BCYXIgPSAoeyB0b2dnbGVTaWRlYmFyIH06IFRvcEJhclByb3BzKSA9PiB7XG4gIGNvbnN0IHBhdGhuYW1lID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgOiAnL2FkbWluJztcbiAgY29uc3Qgc2Vzc2lvbiA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gKHdpbmRvdyBhcyBBZG1pbldpbmRvdykuUkVEVVhfU1RBVEU/LnNlc3Npb24gOiBudWxsO1xuXG4gIGNvbnN0IHRpdGxlID0gdXNlTWVtbygoKSA9PiBnZXRQYWdlVGl0bGUocGF0aG5hbWUpLCBbcGF0aG5hbWVdKTtcbiAgY29uc3Qgc3VidGl0bGUgPSB1c2VNZW1vKCgpID0+IGdldFBhZ2VTdWJ0aXRsZShwYXRobmFtZSksIFtwYXRobmFtZV0pO1xuXG4gIHJldHVybiAoXG4gICAgPGhlYWRlclxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgaGVpZ2h0OiA1NixcbiAgICAgICAgYmFja2dyb3VuZDogJyNmZmZmZmYnLFxuICAgICAgICBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2U1ZTdlYicsXG4gICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicsXG4gICAgICAgIHBhZGRpbmc6ICcwIDIwcHgnLFxuICAgICAgICBwb3NpdGlvbjogJ3N0aWNreScsXG4gICAgICAgIHRvcDogMCxcbiAgICAgICAgekluZGV4OiAzMCxcbiAgICAgIH19XG4gICAgPlxuICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6IDEyLCBtaW5XaWR0aDogMCB9fT5cbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRvZ2dsZVNpZGViYXI/LigpfVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICB3aWR0aDogMzYsXG4gICAgICAgICAgICBoZWlnaHQ6IDM2LFxuICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiA4LFxuICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInLFxuICAgICAgICAgICAgYmFja2dyb3VuZDogJyNmZmZmZmYnLFxuICAgICAgICAgICAgY29sb3I6ICcjNmI3MjgwJyxcbiAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgICAgIH19XG4gICAgICAgICAgYXJpYS1sYWJlbD1cIlRvZ2dsZSBuYXZpZ2F0aW9uXCJcbiAgICAgICAgPlxuICAgICAgICAgIOKYsFxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPGRpdiBzdHlsZT17eyBtaW5XaWR0aDogMCB9fT5cbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAxNSwgZm9udFdlaWdodDogNzAwLCBjb2xvcjogJyMxZjI5MzcnIH19Pnt0aXRsZX08L2Rpdj5cbiAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgICAgICAgIGNvbG9yOiAnIzljYTNhZicsXG4gICAgICAgICAgICAgIG1hcmdpblRvcDogMixcbiAgICAgICAgICAgICAgd2hpdGVTcGFjZTogJ25vd3JhcCcsXG4gICAgICAgICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgICAgICAgICAgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7c3VidGl0bGV9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAxMiB9fT5cbiAgICAgICAgPGRpdiBzdHlsZT17eyB0ZXh0QWxpZ246ICdyaWdodCcgfX0+XG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogMTQsIGZvbnRXZWlnaHQ6IDYwMCwgY29sb3I6ICcjMWYyOTM3JyB9fT5cbiAgICAgICAgICAgIHtzZXNzaW9uPy5lbWFpbCA/PyAnQWRtaW4nfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBjb2xvcjogJyM5Y2EzYWYnIH19PnN1cGVyIGFkbWluPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9oZWFkZXI+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBUb3BCYXI7XG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgTGluayB9IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nO1xuXG50eXBlIEJyYW5kaW5nT3B0aW9ucyA9IHtcbiAgbG9nbz86IHN0cmluZztcbiAgY29tcGFueU5hbWU/OiBzdHJpbmc7XG59O1xuXG50eXBlIFNpZGViYXJCcmFuZGluZ1Byb3BzID0ge1xuICBicmFuZGluZzogQnJhbmRpbmdPcHRpb25zO1xufTtcblxuY29uc3QgU2lkZWJhckJyYW5kaW5nID0gKHsgYnJhbmRpbmcgfTogU2lkZWJhckJyYW5kaW5nUHJvcHMpID0+IChcbiAgPExpbmtcbiAgICB0bz1cIi9hZG1pblwiXG4gICAgc3R5bGU9e3tcbiAgICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgZ2FwOiAxMixcbiAgICAgIHBhZGRpbmc6ICcxNnB4IDIwcHgnLFxuICAgICAgdGV4dERlY29yYXRpb246ICdub25lJyxcbiAgICAgIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjM2M0ZjYzJyxcbiAgICAgIGJhY2tncm91bmQ6ICcjMjQzMDQwJyxcbiAgICB9fVxuICA+XG4gICAgPGRpdlxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgd2lkdGg6IDQwLFxuICAgICAgICBoZWlnaHQ6IDQwLFxuICAgICAgICBib3JkZXJSYWRpdXM6IDgsXG4gICAgICAgIGJhY2tncm91bmQ6ICdyZ2JhKDI1NSwyNTUsMjU1LDAuMSknLFxuICAgICAgICBvdmVyZmxvdzogJ2hpZGRlbicsXG4gICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgZmxleFNocmluazogMCxcbiAgICAgIH19XG4gICAgPlxuICAgICAge2JyYW5kaW5nLmxvZ28gPyAoXG4gICAgICAgIDxpbWdcbiAgICAgICAgICBzcmM9e2JyYW5kaW5nLmxvZ299XG4gICAgICAgICAgYWx0PXticmFuZGluZy5jb21wYW55TmFtZSA/PyAnQWRtaW4nfVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICB3aWR0aDogNDAsXG4gICAgICAgICAgICBoZWlnaHQ6IDQwLFxuICAgICAgICAgICAgb2JqZWN0Rml0OiAnY292ZXInLFxuICAgICAgICAgICAgZGlzcGxheTogJ2Jsb2NrJyxcbiAgICAgICAgICB9fVxuICAgICAgICAvPlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gICAgPGRpdlxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgY29sb3I6ICcjZmZmZmZmJyxcbiAgICAgICAgZm9udFNpemU6IDE2LFxuICAgICAgICBmb250V2VpZ2h0OiA2MDAsXG4gICAgICAgIGxldHRlclNwYWNpbmc6ICctMC4wMmVtJyxcbiAgICAgICAgbGluZUhlaWdodDogMS4yLFxuICAgICAgfX1cbiAgICA+XG4gICAgICB7YnJhbmRpbmcuY29tcGFueU5hbWUgPz8gJ0FkbWluJ31cbiAgICA8L2Rpdj5cbiAgPC9MaW5rPlxuKTtcblxuZXhwb3J0IGRlZmF1bHQgU2lkZWJhckJyYW5kaW5nO1xuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZUxvY2F0aW9uLCB1c2VOYXZpZ2F0ZSB9IGZyb20gJ3JlYWN0LXJvdXRlcic7XG5cbnR5cGUgQWRtaW5QYWdlID0ge1xuICBuYW1lOiBzdHJpbmc7XG59O1xuXG50eXBlIFNpZGViYXJQYWdlc1Byb3BzID0ge1xuICBwYWdlcz86IEFkbWluUGFnZVtdO1xufTtcblxuY29uc3QgbGlua0Jhc2VTdHlsZTogUmVhY3QuQ1NTUHJvcGVydGllcyA9IHtcbiAgZGlzcGxheTogJ2ZsZXgnLFxuICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgZ2FwOiAxMCxcbiAgbWluSGVpZ2h0OiA0MCxcbiAgYm9yZGVyUmFkaXVzOiA2LFxuICBtYXJnaW46ICcycHggOHB4JyxcbiAgcGFkZGluZzogJzAgMTJweCcsXG4gIGNvbG9yOiAnI2MyY2ZkOCcsXG4gIHRleHREZWNvcmF0aW9uOiAnbm9uZScsXG4gIGN1cnNvcjogJ3BvaW50ZXInLFxuICBib3JkZXJMZWZ0OiAnM3B4IHNvbGlkIHRyYW5zcGFyZW50JyxcbiAgZm9udFNpemU6IDE0LFxuICBmb250V2VpZ2h0OiA1MDAsXG59O1xuXG5jb25zdCBnZXRQYWdlTGFiZWwgPSAocGFnZU5hbWU6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gIGlmIChwYWdlTmFtZSA9PT0gJ3NlbGxlci1tYXAnKSB7XG4gICAgcmV0dXJuICdTZWxsZXIgTWFwJztcbiAgfVxuXG4gIGlmIChwYWdlTmFtZSA9PT0gJ3NlbGxlci1hbmFseXRpY3MnKSB7XG4gICAgcmV0dXJuICdTZWxsZXIgQW5hbHl0aWNzJztcbiAgfVxuXG4gIGlmIChwYWdlTmFtZSA9PT0gJ2F1ZGl0LXRpbWVsaW5lJykge1xuICAgIHJldHVybiAnQXVkaXQgVGltZWxpbmUnO1xuICB9XG5cbiAgcmV0dXJuIHBhZ2VOYW1lXG4gICAgLnNwbGl0KCctJylcbiAgICAubWFwKChwYXJ0KSA9PiBwYXJ0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcGFydC5zbGljZSgxKSlcbiAgICAuam9pbignICcpO1xufTtcblxuY29uc3QgSG9tZUdseXBoID0gKCkgPT4gKFxuICA8c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIiBzdHlsZT17eyB3aWR0aDogMTQsIGRpc3BsYXk6ICdpbmxpbmUtZmxleCcsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyB9fT5cbiAgICDijIJcbiAgPC9zcGFuPlxuKTtcblxuY29uc3QgRG90R2x5cGggPSAoKSA9PiAoXG4gIDxzcGFuIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIHN0eWxlPXt7IHdpZHRoOiAxNCwgZGlzcGxheTogJ2lubGluZS1mbGV4JywganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInIH19PlxuICAgIOKAolxuICA8L3NwYW4+XG4pO1xuXG5jb25zdCBOYXZJdGVtID0gKHtcbiAgbGFiZWwsXG4gIGhyZWYsXG4gIGFjdGl2ZSxcbiAgb25OYXZpZ2F0ZSxcbiAgZ2x5cGgsXG59OiB7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIGhyZWY6IHN0cmluZztcbiAgYWN0aXZlOiBib29sZWFuO1xuICBvbk5hdmlnYXRlOiAoaHJlZjogc3RyaW5nKSA9PiB2b2lkO1xuICBnbHlwaDogUmVhY3QuUmVhY3ROb2RlO1xufSkgPT4gKFxuICA8YVxuICAgIGhyZWY9e2hyZWZ9XG4gICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgb25OYXZpZ2F0ZShocmVmKTtcbiAgICB9fVxuICAgIHN0eWxlPXt7XG4gICAgICAuLi5saW5rQmFzZVN0eWxlLFxuICAgICAgYmFja2dyb3VuZDogYWN0aXZlID8gJyMzYzRmNjMnIDogJ3RyYW5zcGFyZW50JyxcbiAgICAgIGNvbG9yOiBhY3RpdmUgPyAnI2ZmZmZmZicgOiAnI2MyY2ZkOCcsXG4gICAgICBib3JkZXJMZWZ0Q29sb3I6IGFjdGl2ZSA/ICcjM2I4MmY2JyA6ICd0cmFuc3BhcmVudCcsXG4gICAgfX1cbiAgPlxuICAgIHtnbHlwaH1cbiAgICA8c3Bhbj57bGFiZWx9PC9zcGFuPlxuICA8L2E+XG4pO1xuXG5jb25zdCBTaWRlYmFyUGFnZXMgPSAoeyBwYWdlcyB9OiBTaWRlYmFyUGFnZXNQcm9wcykgPT4ge1xuICBjb25zdCBsb2NhdGlvbiA9IHVzZUxvY2F0aW9uKCk7XG4gIGNvbnN0IG5hdmlnYXRlID0gdXNlTmF2aWdhdGUoKTtcblxuICBjb25zdCBleHRyYVBhZ2VzID0gKHBhZ2VzID8/IFtdKS5maWx0ZXIoKHBhZ2UpID0+IHBhZ2UubmFtZSAhPT0gJ2hvbWUnKTtcblxuICByZXR1cm4gKFxuICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiAxNiB9fT5cbiAgICAgIDxkaXZcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwYWRkaW5nOiAnMCAyMHB4IDhweCcsXG4gICAgICAgICAgY29sb3I6ICcjOWNhM2FmJyxcbiAgICAgICAgICBmb250U2l6ZTogMTEsXG4gICAgICAgICAgZm9udFdlaWdodDogNjAwLFxuICAgICAgICAgIGxldHRlclNwYWNpbmc6ICcwLjA4ZW0nLFxuICAgICAgICAgIHRleHRUcmFuc2Zvcm06ICd1cHBlcmNhc2UnLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICBQYWdlc1xuICAgICAgPC9kaXY+XG5cbiAgICAgIDxOYXZJdGVtXG4gICAgICAgIGxhYmVsPVwiSG9tZVwiXG4gICAgICAgIGhyZWY9XCIvYWRtaW5cIlxuICAgICAgICBhY3RpdmU9e2xvY2F0aW9uLnBhdGhuYW1lID09PSAnL2FkbWluJyB8fCBsb2NhdGlvbi5wYXRobmFtZSA9PT0gJy9hZG1pbi8nfVxuICAgICAgICBvbk5hdmlnYXRlPXsoaHJlZikgPT4gbmF2aWdhdGUoaHJlZil9XG4gICAgICAgIGdseXBoPXs8SG9tZUdseXBoIC8+fVxuICAgICAgLz5cblxuICAgICAge2V4dHJhUGFnZXMubWFwKChwYWdlKSA9PiAoXG4gICAgICAgIDxOYXZJdGVtXG4gICAgICAgICAga2V5PXtwYWdlLm5hbWV9XG4gICAgICAgICAgbGFiZWw9e2dldFBhZ2VMYWJlbChwYWdlLm5hbWUpfVxuICAgICAgICAgIGhyZWY9e2AvYWRtaW4vcGFnZXMvJHtwYWdlLm5hbWV9YH1cbiAgICAgICAgICBhY3RpdmU9e2xvY2F0aW9uLnBhdGhuYW1lLmluY2x1ZGVzKGAvcGFnZXMvJHtwYWdlLm5hbWV9YCl9XG4gICAgICAgICAgb25OYXZpZ2F0ZT17KGhyZWYpID0+IG5hdmlnYXRlKGhyZWYpfVxuICAgICAgICAgIGdseXBoPXs8RG90R2x5cGggLz59XG4gICAgICAgIC8+XG4gICAgICApKX1cbiAgICA8L2Rpdj5cbiAgKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFNpZGViYXJQYWdlcztcbiIsIkFkbWluSlMuVXNlckNvbXBvbmVudHMgPSB7fVxuaW1wb3J0IERhc2hib2FyZCBmcm9tICcuLi9zcmMvYWRtaW5qcy9jb21wb25lbnRzL0Rhc2hib2FyZCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuRGFzaGJvYXJkID0gRGFzaGJvYXJkXG5pbXBvcnQgU2VsbGVyTWFwIGZyb20gJy4uL3NyYy9hZG1pbmpzL2NvbXBvbmVudHMvU2VsbGVyTWFwJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5TZWxsZXJNYXAgPSBTZWxsZXJNYXBcbmltcG9ydCBTZWxsZXJBbmFseXRpY3MgZnJvbSAnLi4vc3JjL2FkbWluanMvY29tcG9uZW50cy9TZWxsZXJBbmFseXRpY3MnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlNlbGxlckFuYWx5dGljcyA9IFNlbGxlckFuYWx5dGljc1xuaW1wb3J0IEF1ZGl0VGltZWxpbmUgZnJvbSAnLi4vc3JjL2FkbWluanMvY29tcG9uZW50cy9BdWRpdFRpbWVsaW5lJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5BdWRpdFRpbWVsaW5lID0gQXVkaXRUaW1lbGluZVxuaW1wb3J0IFRvcEJhciBmcm9tICcuLi9zcmMvYWRtaW5qcy9jb21wb25lbnRzL1RvcEJhcidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuVG9wQmFyID0gVG9wQmFyXG5pbXBvcnQgU2lkZWJhckJyYW5kaW5nIGZyb20gJy4uL3NyYy9hZG1pbmpzL2NvbXBvbmVudHMvU2lkZWJhckJyYW5kaW5nJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5TaWRlYmFyQnJhbmRpbmcgPSBTaWRlYmFyQnJhbmRpbmdcbmltcG9ydCBTaWRlYmFyUGFnZXMgZnJvbSAnLi4vc3JjL2FkbWluanMvY29tcG9uZW50cy9TaWRlYmFyUGFnZXMnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlNpZGViYXJQYWdlcyA9IFNpZGViYXJQYWdlcyJdLCJuYW1lcyI6WyJhcGkiLCJBcGlDbGllbnQiLCJjYXJkU3R5bGUiLCJiYWNrZ3JvdW5kIiwiYm9yZGVyIiwiYm9yZGVyUmFkaXVzIiwiYm94U2hhZG93Iiwic2VjdGlvbkhlYWRlclN0eWxlIiwiZGlzcGxheSIsImp1c3RpZnlDb250ZW50IiwiYWxpZ25JdGVtcyIsImdhcCIsIm1hcmdpbkJvdHRvbSIsInNlY3Rpb25UaXRsZVN0eWxlIiwibWFyZ2luIiwiZm9udFNpemUiLCJmb250V2VpZ2h0IiwiY29sb3IiLCJzZWN0aW9uU3VidGl0bGVTdHlsZSIsInBhZ2VTdHlsZSIsInBhZGRpbmciLCJtaW5IZWlnaHQiLCJzdGF0dXNDb2xvcnMiLCJwZW5kaW5nIiwiZmlsbCIsInRleHQiLCJhcHByb3ZlZCIsInJlamVjdGVkIiwiYWN0aW9uQ29sb3JzIiwiZm9ybWF0RGF0ZVRpbWUiLCJ2YWx1ZSIsIkludGwiLCJEYXRlVGltZUZvcm1hdCIsImRheSIsIm1vbnRoIiwieWVhciIsImhvdXIiLCJtaW51dGUiLCJob3VyMTIiLCJmb3JtYXQiLCJEYXRlIiwiZm9ybWF0RGF0ZSIsInRpbWVBZ28iLCJkaWZmTXMiLCJnZXRUaW1lIiwibm93IiwiZGlmZk1pbnV0ZXMiLCJNYXRoIiwicm91bmQiLCJmb3JtYXR0ZXIiLCJSZWxhdGl2ZVRpbWVGb3JtYXQiLCJudW1lcmljIiwiYWJzIiwiZGlmZkhvdXJzIiwiZGlmZkRheXMiLCJsb2FkU2NyaXB0T25jZSIsImlkIiwic3JjIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJleGlzdGluZyIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJzY3JpcHQiLCJjcmVhdGVFbGVtZW50IiwiYXN5bmMiLCJvbmxvYWQiLCJvbmVycm9yIiwiRXJyb3IiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJsb2FkU3R5bGVPbmNlIiwiaHJlZiIsImxpbmsiLCJyZWwiLCJoZWFkIiwidXNlUGFnZURhdGEiLCJwYWdlTmFtZSIsImRhdGEiLCJzZXREYXRhIiwidXNlU3RhdGUiLCJsb2FkaW5nIiwic2V0TG9hZGluZyIsImVycm9yIiwic2V0RXJyb3IiLCJ1c2VFZmZlY3QiLCJhY3RpdmUiLCJnZXRQYWdlIiwidGhlbiIsInJlc3BvbnNlIiwiY2F0Y2giLCJjYXVnaHRFcnJvciIsIm1lc3NhZ2UiLCJ1c2VEYXNoYm9hcmREYXRhIiwiZ2V0RGFzaGJvYXJkIiwiTG9hZGluZ1N0YXRlIiwibGFiZWwiLCJSZWFjdCIsInN0eWxlIiwiRXJyb3JTdGF0ZSIsIkJhZGdlIiwidXNlQ2hhcnRKcyIsImNoYXJ0Q29uc3RydWN0b3IiLCJzZXRDaGFydENvbnN0cnVjdG9yIiwiY2hhcnQiLCJ3aW5kb3ciLCJDaGFydCIsInVzZUxlYWZsZXQiLCJsZWFmbGV0Iiwic2V0TGVhZmxldCIsImFsbCIsImxvYWRlZExlYWZsZXQiLCJMIiwiZGVmYXVsdEZpbHRlcnMiLCJzdGF0dXMiLCJzdGF0ZXMiLCJjaXR5IiwicGluY29kZSIsImZyb20iLCJ0byIsImxlZ2VuZEl0ZW1TdHlsZSIsImJ1dHRvblN0eWxlIiwiY3Vyc29yIiwiaW5wdXRTdHlsZSIsIndpZHRoIiwiYm94U2l6aW5nIiwiaXNXaXRoaW5EYXRlUmFuZ2UiLCJyZWNlaXZlZEF0IiwidGltZXN0YW1wIiwiZnJvbVRpbWVzdGFtcCIsInRvVGltZXN0YW1wIiwibWF0Y2hlc0Jhc2VGaWx0ZXJzIiwic2VsbGVyIiwiZmlsdGVycyIsImxlbmd0aCIsImluY2x1ZGVzIiwibG9jYXRpb24iLCJzdGF0ZSIsIm1hdGNoZXNDaXR5IiwidHJpbSIsInRvTG93ZXJDYXNlIiwiZ3JvdXBCeVN0YXRlIiwic2VsbGVycyIsIk9iamVjdCIsImVudHJpZXMiLCJyZWR1Y2UiLCJhY2N1bXVsYXRvciIsImtleSIsInB1c2giLCJsYXQiLCJsbmciLCJtYXAiLCJjb29yZGluYXRlcyIsInRvdGFsIiwic3VtIiwiY29vcmRpbmF0ZSIsImNlbnRlciIsImJ1aWxkUG9wdXAiLCJiYWRnZSIsImJ1c2luZXNzTmFtZSIsInNlbGxlck5hbWUiLCJTZWxsZXJNYXBQYW5lbCIsInBheWxvYWQiLCJzdGFuZGFsb25lIiwibWFwUmVmIiwidXNlUmVmIiwibWFwSW5zdGFuY2VSZWYiLCJtb2RlIiwic2V0TW9kZSIsImRyYWZ0RmlsdGVycyIsInNldERyYWZ0RmlsdGVycyIsImFwcGxpZWRGaWx0ZXJzIiwic2V0QXBwbGllZEZpbHRlcnMiLCJzaG93Tm9Mb2NhdGlvbiIsInNldFNob3dOb0xvY2F0aW9uIiwiYWxsU2VsbGVyUmVjb3JkcyIsInVzZU1lbW8iLCJub0xvY2F0aW9uIiwiYXZhaWxhYmxlU3RhdGVzIiwiU2V0IiwiZmlsdGVyIiwiQm9vbGVhbiIsInNvcnQiLCJsZWZ0IiwicmlnaHQiLCJsb2NhbGVDb21wYXJlIiwiYmFzZU1hdGNoZWRNYXJrZXJzIiwidmlzaWJsZU1hcmtlcnMiLCJ2aXNpYmxlTm9Mb2NhdGlvbiIsInZpc2libGVDb3VudHMiLCJoYW5kbGVGaWx0ZXJMaW5rQ2xpY2siLCJldmVudCIsInRhcmdldCIsIkhUTUxFbGVtZW50IiwiZGF0YXNldCIsImZpbHRlckNpdHkiLCJmaWx0ZXJTdGF0ZSIsInByZXZlbnREZWZhdWx0IiwiY3VycmVudCIsIm5leHQiLCJhZGRFdmVudExpc3RlbmVyIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInJlbW92ZSIsInNldFZpZXciLCJ0aWxlTGF5ZXIiLCJhdHRyaWJ1dGlvbiIsImFkZFRvIiwibWFya2VyTGF5ZXIiLCJtYXJrZXJDbHVzdGVyR3JvdXAiLCJzdGF0ZUxheWVyIiwiY2l0eVF1ZXJ5IiwiZm9yRWFjaCIsIm1hdGNoZXNDdXJyZW50Q2l0eSIsIm1hcmtlciIsImNpcmNsZU1hcmtlciIsInJhZGl1cyIsIndlaWdodCIsImZpbGxDb2xvciIsImZpbGxPcGFjaXR5Iiwib3BhY2l0eSIsImJpbmRQb3B1cCIsInNldFN0eWxlIiwiYWRkTGF5ZXIiLCJzdGF0ZUdyb3VwIiwiY2lyY2xlIiwibWluIiwib24iLCJuZXh0RmlsdGVycyIsImZseVRvIiwiZHVyYXRpb24iLCJoZWF0TGF5ZXIiLCJibHVyIiwiZ3JhZGllbnQiLCJmb2N1c0Nvb3JkaW5hdGVzIiwiYm91bmRzIiwibGF0TG5nQm91bmRzIiwiaXNWYWxpZCIsImZpdEJvdW5kcyIsImFwcGx5RmlsdGVycyIsImNsZWFyQWxsIiwicmVmIiwiaGVpZ2h0Iiwib3ZlcmZsb3ciLCJncmlkVGVtcGxhdGVDb2x1bW5zIiwiYWxpZ25TZWxmIiwidHlwZSIsImNoZWNrZWQiLCJvbkNoYW5nZSIsImNoYXJBdCIsInRvVXBwZXJDYXNlIiwic2xpY2UiLCJtYXhIZWlnaHQiLCJvdmVyZmxvd1kiLCJpdGVtIiwicGxhY2Vob2xkZXIiLCJyZXBsYWNlIiwib25DbGljayIsImJvcmRlckNvbG9yIiwiZmxleCIsImJvcmRlclRvcCIsInBhZGRpbmdUb3AiLCJtYXJnaW5Ub3AiLCJwb3NpdGlvbiIsImJvdHRvbSIsIm92ZXJmbG93WCIsImJvcmRlckNvbGxhcHNlIiwidGV4dEFsaWduIiwiY29sU3BhbiIsIlNlbGxlck1hcFBhZ2UiLCJjaGFydFdyYXBTdHlsZSIsIkRhc2hib2FyZENoYXJ0cyIsImJhckNhbnZhc1JlZiIsImRvbnV0Q2FudmFzUmVmIiwic3VibWlzc2lvbnNTZXJpZXMiLCJzdWJtaXNzaW9uczMwRGF5cyIsInN1Ym1pc3Npb25zMTJNb250aHMiLCJiYXJDb250ZXh0IiwiZ2V0Q29udGV4dCIsImRvbnV0Q29udGV4dCIsImJhckNoYXJ0IiwibGFiZWxzIiwicG9pbnQiLCJkYXRhc2V0cyIsImNvdW50IiwiYmFja2dyb3VuZENvbG9yIiwib3B0aW9ucyIsIm1haW50YWluQXNwZWN0UmF0aW8iLCJwbHVnaW5zIiwibGVnZW5kIiwic2NhbGVzIiwieCIsImdyaWQiLCJ0aWNrcyIsImZvbnQiLCJzaXplIiwieSIsImJlZ2luQXRaZXJvIiwicHJlY2lzaW9uIiwiZG9udXRDaGFydCIsInN0YXRzIiwiYm9yZGVyV2lkdGgiLCJjdXRvdXQiLCJkZXN0cm95IiwiaW5zZXQiLCJmbGV4RGlyZWN0aW9uIiwicG9pbnRlckV2ZW50cyIsInBlcmNlbnRhZ2UiLCJEYXNoYm9hcmQiLCJiZyIsImdyZWV0aW5nIiwiYWRtaW5OYW1lIiwiZGF0ZUxhYmVsIiwic3RhdCIsImJvcmRlckxlZnQiLCJ0b3AiLCJ2aWV3Qm94Iiwic3Ryb2tlIiwic3Ryb2tlV2lkdGgiLCJkIiwicmVjZW50QWN0aXZpdHkiLCJhY3Rpdml0eSIsImFjdGlvbkNvbG9yIiwiYWN0aW9uIiwiYWN0aW9uTGFiZWwiLCJzcGxpdCIsInBvcCIsImJvcmRlckJvdHRvbSIsIm1hcmdpbkxlZnQiLCJhY3RvciIsImNyZWF0ZWRBdCIsIkFuYWx5dGljc0NoYXJ0cyIsInN0YXRlc0NhbnZhc1JlZiIsImFwcHJvdmFsQ2FudmFzUmVmIiwiaG91cnNDYW52YXNSZWYiLCJzdGF0ZUNvbnRleHQiLCJhcHByb3ZhbENvbnRleHQiLCJob3Vyc0NvbnRleHQiLCJzdGF0ZXNDaGFydCIsInRvcFN0YXRlcyIsImluZGV4QXhpcyIsImFwcHJvdmFsQ2hhcnQiLCJhcHByb3ZhbFJhdGUiLCJzdWJtaXR0ZWQiLCJ0ZW5zaW9uIiwiaG91cnNDaGFydCIsImJ1c2llc3RIb3VycyIsIkZyYWdtZW50IiwiYXZlcmFnZUFjdGlvbkhvdXJzIiwidG9GaXhlZCIsImZsZXhXcmFwIiwicmVqZWN0aW9uV29yZHMiLCJ3b3JkIiwiU2VsbGVyQW5hbHl0aWNzIiwic3RhdFBpbGxzIiwiaXNJblJhbmdlIiwiZnJvbURhdGUiLCJ0b0RhdGUiLCJBdWRpdFRpbWVsaW5lIiwiYWN0aW9uRmlsdGVyIiwic2V0QWN0aW9uRmlsdGVyIiwiYWRtaW5GaWx0ZXIiLCJzZXRBZG1pbkZpbHRlciIsInNldEZyb21EYXRlIiwic2V0VG9EYXRlIiwicGFnZSIsInNldFBhZ2UiLCJwYWdlU2l6ZSIsImZpbHRlcmVkTG9ncyIsImxvZ3MiLCJsb2ciLCJtYXRjaGVzQWN0aW9uIiwibWF0Y2hlc0FkbWluIiwibWF0Y2hlc0RhdGUiLCJwYWdlZExvZ3MiLCJ0b3RhbFBhZ2VzIiwibWF4IiwiY2VpbCIsImxhc3REYXRlTGFiZWwiLCJhY3Rpb25PcHRpb25zIiwiYWRtaW5PcHRpb25zIiwiYWRtaW4iLCJzaG93RGF0ZSIsIm1pbldpZHRoIiwidGFyZ2V0Q29sbGVjdGlvbiIsInRhcmdldElkIiwibm90ZSIsImRpc2FibGVkIiwiZ2V0UGFnZVRpdGxlIiwicGF0aG5hbWUiLCJnZXRQYWdlU3VidGl0bGUiLCJUb3BCYXIiLCJ0b2dnbGVTaWRlYmFyIiwic2Vzc2lvbiIsIlJFRFVYX1NUQVRFIiwidGl0bGUiLCJzdWJ0aXRsZSIsInpJbmRleCIsIndoaXRlU3BhY2UiLCJ0ZXh0T3ZlcmZsb3ciLCJlbWFpbCIsIlNpZGViYXJCcmFuZGluZyIsImJyYW5kaW5nIiwiTGluayIsInRleHREZWNvcmF0aW9uIiwiZmxleFNocmluayIsImxvZ28iLCJhbHQiLCJjb21wYW55TmFtZSIsIm9iamVjdEZpdCIsImxldHRlclNwYWNpbmciLCJsaW5lSGVpZ2h0IiwibGlua0Jhc2VTdHlsZSIsImdldFBhZ2VMYWJlbCIsInBhcnQiLCJqb2luIiwiSG9tZUdseXBoIiwiRG90R2x5cGgiLCJOYXZJdGVtIiwib25OYXZpZ2F0ZSIsImdseXBoIiwiYm9yZGVyTGVmdENvbG9yIiwiU2lkZWJhclBhZ2VzIiwicGFnZXMiLCJ1c2VMb2NhdGlvbiIsIm5hdmlnYXRlIiwidXNlTmF2aWdhdGUiLCJleHRyYVBhZ2VzIiwibmFtZSIsInRleHRUcmFuc2Zvcm0iLCJBZG1pbkpTIiwiVXNlckNvbXBvbmVudHMiLCJTZWxsZXJNYXAiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7RUFHTyxNQUFNQSxHQUFHLEdBQUcsSUFBSUMsaUJBQVMsRUFBRTtFQW9FM0IsTUFBTUMsU0FBOEIsR0FBRztFQUM1Q0MsRUFBQUEsVUFBVSxFQUFFLFNBQVM7RUFDckJDLEVBQUFBLE1BQU0sRUFBRSxtQkFBbUI7RUFDM0JDLEVBQUFBLFlBQVksRUFBRSxDQUFDO0VBQ2ZDLEVBQUFBLFNBQVMsRUFBRTtFQUNiLENBQUM7RUFFTSxNQUFNQyxrQkFBdUMsR0FBRztFQUNyREMsRUFBQUEsT0FBTyxFQUFFLE1BQU07RUFDZkMsRUFBQUEsY0FBYyxFQUFFLGVBQWU7RUFDL0JDLEVBQUFBLFVBQVUsRUFBRSxRQUFRO0VBQ3BCQyxFQUFBQSxHQUFHLEVBQUUsRUFBRTtFQUNQQyxFQUFBQSxZQUFZLEVBQUU7RUFDaEIsQ0FBQztFQUVNLE1BQU1DLGlCQUFzQyxHQUFHO0VBQ3BEQyxFQUFBQSxNQUFNLEVBQUUsQ0FBQztFQUNUQyxFQUFBQSxRQUFRLEVBQUUsRUFBRTtFQUNaQyxFQUFBQSxVQUFVLEVBQUUsR0FBRztFQUNmQyxFQUFBQSxLQUFLLEVBQUU7RUFDVCxDQUFDO0VBRU0sTUFBTUMsb0JBQXlDLEdBQUc7RUFDdkRKLEVBQUFBLE1BQU0sRUFBRSxTQUFTO0VBQ2pCQyxFQUFBQSxRQUFRLEVBQUUsRUFBRTtFQUNaRSxFQUFBQSxLQUFLLEVBQUU7RUFDVCxDQUFDO0VBRU0sTUFBTUUsU0FBOEIsR0FBRztFQUM1Q1gsRUFBQUEsT0FBTyxFQUFFLE1BQU07RUFDZkcsRUFBQUEsR0FBRyxFQUFFLEVBQUU7RUFDUFMsRUFBQUEsT0FBTyxFQUFFLEVBQUU7RUFDWGpCLEVBQUFBLFVBQVUsRUFBRSxTQUFTO0VBQ3JCa0IsRUFBQUEsU0FBUyxFQUFFO0VBQ2IsQ0FBQztFQUVNLE1BQU1DLFlBQTRELEdBQUc7RUFDMUVDLEVBQUFB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
