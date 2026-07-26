# L&J Ingeniería y Construcción S.A.S

Sitio web corporativo para presentar la identidad, los servicios y los proyectos de L&J Ingeniería y Construcción S.A.S, una empresa especializada en obra civil, estabilización de terrenos, drenajes, vías y urbanismo en Bogotá.

## 1. Propósito del negocio

La página tiene como objetivo convertir visitas en oportunidades de negocio al mostrar de forma clara y profesional:

- la experiencia técnica de la empresa,
- los servicios que ofrece,
- los proyectos ejecutados,
- y los canales de contacto directos para cotización o asesoría.

La propuesta principal no es solo informar, sino generar confianza y facilitar la decisión de contacto de clientes potenciales, constructoras, entidades públicas o aliados estratégicos.

## 2. Lógica de negocio de la web

### Público objetivo

- Constructoras y consorcios.
- Entidades públicas y privadas.
- Empresas que requieran obra civil o infraestructura.
- Clientes que buscan confiabilidad, capacidad técnica y respuesta rápida.

### Objetivo comercial

Que el visitante pueda entender rápidamente:

1. qué hace la empresa,
2. en qué tipo de proyectos trabaja,
3. por qué debe elegirla,
4. y cómo puede contactarla sin perder tiempo.

### Valor que transmite la página

- Experiencia comprobada en proyectos reales.
- Enfoque en seguridad, calidad y ejecución responsable.
- Visualización de casos concretos mediante portafolio.
- Canal de contacto inmediato por WhatsApp y correo.

## 3. Estructura de la propuesta

La web está organizada para impulsar conversión en tres niveles:

### A. Captación de atención

El hero section presenta de forma inmediata:

- la especialidad de la empresa,
- mensajes de valor,
- botones de acción para ver proyectos o solicitar cotización.

### B. Generación de confianza

La sección de portafolio y la barra de confianza muestran evidencia real del trabajo realizado, lo cual fortalece la credibilidad de la marca.

### C. Conversión

Los bloques de contacto y el botón flotante de WhatsApp permiten que el usuario pase de mirar la página a iniciar una conversación comercial de forma muy simple.

## 4. Lógica del portafolio

El portafolio se diseñó para que cada proyecto pueda agregarse de forma ordenada y rápida sin reescribir todo el HTML.

### Modelo de contenido

Cada proyecto contiene:

- un identificador único,
- título,
- descripción,
- categoría o clasificación,
- y un arreglo de imágenes.

Esto permite escalar la web a medida que se sumen nuevos proyectos, manteniendo la presentación consistente.

## 5. Cómo agregar un proyecto nuevo

1. Sube las imágenes al folder [sources/imgs](sources/imgs).
2. Abre [projects-data.js](projects-data.js).
3. Agrega un nuevo objeto al arreglo de proyectos con:
   - id
   - title
   - description
   - category
   - images
4. Guarda el archivo y la página lo renderizará automáticamente.

### Ejemplo de estructura

```js
{
  id: 'portfolio-item-7',
  title: 'Nuevo proyecto',
  description: 'Descripción breve del trabajo realizado.',
  category: 'vias,estabilizacion',
  images: [
    { src: './sources/imgs/imagen-1.jpg', alt: 'Descripción de la imagen' }
  ]
}
```

## 6. Archivos principales

- [index.html](index.html): estructura principal de la página.
- [styles.css](styles.css): estilos visuales y responsive.
- [script.js](script.js): comportamiento del menú y renderización del portafolio.
- [projects-data.js](projects-data.js): base de datos de proyectos para el portafolio.

## 7. Objetivos futuros

Este proyecto puede evolucionar hacia una plataforma más robusta con:

- un panel simple para agregar proyectos sin editar código,
- filtros por tipo de obra,
- galería más avanzada,
- integración con WhatsApp Business,
- y SEO más profundo para captar clientes por búsqueda orgánica.

## 8. Recomendación de uso

Esta web funciona como una carta de presentación digital, una herramienta de confianza y un canal de captación de oportunidades. Su valor aumenta cuando se mantiene actualizada con proyectos recientes, fotos reales y mensajes claros de servicio.

## 9. Cómo ver la página localmente

Puedes abrir [index.html](index.html) directamente en el navegador o servir la carpeta con un servidor simple si prefieres probarla en un entorno más cercano al despliegue.
