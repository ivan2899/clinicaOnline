# 🏥 Clinica online

![Angular](https://img.shields.io/badge/Angular-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)


Aplicación web de gestión médica que permite administrar turnos, historial clínico y atención de pacientes en tiempo real, con control de acceso por roles (paciente, especialista y administrador).

## ⚙️ Instalación y ejecución

```bash
git clone https://github.com/ivan2899/clinicaOnline.git
cd clinicaOnline
npm install
ng serve
```
Luego, abrir en el navegador:
[Localhost](http://localhost:4200/)

---

🌍 **Demo online:**  
👉 https://clinicaonline-2a62f.web.app

---

🚀 Funcionalidades principales

🔐 Registro e inicio de sesión con verificación por correo electrónico

👨‍⚕️ Gestión de usuarios por roles:
    
    Pacientes
    Especialistas
    Administradores

📅 Gestión de turnos médicos:

    Solicitud de turnos por parte del paciente
    Selección de especialista y especialidad
    Asignación de fecha y horario
    Confirmación y cancelación de turnos
    Estados del turno (activo, cancelado, finalizado)

🩺 Historia clínica digital:

    Registro de consultas médicas
    Carga de datos clínicos (altura, peso, presión, temperatura)
    Observaciones y diagnósticos
    Campos dinámicos personalizados por consulta

⭐ Encuestas de atención médica:

    Calificación del servicio (atención, limpieza, lugar)
    Comentarios de los pacientes

📊 Panel de administración:

    Visualización de encuestas realizadas
    Seguimiento de la actividad de los turnos
    Acceso a estadísticas del sistema

🖼️ Gestión de perfiles:

    Carga de imagen de usuario
    Visualización de datos personales

🔎 Visualización de historial:

    Acceso al historial de turnos del paciente
    Acceso al historial de pacientes para especialistas

---

## 🛠️ Tecnologías

- Angular
- TypeScript
- Supabase
- PostgreSQL
- Firebase

## 🧠 Conceptos aplicados

- Arquitectura basada en servicios
- Manejo de roles y autorización
- Uso de características avanzadas de Angular (Pipes, Directivas y Guards)
- Realtime con Supabase
- Exportación de datos (PDF / Excel)
- Visualización con Highcharts

---

## 🧩 Arquitectura y decisiones técnicas

El sistema está basado en una arquitectura cliente-servidor utilizando Supabase como Backend as a Service (BaaS), integrando autenticación, base de datos y funcionalidades en tiempo real.

- Autenticación gestionada con Supabase Auth para control seguro de sesiones
- Base de datos relacional en PostgreSQL para mantener integridad de datos
- Uso de JSONB para almacenar datos dinámicos en la historia clínica sin rigidez estructural
- Separación entre turnos activos e historial médico para mantener trazabilidad y evitar mutaciones de datos históricos
- Control de acceso mediante guards en Angular según roles (paciente, especialista, administrador)
- Uso de directivas para renderizado condicional y dinámico del DOM
- Uso de pipes para formateo y transformación de datos en la interfaz

---

## Home
> Es el inicio de la web, te redirecciona aquí al empezar.

![Inicio](https://akcxrjaizfewxxpuaaxp.supabase.co/storage/v1/object/public/images/readme/home/welcome.png)

> Una vez iniciada la sesión, dependiendo del rol del usuario se mostrará una página principal u otra 
![Admin](https://akcxrjaizfewxxpuaaxp.supabase.co/storage/v1/object/public/images/readme/home/admin.png)
![Especialista](https://akcxrjaizfewxxpuaaxp.supabase.co/storage/v1/object/public/images/readme/home/specialist.png)
![Paciente](https://akcxrjaizfewxxpuaaxp.supabase.co/storage/v1/object/public/images/readme/home/patient.png)

## Login
> Es el inicio de sesión de la web, el paciente deberá verificar su correo para poder ingresar por primera vez, y si es un Especialista, va a tener que ser aceptado por un administrador.
![Inicio de sesion](https://akcxrjaizfewxxpuaaxp.supabase.co/storage/v1/object/public/images/readme/login/login.png)

> En caso de que no confirme o no sea aceptado se visualizará de la siguiente manera
![Sin confirmar](https://akcxrjaizfewxxpuaaxp.supabase.co/storage/v1/object/public/images/readme/login/noconfirm.png)
![Sin aprobar](https://akcxrjaizfewxxpuaaxp.supabase.co/storage/v1/object/public/images/readme/login/noapproved.png)

## Register
> Esta zona es para que los usuarios puedan registrarse, para agregar un admin únicamente lo puede hacer otro con el mismo rol
* Registro para paciente
![RegistroP](https://akcxrjaizfewxxpuaaxp.supabase.co/storage/v1/object/public/images/readme/register/registerp.png)
* Registro para especialista
![RegistroE](https://akcxrjaizfewxxpuaaxp.supabase.co/storage/v1/object/public/images/readme/register/registere.png)
* Elección de especialidad
![EleccionE](https://akcxrjaizfewxxpuaaxp.supabase.co/storage/v1/object/public/images/readme/register/registeree.png)

## About me
> Es una pequeña descripción sobre mí y sobre el proyecto con la información al momento de realizar el mismo
![Sobre mi](https://akcxrjaizfewxxpuaaxp.supabase.co/storage/v1/object/public/images/readme/about/aboutme.png)

## Perfil
> Es una descripción del usuario y una acción especial para cada rol
![Especialista](https://akcxrjaizfewxxpuaaxp.supabase.co/storage/v1/object/public/images/readme/profile/specialist.png)

## Sección gráficos
> Apartado para descargar pdf y/o excels de diferentes tipos de gráficos
![Logs](https://akcxrjaizfewxxpuaaxp.supabase.co/storage/v1/object/public/images/readme/graphics/logs.png)
![Especialidad](https://akcxrjaizfewxxpuaaxp.supabase.co/storage/v1/object/public/images/readme/graphics/especialidad.png)
![Turnos](https://akcxrjaizfewxxpuaaxp.supabase.co/storage/v1/object/public/images/readme/graphics/turnos.png)

---

### Paciente
Como paciente podemos acceder a diferentes opciones como 
* :one: Mi perfil
* :two: Historia clínica
* :three: Solicitar turno
* :four:  Mis turnos pendientes

### Especialista
Como especialista podemos acceder a diferentes opciones como 
* :one: Mi perfil
* :two: Historia clínica
* :three: Mis turnos
* :four: Mis horarios

### Admin
Como admin podemos acceder a diferentes opciones como 
* :one: Mi perfil
* :two: Historia clínica
* :three: Mis turnos
* :four: Sector usuarios

---
### 🧪 Usuario de prueba

Para los usuarios de prueba hay un acceso rápido para poder probar las funcionalidades
![Prueba](https://akcxrjaizfewxxpuaaxp.supabase.co/storage/v1/object/public/images/readme/login/quick.png)

---

## 📌 Estado del proyecto

> Proyecto finalizado / en mejora continua 🚧

---

## 👨‍💻 Autor

- Ivan Cordoba

### 📬 Contacto

- Mail: ivan.cordoba2002@gmail.com
- LinkedIn: https://linkedin.com/in/ivan-cordoba-90b499253
- Portfolio: https://portfolio-nu-one-nnnc3y3ixn.vercel.app/

---

## 🚀 Conclusión

Este proyecto fue desarrollado con el objetivo de simular un entorno real de gestión médica, aplicando buenas prácticas de desarrollo, manejo de datos y control de acceso por roles.

Se enfoca en la escalabilidad, mantenibilidad y experiencia de usuario, integrando tecnologías modernas como Angular y Supabase.

---