import { useState, useEffect, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  ImageOverlay,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { SITES, GEOJSON_URL } from "./config";
import "./App.css";

/* ------------------------------------------------------------------ */
/*  Helper: imperatively fly the map to a site                        */
/* ------------------------------------------------------------------ */
function FlyToSite({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

/* ------------------------------------------------------------------ */
/*  Control Panel                                                      */
/* ------------------------------------------------------------------ */
function ControlPanel({
  activeSite,
  onSiteChange,
  overlayModes,
  onModeChange,
  onSetAllModes,
}) {
  return (
    <div className="control-panel">
      <div className="panel-header">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <span>Watershed Monitor</span>
      </div>

      {/* Site selector */}
      <div className="panel-section">
        <label className="section-label">Focus Site</label>
        <div className="site-buttons">
          {Object.values(SITES).map((site) => (
            <button
              key={site.id}
              className={`site-btn ${activeSite === site.id ? "active" : ""}`}
              style={{
                "--site-color": site.color,
              }}
              onClick={() => onSiteChange(site.id)}
            >
              <span className="site-dot" style={{ background: site.color }} />
              {site.name}
            </button>
          ))}
        </div>
      </div>

      {/* Satellite Imagery Overlays (Before / After / Present) */}
      <div className="panel-section">
        <div className="section-header-row">
          <label className="section-label">Satellite Imagery</label>
        </div>

        {/* Quick-switch for both sites */}
        <div className="quick-row">
          <span className="quick-label">Both:</span>
          <div className="quick-btn-group">
            <button
              className="quick-btn"
              onClick={() => onSetAllModes("before")}
              title="Show Before image on both sites"
            >
              Before
            </button>
            <button
              className="quick-btn"
              onClick={() => onSetAllModes("after")}
              title="Show After image on both sites"
            >
              After
            </button>
            <button
              className="quick-btn present"
              onClick={() => onSetAllModes("present")}
              title="Show clean base satellite map without overlay on both sites"
            >
              Present
            </button>
          </div>
        </div>

        {/* Per-site selector */}
        {Object.values(SITES).map((site) => {
          const currentMode = overlayModes[site.id] || "present";
          return (
            <div key={site.id} className="overlay-group">
              <div className="overlay-site-header">
                <span
                  className="overlay-site-name"
                  style={{ color: site.color }}
                >
                  {site.name}
                </span>
                <span className={`current-badge ${currentMode}`}>
                  {currentMode === "present"
                    ? "Present (Base)"
                    : currentMode === "before"
                    ? "Before"
                    : "After"}
                </span>
              </div>
              <div className="mode-segmented">
                <button
                  className={`mode-btn ${currentMode === "before" ? "active before" : ""}`}
                  onClick={() => onModeChange(site.id, "before")}
                >
                  Before
                </button>
                <button
                  className={`mode-btn ${currentMode === "after" ? "active after" : ""}`}
                  onClick={() => onModeChange(site.id, "after")}
                >
                  After
                </button>
                <button
                  className={`mode-btn ${currentMode === "present" ? "active present" : ""}`}
                  onClick={() => onModeChange(site.id, "present")}
                >
                  Present
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="panel-footer">
        Present = Satellite Base Map (No overlay)
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main App                                                           */
/* ------------------------------------------------------------------ */
export default function App() {
  const [geojsonData, setGeojsonData] = useState(null);
  const [activeSite, setActiveSite] = useState("HB"); // Default focused on Hiware Bazar

  // Overlay state: "present" (no image overlay) | "before" | "after"
  const [overlayModes, setOverlayModes] = useState({
    HB: "present",
    RS: "present",
  });

  // Fetch GeoJSON boundary polygons
  useEffect(() => {
    fetch(GEOJSON_URL)
      .then((r) => r.json())
      .then((data) => setGeojsonData(data))
      .catch((err) => console.error("Failed to load GeoJSON:", err));
  }, []);

  // Style each polygon by its feature id
  const geoStyle = useCallback((feature) => {
    const site = SITES[feature.properties?.id];
    return {
      color: site?.color ?? "#ffffff",
      weight: 2.5,
      opacity: 0.9,
      fillColor: site?.color ?? "#ffffff",
      fillOpacity: 0.08,
      dashArray: "6 4",
    };
  }, []);

  const handleModeChange = useCallback((siteId, mode) => {
    setOverlayModes((prev) => ({
      ...prev,
      [siteId]: mode,
    }));
  }, []);

  const handleSetAllModes = useCallback((mode) => {
    setOverlayModes({
      HB: mode,
      RS: mode,
    });
  }, []);

  const handleSiteChange = useCallback((siteId) => {
    setActiveSite(siteId);
  }, []);

  const currentSite = activeSite ? SITES[activeSite] : null;

  return (
    <div className="app">
      <MapContainer
        center={[19.0728, 74.0182]}
        zoom={14}
        className="map-container"
        zoomControl={false}
      >
        {/* Base tiles — Esri World Imagery (Satellite) */}
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />

        {/* Fly to selected site on focus button click */}
        {currentSite && (
          <FlyToSite center={currentSite.center} zoom={currentSite.zoom} />
        )}

        {/* GeoJSON boundaries */}
        {geojsonData && (
          <GeoJSON
            data={geojsonData}
            style={geoStyle}
            onEachFeature={(_feature, layer) => {
              const name = _feature.properties?.name;
              if (name) {
                layer.bindTooltip(name, {
                  permanent: false,
                  direction: "center",
                  className: "boundary-tooltip",
                });
              }
            }}
          />
        )}

        {/* Image overlays: Before / After / Present */}
        {Object.values(SITES).map((site) => {
          const mode = overlayModes[site.id];
          if (mode === "before") {
            return (
              <ImageOverlay
                key={`${site.id}-before`}
                url={site.beforeImage}
                bounds={site.imageBounds}
                opacity={0.88}
                zIndex={400}
              />
            );
          }
          if (mode === "after") {
            return (
              <ImageOverlay
                key={`${site.id}-after`}
                url={site.afterImage}
                bounds={site.imageBounds}
                opacity={0.88}
                zIndex={400}
              />
            );
          }
          // "present": do not put any image on the area (shows base satellite map)
          return null;
        })}
      </MapContainer>

      {/* Control panel overlay */}
      <ControlPanel
        activeSite={activeSite}
        onSiteChange={handleSiteChange}
        overlayModes={overlayModes}
        onModeChange={handleModeChange}
        onSetAllModes={handleSetAllModes}
      />
    </div>
  );
}
