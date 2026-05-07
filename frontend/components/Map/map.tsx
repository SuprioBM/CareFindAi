'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from 'next-themes';

// Fix Leaflet's broken default icon paths under webpack/Next.js
/* eslint-disable @typescript-eslint/no-explicit-any */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface DoctorMapProps {
  userLocation: [number, number];
  doctors: {
    id: number;
    name: string;
    specialty: string;
    lat: number;
    lng: number;
    photo: string;
    isSelected: boolean;
  }[];
  onDoctorClick: (id: number) => void;
  routeTo: [number, number] | null;
  onClearRoute: () => void;
}

// ── OSRM road-route layer ────────────────────────────────────
interface RouteLayerProps {
  userLocation: [number, number];
  destination: [number, number] | null;
  onRouteInfo: (info: { distance: string; duration: string; docName: string } | null) => void;
  docName: string;
}

function RouteLayer({ userLocation, destination, onRouteInfo, docName }: RouteLayerProps) {
  const map = useMap();
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);

  useEffect(() => {
    if (!destination) {
      setRoutePoints([]);
      onRouteInfo(null);
      return;
    }

    const [uLat, uLng] = userLocation;
    const [dLat, dLng] = destination;
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${uLng},${uLat};${dLng},${dLat}?overview=full&geometries=geojson`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const route = data.routes?.[0];
        if (!route) throw new Error('no route');

        // GeoJSON coords are [lng, lat] — flip to Leaflet [lat, lng]
        const pts: [number, number][] = route.geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng],
        );
        setRoutePoints(pts);

        const distM: number = route.distance;
        const durS: number  = route.duration;
        const distance = distM < 1000
          ? `${Math.round(distM)} m`
          : `${(distM / 1609.34).toFixed(1)} mi`;
        const duration = durS < 60
          ? `${Math.round(durS)} sec`
          : `${Math.round(durS / 60)} min`;

        onRouteInfo({ distance, duration, docName });

        // Fit the map to show the full route
        if (pts.length > 1) map.fitBounds(pts as L.LatLngBoundsExpression, { padding: [50, 50], animate: true });
      })
      .catch(() => {
        // Fallback: straight dashed line
        const pts: [number, number][] = [userLocation, destination];
        setRoutePoints(pts);
        onRouteInfo({ distance: '—', duration: '—', docName });
        map.fitBounds(pts as L.LatLngBoundsExpression, { padding: [60, 60], animate: true });
      });
  }, [destination, userLocation, docName, map]);

  if (routePoints.length === 0) return null;

  return (
    <Polyline
      positions={routePoints}
      pathOptions={{
        color: '#0d9488',
        weight: 5,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
      }}
    />
  );
}

// ── Re-center map when userLocation changes ──────────────────
function MapSync({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

// ── Floating toolbar controls (responsive) ─────────────────
function MapControls({
  userLocation,
  routeTo,
  onClearRoute,
}: {
  userLocation: [number, number];
  routeTo: [number, number] | null;
  onClearRoute: () => void;
}) {
  const map = useMap();

  const btnBase =
    'bg-card rounded-lg shadow border border-border flex items-center justify-center text-text-sub hover:text-primary hover:border-primary transition-colors';

  // responsive sizing: mobile smaller, desktop larger
  const btnClass = 'w-8 h-8 md:w-10 md:h-10 ' + btnBase;

  return (
    <div className="absolute right-4 top-1/6 lg:top-120 z-1000 flex flex-col gap-2 pointer-events-auto">
      <button className={btnClass} onClick={() => map.zoomIn()} title="Zoom in">
        <span className="material-symbols-outlined text-[16px] md:text-[18px]">add</span>
      </button>
      <button className={btnClass} onClick={() => map.zoomOut()} title="Zoom out">
        <span className="material-symbols-outlined text-[16px] md:text-[18px]">remove</span>
      </button>
      <button
        className={btnClass}
        onClick={() => map.setView(userLocation, 14, { animate: true })}
        title="My location"
      >
        <span className="material-symbols-outlined text-[16px] md:text-[18px]">my_location</span>
      </button>

      {routeTo && (
        <button
          className={btnClass}
          onClick={onClearRoute}
          title="Clear route"
          aria-label="Clear route"
        >
          <span className="material-symbols-outlined text-[16px] md:text-[18px]">close</span>
        </button>
      )}
    </div>
  );
}

// ── Custom DivIcon helpers ────────────────────────────────────
function doctorIcon(isSelected: boolean): L.DivIcon {
  const sz  = isSelected ? 28 : 20;
  const bg  = isSelected ? '#0d9488' : '#475569';
  const brd = isSelected ? '3px' : '2px';
  const pulse = isSelected
    ? `<div style="position:absolute;width:56px;height:56px;border-radius:50%;background:rgba(13,148,136,0.18);
         top:50%;left:50%;transform:translate(-50%,-50%);
         animation:leaflet-ping 1.6s ease-in-out infinite;"></div>`
    : '';
  const icon = isSelected
    ? `<span class="material-symbols-outlined"
         style="font-size:14px;color:#fff;font-variation-settings:'FILL' 1;line-height:1;">
         local_hospital</span>`
    : '';

  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:${sz}px;height:${sz}px;display:flex;
                  align-items:center;justify-content:center;">
        ${pulse}
        <div style="width:${sz}px;height:${sz}px;border-radius:50%;background:${bg};
                    border:${brd} solid white;box-shadow:0 2px 12px rgba(0,0,0,.30);
                    display:flex;align-items:center;justify-content:center;
                    position:relative;z-index:1;">
          ${icon}
        </div>
      </div>`,
    iconSize:    [sz, sz],
    iconAnchor:  [sz / 2, sz / 2],
    popupAnchor: [0, -(sz / 2 + 10)],
  });
}

function userIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:20px;height:20px;display:flex;
                  align-items:center;justify-content:center;">
        <div style="position:absolute;width:44px;height:44px;border-radius:50%;
                    background:rgba(37,99,235,0.18);top:50%;left:50%;
                    animation:user-location-pulse 2s ease-in-out infinite;
                    transform:translate(-50%,-50%);"></div>
        <div style="width:18px;height:18px;border-radius:50%;background:#2563EB;
                    border:2.5px solid white;box-shadow:0 2px 12px rgba(37,99,235,.40);
                    position:relative;z-index:1;"></div>
      </div>`,
    iconSize:   [20, 20],
    iconAnchor: [10, 10],
  });
}

