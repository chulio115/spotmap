import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { useCategoriesContext } from '../lib/CategoriesContext'

export default function MarkerClusterGroup({ spots, onSpotClick, activeSpotId, zoomLevel }) {
  const map = useMap()
  const { getCategoryById } = useCategoriesContext()

  useEffect(() => {
    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 15,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount()
        let size = 'small'
        if (count > 10) size = 'medium'
        if (count > 30) size = 'large'
        
        const sizeMap = { small: 36, medium: 44, large: 52 }
        const s = sizeMap[size]
        
        return L.divIcon({
          html: `<div style="
            width: ${s}px; height: ${s}px;
            display: flex; align-items: center; justify-content: center;
            background: linear-gradient(135deg, #8B5CF6, #EC4899);
            border-radius: 50%;
            border: 2.5px solid rgba(255,255,255,0.4);
            box-shadow: 0 3px 12px rgba(139,92,246,0.4);
            color: white; font-weight: 700;
            font-family: 'Inter', sans-serif;
            font-size: ${count > 99 ? '11' : '13'}px;
          ">${count}</div>`,
          className: 'custom-cluster-icon',
          iconSize: L.point(s, s),
          iconAnchor: [s / 2, s / 2],
        })
      }
    })

    spots.forEach(spot => {
      const category = getCategoryById(spot.category)
      if (!category) return

      const isActive = spot.id === activeSpotId
      const isCompact = zoomLevel <= 10
      const showLabel = zoomLevel >= 15 || isActive
      const scale = Math.min(1, Math.max(0.5, (zoomLevel - 8) / 6))
      const emojiSize = Math.round(14 * scale + 2)
      const padding = isCompact ? '3px 5px' : `${Math.round(4 * scale + 2)}px ${Math.round(6 * scale + 4)}px`
      const borderRadius = isCompact ? '50%' : '16px'
      const borderWidth = isCompact ? '1.5px' : '2px'
      const iconW = isCompact ? 20 : (showLabel ? 80 : Math.round(36 * scale + 10))
      const iconH = isCompact ? 20 : Math.round(24 * scale + 8)

      const icon = L.divIcon({
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
      })

      const marker = L.marker([spot.lat, spot.lng], { icon })
      marker.on('click', () => onSpotClick(spot))
      clusterGroup.addLayer(marker)
    })

    map.addLayer(clusterGroup)

    return () => {
      map.removeLayer(clusterGroup)
    }
  }, [spots, map, onSpotClick, activeSpotId, zoomLevel, getCategoryById])

  return null
}
