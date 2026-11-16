export const DEFAULT_LEGAL_CONFIG = {
  companyName: 'STRONG GYM S.A.S.',
  tradeName: 'STRONG GYM',
  nit: '901.000.000-1',
  email: 'esamyrd@gmail.com',
  supportEmail: 'esamyrd@gmail.com',
  phone: '+57 300 123 4567',
  address: 'Sede Principal, Colombia',
  jurisdiction: 'República de Colombia',
  termsVersion: 'v1.0',
  privacyVersion: 'v1.0',
  cookiesVersion: 'v1.0',
  lastUpdated: '2026-11-10'
};

export const buildLegalDocuments = (cfg = DEFAULT_LEGAL_CONFIG) => ({
  privacy: {
    id: 'privacy',
    title: 'Política de Privacidad y Tratamiento de Datos Personales',
    shortTitle: 'Política de Tratamiento de Datos',
    version: cfg.privacyVersion || 'v1.0',
    lastUpdated: cfg.lastUpdated || '2026-11-10',
    sections: [
      {
        heading: '1. Responsable del Tratamiento de Datos',
        body: `${cfg.companyName} (en adelante "${cfg.tradeName}"), identificada con NIT ${cfg.nit}, con domicilio en ${cfg.address} y correo electrónico oficial para notificaciones legales ${cfg.email}, actúa como Responsable del Tratamiento de los Datos Personales recolectados en esta plataforma, en cumplimiento de la Ley Estatutaria 1581 de 2012, el Decreto 1377 de 2013 (Habeas Data) y normas concordantes.`
      },
      {
        heading: '2. Qué Datos Personales Recopilamos',
        body: `Al registrarte y utilizar ${cfg.tradeName}, recopilamos de forma transparente:\n• Datos de identificación y contacto: Nombre completo, documento de identidad (Cédula/DNI), correo electrónico, teléfono y fotografía de perfil.\n• Credenciales y seguridad: Contraseña almacenada bajo cifrado irreversible (hash bcrypt), códigos PIN de verificación, dirección IP, fecha, hora y versión de aceptación de términos.\n• Datos de salud y antropometría (opcionales): Enfermedades, cirugías previas, lesiones, medicamentos, peso, estatura y medidas corporales.\n• Datos de uso y transacciones: Membresías activas, progreso de rutinas y compras en tienda o punto de venta.`
      },
      {
        heading: '3. Para Qué Usamos tus Datos (Finalidades)',
        body: `Tus datos se utilizan exclusivamente para:\n• Crear, verificar (mediante código PIN) y administrar tu cuenta de socio.\n• Gestionar tu membresía, estado de suscripción, código QR y acceso a las instalaciones.\n• Diseñar rutinas de entrenamiento seguras y adaptadas a tus condiciones físicas.\n• Enviar correos transaccionales (códigos de verificación, recuperación de clave, alertas de vencimiento de plan) y brindar soporte técnico.`
      },
      {
        heading: '4. Con Quién Compartimos tu Información',
        body: `${cfg.tradeName} NUNCA vende, alquila ni comercializa tus datos personales. Únicamente se comparten datos estrictamente necesarios con proveedores tecnológicos encargados de operar el servicio bajo confidencialidad:\n• Servicios de hosting e infraestructura de base de datos.\n• Servicio de almacenamiento de imágenes en la nube (Cloudinary).\n• Plataforma de envío de correos transaccionales (Resend).\n• Autoridades competentes cuando exista requerimiento legal.`
      },
      {
        heading: '5. Ejercicio de Derechos ARCO / Habeas Data',
        body: `Como titular de tus datos tienes derecho en todo momento a:\n• Consultar y Conocer tus datos registrados desde tu perfil.\n• Actualizar y Rectificar tu nombre, teléfono, contraseña y ficha médica.\n• Solicitar la Supresión (Eliminar Cuenta) directamente desde tu perfil o por solicitud escrita.\n• Revocar la autorización otorgada.\n\nCanal oficial de atención Habeas Data: ${cfg.email}`
      }
    ]
  },
  terms: {
    id: 'terms',
    title: 'Términos y Condiciones de Uso (T&C)',
    shortTitle: 'Términos y Condiciones',
    version: cfg.termsVersion || 'v1.0',
    lastUpdated: cfg.lastUpdated || '2026-11-10',
    sections: [
      {
        heading: '1. Contrato Legal Vinculante',
        body: `Estos Términos y Condiciones regulan el acceso y uso de la plataforma y servicios de ${cfg.tradeName} (${cfg.companyName}). Al marcar la casilla de consentimiento durante el registro, aceptas quedar legalmente vinculado por este contrato.`
      },
      {
        heading: '2. Reglas de Uso y Conductas Prohibidas',
        body: `Para mantener una comunidad segura, queda estrictamente prohibido:\n• Suplantar la identidad de otros usuarios o compartir credenciales/membresías personales.\n• Enviar spam, realizar ataques informáticos, inyectar código malicioso o intentar vulnerar la seguridad del servidor.\n• Realizar conductas indebidas, agresivas o discriminatorias contra socios o entrenadores.\n• Incumplir las normas de higiene y seguridad del gimnasio (es obligatorio el uso de toalla personal, ropa deportiva y la devolución del equipo a su lugar).`
      },
      {
        heading: '3. Propiedad Intelectual',
        body: `Todos los derechos sobre la marca "${cfg.tradeName}", logotipos, diseño de interfaz, código fuente, catálogos, textos, gráficos y estructuras de rutinas son propiedad exclusiva de ${cfg.companyName}. Queda prohibida su copia, distribución o uso comercial sin autorización expresa.`
      },
      {
        heading: '4. Limitación de Responsabilidad',
        body: `• Aptitud médica: El usuario declara encontrarse apto para realizar actividad física y se compromete a informar cualquier lesión o antecedente médico.\n• Disponibilidad técnica: ${cfg.tradeName} no será responsable por interrupciones temporales derivadas de mantenimientos, caídas de proveedores de internet/hosting o mal uso de las credenciales por parte del usuario o terceros.`
      },
      {
        heading: '5. Suspensión o Eliminación de Cuenta sin Previo Aviso',
        body: `${cfg.tradeName} podrá suspender o eliminar definitivamente una cuenta sin previo aviso cuando detecte:\n• Registro con datos falsos o suplantación de identidad.\n• Fraude, abuso del sistema o intentos de vulneración informática.\n• Faltas graves a la convivencia o daños intencionales a las instalaciones del gimnasio.`
      }
    ]
  },
  cookies: {
    id: 'cookies',
    title: 'Política de Cookies y Almacenamiento Local',
    shortTitle: 'Política de Cookies',
    version: cfg.cookiesVersion || 'v1.0',
    lastUpdated: cfg.lastUpdated || '2026-11-10',
    sections: [
      {
        heading: '1. Uso de Cookies y Almacenamiento Local',
        body: `Nuestra plataforma web utiliza cookies y almacenamiento local (LocalStorage) para mantener tu sesión activa de forma segura, recordar tus preferencias visuales y analizar el rendimiento del servicio.`
      },
      {
        heading: '2. Categorías de Cookies',
        body: `• Técnicas y Esenciales (Obligatorias): Necesarias para el inicio de sesión seguro mediante tokens JWT, protección contra ataques y registro de tu consentimiento legal.\n• Preferencias y Funcionalidad (Opcionales): Guardan tus filtros de búsqueda y preferencias de interfaz.\n• Analíticas y Rendimiento (Opcionales): Permiten medir de forma estadística y anónima el tráfico y uso de funciones para mejorar la plataforma.`
      },
      {
        heading: '3. Control y Configuración',
        body: `Al ingresar a la web puedes Aceptar todas, Rechazar las no esenciales o Configurar tus preferencias en el banner de consentimiento antes de que se almacenen cookies opcionales. También puedes cambiar tu configuración en cualquier momento.`
      }
    ]
  },
  notice: {
    id: 'notice',
    title: 'Aviso Legal e Identificación del Titular',
    shortTitle: 'Aviso Legal',
    version: 'v1.0',
    lastUpdated: cfg.lastUpdated || '2026-11-10',
    sections: [
      {
        heading: '1. Datos Identificativos del Responsable Legal',
        body: `En cumplimiento de las normas de comercio electrónico y protección al consumidor (Ley 527 de 1999 y Ley 1480 de 2011), se informa a los usuarios los datos del titular legal de esta plataforma:\n\n• Titular / Razón Social: ${cfg.companyName}\n• Nombre Comercial: ${cfg.tradeName}\n• Identificación Fiscal (NIT): ${cfg.nit}\n• Domicilio: ${cfg.address}\n• Correo Oficial para Notificaciones Legales: ${cfg.email}\n• Teléfono de Contacto: ${cfg.phone}`
      },
      {
        heading: '2. Canal Oficial para Notificaciones Legales',
        body: `Toda comunicación formal, notificación judicial, solicitud de derechos de Habeas Data (ARCO) o reclamación legal deberá dirigirse al correo electrónico oficial: ${cfg.email}.`
      },
      {
        heading: '3. Legislación y Jurisdicción Aplicable',
        body: `El presente Aviso Legal y el uso de la plataforma se rigen por las leyes de la ${cfg.jurisdiction}.`
      }
    ]
  }
});
