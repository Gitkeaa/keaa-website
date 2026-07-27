import { lazy, Suspense, useState, useCallback } from 'react';
import Modal from './Modal';

// react-easy-crop is only needed once a photo is actually being cropped, so it is loaded on
// demand instead of shipping in the chunk of every admin page that mounts this modal.
const Cropper = lazy(() => import('react-easy-crop'));

/** Crop the chosen area of `src` to a square JPEG blob via canvas. */
async function getCroppedBlob(src, area) {
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
  const size = 320; // output is a 320×320 square
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, size, size);
  return new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.9));
}

/**
 * Lets the user reposition + zoom a picked image inside a round frame, then saves the crop.
 * `onSave(blob)` receives the cropped square JPEG; the caller uploads it.
 */
export default function AvatarCropModal({ src, onClose, onSave }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState(null);
  const [saving, setSaving] = useState(false);

  const onComplete = useCallback((_, pixels) => setArea(pixels), []);

  const save = async () => {
    if (!area) return;
    setSaving(true);
    try {
      const blob = await getCroppedBlob(src, area);
      await onSave(blob);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={Boolean(src)} onClose={onClose} title="Adjust your photo">
      <div className="px-5 py-5">
        <div className="relative h-64 w-full overflow-hidden rounded-lg bg-slate-900">
          {src && (
            <Suspense fallback={null}>
              <Cropper
                image={src}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onComplete}
              />
            </Suspense>
          )}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="flex-shrink-0 text-xs font-medium text-slate-500">Zoom</span>
          <input
            type="range" min={1} max={3} step={0.01} value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Zoom"
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-primary-dark"
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button type="button" onClick={save} disabled={saving} className="rounded-lg bg-primary-dark px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-darker disabled:opacity-60">
            {saving ? 'Saving…' : 'Save photo'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
