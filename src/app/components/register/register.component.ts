import { Component, ElementRef, ViewChild } from '@angular/core';
import { User } from '@supabase/supabase-js';
import { Route, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { MessagesService } from '../../services/messages.service';
import { dniValidator } from '../../validators/dni.validator';
import { passwordMatchValidator } from '../../validators/password-match.validator';
import { UploadService } from '../../services/upload.service';
import { AppointmentService } from '../../services/appointment.service';
import { RecaptchaModule, RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  role: 'paciente' | 'admin' | 'especialista' = 'paciente';
  registerForm!: FormGroup;
  especialidades: any;
  especialidadSeleccionada: string | null = null;
  showOtraEspecialidad = false;
  showModal = false;
  selectedFiles: { photo?: File; photo2?: File } = {};
  path: string = '';
  pathDos: string = '';
  public isSubmitted: boolean = false;
  public captchaToken: string | null = null;


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private supabaseService: SupabaseService,
    private messagesService: MessagesService,
    private uploadService: UploadService,
    private appointmentService: AppointmentService
  ) {  }

  async ngOnInit() {
    this.initForm();
    const res = await this.appointmentService.getSpecialitys();
    if (res && res.data) {
      this.especialidades = res.data.map((e: any) => e.speciality);
    }
  }

  setRole(role: 'paciente' | 'especialista') {
    this.role = role;
    this.initForm(); // reinicia con los campos del rol actual
  }

  initForm() {
    if (this.role === 'paciente') {
      this.registerForm = this.fb.group({
        firstName: ['', [Validators.required, Validators.minLength(3)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        age: ['', [Validators.required, Validators.min(16), Validators.max(120)]],
        dni: ['', [Validators.required, dniValidator]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        healtInsurance: [''],
      }, { validators: passwordMatchValidator });
    } else {
      this.registerForm = this.fb.group({
        firstName: ['', [Validators.required, Validators.minLength(3)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        age: ['', [Validators.required, Validators.min(16), Validators.max(120)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        dni: ['', [Validators.required, dniValidator]],
        especialidad: ['', Validators.required],
        otraEspecialidad: [{ value: '', disabled: true }],
      }, { validators: passwordMatchValidator });
    }
  }

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

  resolved(token: string | null) {
    this.captchaToken = token;
    console.log(`Token reCAPTCHA: ${token}`);

    // Opcional: Si estás usando el modo invisible, puedes enviar el formulario aquí
    if (this.isSubmitted && token) {
      this.onSubmit();
    }
  }

  async onSubmit() {
    if (this.registerForm.invalid) return;
    const registro = await this.register();
    console.log('Formulario enviado:', this.registerForm.value);
    this.registerForm.reset();

    // 🔹 Limpia el input file manualmente
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    // 🔹 (opcional) Resetear texto del label
    const fileLabel = document.getElementById('fileLabel');
    if (fileLabel) fileLabel.textContent = 'Seleccionar imagen';
  }

  seleccionarEspecialidad(esp: string) {
    this.especialidadSeleccionada = esp;
    this.showOtraEspecialidad = false;

    this.registerForm.patchValue({ especialidad: esp, otraEspecialidad: '' });
    this.registerForm.get('otraEspecialidad')?.disable(); // 🔹 se desactiva
  }

  toggleOtraEspecialidad() {
    this.showOtraEspecialidad = true;
    this.especialidadSeleccionada = null;

    this.registerForm.patchValue({ especialidad: '' });
    this.registerForm.get('otraEspecialidad')?.enable(); // 🔹 se activa
  }

  async register() {
    const { data, error } = await this.supabaseService.signUp(this.registerForm.value.email, this.registerForm.value.confirmPassword);

    if (error) {
      this.error(this.traducirError(error.message));
      return;
    }
    if (this.registerForm.invalid) return;


    if (data.user) {
      try {
        const file = this.selectedFiles.photo;
        if (!file) return

        console.log('file: ', file);

        // 🔹 Subir imagen comprimida y obtener URL
        const base64 = await this.uploadService.fileToBase64(file)

        const compressedBlob = await this.uploadService.compressImage(base64, 0.8)

        // 🔹 Generar ruta
        const fileExt = file.name.split('.').pop();
        const filePath = `clients/${this.role}/${Date.now()}.${fileExt}`;

        // 🔹 Guardar la URL en el formulario para pasársela a saveUserData()
        const publicUrl = await this.uploadService.uploadPhoto('images', filePath, compressedBlob);
        console.log('Form antes de patchValue:', this.registerForm);
        this.path = publicUrl
        console.log('Form después de patchValue:', this.registerForm.value);
      } catch (error) {
        console.error('❌ Falló la subida:', error);
        console.error('🧱 Error completo:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      }

      if (this.role == 'paciente') {
        try {
          const file2 = this.selectedFiles.photo2;
          if (!file2) return

          console.log('file2: ', file2);

          // 🔹 Subir imagen comprimida y obtener URL
          const base64 = await this.uploadService.fileToBase64(file2)

          const compressedBlob = await this.uploadService.compressImage(base64, 0.8)

          // 🔹 Generar ruta
          const fileExt = file2.name.split('.').pop();
          const filePath = `clients/${this.role}/${Date.now()}.${fileExt}`;

          // 🔹 Guardar la URL en el formulario para pasársela a saveUserData()
          const publicUrl = await this.uploadService.uploadPhoto('images', filePath, compressedBlob);
          this.pathDos = publicUrl
        } catch (error) {
          console.error('❌ Falló la subida:', error);
        }
      }

      await this.saveUserData(data.user);
    }
  }

  private async saveUserData(user: User) {
    const { data: existe, error: errorCheck } = await this.supabaseService.userExists(this.registerForm.value.email);

    if (errorCheck) {
      this.error("Hubo un problema al verificar el usuario");
      return;
    }

    if (existe && existe.length > 0) {
      this.error("El usuario ya está registrado");
      return;
    }


    switch (this.role) {
      case 'paciente':
        const { error: pacienteError } = await this.supabaseService.saveUserDataPac(
          user,
          this.registerForm.value.firstName,
          this.registerForm.value.lastName,
          this.registerForm.value.age,
          this.registerForm.value.dni,
          this.registerForm.value.email,
          this.registerForm.value.healtInsurance,
          this.path,
          this.pathDos
        );

        if (pacienteError) {
          this.error("Hubo un problema al registrar el paciente");
        } else {
          this.router.navigate(['/home']);
        }
        break;

      case 'admin':
        const { error: adminError } = await this.supabaseService.saveUserAdmin(
          user,
          this.registerForm.value.firstName,
          this.registerForm.value.lastName,
          this.registerForm.value.age,
          this.registerForm.value.dni,
          this.registerForm.value.email,
          this.path
        );

        if (adminError) {
          this.error("Hubo un problema al registrar el admin");
        } else {
          this.messagesService.succesMessage('Recibido', 'Su usuario se agregó con éxito, confirme el correo para poder ingresar')
          this.router.navigate(['/home']);
        }
        break;

      case 'especialista':
        const { error: especialistaError } = await this.supabaseService.saveUserDataEspecialist(
          user,
          this.registerForm.value.firstName,
          this.registerForm.value.lastName,
          this.registerForm.value.age,
          this.registerForm.value.dni,
          this.registerForm.value.email,
          this.registerForm.value.specialty,
          this.path
        );

        if (especialistaError) {
          this.error("Hubo un problema al registrar el especialista");
        } else {
          this.router.navigate(['/home']);
        }
        break;
    }
  }

  private error(mensaje: string) {
    this.messagesService.errorMessage('Error', mensaje);
  }

  private traducirError(codigo: string): string {
    console.log(codigo);

    switch (codigo) {
      case 'Invalid login credentials':
        return 'Credenciales inválidas. Verifique su Correo y Clave.';
      case 'Email not confirmed':
        return 'Debe confirmar su correo antes de iniciar sesión.';
      case 'User not found':
        return 'El usuario no existe en el sistema.';
      case 'Password should be at least 6 characters.':
        return 'La contraseña debe tener al menos 6 caracteres.';
      case 'User already registered':
        return 'El email ya se encuentra registrado.';
      case 'Unable to validate email address: invalid format':
        return 'El email no tiene un formato correcto';
      default:
        return 'Ocurrió un error inesperado. Intente nuevamente.';
    }
  }

  private async procesarYSubirImagen(file: File, role: string, tipo: string): Promise<string | null> {
    if (!file) {
      console.warn(`⚠️ No se seleccionó archivo para ${tipo}`);
      return null;
    }

    try {
      // Convertir a base64
      const base64 = await this.uploadService.fileToBase64(file);

      // Comprimir
      const compressedBlob = await this.uploadService.compressImage(base64, 0.8);

      // Generar ruta
      const fileExt = file.name.split('.').pop();
      const filePath = `clients/${role}/${Date.now()}-${tipo}.${fileExt}`;

      // Subir al bucket 'images'
      const publicUrl = await this.uploadService.uploadPhoto('images', filePath, compressedBlob);
      console.log(`✅ ${tipo} subida correctamente:`, publicUrl);

      return publicUrl;
    } catch (error) {
      console.error(`❌ Falló la subida de ${tipo}:`, error);
      return null;
    }
  }

  abrirModal() {
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
    this.showOtraEspecialidad = false;
  }

  guardarEspecialidad() {
    if (this.showOtraEspecialidad) {
      const otra = this.registerForm.get('otraEspecialidad')?.value;
      if (!otra) {
        console.warn('Ingrese la especialidad');
        return;
      }
      this.especialidadSeleccionada = otra;
    }

    console.log('Especialidad seleccionada:', this.especialidadSeleccionada);
    this.cerrarModal();
  }
}