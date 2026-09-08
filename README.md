# happy-wakey-assets

Versioned, application-safe Happy Wakey brand assets. This repository is the
source for product icons, design tokens, shared CSS custom properties and CDN
export metadata; marketing page composition stays in `happy-wakey.github.io`.

## Contents

| Path | Purpose |
| --- | --- |
| `branding/app-logo.png` | Original high-resolution RGB application icon. |
| `branding/app-mark.svg` | Scalable full-color product mark with accessible metadata. |
| `branding/app-mark-monochrome.svg` | Single-color mask for native menus, trays and notifications. |
| `branding/wordmark.svg` | Horizontal Happy Wakey lockup for product chrome. |
| `tokens/happy-wakey.tokens.json` | Machine-readable primitive and semantic design tokens. |
| `css/happy-wakey.css` | Framework-neutral CSS custom properties matching the tokens. |
| `assets.manifest.json` | Media type, role, dimensions and SHA-256 integrity metadata. |

Consumers should pin a Git commit or release tag. They must not hotlink the
GitHub `main` branch. SVGs contain no scripts, remote resources or embedded
credentials. The monochrome mark inherits `currentColor` so the consuming UI
controls contrast.

## Validate

```sh
npm test
```

Validation fails on a missing asset, hash or dimension drift, unsafe SVG
content, missing accessibility title, token/CSS divergence, or an unbounded
manifest entry. Update the corresponding manifest SHA-256 whenever an asset is
intentionally changed.
