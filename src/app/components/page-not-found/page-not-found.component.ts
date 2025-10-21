import { Component } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.scss'
})
export class PageNotFoundComponent {

  constructor(private uploadService: UploadService) {

  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      console.error('El archivo seleccionado no es una imagen.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;

      // Comprimir la imagen
      const compressedBlob = await this.compressImage(base64, 0.7);

      // Mantener el nombre original, cambiando extensión a .webp
      const originalName = file.name.replace(/\.[^/.]+$/, ''); // quita la extensión
      const webpFile = new File([compressedBlob], `${originalName}.webp`, { type: 'image/webp' });

      // Descargar directamente (sin abrir pestaña)
      const url = URL.createObjectURL(webpFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = webpFile.name; // nombre original .webp
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url); // liberar memoria

      console.log(`✅ Imagen comprimida y descargada (${(webpFile.size / 1024).toFixed(1)} KB)`);
    };

    reader.readAsDataURL(file);
  }

  /**
   * Comprime una imagen base64 a formato WebP
   * Ajusta automáticamente la calidad hasta que el peso sea <200 KB
   */
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

  async cargar(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    // 🔹 Convertir a base64
    const base64 = await this.fileToBase64(file);

    // 🔹 Comprimir usando tu función
    const compressedBlob = await this.compressImage(base64, 0.8);

    // 🔹 Generar ruta
    const fileExt = file.name.split('.').pop();
    const filePath = `clients/test/${Date.now()}.${fileExt}`;

    // 🔹 Subir al bucket 'images'
    try {
      const publicUrl = await this.uploadService.uploadPhoto('images', filePath, compressedBlob);
      console.log('✅ Imagen subida correctamente:', publicUrl);
    } catch (error) {
      console.error('❌ Falló la subida:', error);
    }
  }

  // 🧩 Convertir archivo a Base64
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

}