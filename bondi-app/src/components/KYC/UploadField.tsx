import React, { useState, useRef } from "react";

interface UploadFieldProps {
  label: string;
  className?: string;
  onFileSelect: (file: File | null) => void;
}

const UploadField: React.FC<UploadFieldProps> = ({ label, className = "", onFileSelect }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      onFileSelect(selectedFile);
      
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else if (selectedFile.type === 'application/pdf') {
        setPreview('/public/assets/pdf-icon.png');
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type.startsWith('image/') || droppedFile.type === 'application/pdf')) {
      setFile(droppedFile);
      onFileSelect(droppedFile);
      
      if (droppedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(droppedFile);
      } else if (droppedFile.type === 'application/pdf') {
        setPreview('/public/assets/pdf-icon.png');
      }
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div 
        className="flex flex-col items-center justify-center p-4 w-full text-xs font-medium text-teal-900 rounded-lg border border-dashed bg-white bg-opacity-40 border-emerald-950 border-opacity-40 min-h-[150px]"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="w-full flex flex-col items-center justify-center">
            {file?.type.startsWith('image/') ? (
              <img src={preview} alt="Preview" className="max-w-full max-h-[100px] object-contain mb-2" />
            ) : (
              <img src={preview} alt="PDF" className="w-12 h-12 mb-2" />
            )}
            <span className="text-xs text-center text-teal-900 truncate max-w-full">
              {file?.name}
            </span>
          </div>
        ) : (
          <>
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/5f936c64bbd6a1ed77043cd1a876a0a1b9e7c4ed513d5caf14f0a783b56310a3?placeholderIfAbsent=true&apiKey=a06ef9eb8abe48b8ac6053587476251b"
              alt=""
              className="w-4 h-4 mb-2"
            />
            <div className="text-center">{label}</div>
            <div className="mt-1 text-xs text-center text-teal-900 text-opacity-80">
              Supported Formats: JPG, PNG, PDF
            </div>
          </>
        )}
        <label
          htmlFor={`upload-${label}`}
          className="mt-2 px-3 xs py-1 text-xs leading-5 text-center border border-teal-900 border-solid rounded-full cursor-pointer hover:bg-teal-900 hover:text-white transition-colors"
        >
          {file ? "Change File" : "Upload a File"}
        </label>
        <input
          id={`upload-${label}`}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="sr-only"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
      </div>
    </div>
  );
};

export default UploadField;
