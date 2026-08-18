import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

export type LegalDocumentType = 'terms' | 'privacy';

interface LegalSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

@Component({
  selector: 'app-legal-modal',
  standalone: true,
  imports: [],
  templateUrl: './legal-modal.html',
})
export class LegalModalComponent {
  @Input({ required: true }) documentType: LegalDocumentType = 'terms';
  @Output() close = new EventEmitter<void>();

  private readonly termsSections: LegalSection[] = [
    {
      title: '1. Alcance del servicio',
      paragraphs: [
        'FinCoach es una herramienta de organización y análisis financiero personal. Permite registrar un perfil, movimientos y deudas; consultar resúmenes; recibir propuestas de clasificación; observar la evolución de periodos y acceder a recomendaciones informativas.',
        'El servicio no se conecta directamente con entidades bancarias, no ejecuta pagos, transferencias, inversiones ni solicitudes de crédito y no sustituye documentos oficiales de una entidad financiera.'
      ]
    },
    {
      title: '2. Cuenta y datos declarados',
      paragraphs: [
        'La persona usuaria se compromete a proteger sus credenciales, mantener actualizada la información que decida registrar y no utilizar cuentas ajenas. Los análisis dependen de los datos declarados y del historial disponible; información incompleta o incorrecta puede producir resultados limitados.'
      ]
    },
    {
      title: '3. Clasificaciones y modelos analíticos',
      paragraphs: [
        'FinCoach utiliza modelos analíticos para proponer categorías, regularidades, estados temporales y recomendaciones. Estas respuestas pueden incluir porcentajes de confianza, alternativas o una indicación de evidencia insuficiente.',
        'Una propuesta del sistema no se considera una verdad absoluta. La persona puede confirmar o corregir la clasificación de un movimiento. Los estados describen un periodo y no definen permanentemente la identidad, responsabilidad o capacidad financiera de una persona.'
      ]
    },
    {
      title: '4. Uso responsable',
      bullets: [
        'Utilizar FinCoach únicamente para fines personales y legítimos.',
        'No intentar acceder a datos, cuentas o recursos pertenecientes a otra persona.',
        'No alterar, interferir o someter el servicio a actividades que afecten su seguridad o disponibilidad.',
        'No utilizar resultados de FinCoach para negar automáticamente empleo, crédito, seguros, vivienda u otras oportunidades.',
        'No presentar una clasificación o recomendación como diagnóstico profesional o calificación oficial.'
      ]
    },
    {
      title: '5. Límites de las recomendaciones',
      paragraphs: [
        'Las recomendaciones son orientaciones generales para apoyar la comprensión y organización del dinero. No constituyen asesoría financiera, crediticia, tributaria, legal, contable, aseguradora ni de inversión.',
        'Antes de tomar una decisión con consecuencias importantes, la persona debe revisar su situación completa y, cuando corresponda, consultar a un profesional autorizado. FinCoach procura no recomendar reducciones que comprometan alimentación, salud, vivienda indispensable u otras necesidades esenciales.'
      ]
    },
    {
      title: '6. Disponibilidad y cambios',
      paragraphs: [
        'El servicio puede recibir mantenimiento, incorporar mejoras o modificar funciones. Los cambios relevantes en estos términos serán informados de manera visible. La continuidad en el uso después de su entrada en vigor implicará la aceptación de la versión actualizada, salvo que la legislación aplicable exija una aceptación diferente.'
      ]
    },
    {
      title: '7. Suspensión o cierre',
      paragraphs: [
        'FinCoach podrá limitar una cuenta cuando exista uso fraudulento, intento de acceso no autorizado, afectación de la seguridad o incumplimiento grave de estos términos. La persona podrá solicitar el cierre de su cuenta y el tratamiento de sus datos se realizará conforme a la Política de privacidad y a las obligaciones legales aplicables.'
      ]
    },
    {
      title: '8. Legislación aplicable',
      paragraphs: [
        'Estos términos se interpretan junto con las normas de protección al consumidor, contratación electrónica, datos personales y demás disposiciones obligatorias del país donde se ofrezca el servicio. Ninguna cláusula busca limitar derechos que una norma local reconozca como irrenunciables.'
      ]
    }
  ];

