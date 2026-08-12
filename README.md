# Alberto Casaus — Detective Privado Acreditado

Sitio web oficial de **Alberto Casaus**, detective privado acreditado en España. Investigación privada discreta y con validez legal: infidelidades, localización de personas, bajas laborales, conductas de riesgo en menores, acoso y contravigilancia, pensión alimenticia y custodia, y propiedad intelectual.

🔗 **Web en producción:** https://alberto011080.github.io/Detective-Privado_Alberto/

---

## Sobre este proyecto

Web estática (sin frameworks ni build) construida en HTML, CSS y JavaScript vanilla, con una estética de "expediente confidencial": tonos navy y carpeta manila, acentos en latón y burdeos, tipografía serif para titulares y monoespaciada para el detalle documental. Todas las investigaciones que se ofrecen se enmarcan en la **Ley 5/2014, de 4 de abril, de Seguridad Privada**.

## Páginas

| Archivo | Contenido |
|---|---|
| `index.html` | Inicio: presentación de la agencia y resumen de los 7 servicios |
| `servicios.html` | Los 7 servicios en formato acordeón, con CTA a Contacto o a JuezIA en cada uno |
| `contacto.html` | Formulario de consulta (nombre, email, teléfono, tipo de servicio, mensaje) |
| `juezia.html` | **JuezIA**, asistente de IA que resuelve dudas legales: fundamento legal → explicación cotidiana → resumen |

## Servicios

1. Infidelidad de parejas
2. Localización de personas
3. Seguimiento de bajas laborales
4. Conductas dudosas de hijos
5. Acoso y contravigilancia
6. Pensión alimenticia y custodia
7. Propiedad intelectual

## Cómo ejecutarlo en local

No requiere instalación. Basta con abrir `index.html` en cualquier navegador, o servirlo con un servidor estático simple:

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Despliegue

La web se publica con **GitHub Pages** directamente desde la rama `main` (carpeta raíz). Cualquier cambio subido a `main` se refleja automáticamente en la URL pública en uno o dos minutos.

## JuezIA — asistente legal con IA

`juezia.html` envía la consulta del usuario a una función serverless (**Supabase Edge Functions**) que llama a la API de Anthropic (Claude) de forma segura, sin exponer ninguna clave en el navegador. El código de esa función está en `supabase-juezia-function.ts`.

> ⚠️ Estado actual: la función aún no está desplegada en producción. Hasta que se configure Supabase, `juezia.html` mostrará un error de conexión al intentar preguntar. Consulta la sección de configuración más abajo.

### Configurar Supabase

1. `npm install -g supabase` y `supabase login`
2. Crear proyecto en [supabase.com](https://supabase.com/dashboard)
3. `supabase init` y `supabase link --project-ref TU_PROJECT_REF`
4. `supabase functions new juezia` y sustituir su contenido por `supabase-juezia-function.ts`
5. `supabase secrets set ANTHROPIC_API_KEY=tu_clave`
6. `supabase functions deploy juezia --no-verify-jwt`
7. Copiar la URL resultante en la constante `SUPABASE_FUNCTION_URL` de `juezia.html`

JuezIA ofrece orientación informativa general y no sustituye el asesoramiento de un abogado o graduado social colegiado.

## Stack técnico

- HTML5 / CSS3 (variables CSS, grid, flexbox)
- JavaScript vanilla (sin frameworks)
- Fuentes: [Fraunces](https://fonts.google.com/specimen/Fraunces) y [Courier Prime](https://fonts.google.com/specimen/Courier+Prime) vía Google Fonts
- Backend de IA: Supabase Edge Functions + API de Anthropic (Claude)
- Hosting: GitHub Pages

## Contacto

- 📞 650 56 91 01
- ✉️ al100180@gmail.com
- 📍 Zona de actuación: toda España

---

© 2026 Alberto Casaus — Detective Privado Acreditado. Todas las investigaciones se realizan conforme a la Ley 5/2014 de Seguridad Privada.
