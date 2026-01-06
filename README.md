<p align="center">
  <img src="logo.png" alt="TyMinder Logo" width="128" height="128">
</p>

<h1 align="center">TyMinder</h1>

<p align="center">
  A powerful, lightweight, and cross-platform mind mapping desktop application.
</p>

<p align="center">
  <a href="https://github.com/ACtom/TyMinder/releases"><img src="https://img.shields.io/github/v/release/ACtom/TyMinder?style=flat-square" alt="Release"></a>
  <a href="https://github.com/ACtom/TyMinder/blob/main/LICENSE"><img src="https://img.shields.io/github/license/ACtom/TyMinder?style=flat-square" alt="License"></a>
  <a href="https://github.com/ACtom/TyMinder/releases"><img src="https://img.shields.io/github/downloads/ACtom/TyMinder/total?style=flat-square" alt="Downloads"></a>
</p>

<p align="center">
  <a href="README-zh.md">简体中文</a> | English
</p>

---

## Features

- **Cross-Platform** - Built with Tauri 2, runs on Windows, macOS, and Linux
- **Rich Editing** - Node operations (insert, delete, arrange, summarize), copy/paste, undo/redo
- **Styling** - Font family, bold, italic, colors, style copy/paste
- **Icons** - Priority and progress indicators
- **Notes** - Markdown-formatted notes with live preview
- **Images** - Insert local or web images
- **Layouts** - Multiple layout styles (mind map, tree, organization chart, etc.)
- **Themes** - Various built-in themes
- **Search** - Quick search within mind map nodes
- **Auto Backup** - Automatic backup with configurable interval

## Screenshots


![Screenshot 1](screenshots/screenshot1.png)
![Screenshot 2](screenshots/screenshot2.png)
![Screenshot 3](screenshots/screenshot3.png)

## Installation

### Download

Download the latest installer from [Releases](https://github.com/ACtom/TyMinder/releases).

| Platform | Download |
|----------|----------|
| Windows  | `.exe` (NSIS Installer) |
| macOS    | `.dmg` |
| Linux    | `.AppImage` / `.deb` |

### File Association

TyMinder automatically associates with `.km` files during installation.

## Import & Export

### Supported Formats

| Format | Import | Export |
|--------|:------:|:------:|
| JSON (`.km`) | ✅ | ✅ |
| Markdown | ✅ | ✅ |
| Plain Text | ✅ | ✅ |
| FreeMind (`.mm`) | ✅ | ❌ |
| XMind (`.xmind`) | ✅ | ✅ |
| MindManager (`.mmap`) | ✅ | ❌ |
| PNG Image | ❌ | ✅ |
| SVG Vector | ❌ | ✅ |

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| New File | `Ctrl+N` |
| Open File | `Ctrl+O` |
| Save | `Ctrl+S` |
| Save As | `Ctrl+Shift+S` |
| Undo | `Ctrl+Z` |
| Redo | `Ctrl+Y` |
| Insert Child Node | `Tab` |
| Insert Sibling Node | `Enter` |
| Delete Node | `Delete` |
| Edit Node | `F2` / `Space` |
| Expand/Collapse | `Ctrl+/` |
| Search | `Ctrl+F` |

## Languages

- 简体中文 (Simplified Chinese)
- 繁體中文 (Traditional Chinese)
- English
- Deutsch (German)
- Français (French)
- Español (Spanish)
- Italiano (Italian)

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [Rust](https://www.rust-lang.org/) (for Tauri)
- npm or pnpm

### Setup

```bash
# Clone the repository
git clone https://github.com/ACtom/TyMinder.git
cd TyMinder

# Install dependencies
npm run init

# Start Tauri dev mode
npm run tauri dev
```

### Build

```bash
# Build for production
npm run build

# Build Tauri application
npm run tauri build
```

## Tech Stack

- **Frontend**: AngularJS, Bootstrap, [kityminder-core](https://github.com/fex-team/kityminder-core), [kityminder-editor](https://github.com/fex-team/kityminder-editor)
- **Desktop**: [Tauri 2](https://tauri.app/)
- **Graphics**: [Kity](https://github.com/fex-team/kity) (SVG rendering)

## Credits

TyMinder is built upon these excellent open-source projects:

- [kityminder-core](https://github.com/fex-team/kityminder-core) - Mind map core engine by Baidu FEX
- [kityminder-editor](https://github.com/fex-team/kityminder-editor) - Original editor implementation
- [Tauri](https://tauri.app/) - Build cross-platform desktop apps

## License

[GPL-2.0](LICENSE)
