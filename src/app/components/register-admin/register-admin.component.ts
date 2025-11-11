import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { dniValidator } from '../../validators/dni.validator';
import { passwordMatchValidator } from '../../validators/password-match.validator';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-admin',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './register-admin.component.html',
  styleUrl: './register-admin.component.scss'
})
export class RegisterAdminComponent {
  registerForm!: FormGroup;
  selectedFiles: { photo?: File; photo2?: File } = {};

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  initForm() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      age: ['', [Validators.required, Validators.min(16), Validators.max(120)]],
      dni: ['', [Validators.required, dniValidator]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });
  }

  onFileSelected(event: any, controlName: 'photo' | 'photo2') {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFiles[controlName] = file;
  }

  soloNumeros(event: KeyboardEvent) {
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }

  async onSubmit() {
    /*if (this.registerForm.invalid) return;
    const registro = await this.register();
    console.log('Formulario enviado:', this.registerForm.value);
    this.registerForm.reset();

    // 🔹 Limpia el input file manualmente
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    // 🔹 (opcional) Resetear texto del label
    const fileLabel = document.getElementById('fileLabel');
    if (fileLabel) fileLabel.textContent = 'Seleccionar imagen';*/
  }
}
