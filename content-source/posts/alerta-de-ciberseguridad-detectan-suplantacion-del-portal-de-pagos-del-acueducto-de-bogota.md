---
title: "ALERTA DE CIBERSEGURIDAD: Detectan suplantación del Portal de Pagos del Acueducto de Bogotá"
slug: alerta-de-ciberseguridad-detectan-suplantacion-del-portal-de-pagos-del-acueducto-de-bogota
wp_url: https://lumacloud.co/alerta-de-ciberseguridad-detectan-suplantacion-del-portal-de-pagos-del-acueducto-de-bogota/
date: 2026-05-14T14:33:12
modified: 2026-05-14T14:33:15
featured_image: https://lumacloud.co/wp-content/uploads/2026/05/Gemini_Generated_Image_-2.png
---

El equipo de CyberSOC de Luma ha identificado una campaña activa de phishing (*) que busca estafar a los ciudadanos de Bogotá. A través de una página web fraudulenta que imita a la perfección la interfaz de la Empresa de Acueducto y Alcantarillado de Bogotá (EAAB), los atacantes están capturando información financiera y datos personales de usuarios desprevenidos.

**¿Cómo operan los atacantes?**

Nuestro equipo técnico analizó el sitio malicioso y confirmó que se trata de una suplantación de identidad (spoofing) diseñada para engañar al usuario:

**URL Fraudulenta:** El dominio detectado es https[:]//pagos-acueducto[.]st **(Nota: No ingresar a este enlace).**

**Falta de Validación: **La página no está conectada a la base de datos real de la EAAB. Al ingresar cualquier número de cuenta contrato (incluso números inventados), el sistema arroja un valor de cobro aleatorio para presionar al usuario a proceder con el «pago».

**Objetivo Final:** Capturar datos de tarjetas de crédito, débito y credenciales de acceso a portales bancarios.

**Recomendaciones de nuestro CyberSOC**

Para evitar ser víctima de este tipo de fraudes, te sugerimos seguir estas pautas de seguridad:

**Verifica la URL:** Asegúrate de que la dirección sea la oficial: [https://www.acueducto.com.co](https://www.acueducto.com.co/). Desconfía de dominios que terminen en .st, .net o variaciones extrañas.

**No uses enlaces de terceros:** Evita ingresar a portales de pago a través de links que lleguen por SMS, correos electrónicos sospechosos o mensajes de WhatsApp.

**Prueba de veracidad:** Como detectó nuestro equipo, si al ingresar un número de cuenta falso el sistema te genera una factura «real», estás ante un sitio de estafa. Los portales oficiales siempre validan la existencia del usuario.

**Reporta: **Si identificas un sitio sospechoso, repórtalo de inmediato con las autoridades y con tu equipo de TI.

En Luma, nuestro compromiso es proteger tu infraestructura y tus datos. Mantente alerta y verifica siempre la fuente antes de realizar cualquier transacción digital.

Tabla de contenidos

[Toggle](#)

- Phishing avanzado utilizando el sistema de pagos PSE como gancho.Recomendaciones Urgentes:

## Phishing avanzado utilizando el sistema de pagos PSE como gancho.

Lo que se ve es la «radiografía» de cómo operan los cibercriminales hoy en día: ya no solo copian una página, sino que montan una infraestructura completa para evadir seguridad.

**Los puntos más críticos:**

**1. El Engaño de Infraestructura (Evasión de Confianza)**

• Dominio de Suplantación: Utilizan el TLD .st (Santo Tomé y Príncipe). Es una alerta roja inmediata; ninguna entidad gubernamental o de servicios públicos en Colombia usaría una extensión de África.

• Falsa Seguridad (SSL): El uso de Let’s Encrypt les permite mostrar el «candadito verde». Es vital recordar que el candado significa que la conexión es privada, no que el sitio sea honesto.

**2. Técnicas de Evasión (Para no ser detectados)**

El atacante es sofisticado porque implementó medidas para que los expertos en seguridad no los encuentren fácilmente:

• Filtro de IPs ([api.ipify.org](http://api.ipify.org/)): El sitio verifica quién entra. Si detecta que es un bot de Google o una empresa de antivirus (crawlers), muestra una página limpia. Si detecta que es un usuario real, activa el ataque.

• Ofuscación Base64: Esconden el código malicioso en un lenguaje que parece «ruido» para que los antivirus básicos no lo reconozcan como una amenaza.

**3. El Robo de Datos (Exfiltración)**

Este es el corazón del ataque. El reporte indica que no solo buscan tu clave:

• Datos Comprometidos: Cédula, celular, correo y banco. Con esto pueden realizar un Account Takeover (ATO), es decir, suplantarte ante el banco para pedir créditos o cambiar claves.

• Captura en segundo plano: El método application/x-www-form-urlencoded sugiere que mientras tú crees que estás navegando, los datos ya fueron enviados al servidor del atacante (/w.php) antes de que te des cuenta.

**4. El «Toque Final»: Redirección Legítima**

Para que la víctima no sospeche, el sitio termina enviándote a [registro.pse.com.co](http://registro.pse.com.co/).

• Efecto Psicológico: El usuario ve que al final «llegó a la página real» y asume que hubo un error técnico menor, sin saber que sus datos ya fueron robados minutos antes.

• Telemetría: El archivo fingerprint.min.js les sirve para saber qué dispositivo usas (iPhone, Android, Windows) y así enviarte estafas personalizadas en el futuro.

### Recomendaciones Urgentes:

Si interactuaste con ese sitio o ingresaste datos:

1. Bloqueo Preventivo: Contacta a tu entidad bancaria de inmediato y solicita el bloqueo de canales virtuales.

2. Cambio de Credenciales: Cambia las contraseñas de tu correo electrónico y aplicaciones bancarias (desde un dispositivo seguro).

3. Doble Factor de Autenticación (MFA): Activa siempre la verificación por aplicación (como Google Authenticator o Microsoft Authenticator) y evita los códigos por SMS, que son vulnerables a vishing.

4. Reporte: Puedes denunciar este dominio ante el CAI Virtual de la Policía Nacional de Colombia para que lo den de baja más rápido.

Glosario:

Phishing: técnica de **ingeniería social** y ciberdelincuencia donde los atacantes suplantan la identidad de empresas, bancos o personas de confianza para engañar a las víctimas