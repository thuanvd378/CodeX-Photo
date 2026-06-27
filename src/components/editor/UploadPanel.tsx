import { useRef } from "react";
import { ImagePlus, Upload } from "lucide-react";
import { Button } from "../ui/button";
import { useEditorStore } from "../../app/editor-store";

interface UploadPanelProps {
  compact?: boolean;
}

export function UploadPanel({ compact = false }: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const uploadFile = useEditorStore((state) => state.uploadFile);

  const handleFile = (file: File | undefined) => {
    if (file) {
      void uploadFile(file);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.currentTarget.value = "";
        }}
      />
      <Button
        variant={compact ? "secondary" : "primary"}
        size={compact ? "sm" : "md"}
        icon={compact ? <Upload size={16} /> : <ImagePlus size={18} />}
        onClick={() => inputRef.current?.click()}
      >
        Tải ảnh lên
      </Button>
    </>
  );
}
