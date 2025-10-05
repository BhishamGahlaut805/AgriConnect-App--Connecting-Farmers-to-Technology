const ImageViewer = ({ src, alt }) => {
  const [zoom, setZoom] = useState(1); // State for image zoom level

  // Handles zooming in, with a max zoom of 3x
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  };

  // Handles zooming out, with a min zoom of 0.5x
  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  return (
    <div className="relative group overflow-hidden rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
      <div className="w-full h-auto flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[70vh] object-contain transition-transform duration-300 ease-in-out cursor-grab"
          style={{ transform: `scale(${zoom})` }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/400x300/E0E0E0/6C757D?text=Image+Error";
          }} // Fallback image on error
        />
      </div>
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-2 rounded-lg shadow-lg">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-green-500 text-white rounded-full shadow hover:bg-green-600 transition-colors"
          title="Zoom In"
          data-tooltip-id="general-tooltip"
          data-tooltip-content="Zoom in on the image"
        >
          <FiZoomIn className="h-5 w-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 transition-colors"
          title="Zoom Out"
          data-tooltip-id="general-tooltip"
          data-tooltip-content="Zoom out from the image"
        >
          <FiZoomOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
export default ImageViewer;