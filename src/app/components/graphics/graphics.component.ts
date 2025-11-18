import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-graphics',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './graphics.component.html',
  styleUrl: './graphics.component.scss'
})
export class GraphicsComponent implements OnInit {
  chartsMap = new Map<string, Highcharts.Chart>();
  Highcharts: typeof Highcharts = Highcharts;

  dateFrom1: string | null = null;
  dateTo1: string | null = null;

  dateFrom2: string | null = null;
  dateTo2: string | null = null;

  weeks: { label: string; start: string; end: string }[] = [];
  selectedWeek: number | null = null;
  weeks2: { from: string; to: string; label: string }[] = [];
  selectedWeek2: any = null;

  currentPage: number = 1;

  goToPage(n: number) {
    this.currentPage = n;
    switch (n) {
      case 1:
        this.loadLogChart();
        break;
      case 2:
        this.loadTurnosPorEspecialidad();
        break;
      case 3:
        this.loadTurnosPorDia();
        break;
      case 4:
        this.generateWeeks(6);
        break;
      case 5:
        this.generateWeeks2(6);
        break;
    }
  }

  constructor(private supabaseService: SupabaseService) {

  }

  ngOnInit(): void {
    this.loadLogChart();
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // ======================================================
  // 1) LOG DE INGRESOS
  // ======================================================
  async loadLogChart() {
    const { data, error } = await this.supabaseService.client
      .from('audit_log')
      .select('*');

    if (error) {
      console.error(error);
      return;
    }

    const logsByDay: Record<string, number> = {};

    data.forEach((l: any) => {
      const rawDay = new Date(l.created_at).toISOString().split('T')[0]; // yyyy-mm-dd
      logsByDay[rawDay] = (logsByDay[rawDay] || 0) + 1;
    });

    // Ordenar por fecha real
    const sortedRawDays = Object.keys(logsByDay).sort();

    // Convertir a dd/mm/aaaa
    const days = sortedRawDays.map(d => this.formatDate(d));

    const counts = sortedRawDays.map(d => logsByDay[d]);

    const chart = Highcharts.chart('logChart', {
      chart: { type: 'line' },
      title: { text: 'Log de ingresos al sistema' },
      xAxis: {
        categories: days,
        title: { text: 'Día' }
      },
      yAxis: {
        title: { text: 'Cantidad de ingresos' },
        allowDecimals: false
      },
      series: [{
        name: 'Ingresos por día',
        type: 'line',
        data: counts
      }]
    });

    this.chartsMap.set('logChart', chart);
  }


  // ======================================================
  // 2) CANTIDAD DE TURNOS POR ESPECIALIDAD
  // ======================================================
  async loadTurnosPorEspecialidad() {
    const { data, error } = await this.supabaseService.client
      .from('appointments')
      .select('speciality');

    if (error) return;

    const conteo: any = {};

    data.forEach((t: any) => {
      conteo[t.speciality] = (conteo[t.speciality] || 0) + 1;
    });

    const categorias = Object.keys(conteo);
    const valores = Object.values(conteo);

    const chart = Highcharts.chart('perSpecialtyChart', {
      chart: { type: 'column' },
      title: { text: 'Turnos por Especialidad' },
      xAxis: { categories: categorias },
      yAxis: { title: { text: 'Cantidad' } },
      series: [{
        name: 'Turnos',
        type: 'column',
        data: valores as number[]
      }]
    });

    this.chartsMap.set('perSpecialtyChart', chart);
  }

  // ======================================================
  // 3) CANTIDAD DE TURNOS POR DÍA
  // ======================================================
  async loadTurnosPorDia() {
    const { data, error } = await this.supabaseService.client
      .from('appointments')
      .select('created_at');

    if (error) {
      console.error(error);
      return;
    }

    const conteo: Record<string, number> = {};

    data.forEach((t: any) => {
      const iso = t.created_at.split('T')[0]; // "2025-11-18"
      conteo[iso] = (conteo[iso] || 0) + 1;
    });

    // Ordenamos los días para que el gráfico quede prolijo
    const categoriasISO = Object.keys(conteo).sort();

    const categoriasFormateadas = categoriasISO.map(iso => {
      const [year, month, day] = iso.split('-');
      return `${day}/${month}/${year}`;
    });

    const valores = categoriasISO.map(k => conteo[k]);

    const chart = Highcharts.chart('perDayChart', {
      chart: { type: 'line' },
      title: { text: 'Turnos por Día' },
      xAxis: { categories: categoriasFormateadas },
      yAxis: { title: { text: 'Cantidad' } },
      series: [{
        name: 'Turnos',
        type: 'line',
        data: valores
      }]
    });

    this.chartsMap.set('perDayChart', chart);
  }

  // ======================================================
  // 4) TURNOS SOLICITADOS POR MÉDICO EN LAPSO
  // ======================================================
  async loadRequestedAppointments() {
    if (!this.dateFrom1 || !this.dateTo1) return;

    // 1) Obtener turnos en el rango
    const { data: appointments, error } = await this.supabaseService.client
      .from('appointments')
      .select('specialist_id, created_at')
      .gte('created_at', this.dateFrom1)
      .lte('created_at', this.dateTo1);

    if (error) {
      console.error(error);
      return;
    }

    // 2) Obtener solo los perfiles necesarios
    const specialistIds = [...new Set(appointments.map((t: any) => t.specialist_id))];

    const { data: profiles, error: profilesError } = await this.supabaseService.client
      .from('profiles')
      .select('auth_id, first_name, last_name')
      .in('auth_id', specialistIds);

    if (profilesError) {
      console.error(profilesError);
      return;
    }

    // Map de ID → Nombre completo
    const specialistMap: Record<string, string> = {};
    profiles.forEach((p: any) => {
      specialistMap[p.auth_id] = `${p.first_name} ${p.last_name}`;
    });

    // 3) Contar turnos por especialista usando nombre en vez de ID
    const conteo: Record<string, number> = {};

    appointments.forEach((t: any) => {
      const name = specialistMap[t.specialist_id] || 'Desconocido';
      conteo[name] = (conteo[name] || 0) + 1;
    });

    // 4) Render del gráfico con nombres
    const chart = Highcharts.chart('requestedChart', {
      chart: { type: 'bar' },
      title: { text: 'Turnos Solicitados por Médico' },
      xAxis: { categories: Object.keys(conteo) },
      yAxis: { title: { text: 'Cantidad' } },
      series: [{
        name: 'Solicitados',
        type: 'bar',
        data: Object.values(conteo)
      }]
    });
    this.chartsMap.set('requestedChart', chart);
  }


  // ======================================================
  // 5) TURNOS FINALIZADOS POR MÉDICO EN LAPSO
  // ======================================================
  async loadFinishedAppointments() {
    if (!this.dateFrom2 || !this.dateTo2) return;

    // 1) Obtener turnos finalizados dentro del rango
    const { data: appointments, error } = await this.supabaseService.client
      .from('appointments')
      .select('specialist_id, is_end, updated_at')
      .eq('is_end', true)
      .gte('updated_at', this.dateFrom2)
      .lte('updated_at', this.dateTo2);

    if (error) {
      console.error(error);
      return;
    }

    // Si no hay turnos, mostrar gráfico vacío pero sin romper
    if (!appointments || appointments.length === 0) {
      const chart = Highcharts.chart('finishedChart', {
        chart: { type: 'bar' },
        title: { text: 'Turnos Finalizados por Médico' },
        xAxis: { categories: [] },
        yAxis: { title: { text: 'Cantidad' } },
        series: [{ name: 'Finalizados', type: 'bar', data: [] }]
      });
      this.chartsMap.set('finishedChart', chart);
      return;
    }

    // 2) Obtener todos los specialist_id que figuran
    const specialistIds = [...new Set(appointments.map((t: any) => t.specialist_id))];

    // 3) Obtener perfiles (nombre y apellido)
    const { data: profiles, error: profilesError } = await this.supabaseService.client
      .from('profiles')
      .select('auth_id, first_name, last_name')
      .in('auth_id', specialistIds);

    if (profilesError) {
      console.error(profilesError);
      return;
    }

    // Map id → nombre completo
    const specialistMap: Record<string, string> = {};
    profiles.forEach((p: any) => {
      specialistMap[p.auth_id] = `${p.first_name} ${p.last_name}`;
    });

    // 4) Contar turnos por nombre del médico
    const conteo: Record<string, number> = {};

    appointments.forEach((t: any) => {
      const name = specialistMap[t.specialist_id] || 'Desconocido';
      conteo[name] = (conteo[name] || 0) + 1;
    });

    // 5) Crear gráfico
    const chart = Highcharts.chart('finishedChart', {
      chart: { type: 'bar' },
      title: { text: 'Turnos Finalizados por Médico' },
      xAxis: { categories: Object.keys(conteo) },
      yAxis: { title: { text: 'Cantidad' } },
      series: [{
        name: 'Finalizados',
        type: 'bar',
        data: Object.values(conteo)
      }]
    });
    this.chartsMap.set('finishedChart', chart);
  }

  // ======================================================
  // DESCARGA PDF
  // ======================================================
  async downloadPdf(chartId: string) {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) return;

    // convertir a PNG usando HTMLCanvas
    const canvas = await html2canvas(chartElement);

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");

    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "PNG", 5, 5, width - 10, height - 10);

