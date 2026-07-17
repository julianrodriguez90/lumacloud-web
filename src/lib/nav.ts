/** Navegación principal — refleja los silos de servicio del sitio. */
export const SERVICES = [
  {
    href: '/ciberseguridad',
    label: 'Ciberseguridad',
    desc: 'Protección integral: EDR, DLP, seguridad perimetral y WAF',
  },
  {
    href: '/backup',
    label: 'Backup y Ciberrecuperación',
    desc: 'Backup empresarial, DRP y replicación con RTO/RPO garantizados',
  },
  {
    href: '/cloud',
    label: 'Cloud e Infraestructura',
    desc: 'Nube pública, privada e híbrida con datacenters TIER III y IV',
  },
  {
    href: '/soc',
    label: 'SOC 24/7',
    desc: 'Monitoreo continuo: SIEM, threat hunting, SOAR y sandbox',
  },
  {
    href: '/cumplimiento/iso-27001',
    label: 'Cumplimiento',
    desc: 'ISO 27001 y Ley 1581 de protección de datos',
  },
  {
    href: '/servicios-profesionales',
    label: 'Servicios Profesionales',
    desc: 'Administración de BD, infraestructura y hacking ético',
  },
] as const;

export const NAV = [
  { href: '/plataforma-ia-lci', label: 'Plataforma IA' },
  { href: '/csirt', label: 'CSIRT' },
  { href: '/herramientas', label: 'Herramientas' },
  { href: '/quienes-somos', label: 'Quiénes somos' },
  { href: '/blog', label: 'Blog' },
] as const;
