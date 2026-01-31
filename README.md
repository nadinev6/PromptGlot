# PromptGlot

<div align="center">

![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Version](https://img.shields.io/badge/version-0.1.0-orange?style=flat-square)
![Node](https://img.shields.io/badge/node-%3E%3D18-green?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square)
![React](https://img.shields.io/badge/React-19.2.3-61dafb?style=flat-square)

**The Chain-of-Thought Bridge for Multilingual AI Art**

Transform native language ideas into stunning AI art with culturally-aware prompt engineering.

[Documentation](./docs/START_HERE.md) • [Quick Start](#quick-start) • [Features](#features) • [Architecture](#architecture)

</div>

---

## What is PromptGlot? 🎨

PromptGlot solves a critical problem: **AI image models are biased towards English**, leaving non-native speakers with poor results.

### The Problem
- User in German: "Zeige mir einen Katzentanz" → DALL-E produces mediocre results
- Why? The model optimizes for English, and most quality training data is in English

### The Solution
PromptGlot acts as an **intelligent bridge**:

1. **User describes their idea in native language** (German, Afrikaans, Spanish, etc.)
2. **AI Persona engineers a perfect English prompt** using GPT-4o's chain-of-thought reasoning
3. **DALL-E 3 generates the image** from the optimized prompt
4. **Explanation is provided back in the user's language** so they understand the prompt engineering logic

**Result**: Better images for non-English speakers + educational insights into AI reasoning.

---

## 🚀 Quick Start

### 1. Setup Environment (1 minute)
```bash
cd prompt-glot
cp .env.local.example .env.local
# Add your OPENAI_API_KEY to .env.local
```

Get your API key: https://platform.openai.com/api-keys

### 2. Install & Run (30 seconds)
```bash
npm install
npm run dev
```

Visit: **http://localhost:3000**

### 3. Connect Lingo.dev (5 minutes)
1. Go to [app.lingo.dev](https://app.lingo.dev)
2. Create project: `prompt-glot`
3. Add translations for German, Afrikaans, Spanish
4. Export → Extract to `src/locales/`

---

## ✨ Features

### 🌐 Multi-Language Support
- **4 languages scaffolded**: English, German, Afrikaans, Spanish
- UI translations managed by **lingo.dev**
- AI personas configured per language
- Ready to scale to more languages

### 🤖 AI-Powered Prompt Engineering
- **GPT-4o** generates culturally-aware English prompts
- **DALL-E 3** creates stunning images
- **Explains reasoning** in user's native language
- Chain-of-thought prompting for better results

### 🔄 Localization at Scale
- **i18next** for UI translations
- **lingo.dev** integration for CI/CD localization
- **PromptOps**: AI personas version-controlled in Git
- **Hybrid CI/CD**: Manual pulls + optional GitHub Actions

### ⚡ Hackathon-Ready
- No pre-commit hooks (fast development)
- Build verified: ✅ npm run build passing
- All 366 packages installed & audited (0 vulnerabilities)
- TypeScript strict mode enabled
- Production-ready Next.js 16 setup

### 📦 Modern Tech Stack
- **Next.js 16** with Turbopack + React 19
- **TypeScript 5** for type safety
- **Tailwind CSS 4** for styling
- **OpenAI SDK** for GPT-4o & DALL-E 3
- **i18next** for internationalization

---

## 🏗️ Architecture

```
User Input (German)
    ↓
i18next loads German UI ("Zeige mir...")
    ↓
POST /api/generate { prompt: "...", lang: "de" }
    ↓
Load AI Persona: src/prompts/de/system.json
    ↓
GPT-4o Chain-of-Thought:
  ├─ Analyze user's request
  ├─ Generate optimized English prompt
  └─ Prepare explanation in German
    ↓
DALL-E 3: Generate image from English prompt
    ↓
Response:
{
  "imageUrl": "https://...",
  "explanation": "Ich habe folgende Schlüsselwörter gewählt..."
}
```

### PromptOps (GitOps for AI Personas)
- System prompts are **version-controlled in Git**
- Each language has its own AI personality
- Changes take effect immediately after commit
- Perfect for hackathon iteration

---

## 📋 Supported Languages

| Language | Code | Status |
|----------|------|--------|
| English | `en` | ✅ Reference |
| German | `de` | ✅ Complete |
| Afrikaans | `af` | ✅ Complete |
| Spanish | `es` | ✅ Complete |

---

## 🧪 Test Multilingual Art Generation

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Generate image in German
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Eine Katze im Weltall tanzt",
    "lang": "de"
  }'

# Response:
# {
#   "imageUrl": "https://...",
#   "explanation": "Ich habe mehrere Schlüsselwörter ausgewählt..."
# }
```

Try other languages:
- **Afrikaans**: `"'n Kat in die ruimte dans"`
- **Spanish**: `"Un gato en el espacio baila"`

---

## 📚 Documentation

All documentation is organized in the `docs/` folder:

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [`docs/START_HERE.md`](./docs/START_HERE.md) | 🎯 Quick start guide | 5 min |
| [`docs/QUICKSTART.md`](./docs/QUICKSTART.md) | ⚡ Commands & testing | 5 min |
| [`docs/SETUP_COMPLETE.md`](./docs/SETUP_COMPLETE.md) | 📖 Full setup overview | 10 min |
| [`docs/LINGO_DEV_SETUP.md`](./docs/LINGO_DEV_SETUP.md) | 🔧 Detailed workflows | 15 min |
| [`docs/INDEX.md`](./docs/INDEX.md) | 📚 Documentation index | 2 min |
| [`docs/IMPLEMENTATION_CHECKLIST.md`](./docs/IMPLEMENTATION_CHECKLIST.md) | ✅ Verification checklist | 5 min |

---

## 🎯 Project Structure

```
prompt-glot/
├── src/
│   ├── app/
│   │   ├── api/generate/route.ts    # Multi-language AI handler
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── locales/                      # UI Translations (lingo.dev)
│   │   ├── en/common.json
│   │   ├── de/common.json
│   │   ├── af/common.json
│   │   └── es/common.json
│   ├── prompts/                      # AI Personas (GitOps)
│   │   ├── en/system.json
│   │   ├── de/system.json
│   │   ├── af/system.json
│   │   └── es/system.json
│   └── i18n.js
├── docs/                             # Documentation
├── .env.local.example
├── .github/workflows/
│   └── pull-translations.yml         # Optional GitHub Actions
├── lingoconfig.json
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## 🔄 Localization Workflow

### Option A: Web Dashboard (Recommended)
1. Go to [app.lingo.dev](https://app.lingo.dev)
2. Create project: `prompt-glot`
3. Add English source strings
4. Add translations (de, af, es)
5. Export as JSON
6. Extract to `src/locales/`

### Option B: CLI
```bash
lingo pull
```

### Option C: GitHub Actions (Optional)
Set `LINGO_DEV_TOKEN` secret in GitHub → auto-syncs daily (see `.github/workflows/pull-translations.yml`)

**Why hybrid?** ⚡ No pre-commit hooks = fast, reliable development

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4 |
| **Backend** | Next.js API Routes |
| **AI/ML** | OpenAI GPT-4o + DALL-E 3 |
| **i18n** | i18next + lingo.dev |
| **Language** | TypeScript 5 |
| **Linting** | ESLint 9 |
| **Prompts** | GitOps (PromptOps) |
| **CI/CD** | GitHub Actions (optional) |

---

## 🚀 Commands

```bash
npm run dev              # Start development server (http://localhost:3000)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
```

---

## 🎓 Next Steps

### Immediate
1. ✅ Add `OPENAI_API_KEY` to `.env.local`
2. ✅ Run `npm run dev`
3. ✅ Test at http://localhost:3000

### Hackathon
1. ✅ Connect lingo.dev project
2. ✅ Add translations for all languages
3. ✅ Test multilingual AI art generation
4. ✅ Commit AI Persona improvements to Git

### Post-Hackathon
1. Add more languages (French, Portuguese, Japanese, etc.)
2. Enable GitHub Actions for daily translation syncs
3. Set up monitoring & analytics
4. Professional translation management

---

## 🔐 Environment Variables

Create `.env.local` (copy from `.env.local.example`):

```env
# Required: OpenAI API Key
OPENAI_API_KEY=sk-your-openai-key-here

# Optional: For GitHub Actions automation
LINGO_DEV_TOKEN=your-lingo-dev-token
```

**Never commit** `.env.local` or `.env.*.local` files (already in `.gitignore`)

---

## 📊 Build Status

| Component | Status |
|-----------|--------|
| Dependencies | ✅ 366 packages installed (0 vulnerabilities) |
| Build | ✅ `npm run build` passing |
| TypeScript | ✅ Strict mode enabled |
| Linting | ✅ ESLint configured |
| Production Ready | ✅ Verified |

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- [OpenAI](https://openai.com) - GPT-4o & DALL-E 3
- [Next.js](https://nextjs.org) - React framework
- [lingo.dev](https://lingo.dev) - Translation management
- [i18next](https://www.i18next.com) - Internationalization
- Hackathon community for inspiration

---

## 📞 Support

- **🎯 Quick Start**: See [`docs/START_HERE.md`](./docs/START_HERE.md)
- **❓ FAQ**: See [`docs/INDEX.md`](./docs/INDEX.md)
- **🔧 Setup Help**: See [`docs/LINGO_DEV_SETUP.md`](./docs/LINGO_DEV_SETUP.md)
- **⚡ Commands**: See [`docs/QUICKSTART.md`](./docs/QUICKSTART.md)

---

<div align="center">

**Built for the Lingo.dev hackathon. Scaled for production.**

[Start Now](./docs/START_HERE.md) → [Read Docs](./docs/INDEX.md) → [View Code](./src)

</div>
