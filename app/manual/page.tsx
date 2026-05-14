'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft } from '@/components/icons';

const sections = [
  { id: 'intro', title: '1. Introducción' },
  { id: 'requisitos', title: '2. Requisitos' },
  { id: 'acceso', title: '3. Acceso al Sistema' },
  { id: 'busqueda', title: '4. Búsqueda de Equipos' },
  { id: 'libro', title: '5. Libro Fiscal' },
  { id: 'info-base', title: '6. Información Base' },
  { id: 'servicios', title: '7. Servicios Técnicos' },
  { id: 'inspecciones', title: '8. Inspecciones Anuales' },
  { id: 'filtros', title: '9. Filtros y Navegación' },
  { id: 'pdf', title: '10. Exportación PDF' },
  { id: 'roles', title: '11. Roles y Permisos' },
  { id: 'faq', title: '12. Preguntas Frecuentes' },
  { id: 'glosario', title: '13. Glosario' },
  { id: 'soporte', title: '14. Soporte' },
];

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24 text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mt-14 mb-6 pb-3 border-b border-slate-200 dark:border-slate-800">
      {children}
    </h2>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mt-8 mb-3">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4 text-[15px]">{children}</p>;
}

function Li({ children }: { children: React.ReactNode }) {
  return <li className="text-slate-600 dark:text-slate-300 leading-relaxed text-[15px]">{children}</li>;
}

function TRow({ cells, head }: { cells: string[]; head?: boolean }) {
  const Tag = head ? 'th' : 'td';
  const cls = head
    ? 'px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60'
    : 'px-3 py-2 text-sm text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800';
  return (
    <tr>{cells.map((c, i) => <Tag key={i} className={cls}>{c}</Tag>)}</tr>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto mb-6 rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-left">
        <thead><TRow cells={headers} head /></thead>
        <tbody>{rows.map((r, i) => <TRow key={i} cells={r} />)}</tbody>
      </table>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-xl p-4 mb-6">
      <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed"><strong>Nota:</strong> {children}</p>
    </div>
  );
}

