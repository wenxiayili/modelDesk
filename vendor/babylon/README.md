# Babylon.js Runtime Assets

Vendored on 2026-05-01 for ModelDesk offline desktop packaging.

## Files

- `babylon.js`
  - Source: `https://cdn.babylonjs.com/babylon.js`
  - Runtime version observed in smoke test: `9.5.0`
- `babylonjs.loaders.min.js`
  - Source: `https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js`
- `studio.env`
  - Source: `https://assets.babylonjs.com/environments/studio.env`

## Upgrade

Replace these files together, then run:

```powershell
node scripts/prepare-tauri-dist.js
cargo tauri build --no-bundle
```

