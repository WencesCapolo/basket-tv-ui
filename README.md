# basket-tv-ui

Estilos y marco compartidos de las apps de `basket-app.com` (Portal, Facturación, Incidencias, Analytics): que todas se vean como un solo producto.

- `estilos.css`: tokens (escala neutra cálida `--n-*`, rojo `--accent*`, navy `--navy-*`, radio, sombras, fuentes) y los colores de Tailwind que salen de ellos (`bg-n-50`, `text-accent`…). Solo claro.
- `Marco`: la barra lateral navy con el logo blanco, el nombre de la app, las secciones (compactable, cajón debajo de `lg`) y **Elegir aplicación** al pie; el encabezado con **Volver** al selector de apps y la cabecera de la app.
- `CampanaDeSolicitudes`: la campana de Solicitudes de acceso y su modal, solo UI.
- `ChipDeUsuario`, `BotonDeSalir`, `urlDelLanzador`, `urlDeSolicitud`, `unir`.

Requiere React 19 y Tailwind CSS 4.

## Uso

Se instala como dependencia de git, fijada a un tag:

```json
"basket-tv-ui": "github:<owner>/basket-tv-ui#v0.2.2"
```

`dist/` está commiteado: la instalación no compila nada.

### CSS

```css
@import 'tailwindcss';
@import 'basket-tv-ui/estilos.css';
```

`estilos.css` trae su propio `@source` a `dist/`, así Tailwind genera las clases del marco.

### Fuentes

Poppins, Oswald e IBM Plex Mono. En Next, con `next/font/google` y `variable: '--font-poppins'` / `'--font-oswald'` / `'--font-plex-mono'` en el `<html>`. En Vite, el `<link>` de Google Fonts: los tokens ya nombran las familias.

### Logos

Copiá `assets/basket-tv-horizontal-blanco.png` y `assets/basket-tv-horizontal-rojo.png` a `public/`. Si viven en otra ruta, pasalas con `logo` y `logoEnCabecera`.

### Marco

```tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BotonDeSalir, ChipDeUsuario, Marco } from 'basket-tv-ui';

<Marco
  nombreDeApp="Incidencias"
  lanzadorUrl={urlDelLanzador(portalUrl)}
  enlace={Link}
  secciones={[{ clave: 'ar', titulo: 'Argentina', icono: <Radio />, href: '/ar', activa: pathname.startsWith('/ar') }]}
  cabecera={
    <>
      <ChipDeUsuario nombre="Ana Pérez" rol="Operador" />
      <BotonDeSalir href={`${portalUrl}/logout`} />
    </>
  }
>
  {children}
</Marco>
```

Sin `lanzadorUrl` no se muestran Volver ni Elegir aplicación: pasá `null` a quien tenga menos de dos apps. `enlace` es opcional: por defecto es un `<a>`.

### Cerrar sesión

`BotonDeSalir` apunta siempre a `${portalUrl}/logout`: el route handler del Portal termina la sesión compartida, borra las cookies de todos los subdominios y lleva a `/login`. Es una navegación completa, no un `signOut()` del cliente ni una server action: con esos la sesión puede quedar viva y hay que salir dos veces.

### Solicitudes de acceso

Quien entra a una app sin Acceso va al formulario del Portal, que registra qué app pidió:

```ts
redirect(urlDeSolicitud(portalUrl, 'facturacion')); // → ${portalUrl}/no-access?app=facturacion
```

Los admins de la app deciden desde `CampanaDeSolicitudes`, en la `cabecera` del `Marco`. El componente no lee datos: cada app carga sus pendientes y pasa sus server actions.

```tsx
<CampanaDeSolicitudes
  solicitudes={pendientes.map((s) => ({
    id: s.id,
    app: s.app,
    nombreDeApp: 'Facturación',
    nombre: s.fullName,
    email: s.email,
    telefono: s.phone,
    ciudad: s.ciudad,
    mensaje: s.mensaje,
    roles: rolesQuePuedeOtorgar, // [{ valor: 'editor', etiqueta: 'Editor' }], ya filtrados por rango
  }))}
  aprobar={aprobarSolicitudAction}
  rechazar={rechazarSolicitudAction}
/>
```

- Los dos formularios envían `solicitudId` y `app`; `aprobar` además envía `rol`. `camposOcultos` agrega otros campos a ambos (una ruta de vuelta, por ejemplo).
- La acción vuelve a chequear el rango y reclama la Solicitud: el componente no autoriza nada.
- Con varios roles hay que elegir uno; con uno solo viene elegido; sin roles solo se puede rechazar.
- `decision` reemplaza el selector de rol en un ítem: el apex lo usa para el formulario propio del Portal.
- Se abre sola una vez por conjunto de pendientes y por pestaña (`sessionStorage`). El modal va a `<body>`, así el `backdrop-blur` del encabezado no lo recorta.

## Desarrollo

```sh
pnpm install
pnpm test    # vitest + jsdom
pnpm build   # regenera dist/; commitealo junto con src/
```

Una versión nueva es un tag (`v0.2.0`) y un bump del `#tag` en cada app.
