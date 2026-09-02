// ============================================================
// OVERLAY ALIGNMENT OFFSETS — Fine-tune image positioning here
// Positive lat = shift NORTH (up), Negative lat = shift SOUTH (down)
// Positive lng = shift EAST (right), Negative lng = shift WEST (left)
// ============================================================
export const hbOffset = { lat: 0, lng: -0.003 }; // negative lng = shift left
export const rsOffset = { lat: 0, lng: -0.004 }; // negative lng = shift left

// ~1km ≈ 0.009° latitude, ~0.0097° longitude at ~19°N
const KM_TO_DEG_LAT = 0.009;
const KM_TO_DEG_LNG = 0.0097;
// Overlay size: increased from 3.0km to ~4.4km (~45% larger bounds/area)
export const OVERLAY_SIZE_KM = 5.5; // total width/height in km
const OVERLAY_HALF_SIZE_KM = OVERLAY_SIZE_KM / 2; // 2.2km radius from center

function boundsFromCenter(lat, lng, offset = { lat: 0, lng: 0 }) {
  const dLat = KM_TO_DEG_LAT * OVERLAY_HALF_SIZE_KM;
  const dLng = KM_TO_DEG_LNG * OVERLAY_HALF_SIZE_KM;
  const centerLat = lat + (offset.lat || 0);
  const centerLng = lng + (offset.lng || 0);
  return [
    [centerLat - dLat, centerLng - dLng], // southwest
    [centerLat + dLat, centerLng + dLng], // northeast
  ];
}

export const SITES = {
  HB: {
    id: "HB",
    name: "Hiware Bazar",
    center: [19.0728, 74.0182],
    zoom: 14,
    // Overlay bounds with hbOffset applied:
    imageBounds: boundsFromCenter(19.0728, 74.0182, hbOffset),
    beforeImage: "/images/before_HB.png",
    afterImage: "/images/after_HB.png",
    color: "#00e5ff",
  },
  RS: {
    id: "RS",
    name: "Ralegan Siddhi",
    center: [19.1642, 74.4300],
    zoom: 14,
    // Overlay bounds with rsOffset applied:
    imageBounds: boundsFromCenter(19.1642, 74.4300, rsOffset),
    beforeImage: "/images/before_RS.png",
    afterImage: "/images/after_RS.png",
    color: "#76ff03",
  },
};

export const GEOJSON_URL = "/data/boundary.geojson";
export const PHOTOS_URL = "/data/photos.json";
