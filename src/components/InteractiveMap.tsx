import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { BusinessLead } from '../types/business';
import { MapPin, ExternalLink, Phone, Navigation } from 'lucide-react';

interface InteractiveMapProps {
  leads: BusinessLead[];
  onOpenDetails: (lead: BusinessLead) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  leads,
  onOpenDetails,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Filter leads with valid coordinates
  const leadsWithCoords = leads.filter(
    (l) => l.latitude !== undefined && l.longitude !== undefined && !isNaN(l.latitude) && !isNaN(l.longitude)
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if not yet created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([34.64, 50.88], 12); // Default to Qom coordinates

      // Standard free OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    const bounds: L.LatLngTuple[] = [];

    leadsWithCoords.forEach((lead) => {
      if (lead.latitude && lead.longitude) {
        bounds.push([lead.latitude, lead.longitude]);

        // Custom HTML marker pin with amber badge
        const customIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `
            <div style="background-color: #f59e0b; color: #020617; border: 2px solid #ffffff; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 13px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
              📍
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -18],
        });

        const marker = L.marker([lead.latitude, lead.longitude], { icon: customIcon });

        const popupContent = document.createElement('div');
        popupContent.style.direction = 'rtl';
        popupContent.style.fontFamily = 'Vazirmatn, sans-serif';
        popupContent.innerHTML = `
          <div style="padding: 6px; min-width: 200px;">
            <div style="font-size: 10px; color: #d97706; font-weight: bold;">${lead.category || 'کسب‌وکار'}</div>
            <div style="font-weight: 800; font-size: 14px; margin-bottom: 4px; color: #0f172a;">${lead.name}</div>
            ${lead.phone ? `<div style="font-size: 12px; margin-bottom: 4px; color: #059669; font-weight: bold;">📞 ${lead.phone}</div>` : ''}
            <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">${lead.address}</div>
            ${lead.googleMapsUrl ? `<a href="${lead.googleMapsUrl}" target="_blank" style="display: inline-block; background: #0f172a; color: #fff; padding: 4px 8px; border-radius: 6px; font-size: 11px; text-decoration: none; font-weight: bold;">مسیریابی در گوگل مپ ↗</a>` : ''}
          </div>
        `;

        marker.bindPopup(popupContent);
        markersLayer.addLayer(marker);
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }

    // Leaflet needs resize invalidate
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      // Map stays alive until unmounted
    };
  }, [leadsWithCoords.length]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl mb-8">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white text-sm sm:text-base">نقشه تعاملی موقعیت‌ها</h3>
        </div>
        <span className="text-xs text-slate-400">
          {leadsWithCoords.length} موقعیت مکانی روی نقشه
        </span>
      </div>

      <div
        ref={mapContainerRef}
        className="w-full h-[450px] sm:h-[550px] bg-slate-950 z-10"
      />
    </div>
  );
};
