"use client";

import { useRef, useState } from "react";
import { Eye, ImagePlus, X } from "lucide-react";
import { useUploadImageMutation } from "@/redux/fetchers/upload/uploadApi";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_MB = 5;

/** Multi-image uploader: each file goes through the shared /upload/image endpoint; the form keeps the URLs. */
export default function GalleryUpload({
  value,
  onChange,
  disabled = false,
  label = "Gallery Images",
  max = 30,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
  label?: string;
  max?: number;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadImage] = useUploadImageMutation();
  const [uploading, setUploading] = useState(0);
  const [over, setOver] = useState(false);
  const [error, setError] = useState("");
  const locked = disabled || uploading > 0;

  async function addFiles(files: FileList | File[] | null) {
    if (!files || !files.length || locked) return;
    setError("");
    const list = Array.from(files).slice(0, Math.max(0, max - value.length));
    setUploading(list.length);
    const urls: string[] = [];
    const problems: string[] = [];
    for (const file of list) {
      if (!ALLOWED.includes(file.type)) {
        problems.push(`${file.name}: unsupported format`);
      } else if (file.size > MAX_MB * 1024 * 1024) {
        problems.push(`${file.name}: larger than ${MAX_MB} MB`);
      } else {
        try {
          const fd = new FormData();
          fd.append("image", file);
          const res = await uploadImage(fd).unwrap();
          if (res?.data?.imageUrl) urls.push(res.data.imageUrl);
          else problems.push(`${file.name}: upload failed`);
        } catch {
          problems.push(`${file.name}: upload failed`);
        }
      }
      setUploading((n) => n - 1);
    }
    if (urls.length) onChange([...value, ...urls]);
    if (problems.length) setError(problems.join(" · "));
  }

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="pf-field">
      <div className="gallery-up__head">
        <span className="pf-label">{label}</span>
        <span className="gallery-up__count">{value.length}</span>
      </div>

      {value.length < max && (
        <div
          className={`gallery-up__drop${over ? " is-over" : ""}`}
          role="button"
          tabIndex={locked ? -1 : 0}
          aria-label="Add gallery images"
          onClick={() => !locked && fileRef.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !locked && fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            addFiles(e.dataTransfer.files);
          }}
        >
          {uploading > 0 ? (
            <>
              <span className="img-upload__spinner" aria-hidden="true" />
              <strong>Uploading {uploading} image{uploading > 1 ? "s" : ""}…</strong>
            </>
          ) : (
            <>
              <ImagePlus size={22} aria-hidden="true" />
              <strong>Drop images here or click to browse</strong>
              <span>
                JPG, PNG, WebP or GIF · max {MAX_MB} MB each · select several at once
              </span>
            </>
          )}
        </div>
      )}

      {value.length > 0 && (
        <div className="gallery-up">
          {value.map((url, i) => (
            <div key={`${url}-${i}`} className="gallery-up__item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Gallery ${i + 1}`} />
              <span className="gallery-up__index">{i + 1}</span>
              <div className="gallery-up__actions">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Preview image ${i + 1}`}
                  title="Preview"
                >
                  <Eye size={14} />
                </a>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  disabled={locked}
                  aria-label={`Remove image ${i + 1}`}
                  title="Remove"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {error && (
        <p className="err" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
