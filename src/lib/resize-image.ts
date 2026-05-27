// Client-side image resize. Returns a JPEG `File` capped at `maxDim` on its
// longest side. EXIF orientation is honored so portrait photos from phone
// cameras stay upright. Files smaller than the target are still re-encoded
// as JPEG to normalize format and apply the quality setting.

export async function resizeImage(
  file: File,
  maxDim = 1600,
  quality = 0.85
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const { width, height } = bitmap;

  let targetW = width;
  let targetH = height;
  if (width > maxDim || height > maxDim) {
    if (width >= height) {
      targetW = maxDim;
      targetH = Math.round((height / width) * maxDim);
    } else {
      targetH = maxDim;
      targetW = Math.round((width / height) * maxDim);
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Canvas 2D context unavailable");
  }
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
  if (!blob) throw new Error("Image resize failed");

  const baseName = file.name.replace(/\.[^/.]+$/, "") || "photo";
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