  private readonly privacySections: LegalSection[] = [
    {
      title: '1. Alcance y responsable',
      paragraphs: [
        'Esta política explica el tratamiento de datos personales realizado por FinCoach. El equipo responsable de la operación administra los datos necesarios para prestar el servicio y debe habilitar un canal identificable para consultas, solicitudes y reclamos en el entorno donde se publique la aplicación.',
        'La legislación aplicable depende del país desde el cual se ofrece el servicio. Cuando una norma nacional conceda una protección mayor, prevalecerán sus disposiciones.'
      ]
    },
    {
      title: '2. Datos tratados',
      bullets: [
        'Datos de cuenta: nombre, apellido, correo electrónico, credenciales protegidas e identificadores internos.',
        'Datos del perfil: actividad, modalidades de ingreso, ingreso mensual, hábito de ahorro, objetivos, hobbies, responsabilidades y nivel declarado de endeudamiento.',
        'Información financiera registrada: ingresos, gastos, descripciones, valores, fechas, categorías, regularidad, deudas y pagos.',
        'Resultados analíticos: clasificaciones, porcentajes de confianza, alternativas, estados, recomendaciones, confirmaciones y correcciones.',
        'Datos técnicos indispensables para autenticación, seguridad, diagnóstico y funcionamiento del servicio.'
      ]
    },
    {
      title: '3. Finalidades',
      bullets: [
        'Crear y proteger la cuenta de la persona usuaria.',
        'Construir y actualizar el perfil financiero declarado.',
        'Registrar, clasificar y presentar movimientos y deudas.',
        'Calcular resúmenes, indicadores, comparaciones temporales y recomendaciones explicables.',
        'Permitir la confirmación o corrección humana y conservar la trazabilidad de esa decisión.',
        'Prevenir accesos indebidos, resolver errores y mejorar la calidad del servicio mediante procesos controlados.',
        'Atender solicitudes relacionadas con los datos personales y cumplir obligaciones legales aplicables.'
      ]
    },
    {
      title: '4. Principios de tratamiento',
      paragraphs: [
        'FinCoach aplica como criterios regionales la licitud, lealtad, transparencia, finalidad determinada, minimización, calidad, seguridad, confidencialidad y responsabilidad demostrada. Los datos no deben utilizarse para una finalidad incompatible con la informada ni conservarse por un tiempo superior al necesario.'
      ]
    },
    {
      title: '5. Tratamiento automatizado y supervisión humana',
      paragraphs: [
        'Los modelos de FinCoach apoyan la clasificación y el análisis, pero pueden equivocarse o abstenerse cuando falta evidencia. La interfaz muestra la confianza disponible y permite confirmar o corregir movimientos antes de consolidar su clasificación.',
        'Los resultados no se utilizan para adoptar automáticamente decisiones crediticias, laborales, aseguradoras o comerciales. La ocupación, los hobbies, los ingresos o una situación temporal no se convierten en juicios morales ni en una calificación permanente.'
      ]
    },
    {
      title: '6. Base para el tratamiento',
      paragraphs: [
        'El tratamiento se sustenta, según la legislación del país aplicable, en la autorización informada de la persona, la ejecución del servicio solicitado, el cumplimiento de obligaciones legales o una base permitida equivalente. Cuando el consentimiento sea necesario, podrá retirarse sin afectar el tratamiento realizado legítimamente con anterioridad.'
      ]
    },
    {
      title: '7. Encargados, transferencias y venta de datos',
      paragraphs: [
        'Los datos podrán ser procesados por proveedores indispensables de infraestructura, alojamiento, almacenamiento, seguridad o soporte, bajo instrucciones, confidencialidad y medidas de protección acordes con su función.',
        'Si el procesamiento implica una transferencia internacional, se aplicarán las salvaguardas exigidas por la legislación correspondiente. FinCoach no vende datos personales ni los utiliza para publicidad dirigida de terceros.'
      ]
    },
    {
      title: '8. Conservación y eliminación',
      paragraphs: [
        'Los datos se conservan mientras la cuenta permanezca activa y durante el periodo adicional necesario para cumplir la finalidad informada, resolver solicitudes, prevenir fraude o atender obligaciones legales. Después serán eliminados, anonimizados o bloqueados según corresponda.',
        'Las correcciones destinadas a una posible mejora de modelos no se incorporan automáticamente al entrenamiento. Antes requieren separación de identidad, revisión, validación y versionado controlado.'
      ]
    },
    {
      title: '9. Seguridad',
      paragraphs: [
        'FinCoach aplica controles razonables de autenticación, autorización por usuario, cifrado durante la comunicación, gestión separada de secretos, registro de eventos y restricción de acceso. Ningún sistema elimina totalmente el riesgo, por lo que los incidentes se gestionarán conforme a la normativa aplicable y se informarán cuando exista obligación de hacerlo.'
      ]
    },
    {
      title: '10. Derechos de la persona',
      paragraphs: [
        'De acuerdo con la legislación aplicable, la persona podrá solicitar información sobre el tratamiento, acceder a sus datos, actualizarlos, rectificarlos, pedir su eliminación, oponerse a determinados usos, retirar su consentimiento y solicitar portabilidad cuando ese derecho exista. También podrá pedir revisión humana de un resultado automatizado y acudir a la autoridad nacional competente.',
        'La identidad de quien presenta la solicitud deberá verificarse para evitar entregar o modificar información de otra persona. El ejercicio de derechos no dará lugar a discriminación ni a cobros indebidos.'
      ]
    },
    {
      title: '11. Cookies y sesión',
      paragraphs: [
        'La aplicación puede utilizar cookies o mecanismos equivalentes estrictamente necesarios para mantener una sesión segura y proteger la cuenta. Estos mecanismos no se destinan a publicidad comportamental. Su bloqueo puede impedir el inicio de sesión o el uso de funciones autenticadas.'
      ]
    },
    {
      title: '12. Actualizaciones y contacto',
      paragraphs: [
        'Los cambios relevantes en esta política serán informados de forma clara antes de entrar en vigor cuando así lo exija la normativa. Las consultas y solicitudes deberán dirigirse al canal de privacidad publicado junto con la versión desplegada de FinCoach.'
      ]
    }
  ];

  get title(): string {
    return this.documentType === 'terms' ? 'Términos de servicio' : 'Política de privacidad';
  }

  get summary(): string {
    return this.documentType === 'terms'
      ? 'Condiciones para utilizar FinCoach de forma segura y responsable.'
      : 'Cómo FinCoach recopila, utiliza y protege la información personal y financiera.';
  }

  get sections(): LegalSection[] {
    return this.documentType === 'terms' ? this.termsSections : this.privacySections;
  }

  @HostListener('document:keydown.escape')
  closeWithEscape(): void {
    this.close.emit();
  }
}
