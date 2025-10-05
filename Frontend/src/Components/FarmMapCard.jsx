// src/components/FarmMapCard.jsx
import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const FarmMapCard = ({ farmData }) => {
  if (!farmData?.agro_polygon?.geo_json?.geometry?.coordinates) return null;

  const center = [farmData.latitude, farmData.longitude];
  const polygonCoords =
    farmData.agro_polygon.geo_json.geometry.coordinates[0].map((coord) => [
      coord[1],
      coord[0],
    ]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Farm Location
        </h3>
        <div className="h-64 rounded-lg overflow-hidden">
          <MapContainer
            center={center}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={center}>
              <Popup>{farmData.farm_name}</Popup>
            </Marker>
            <Polygon positions={polygonCoords} color="blue">
              <Popup>Farm Boundary</Popup>
            </Polygon>
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default FarmMapCard;
