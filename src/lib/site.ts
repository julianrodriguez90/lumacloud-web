/**
 * Datos de empresa centralizados — fuente: WordPress actual + BrandBook.
 * Regla E-E-A-T: solo datos verificables en content-source/ o el BrandBook.
 */
export const SITE = {
  name: 'LumaCloud',
  legalName: 'Grupo Luma SAS',
  url: 'https://lumacloud.co',
  email: 'info@lumacloud.co',
  phone: '+573185958261',
  phoneDisplay: '+57 318 595 8261',
  whatsapp: 'https://wa.me/573185958261',
  address: {
    street: 'Cll 121 #15a-50',
    city: 'Bogotá D.C.',
    country: 'Colombia',
    geo: { lat: 4.6972, lng: -74.0455 },
  },
  social: {
    linkedin: 'https://www.linkedin.com/company/grupolumacloud/',
    instagram: 'https://www.instagram.com/luma.cloud/',
    youtube: 'https://www.youtube.com/@Luma_Cloud',
    facebook: 'https://www.facebook.com/lumacloud113',
  },
  description:
    'Empresa colombiana de ciberseguridad y nube empresarial: ciberseguridad administrada, backup, cloud privado, SOC 24/7 y cumplimiento normativo.',
} as const;

export type Crumb = { name: string; href: string };
