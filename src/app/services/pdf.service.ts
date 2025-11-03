import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf'; // Importa jsPDF

// Reemplaza con tu cadena Base64 del logo "hola.png"
// Ejemplo: const LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'; 
let LOGO_BASE64 = 'TU_LOGO_EN_BASE64_AQUI';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() {
    this.novo();
  }

  async novo() {
    LOGO_BASE64 = await this.getBase64ImageFromURL('https://fuwqovndluczbpnnywse.supabase.co/storage/v1/object/public/images/fondo/icon.webp');
  }

  /**
   * Genera y descarga un archivo PDF con logo, fecha, título y datos.
   * @param title El título principal del informe.
   * @param data El contenido del informe (puede ser un string o datos formateados).
   */
  generatePdf(title: string, data: string): void {
    // 1. Inicializar jsPDF. 'p': portrait (vertical), 'mm': unidades en milímetros, 'a4': formato A4.
    const doc = new jsPDF('p', 'mm', 'a4');
    let yOffset = 10; // Posición inicial vertical

    // --- Configuración General ---
    const MARGIN = 15;
    const MAX_WIDTH = doc.internal.pageSize.getWidth() - 2 * MARGIN;

    // --- 1. Agregar el Logo ---
    if (LOGO_BASE64 !== 'TU_LOGO_EN_BASE64_AQUI') {
      const logoWidth = 30; // Ancho deseado del logo en mm
      const logoHeight = 10; // Alto deseado del logo en mm
      // Asegúrate de que el LOGO_BASE64 tenga el prefijo 'data:image/png;base64,'
      doc.addImage(LOGO_BASE64, 'PNG', MARGIN, yOffset, logoWidth, logoHeight);
      yOffset += logoHeight + 5; // Mover la posición hacia abajo
    } else {
      // Si no se proporciona el Base64, ajusta el offset para que el contenido comience correctamente
      yOffset += 10;
    }

    // --- 2. Agregar la Fecha de Emisión ---
    const emissionDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    doc.setFontSize(10);
    doc.text(`Fecha de Emisión: ${emissionDate}`, doc.internal.pageSize.getWidth() - MARGIN, 10, {
      align: 'right'
    });

    // --- 3. Agregar el Título del Informe ('title') ---
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    yOffset += 5;
    // Centrar el título
    const titleX = doc.internal.pageSize.getWidth() / 2;
    doc.text(title, titleX, yOffset, {
      align: 'center'
    });

    // Línea separadora
    doc.line(MARGIN, yOffset + 2, doc.internal.pageSize.getWidth() - MARGIN, yOffset + 2);
    yOffset += 10; // Mover la posición hacia abajo

    // --- 4. Agregar la Información de 'data' ---
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    // La función 'splitTextToSize' es esencial para manejar saltos de línea automáticos.
    const splitData = doc.splitTextToSize(data, MAX_WIDTH);
    doc.text(splitData, MARGIN, yOffset, {
      align: 'left'
    });

    // La función 'save' genera y descarga el PDF directamente.
    doc.save(`${this.cleanFileName(title)}-${new Date().getTime()}.pdf`);
  }

  /**
   * Ayuda a limpiar el título para el nombre del archivo.
   * @param name Nombre a limpiar.
   * @returns Nombre limpio.
   */
  private cleanFileName(name: string): string {
    return name.toLowerCase().replace(/ /g, '_').replace(/[^\w-]+/g, '');
  }

  private getBase64ImageFromURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = error => reject(error);
      img.src = url;
    });
  }
}