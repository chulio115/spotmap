import { Marker } from 'react-leaflet'
import L from 'leaflet'
import { getCategoryById } from '../constants/categories'

export default function SpotMarker({ spot, onClick, isActive, zoomLevel = 13 }) {
  const category = getCategoryById(spot.category)
  
  // Zoom-basierte Skalierung
  // zoom 8-10: nur kleiner Punkt, zoom 11-13: Emoji, zoom 14+: Emoji + Label
  const isCompact = zoomLevel <= 10
  const showLabel = zoomLevel >= 15 || isActive
  
  // Skalierungsfaktor: 0.5 bei zoom 8 → 1.0 bei zoom 14+
  const scale = Math.min(1, Math.max(0.5, (zoomLevel - 8) / 6))
  
  const emojiSize = Math.round(14 * scale + 2)
  const padding = isCompact ? '3px 5px' : `${Math.round(4 * scale + 2)}px ${Math.round(6 * scale + 4)}px`
  const borderRadius = isCompact ? '50%' : '16px'
  const borderWidth = isCompact ? '1.5px' : '2px'
  const iconW = isCompact ? 20 : (showLabel ? 80 : Math.round(36 * scale + 10))
  const iconH = isCompact ? 20 : Math.round(24 * scale + 8)
  
  const customIcon = L.divIcon({
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, ${category.color}ee, ${category.color});
        padding: ${padding};
        border-radius: ${borderRadius};
        gap: ${isCompact ? '0' : '4px'};
        border: ${borderWidth} solid rgba(255, 255, 255, ${isCompact ? '0.4' : '0.3'});
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
        transform: ${isActive ? 'scale(1.25)' : 'scale(1)'};
        transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        white-space: nowrap;
      ">
        <span style="
          font-size: ${emojiSize}px;
          line-height: 1;
          filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));
        ">${category.emoji}</span>
        ${showLabel ? `<span style="
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 600;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
          overflow: hidden;
          max-width: 80px;
          text-overflow: ellipsis;
        ">${spot.title || category.label.split('/')[0].trim()}</span>` : ''}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [iconW, iconH],
    iconAnchor: [iconW / 2, iconH / 2],
    popupAnchor: [0, -iconH / 2]
  })

  return (
    <Marker
      position={[spot.lat, spot.lng]}
      icon={customIcon}
      eventHandlers={{
        click: () => onClick(spot)
      }}
    />
  )
}
