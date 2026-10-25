import { type AfferentResponse } from '../types/afferent';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8002';

export async function predictTactile(objectLabel: string, imageBase64: string): Promise<AfferentResponse> {
  const res = await fetch(`${API_BASE}/api/v1/predict-tactile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ object_label: objectLabel, image_base64: imageBase64 })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Failed to predict tactile prior');
  }
  return res.json();
}
