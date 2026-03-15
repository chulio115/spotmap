import { Marker } from 'react-leaflet'
import L from 'leaflet'
import { getCategoryById } from '../constants/categories'

export default function SpotMarker({ spot, onClick, isActive }) {
  const category = getCategoryById(spot.category)
  
  // Konvertiere Hex zu RGB für Glow-Effekt
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 100, g: 100, b: 100 }
  }
  
  const rgb = hexToRgb(category.color)
  const glowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`
  
  const customIcon = L.divIcon({
    html: `
      <div class="spot-marker-wrapper ${isActive ? 'active' : ''}" style="
        position: relative;
        width: fit-content;
        height: fit-content;
      ">
        <!-- Glow Ring -->
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 48px;
          height: 28px;
          background: ${glowColor};
          border-radius: 14px;
          filter: blur(8px);
          opacity: ${isActive ? '1' : '0.5'};
          transition: all 200ms ease;
        "></div>
        
        <!-- Pill Container -->
        <div style="
          position: relative;
          background: linear-gradient(135deg, ${category.color}ee, ${category.color});
          padding: 6px 12px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 6px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          transform: ${isActive ? 'scale(1.2)' : 'scale(1)'};
          transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        ">
          <!-- Emoji -->
          <span style="
            font-size: 16px;
            line-height: 1;
            filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
          ">${category.emoji}</span>
          
          <!-- Label (nur bei hover/active) -->
          <span style="
            font-family: 'Inter', sans-serif;
            font-size: 11px;
            font-weight: 600;
            color: white;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
            white-space: nowrap;
            max-width: ${isActive ? '100px' : '0'};
            overflow: hidden;
            transition: max-width 200ms ease;
          ">${category.label.split(' ')[0]}</span>
        </div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [60, 32],
    iconAnchor: [30, 32],
    popupAnchor: [0, -32]
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
