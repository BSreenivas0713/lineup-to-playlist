export default function ProcessingScreen({ uploading, processing }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
      <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      {uploading && <p className="text-gray-700 font-medium">Uploading image...</p>}
      {processing && (
        <>
          <p className="text-gray-700 font-medium mb-2">Processing your lineup...</p>
          <p className="text-sm text-gray-500">Using AI to extract artist names...</p>
        </>
      )}
    </div>
  );
}
