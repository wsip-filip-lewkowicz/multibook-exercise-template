# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vite-based template for creating interactive exercises that run inside iframes in the Multibook parent application. Exercises communicate with the parent via postMessage using a custom SDK.

## Commands

```bash
pnpm dev              # Start development server with hot reload
pnpm build            # Production build to dist/
pnpm build:test       # Development mode build (includes preview modal)
pnpm build:zip        # Build and create dist.zip for upload
pnpm build:zip:test   # Development build as zip
```

## Architecture

### SDK Communication (`src/sdk/index.js`)

The SDK singleton (`sdk`) handles all parent-iframe communication via `postMessage` with message type `multibook:event`.

**Emitting to parent:**
```js
import { sdk } from "@/sdk";
sdk.emit("goToPage", { page: 5 });
sdk.emit("keyboardOpen", {});
```

**Listening from parent:**
```js
sdk.on("keyboardPressed", ({ key }) => { ... });
```

The SDK automatically:
- Sends `ready` event on instantiation
- Binds `[data-page]` elements to emit `goToPage`
- Binds `[data-modal-close]` elements to emit `closeModal`

### Dev Preview System

The preview modal (`src/preview-modal.js` + `src/styles/modal.css`) is **development-only** - it's dynamically imported in `src/main.js` only when `import.meta.env.DEV` is true, ensuring zero bytes in production builds.

Preview mode adds CSS classes to body (`dev-preview-mode`, `dev-preview--{size}`) to simulate different modal sizes.

### Virtual Keyboard (dev only)

The virtual keyboard (`src/virtual-keyboard.js` + `src/styles/virtual-keyboard.css`) simulates the parent app's on-screen keyboard for testing SDK integration locally.

**Key files:**
- `src/virtual-keyboard.js` - Keyboard UI and logic (dev-only, dynamically imported)
- `src/keyboard.js` - SDK event handler for `keyboardPressed` (always included)

**Communication flow:**
```
Virtual Keyboard → postMessage({type: "multibook:event", event: "keyboardPressed"})
    → SDK receives → keyboard.js handles (same path as production)
```

**Special key mappings:**
- `Backspace`, `Delete` - character deletion
- `ArrowLeft`, `ArrowRight` - cursor movement
- ` ` (space) - space character

### Environment Configuration

- `.env.development` - Test environment URLs (multibooks-tst.eduranga.pl)
- `.env.production` - Production URLs (multibooks.eduranga.pl)
- `VITE_STORAGE_URL` is used in index.html via `%VITE_STORAGE_URL%` placeholder

### External Dependencies (loaded from CDN in index.html)

- Phosphor Icons (icon classes: `ph`, `ph-fill`, `ph-bold`)
- Silka font family
- Global CSS from Multibook backend
- iframe-resizer for height synchronization with parent

### Path Alias

`@` maps to `src/` directory (configured in vite.config.js)

## Code Style

Uses Biome for linting/formatting:
- Tab indentation
- Double quotes for strings
- Recommended linting rules
