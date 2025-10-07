import { Component } from '@angular/core';
import { User } from '@supabase/supabase-js';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { MessagesService } from '../../services/messages.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  role: 'paciente' | 'especialista' = 'paciente';
  registerForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.initForm();
  }

  setRole(role: 'paciente' | 'especialista') {
    this.role = role;
    this.initForm(); // reinicia con los campos del rol actual
  }

  initForm() {
    if (this.role === 'paciente') {
      this.registerForm = this.fb.group({
        first_name: ['', Validators.required],
        last_name: ['', Validators.required],
        edad: ['', [Validators.required, Validators.min(1)]],
        dni: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        obraSocial: [''],
        imagen1: [null],
        imagen2: [null],
      });
    } else {
      this.registerForm = this.fb.group({
        first_name: ['', Validators.required],
        last_name: ['', Validators.required],
        edad: ['', [Validators.required, Validators.min(1)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        dni: ['', Validators.required],
        especialidad: ['', Validators.required],
        otraEspecialidad: [''],  // <- campo oculto
        imagen: [null],
      });
    }
  }

  showOtraEspecialidad = false;

  onEspecialidadChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value;

    this.showOtraEspecialidad = value === 'otra';

    if (this.showOtraEspecialidad) {
      this.registerForm.get('otraEspecialidad')?.setValidators([Validators.required]);
    } else {
      this.registerForm.get('otraEspecialidad')?.clearValidators();
      this.registerForm.get('otraEspecialidad')?.setValue('');
    }

    this.registerForm.get('otraEspecialidad')?.updateValueAndValidity();
  }

  onFileSelected(event: any, field: string = 'imagen') {
    const file = event.target.files[0];
    if (file) {
      this.registerForm.patchValue({ [field]: file });
    }
  }

  onSubmit() {
    if (this.registerForm.invalid) return;
    console.log('Formulario enviado:', this.registerForm.value);
  }
}