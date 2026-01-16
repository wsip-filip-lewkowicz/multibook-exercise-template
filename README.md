# Multibook Exercise Template

Template for creating interactive exercises displayed in iframes.

## SDK

The SDK automatically:
- Sends `ready` event to parent on load
- Binds clicks on `[data-page]` elements
- Binds clicks on `[data-modal-close]` elements

### Usage

```js
import { sdk } from "@/sdk";

// Send events to parent
sdk.emit("goToPage", { page: 5 });
sdk.emit("exerciseCompleted", {});

// Keyboard control
sdk.emit("keyboardOpen", {});    // Request to open on-screen keyboard
sdk.emit("keyboardClose", {});   // Request to close on-screen keyboard

// Listen for events from parent
sdk.on("keyboardPressed", ({ key }) => {
  console.log("Key pressed:", key);
});
```

### Events

#### iframe -> parent

| Event              | Payload            | Description                 |
| ------------------ | ------------------ | --------------------------- |
| `ready`            | `{}`               | Iframe loaded and ready     |
| `goToPage`         | `{ page: number }` | Navigate to page            |
| `closeModal`       | `{}`               | Close modal (from iframe)   |
| `exerciseCompleted`| `{}`               | Exercise completed          |
| `keyboardOpen`     | `{}`               | Request to open on-screen keyboard |
| `keyboardClose`    | `{}`               | Request to close on-screen keyboard |

#### parent -> iframe

| Event             | Payload          | Description                          |
| ----------------- | ---------------- | ------------------------------------ |
| `keyboardPressed` | `{ key: string }` | Key pressed on on-screen keyboard   |

### Message format

```js
{
  type: "multibook:event",
  event: "goToPage",
  payload: { page: 5 }
}
```

### Parent integration

```js
// Listen for events from iframe
window.addEventListener("message", (e) => {
  if (e.data?.type !== "multibook:event") return;

  const { event, payload } = e.data;

  switch (event) {
    case "ready":
      console.log("Iframe ready");
      break;
    case "goToPage":
      console.log("Navigate to page:", payload.page);
      break;
    case "exerciseCompleted":
      console.log("Exercise completed");
      break;
    case "keyboardOpen":
      console.log("Open on-screen keyboard");
      break;
    case "keyboardClose":
      console.log("Close on-screen keyboard");
      break;
  }
});

// Send events to iframe
iframe.contentWindow.postMessage({
  type: "multibook:event",
  event: "keyboardPressed",
  payload: { key: "a" }
}, "*");
```

## Required Scripts

The iframe resizer script must be included in `index.html`:

```html
<script src="/iframeResizer.contentWindow.min.js"></script>
```

This enables automatic height synchronization with the parent window.

## Development

Skopiuj `.env.example` do `.env` (usuń `.example` z nazwy) i uzupełnij wymagane wartości.

```bash
pnpm install
pnpm dev
```

### Preview Modal (dev only)

During development, a "Pokaż w modalu" button appears allowing you to preview the exercise in a resizable modal overlay. This simulates how the exercise will look when embedded in the parent application.

The preview modal is automatically excluded from production builds.

### Virtual Keyboard (dev only)

During development, a virtual on-screen keyboard is available for testing keyboard integration without running the parent application.

**How it works:**
- Click "Otwórz klawiaturę" button (or any `[data-keyboard-open]` element) to show the keyboard
- The keyboard sends `keyboardPressed` events via `postMessage` - exactly like the parent app does in production
- This allows testing the full SDK communication flow locally

**Features:**
- Polish letter layout (with ą, ć, ę, ł, ń, ó, ś, ź, ż)
- Numbers and symbols mode (toggle with 123/ABC button)
- Shift key: single tap = one uppercase letter, double tap = caps lock
- Special keys: space, backspace, delete, arrow left/right
- Draggable - click and drag to reposition
- Close via X button or `[data-keyboard-close]` element

**Key mappings sent to SDK:**
| Key | `keyboardPressed` payload |
|-----|---------------------------|
| Letters | `{ key: "a" }` or `{ key: "A" }` (with shift) |
| Space | `{ key: " " }` |
| Backspace | `{ key: "Backspace" }` |
| Delete | `{ key: "Delete" }` |
| Arrow Left | `{ key: "ArrowLeft" }` |
| Arrow Right | `{ key: "ArrowRight" }` |

The virtual keyboard is automatically excluded from production builds (0 bytes overhead).

## Build

```bash
pnpm build
```

Output in `dist/` folder.

### Upload

Przed wrzuceniem projektu zbuduj archiwum:

```bash
pnpm build:zip
```

## Icons

Projekt korzysta z Phosphor Icons:
- https://github.com/phosphor-icons/web
- https://phosphoricons.com/
