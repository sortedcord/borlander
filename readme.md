# Borlander

Borlander is a MV3 browser extension that applies a classic Borland blue/yellow theme globally, with optional site-specific overrides.

## Site-specific themes (automatic)

Any folder under `borlander/sites/<site>/styles.css` is treated as a site theme automatically.

* If the folder name looks like a hostname (e.g. `github.com`), it matches when the current page hostname includes that string.
* A couple themes are **heuristic-based** (currently `sonarr.local`, `gitea.local`) because they may run on custom domains. Those are defined in `borlander/scripts/generate-themes.mjs`.

The registry lives in `borlander/themes.json` and is loaded by both `content.js` and `popup.js`.

### Regenerate `themes.json`

If you add/remove site themes in `borlander/sites/`, re-generate the registry:

```fish

node borlander/scripts/generate-themes.mjs
```


#### Monkeytype theme

[Monkeytype](https://monkeytype.com?customTheme=eyJjIjpbIiMwMDAwYTQiLCIjZmZmZjRlIiwiI2RjOGE3OCIsIiNhY2IwYmUiLCIjNzA3MDcwIiwiI2ZmZmY0ZSIsIiNkMjBmMzkiLCIjZTY0NTUzIiwiI2QyMGYzOSIsIiNlNjQ1NTMiXSwiaSI6IiIsInMiOiJjb3ZlciIsImYiOlswLDEsMSwxXX0=)