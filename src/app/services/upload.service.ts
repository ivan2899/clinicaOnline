import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(private supabase: SupabaseService) { }

  async uploadPhoto(bucket: string, path: string, file: Blob | File): Promise<string> {
    const { data, error } = await this.supabase.client
      .storage
      .from(bucket)
      .upload(path, file, { upsert: true }); // sobrescribe si ya existe

    if (error) throw error;

    // Obtener URL pública
    const { data: publicUrlData } = this.supabase.client
      .storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  }

  async compressImage(base64: string, quality: number): Promise<Blob> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // Escalar si es muy grande
        const MAX_WIDTH = 1280;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          async (blob) => {
            if (!blob) return;

            // Si pesa más de 200 KB, bajamos la calidad un poco
            if (blob.size > 200 * 1024 && quality > 0.3) {
              console.log(`Reduciendo calidad a ${(quality - 0.1).toFixed(1)}...`);
              const newBlob = await this.compressImage(base64, quality - 0.1);
              resolve(newBlob);
            } else {
              resolve(blob);
            }
          },
          'image/webp',
          quality
        );
      };
    });
  }

  // 🧩 Convertir archivo a Base64
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
}