export default function ManualPage() {
  const [activeId, setActiveId] = useState('intro');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) { setActiveId(e.target.id); break; }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    );
    sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setSidebarOpen(false);
  };

  const sidebar = (
    <nav className="space-y-1">
      {sections.map(s => (
        <button key={s.id} onClick={() => scrollTo(s.id)}
          className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeId === s.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
          {s.title}
        </button>
      ))}
    </nav>
  );

  return (
    <main className="flex-1">
      {/* Mobile TOC toggle */}
      <div className="md:hidden sticky top-16 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 py-2">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <span>☰</span> Tabla de contenido
        </button>
        {sidebarOpen && <div className="mt-2 pb-2">{sidebar}</div>}
      </div>

      <div className="max-w-7xl mx-auto flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto py-8 pl-6 pr-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-4 px-3">Contenido</p>
          {sidebar}
        </aside>

        {/* Content */}
        <div ref={mainRef} className="flex-1 min-w-0 px-6 md:px-12 py-8 md:py-12 max-w-4xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors">
            <ArrowLeft size={16} /> Volver al inicio
          </Link>

          <div className="mb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Libro Virtual AEG</p>
            <h1 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Manual de Usuario
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Alpha Engineer Group, C.A. — RIF J-50459436-9 — Providencia SENIAT 0141 — v1.0 Mayo 2026
            </p>
          </div>

          {/* ===== SECCIONES ===== */}

          <SectionTitle id="intro">1. Introducción</SectionTitle>
          <P>El <strong>Libro Virtual de Control, Reparación y Mantenimiento</strong> es una aplicación web que digitaliza el registro obligatorio de máquinas fiscales según la Providencia SENIAT 0141. Permite:</P>
          <ul className="list-disc pl-5 space-y-1 mb-6">
            <Li>Consultar el historial completo de cada equipo fiscal.</Li>
            <Li>Registrar servicios técnicos (preventivo, correctivo, cambio de alícuota, reparación, inicialización).</Li>
            <Li>Registrar inspecciones anuales.</Li>
            <Li>Gestionar precintos de seguridad.</Li>
            <Li>Exportar documentación oficial en PDF.</Li>
            <Li>Auditar información con trazabilidad completa.</Li>
          </ul>
          <P>El sistema cumple con la <strong>Providencia Administrativa N° SNAT/2018/0141</strong> del SENIAT que regula la fabricación, importación, distribución, venta y control de Máquinas Fiscales.</P>

          <SectionTitle id="requisitos">2. Requisitos del Sistema</SectionTitle>
          <Table headers={['Navegador', 'Versión Mínima']} rows={[['Google Chrome', '90+'],['Mozilla Firefox', '88+'],['Microsoft Edge', '90+'],['Safari', '14+']]} />
          <ul className="list-disc pl-5 space-y-1 mb-6">
            <Li>Conexión a Internet estable.</Li>
            <Li>Resolución mínima recomendada: 1024×768 px.</Li>
            <Li>Compatible con dispositivos móviles (responsive).</Li>
            <Li>JavaScript habilitado.</Li>
          </ul>
          <Note>Las credenciales son proporcionadas exclusivamente por un administrador de AEG.</Note>

          <SectionTitle id="acceso">3. Acceso al Sistema</SectionTitle>
          <Sub>3.1 Inicio de Sesión</Sub>
          <ol className="list-decimal pl-5 space-y-2 mb-6">
            <Li>Abra su navegador e ingrese la URL del sistema.</Li>
            <Li>Escriba su <strong>Correo Electrónico</strong> y <strong>Contraseña</strong>. Use el ícono 👁 para ver/ocultar la contraseña.</Li>
            <Li>Pulse <strong>&quot;Entrar al Sistema&quot;</strong>.</Li>
            <Li>Será redirigido a la pantalla principal.</Li>
          </ol>
          <Sub>3.2 Cierre de Sesión</Sub>
          <P>Pulse el botón <strong>&quot;Salir&quot;</strong> en la esquina superior derecha, junto a su correo electrónico.</P>
          <Sub>3.3 Tema Claro / Oscuro</Sub>
          <P>Pulse el ícono ☀/🌙 en la barra superior para alternar entre modos. La preferencia se guarda automáticamente.</P>

          <SectionTitle id="busqueda">4. Búsqueda de Equipos</SectionTitle>
          <Sub>4.1 Tipos de Búsqueda</Sub>
          <Table headers={['Tipo', 'Formato', 'Ejemplo']} rows={[['Serial', '3 letras + 7 dígitos', 'GRA0000123'],['RIF', 'V/E/J/P/G + 7-9 dígitos', 'J12345678']]} />
          <Sub>4.2 Procedimiento</Sub>
          <ol className="list-decimal pl-5 space-y-2 mb-6">
            <Li>Seleccione <strong>Serial</strong> o <strong>RIF</strong> con el selector.</Li>
            <Li>Escriba el dato (se normaliza automáticamente a mayúsculas).</Li>
            <Li>Pulse <strong>&quot;Auditar&quot;</strong>. El sistema valida el formato antes de buscar.</Li>
          </ol>
          <Note>Deje el campo vacío y pulse &quot;Auditar&quot; para ver el listado completo de equipos según su rol.</Note>
          <Sub>4.3 Resultados</Sub>
          <P>Las tarjetas muestran: razón social, RIF, serial fiscal y estatus del equipo. Haga clic en una tarjeta para abrir su libro fiscal.</P>
          <Table headers={['Estatus', 'Significado']} rows={[['Asignada','Equipo operativo en contribuyente'],['Laboratorio','En configuración o reparación'],['Sin asignar','Disponible, sin contribuyente'],['Enajenada','Transferido o fuera de servicio']]} />
          <P>Configure resultados por página (5, 10, 20, 50) con el selector <strong>&quot;Por página&quot;</strong>.</P>

          <SectionTitle id="libro">5. Libro Fiscal del Equipo</SectionTitle>
          <P>Se presenta como documento formal con encabezado oficial: <em>&quot;Libro Virtual de Control, Reparación y Mantenimiento — Máquina Fiscal — Providencia SENIAT 0141&quot;</em> y el serial fiscal del equipo.</P>
          <Sub>5.1 Pestañas</Sub>
          <Table headers={['Pestaña', 'Contenido']} rows={[['Inf. Base','Datos del equipo, fabricante, enajenador, contribuyente, software y firmware'],['Servicios','Historial de servicios técnicos (con contador)'],['Inspecciones','Historial de inspecciones anuales (con contador)']]} />
          <Sub>5.2 Barra de Control</Sub>
          <P>Barra sticky superior con: <strong>Volver</strong>, pestañas, paginador, filtros, agregar (+) y descargar PDF. En móvil se agrupa bajo menú hamburguesa (☰).</P>

          <SectionTitle id="info-base">6. Información Base</SectionTitle>
          <P>La pestaña <strong>&quot;Inf. Base&quot;</strong> contiene 6 secciones:</P>
          <Table headers={['Sección', 'Contenido']} rows={[
            ['1. Datos del Fabricante','Razón social, RIF, domicilio, teléfono y correo de AEG'],
            ['2. Datos del Enajenador','Distribuidora que vendió/instaló el equipo'],
            ['3. Datos del Contribuyente','Negocio donde opera el equipo (razón social, RIF, tipo, domicilio)'],
            ['4. Lugar de Instalación','Domicilio fiscal del contribuyente'],
            ['5. Datos de la Máquina','Serial, tipo dispositivo, marca, modelo, precinto, firmware, fecha instalación'],
            ['6. Datos del Software','Nombre y versión del software fiscal'],
          ]} />
          <Note>Los campos sin información muestran &quot;N/D&quot; (No Disponible). Para ver la versión completa del firmware, pase el cursor sobre el ícono ℹ.</Note>

          <SectionTitle id="servicios">7. Servicios Técnicos</SectionTitle>
          <Sub>7.1 Contenido de un Registro</Sub>
          <P>Cada servicio tiene 4 secciones:</P>
          <ol className="list-decimal pl-5 space-y-2 mb-6">
            <Li><strong>Datos del Servicio:</strong> centro autorizado, RIF, fecha solicitud, fechas inicio/fin, reportes Z inicial y final con timestamps.</Li>
            <Li><strong>Gestión de Precintos:</strong> serial actual, si fue violentado, si se cambió y serial del nuevo.</Li>
            <Li><strong>Detalles de la Intervención:</strong> falla reportada y acción realizada.</Li>
            <Li><strong>Cierre y Responsabilidades:</strong> técnico autorizado y persona que recibe.</Li>
          </ol>
          <Sub>7.2 Crear Servicio (Solo Técnico)</Sub>
          <P>Pulse <strong>&quot;+&quot;</strong> en la pestaña Servicios. Se autocompletan: técnico responsable y centro/distribuidora según su perfil.</P>
          <Table headers={['Campo', 'Tipo', 'Descripción']} rows={[
            ['Fecha de Solicitud','Fecha','Cuándo se solicitó'],
            ['Inicio/Fin Servicio','Fecha+Hora','Período del servicio'],
            ['Reporte Z Inicial/Final','Número','Números de reporte Z'],
            ['Fecha Z Inicial/Final','Fecha+Hora','Timestamps de los Z'],
            ['Falla Reportada','Texto','Descripción detallada'],
            ['Costo','Número','Costo en Bs.'],
            ['Precinto violentado','Casilla','Si fue encontrado violentado'],
            ['Cambio de precinto','Casilla','Si se reemplazó (seleccione nuevo de lista)'],
          ]} />
          <Sub>7.3 Validaciones</Sub>
          <ul className="list-disc pl-5 space-y-1 mb-6">
            <Li>Todos los campos obligatorios completos.</Li>
            <Li>Fin no anterior al inicio; máximo <strong>8 días</strong> de duración.</Li>
            <Li>Solicitud no posterior al fin.</Li>
            <Li>Z final ≥ Z inicial; timestamps Z dentro del período.</Li>
            <Li>Precinto nuevo debe estar &quot;disponible&quot; y ser diferente al actual.</Li>
          </ul>

          <SectionTitle id="inspecciones">8. Inspecciones Anuales</SectionTitle>
          <Sub>8.1 Contenido</Sub>
          <P>Cada inspección tiene 2 secciones: <strong>Datos del Centro y Técnico</strong> (centro, RIF, fecha, inspector) y <strong>Detalles de la Inspección</strong> (observaciones y hallazgos).</P>
          <Sub>8.2 Crear Inspección (Solo Técnico)</Sub>
          <P>Pulse <strong>&quot;+&quot;</strong> en la pestaña Inspecciones. Complete: fecha de inspección (no futura), observaciones/resultados e indique si el precinto fue violentado. El inspector se autocompleta desde su perfil.</P>

          <SectionTitle id="filtros">9. Filtros y Navegación</SectionTitle>
          <P>En las pestañas de Servicios e Inspecciones:</P>
          <ul className="list-disc pl-5 space-y-1 mb-6">
            <Li>Pulse el ícono de <strong>filtro</strong> (embudo) para abrir el panel.</Li>
            <Li><strong>Búsqueda por texto:</strong> filtra por falla, técnico, centro, observaciones o ID.</Li>
            <Li><strong>Selector de año:</strong> filtra por año de creación.</Li>
            <Li>Pulse <strong>&quot;Limpiar filtros&quot;</strong> para reiniciar.</Li>
            <Li>Navegue registro a registro con las flechas ◀ ▶.</Li>
          </ul>

          <SectionTitle id="pdf">10. Exportación a PDF</SectionTitle>
          <P>Pulse el ícono de <strong>descarga</strong> (⬇) en la barra de acciones. El PDF incluye:</P>
          <ul className="list-disc pl-5 space-y-1 mb-6">
            <Li><strong>Página 1:</strong> encabezado oficial AEG + 6 secciones de información base.</Li>
            <Li><strong>Página 2:</strong> detalle del servicio o inspección seleccionado + espacios para firmas.</Li>
            <Li>Formato carta, campos vacíos como <em>N/D</em>, pie de página con fecha de generación.</Li>
          </ul>
          <P>Archivo descargado: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-sm">{'{SERIAL}'}-{'{TIMESTAMP}'}.pdf</code></P>

          <SectionTitle id="roles">11. Roles y Permisos</SectionTitle>
          <Table headers={['Funcionalidad', 'SENIAT', 'Técnico', 'Admin']} rows={[
            ['Buscar equipos','✅ Todos','✅ Su distribuidora','✅ Todos'],
            ['Ver libro fiscal','✅','✅','✅'],
            ['Crear servicio técnico','❌','✅','❌'],
            ['Crear inspección','❌','✅','❌'],
            ['Exportar PDF','✅','✅','✅'],
            ['Filtrar registros','✅','✅','✅'],
          ]} />
          <P><strong>SENIAT:</strong> acceso de solo lectura a todos los equipos. <strong>Técnico:</strong> acceso operativo limitado a equipos de su distribuidora. <strong>Admin:</strong> consulta completa sin crear registros.</P>

          <SectionTitle id="faq">12. Preguntas Frecuentes</SectionTitle>
          {[
            ['¿Qué hago si no puedo iniciar sesión?', 'Verifique correo y contraseña. Si persiste, contacte a un administrador de AEG.'],
            ['¿Por qué no veo el botón "+"?', 'Solo usuarios con rol Técnico pueden crear registros.'],
            ['¿Qué significa "N/D"?', 'No Disponible — el dato no ha sido registrado para ese equipo.'],
            ['¿Puedo editar un registro guardado?', 'No. Los registros son inmutables para garantizar la integridad del libro fiscal.'],
            ['¿Se puede usar desde celular?', 'Sí. El sistema es responsive y se adapta a cualquier pantalla.'],
          ].map(([q, a], i) => (
            <div key={i} className="mb-5">
              <p className="font-bold text-slate-800 dark:text-slate-200 text-[15px]">{q}</p>
              <p className="text-slate-600 dark:text-slate-300 text-[15px] mt-1">{a}</p>
            </div>
          ))}

          <SectionTitle id="glosario">13. Glosario</SectionTitle>
          <Table headers={['Término', 'Definición']} rows={[
            ['Serial Fiscal','Identificador único: 3 letras + 7 dígitos'],
            ['RIF','Registro de Información Fiscal'],
            ['Reporte Z','Reporte de cierre diario de la máquina fiscal'],
            ['Precinto','Sello de seguridad físico en la máquina'],
            ['Enajenador','Distribuidora que vendió/instaló el equipo'],
            ['Contribuyente','Persona que usa la máquina fiscal'],
            ['Firmware','Software embebido en el hardware fiscal'],
            ['Providencia 0141','Normativa SENIAT para máquinas fiscales'],
          ]} />

          <SectionTitle id="soporte">14. Soporte Técnico</SectionTitle>
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-8">
            <p className="font-bold text-slate-900 dark:text-white text-lg mb-3">Alpha Engineer Group, C.A.</p>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p>📧 <strong>Correo:</strong> soportealphavzla@gmail.com</p>
              <p>📞 <strong>Teléfono:</strong> +58 424-291-3038</p>
              <p>📍 <strong>Dirección:</strong> Av. Bicentenario, Redoma del Tambor, Edif. Veracruz, Piso 1, Local 3, Los Teques, Miranda.</p>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-12 mb-8">
            © 2026 Alpha Engineer Group, C.A. — Todos los derechos reservados.<br />
            Documento del expediente de homologación de firmware y libro digital ante el SENIAT.
          </p>
        </div>
      </div>
    </main>
  );
}
