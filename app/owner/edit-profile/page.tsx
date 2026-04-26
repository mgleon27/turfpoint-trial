"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/userContext";

type Area = {
  width: number;
  height: number;
  x: number;
  y: number;
};

export default function OwnerEditProfilePage() {
  const router = useRouter();
  const { user, profile } = useUser();

  const [name, setName] = useState(profile?.full_name || "");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [preview, setPreview] = useState(profile?.avatar_url || "");

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const getCroppedImg = async (imageSrc: string, crop: Area) => {
    const image = new Image();
    image.src = imageSrc;

    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    canvas.width = crop.width;
    canvas.height = crop.height;

    const ctx = canvas.getContext("2d");

    ctx?.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), "image/jpeg");
    });
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);

    let avatar_url = profile?.avatar_url || "";

    if (imageSrc && croppedAreaPixels) {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);

      const filePath = `${user.id}/avatar.jpg`;

      await supabase.storage
        .from("avatars")
        .upload(filePath, blob, {
          upsert: true,
          contentType: "image/jpeg",
        });

      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      avatar_url = `${data.publicUrl}?t=${Date.now()}`;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: name,
        avatar_url,
      })
      .eq("id", user.id);

    if (error) {
      alert("Update failed");
      setLoading(false);
      return;
    }

    // ✅ CHANGE HERE (owner redirect)
    router.push("/owner/profile");
  };

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <div className="max-w-md mx-auto">

        <div className="mb-8 flex items-center gap-3">
          <img onClick={() => router.back()} src="/icons/back.png" className="h-4.5" />
          <p className="text-xl font-medium">Edit Profile</p>
        </div>

        <div className="flex flex-col items-center mb-6">
          <img
            src={preview || "/profile.png"}
            className="w-24 h-24 rounded-full object-cover border"
          />

          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        {imageSrc && (
          <div className="relative w-full h-64 bg-black mb-5 rounded-lg overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
        )}

        <p className="text-gray-600 mt-4">Name</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border-b py-2 mb-6"
        />

        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-green-600 text-white py-3 rounded-full w-full"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}