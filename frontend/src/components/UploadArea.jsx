import { useRef } from "react";

export default function UploadArea({ onFileUpload, uploading, processing }) {
  const inputRef = useRef(null);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload Concert Lineup</h2>
      <p className="text-gray-600 mb-6">
        Upload a screenshot or photo of a concert lineup poster.
      </p>

      {/* Label automatically triggers file input */}
      <label className="block cursor-pointer">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-green-500 hover:bg-green-50 transition-colors">
          <div className="text-5xl mb-4">📤</div>
          <p className="text-gray-700 font-medium">Click to upload or drag and drop</p>
          <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>

          <input
            type="file"
            ref={inputRef}
            className="hidden"
            accept="image/*"
            onChange={onFileUpload}
            disabled={uploading || processing}
          />
        </div>
      </label>
    </div>
  );
}
