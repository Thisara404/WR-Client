# Gather visibility fix

Copy the files into `frontend/public/`, replacing the previous favicon files.

## Navy login panel

Use the white G variant with a navy background:

```tsx
<img className="brand-logo" src="/gather-logo-on-navy.webp" alt="" />
```

Replace the existing logo image or `brand-symbol` element with this image; keep the `gather` text beside it.

```css
.brand-logo { width: 40px; height: 40px; object-fit: contain; flex-shrink: 0; }
```

`gather-logo-on-navy.webp` is opaque and designed for the navy login panel. Use the original transparent `gather-logo.webp` on light backgrounds.

## Browser favicon

The new favicon has an ivory background, so it stays visible on dark and light tabs. Replace the existing icon links inside `<head>`:

```html
<link rel="icon" href="/favicon.ico?v=2" sizes="any" />
<link rel="icon" type="image/png" href="/favicon-32x32.png?v=2" sizes="32x32" />
<link rel="icon" type="image/png" href="/favicon-16x16.png?v=2" sizes="16x16" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" sizes="180x180" />
<link rel="manifest" href="/site.webmanifest?v=2" />
```

Close and reopen the tab if the browser still shows the old cached favicon.
