import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class ExcelService {

  constructor() {}

  descargarExcel(users: any[], title: string) {
    if (!users || users.length === 0) return;

    // Armamos los datos del Excel
    const sheetData = users.map(user => ({
      Foto: user.first_photo_url || '',
      Nombre: `${user.first_name} ${user.last_name}`,
      Email: user.email,
      Edad: user.age,
      Dni: user.dni,
      Rol: user.role,
      Activo: user.is_active ? 'Activo' : 'Inactivo',
      Estado:
        user.status === 'approved'
          ? 'Aceptado'
          : user.status === 'pending'
          ? 'Pendiente'
          : user.status === 'rejected'
          ? 'Rechazado'
          : '-',
    }));

    // Crear la hoja
    const worksheet = XLSX.utils.json_to_sheet(sheetData);

    // Crear el libro
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');

    // Generar archivo
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    // Descargar
    const blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });
    saveAs(blob, `${title}.xlsx`);
  }
}
