import { useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import data from "../data/data.json";
import "leaflet/dist/leaflet.css";

export default function Peta() {
  const centerPekanbaru = [0.5333, 101.4475];
  const NAVBAR_HEIGHT = 64;

  const [selectedToko, setSelectedToko] = useState(null);

  return (
    <>
      {/* MAP */}
      <div
        style={{
          width: "100%",
          height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
          marginTop: `${NAVBAR_HEIGHT}px`,
        }}
      >
        <MapContainer
          center={centerPekanbaru}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {data
            .filter(
              (t) =>
                typeof t.Latitude === "number" &&
                typeof t.Longititude === "number"
            )
            .map((toko) => (
              <Marker
                key={`${toko["Nama Toko"]}-${toko.Latitude}`}
                position={[toko.Latitude, toko.Longititude]}
                eventHandlers={{
                  click: () => {
                    setSelectedToko(toko);
                  },
                }}
              />
            ))}
        </MapContainer>
      </div>

      {/* MODAL */}
      {selectedToko && (
        <div className="fixed inset-0 z-[2000] bg-black/60 flex items-center justify-center">
          <div className="bg-white w-[90%] max-w-md rounded-xl shadow-lg overflow-hidden">

            {/* IMAGE */}
            <img
              src={selectedToko.Gambar}
              alt={selectedToko["Nama Toko"]}
              className="w-full h-48 object-cover"
            />

            {/* CONTENT */}
            <div className="p-4 space-y-2">
              <h2 className="text-xl font-bold">
                {selectedToko["Nama Toko"]}
              </h2>

              <p className="text-sm text-gray-600">
                Kecamatan: {selectedToko.Kecamatan}
              </p>
              <p className="text-sm text-gray-600">
                Kota: {selectedToko.Kota}
              </p>
              <p className="text-sm text-gray-600">
                Provinsi: {selectedToko.Provinsi}
              </p>

              <p className="text-xs text-gray-500">
                Lat: {selectedToko.Latitude} <br />
                Lng: {selectedToko.Longititude}
              </p>
            </div>

            {/* ACTION */}
            <div className="p-4 border-t text-right">
              <button
                onClick={() => setSelectedToko(null)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