    pdf.save(`${chartId}.pdf`);
  }

  // ======================================================
  // DESCARGA EXCEL
  // ======================================================
  downloadExcel(chartId: string) {
    const chart = this.chartsMap.get(chartId);

    if (!chart) {
      console.error("No se encontró el chart:", chartId);
      return;
    }

    const categories = chart.xAxis[0].categories;
    const series = chart.series[0].data;

    const data = categories.map((c: any, i: number) => ({
      categoria: c,
      valor: series[i].y
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Datos");

    XLSX.writeFile(wb, `${chartId}.xlsx`);
  }

  generateWeeks(count: number) {
    const today = new Date();

    // Empezar desde la semana actual (lunes)
    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // lunes

    for (let i = 0; i < count; i++) {
      const start = new Date(currentMonday);
      start.setDate(currentMonday.getDate() - 7 * i);

      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      this.weeks.push({
        label: `Lun ${start.getDate()}/${start.getMonth() + 1} - Dom ${end.getDate()}/${end.getMonth() + 1}`,
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0]
      });
    }

    // Ordenar para que la semana más reciente esté primero
    this.weeks.sort((a, b) => (a.start < b.start ? 1 : -1));
  }

  selectWeek(index: number) {
    this.selectedWeek = index;
    this.dateFrom1 = this.weeks[index].start;
    this.dateTo1 = this.weeks[index].end;
    this.loadRequestedAppointments();
  }

  generateWeeks2(cantSemanas: number = 8) {
    this.weeks2 = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < cantSemanas; i++) {
      // Obtener lunes de esta semana
      const monday = new Date(today);
      const day = monday.getDay(); // 0=domingo, 1=lunes ...
      const diffToMonday = day === 0 ? -6 : 1 - day;
      monday.setDate(monday.getDate() + diffToMonday - i * 7);

      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);

      this.weeks2.push({
        from: monday.toISOString().split("T")[0],
        to: sunday.toISOString().split("T")[0],
        label: `Lun ${monday.getDate()}/${monday.getMonth() + 1} - Dom ${sunday.getDate()}/${sunday.getMonth() + 1}`
      });
    }
  }

  selectWeek2(week: any) {
    this.selectedWeek2 = week;
    this.dateFrom2 = week.from;
    this.dateTo2 = week.to;
    this.loadFinishedAppointments();
  }
}
