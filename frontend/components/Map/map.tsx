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

// ── Custom +/- / locate buttons using Leaflet's map instance ─
function MapControls({ userLocation }: { userLocation: [number, number] }) {
  const map = useMap();

  const btn =
    'size-10 bg-card rounded-xl shadow border border-border flex items-center justify-center text-text-sub hover:text-primary hover:border-primary transition-colors';

  return (
    <div className="absolute bottom-6 right-4 z-1000 flex flex-col gap-2 pointer-events-auto">
      <button className={btn} onClick={() => map.zoomIn()} title="Zoom in">
        <span className="material-symbols-outlined">add</span>
      </button>
      <button className={btn} onClick={() => map.zoomOut()} title="Zoom out">
        <span className="material-symbols-outlined">remove</span>
      </button>
      <button
        className={`${btn} mt-2`}
        onClick={() => map.setView(userLocation, 14, { animate: true })}
        title="My location"
      >
        <span className="material-symbols-outlined">my_location</span>
      </button>
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
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
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
      <MapControls userLocation={userLocation} />

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

    {/* ── Route info card ── */}
    {routeInfo && (
      <div
        style={{ position: 'absolute', bottom: '24px', left: '16px', zIndex: 1000 }}
        className="bg-card border border-primary/30 rounded-2xl shadow-xl p-4 min-w-56 pointer-events-auto"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[16px]">route</span>
            </div>
            <span className="text-xs font-bold text-text-base uppercase tracking-wider">Route</span>
          </div>
          <button
            onClick={onClearRoute}
            className="size-6 rounded-lg flex items-center justify-center text-text-muted hover:text-error hover:bg-error/10 transition-colors"
            title="Clear route"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        <p className="text-xs text-text-muted mb-3 truncate max-w-48">
          To: <span className="text-text-base font-semibold">{routeInfo.docName}</span>
        </p>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-surface rounded-xl p-2.5 text-center border border-border">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <span className="material-symbols-outlined text-[14px]">straighten</span>
            </div>
            <div className="text-sm font-bold text-text-base">{routeInfo.distance}</div>
            <div className="text-[10px] text-text-muted">Distance</div>
          </div>
          <div className="bg-surface rounded-xl p-2.5 text-center border border-border">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
            </div>
            <div className="text-sm font-bold text-text-base">{routeInfo.duration}</div>
            <div className="text-[10px] text-text-muted">Drive time</div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
