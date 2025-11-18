import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';

let LOGO_BASE64 = 'TU_LOGO_EN_BASE64_AQUI';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() {
    this.loadLogo();
  }

  private async loadLogo() {
    LOGO_BASE64 = await this.getBase64ImageFromURL(
      'https://fuwqovndluczbpnnywse.supabase.co/storage/v1/object/public/images/fondo/icon.webp'
    );
  }

  generatePdf(title: string, history: any[]): void {

    const doc = new jsPDF('p', 'mm', 'a4');
    const MARGIN = 15;
    const MAX_WIDTH = doc.internal.pageSize.getWidth() - MARGIN * 2;
    const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
    let y = 40;

    // Encabezado
    this.drawHeader(doc, title);

    // 🟥 Si no hay historia, generar PDF vacío con el mensaje
    if (!history || history.length === 0) {

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(14);

      const msg = "El usuario no tiene historia clínica aún";
      doc.text(
        msg,
        doc.internal.pageSize.getWidth() / 2,
        60,
        { align: 'center' }
      );

      const d = new Date();
      const fname = `historiaClinica_${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}.pdf`;
      doc.save(fname);
      return; // ⛔ cortar ejecución
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    const lineHeight = 7;

    // 🟦 Ordenar turnos por fecha (cronológico)
    history = history.sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return da - db; // primero el más antiguo
    });

    for (let i = 0; i < history.length; i++) {

      const turno = history[i];
      const block = this.formatTurno(turno, i + 1).split('\n');

      for (const line of block) {

        const lines = doc.splitTextToSize(line, MAX_WIDTH);

        for (const l of lines) {

          if (y + lineHeight > PAGE_HEIGHT - 20) {
            doc.addPage();
            this.drawHeader(doc, "Historia Clínica");
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            y = 40;
          }

          doc.text(l, MARGIN, y);
          y += lineHeight;
        }
      }
    }

    // Separador entre turnos
    y += 5;
    doc.line(MARGIN, y, doc.internal.pageSize.getWidth() - MARGIN, y);
    y += 10;


    // Numeración de páginas
    const total = doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Página ${i} de ${total}`,
        doc.internal.pageSize.getWidth() / 2,
        PAGE_HEIGHT - 10,
        { align: 'center' }
      );
    }

    // Guardar PDF SIEMPRE como “historiaClinica”
    const d = new Date();
    const fname = `historiaClinica_${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}.pdf`;
    doc.save(fname);
  }


  // ---------------------------------------------------------
  //   ENCABEZADO
  // ---------------------------------------------------------
  private drawHeader(doc: jsPDF, title: string) {
    const MARGIN = 15;

    if (LOGO_BASE64 !== 'TU_LOGO_EN_BASE64_AQUI') {
      doc.addImage(LOGO_BASE64, 'PNG', MARGIN, 8, 25, 10);
    }

    const emission = new Date().toLocaleDateString('es-ES');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Fecha de emisión: ${emission}`,
      doc.internal.pageSize.getWidth() - MARGIN,
      12,
      { align: 'right' }
    );

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(
      title,
      doc.internal.pageSize.getWidth() / 2,
      25,
      { align: 'center' }
    );

    doc.line(MARGIN, 28, doc.internal.pageSize.getWidth() - MARGIN, 28);
  }


  // ---------------------------------------------------------
  //   FORMATO DE CADA TURNO  (SIN DESCRIPCIÓN)
  // ---------------------------------------------------------
  private formatTurno(t: any, index: number): string {

    return `
--- Turno #${index} ---
Paciente: ${t.user_name ?? 'No registrado'}
Especialista: ${t.specialist_name ?? 'No registrado'}
Especialidad: ${t.speciality ?? 'No registrado'}
Día: ${t.day ?? '-'} - Hora: ${t.time ?? '-'}

Altura: ${t.height ? t.height + ' cm' : 'No registrado'}
Peso: ${t.weight ? t.weight + ' kg' : 'No registrado'}
Presión: ${t.pressure ? t.pressure + ' mmHg' : 'No registrado'}
Temperatura: ${t.temperature ? t.temperature + ' °C' : 'No registrado'}
Datos: ${t.dynamic ?? 'No registrado'}

Comentario final: ${t.commentary ?? 'Sin comentario'}
Creado: ${this.formatDate(t.created_at)}
Estado: ${t.is_end ? 'Finalizado' : 'Cancelado'}
    `.trim();
  }


  private formatDate(d: string) {
    if (!d) return '-';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '-';
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  }


  private getBase64ImageFromURL(url: string) {
    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = url;
    });
  }

}
