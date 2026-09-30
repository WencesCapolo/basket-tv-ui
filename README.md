# basket-tv-ui

Estilos y marco compartidos de las apps de `basket-app.com` (Portal, Facturación, Incidencias, Analytics): que todas se vean como un solo producto.

- `estilos.css`: tokens (escala neutra cálida `--n-*`, rojo `--accent*`, navy `--navy-*`, radio, sombras, fuentes) y los colores de Tailwind que salen de ellos (`bg-n-50`, `text-accent`…). Solo claro.
- `Marco`: la barra lateral navy con el logo blanco, el nombre de la app, las secciones (compactable, cajón debajo de `lg`) y **Elegir aplicación** al pie; el encabezado con **Volver** al selector de apps y la cabecera de la app.
- `ChipDeUsuario`, `BotonDeSalir`, `urlDelLanzador`, `unir`.

Requiere React 19 y Tailwind CSS 4.

## Uso

Se instala como dependencia de git, fijada a un tag:

```json
"basket-tv-ui": "github:<owner>/basket-tv-ui#v0.1.0"
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

Sin `lanzadorUrl` no se muestran Volver ni Elegir aplicación. `enlace` es opcional: por defecto es un `<a>`.

## Desarrollo

```sh
pnpm install
pnpm build   # regenera dist/; commitealo junto con src/
```

Una versión nueva es un tag (`v0.2.0`) y un bump del `#tag` en cada app.
