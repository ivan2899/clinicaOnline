export interface Appointment {
  specialist_id: string,
  user_id: string,
  speciality: string,
  day: string,
  time: string,
  is_confirm: boolean,
  created_at: string;
}