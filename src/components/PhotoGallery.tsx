"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import PhotoUpload from "./PhotoUpload";
import PhotoLightbox from "./PhotoLightbox";

interface Photo {
  id: number;
  session_id: number;
  uploaded_by: string;
  file_path: string;
  file_name: string;
  caption: string | null;
  created_at: string;
  profiles: { username: string } | null;
  signedUrl?: string;
}

interface PhotoGalleryProps {
  sessionId: number;
  initialPhotoCount: number;
}

export default function PhotoGallery({ sessionId, initialPhotoCount }: PhotoGalleryProps) {
  const { user, profile } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const isRestricted = profile?.role === "Observer";

  const fetchPhotos = useCallback(async () => {
    if (isRestricted) {
      setLoading(false);
      return;
    }

    const supabase = createSupabaseBrowser();
    const { data } = await supabase
      .from("session_photos")
      .select("*, profiles(username)")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      // Get signed URLs in parallel
      const withUrls = await Promise.all(
        data.map(async (photo) => {
          const { data: urlData } = await supabase.storage
            .from("session-photos")
            .createSignedUrl(photo.file_path, 3600);
          return { ...photo, signedUrl: urlData?.signedUrl || "" };
        })
      );
      setPhotos(withUrls as Photo[]);
    } else {
      setPhotos([]);
    }
    setLoading(false);
  }, [sessionId, isRestricted]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleDelete = async (photo: Photo) => {
    if (!confirm("Delete this photo?")) return;
    const supabase = createSupabaseBrowser();
    await supabase.storage.from("session-photos").remove([photo.file_path]);
    await supabase.from("session_photos").delete().eq("id", photo.id);
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
  };

  if (isRestricted) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-txt-tertiary">
          Session photos are available to programme attendees only.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: Math.min(initialPhotoCount, 8) || 4 }).map((_, i) => (
            <div key={i} className="aspect-square skeleton rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const lightboxPhotos = photos
    .filter((p) => p.signedUrl)
    .map((p) => ({
      url: p.signedUrl!,
      caption: p.caption || undefined,
      photographer: (p.profiles as unknown as { username: string } | null)?.username || "Unknown",
    }));

  return (
    <div className="p-4">
      <PhotoUpload sessionId={sessionId} onUploadComplete={fetchPhotos} />

      {photos.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-txt-tertiary text-sm">No photos yet.</p>
          <p className="text-txt-tertiary/60 text-[13px] mt-1">
            Attendees can upload photos from this session.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              className="relative group aspect-square rounded-lg overflow-hidden cursor-pointer bg-dark-surface"
              onClick={() => setLightboxIndex(i)}
            >
              {photo.signedUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo.signedUrl}
                  alt={photo.caption || photo.file_name}
                  className="w-full h-full object-cover"
                />
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100">
                <p className="text-[11px] text-white truncate">
                  {(photo.profiles as unknown as { username: string } | null)?.username || "Unknown"}
                </p>
                {photo.caption && (
                  <p className="text-[10px] text-white/70 truncate">{photo.caption}</p>
                )}
                {/* Delete button */}
                {(user?.id === photo.uploaded_by || profile?.role === "Admin") && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(photo);
                    }}
                    className="absolute top-2 right-2 text-white/60 hover:text-red-400 transition-colors"
                    title="Delete photo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={lightboxPhotos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((lightboxIndex - 1 + lightboxPhotos.length) % lightboxPhotos.length)}
          onNext={() => setLightboxIndex((lightboxIndex + 1) % lightboxPhotos.length)}
        />
      )}
    </div>
  );
}