// ── Main export ───────────────────────────────────────────────
export default function DoctorMap({ userLocation, doctors, onDoctorClick, routeTo, onClearRoute }: DoctorMapProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string; docName: string } | null>(null);

  const selectedDoc = doctors.find((d) => routeTo && d.lat === routeTo[0] && d.lng === routeTo[1]);

  /* CartoDB tiles — free, performant, dark/light variants */
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const attribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ' +
    'contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  // Selected doc name for RouteLayer
  const routeDocName = selectedDoc?.name ?? 'Doctor';

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative', zIndex: 0 }}>
    <MapContainer
      center={userLocation}
      zoom={14}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      scrollWheelZoom
    >
      {/* key forces TileLayer remount when tile URL changes (theme switch) */}
      <TileLayer key={tileUrl} url={tileUrl} attribution={attribution} maxZoom={19} />

      <MapSync center={userLocation} />
      <MapControls userLocation={userLocation} routeTo={routeTo} onClearRoute={onClearRoute} />

      <RouteLayer
        userLocation={userLocation}
        destination={routeTo}
        onRouteInfo={setRouteInfo}
        docName={routeDocName}
      />

      {/* ── User location ── */}
      <Marker position={userLocation} icon={userIcon()}>
        <Popup>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-base)' }}>
            📍 Your Location
          </div>
        </Popup>
      </Marker>

      {/* ── Doctor markers ── */}
      {doctors.map((doc) => (
        <Marker
          key={doc.id}
          position={[doc.lat, doc.lng]}
          icon={doctorIcon(doc.isSelected)}
          eventHandlers={{ click: () => onDoctorClick(doc.id) }}
        >
          <Popup>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', minWidth: '168px' }}>
              <img
                src={doc.photo}
                alt={doc.name}
                style={{
                  width: '42px', height: '42px', borderRadius: '8px',
                  objectFit: 'cover', border: '1px solid var(--border)',
                }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-base)', marginBottom: '2px' }}>
                  {doc.name}
                </div>
                <div style={{ fontSize: '12px', color: '#0d9488', fontWeight: 500 }}>
                  {doc.specialty}
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>

    {/* ── Compact Route Card (responsive) ── */}
    {routeInfo && selectedDoc && (
      <div
        className="hidden md:block pointer-events-auto absolute left-4 bottom-4 md:bottom-24 z-1000 max-w-[220px] md:max-w-[260px] bg-card/95 backdrop-blur rounded-2xl border border-border shadow-lg p-3 transition transform duration-200"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3">
          <img
            src={selectedDoc.photo}
            alt={selectedDoc.name}
            className="w-12 h-12 md:w-14 md:h-14 rounded-lg object-cover border border-border"
          />

          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{selectedDoc.name}</div>
            <div className="text-xs text-primary truncate">{selectedDoc.specialty}</div>
            <div className="mt-1 text-[12px] text-text-muted flex items-center gap-2">
              <span className="font-bold text-text-base">{routeInfo.distance}</span>
              <span className="text-text-muted">•</span>
              <span>{routeInfo.duration}</span>
            </div>
          </div>

          <button
            onClick={onClearRoute}
            className="ml-2 inline-flex items-center p-2 rounded-lg bg-card border border-border hover:bg-white/5 transition-colors"
            title="Clear route"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      </div>
    )}
    </div>
  );
}
