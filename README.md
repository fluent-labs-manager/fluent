# Fluent

Frontend application built with **Vue 3**, **TypeScript**, and **Vite**.

---

## Requirements

| Tool    | Version                   |
|---------|---------------------------|
| Node.js | `^22.18.0` or `>=24.12.0` |
| npm     | `>=10`                    |

---

## Getting Started

### Install dependencies

```sh
npm install
```

### Start development server

```sh
npm run dev
```

Runs the app at `http://localhost:5173` with hot-reload.

### Build for production

```sh
npm run build
```

Output is placed in `dist/`.

### Preview the production build locally

```sh
npm run preview
```

---

## Linting & Formatting

The project uses a three-layer linting setup:

| Tool          | Scope                                                   |
|---------------|---------------------------------------------------------|
| **ESLint**    | TypeScript + Vue rules with Prettier integration        |
| **Stylelint** | CSS/SCSS inside `.vue` files and standalone stylesheets |
| **Prettier**  | Formatter for JS/TS/Vue/JSON/MD/YAML                    |

### Run linters (with auto-fix)

```sh
npm run lint
```

### Format all source files

```sh
npm run format
```

Runs Prettier over `src/`.

---

## Testing

### Unit tests — [Vitest](https://vitest.dev/)

```sh
# Run once
npm run test:unit

# Watch mode
npm run test:unit -- --watch

# With coverage
npm run test:unit -- --coverage
```

Unit test files live under `src/**/__tests__/`: `*.spec.ts` / `*.test.ts`.

### End-to-end tests — [Playwright](https://playwright.dev)

```sh
# First run: install browsers
npx playwright install

# Run all e2e tests
npm run test:e2e

# Run on Chromium only
npm run test:e2e -- --project=chromium

# Run a specific test file
npm run test:e2e -- e2e/vue.spec.ts

# Run in headed mode (see the browser)
npm run test:e2e -- --headed

# Run in debug mode
npm run test:e2e -- --debug
```

> **Note:** on CI, build the project first with `npm run build` before running e2e tests.

E2e test files are located in `e2e/`.

---

## Documentation

Project documentation is available in [`docs/readme.md`](docs/readme.md).

---

## Project Structure

```markdown
fluent/
├── docs/
│ ├── readme.md                             # Documentation index
│ ├── data.md                               # Data layer, API stubs, mock modes
│ └── styles.md                             # Design tokens and fonts
├── e2e/                                    # Playwright end-to-end tests
├── public/                                 # Static assets served as-is (favicon)
├── src/
│ ├── __tests__/                            # Unit tests (mirror src/: api/, components/, stores/, utils/, views/)
│ ├── api/                                  # API configuration and request types
│ │ ├── courses/                            # Course.dto.ts
│ │ ├── semesters/                          # Semester.dto.ts, SemestersApi.ts (stub for now)
│ │ └── users/                              # User.dto.ts, UsersApi.ts (stub for now)
│ ├── assets/
│ │ ├── fonts/                              # Web fonts (woff2)
│ │ └── base.css                            # Global styles, design tokens, @font-face
│ ├── components/                           # Reusable UI components
│ ├── composables/                          # Data loading for pages (useSemesters)
│ ├── layouts/                              # Page layouts (sidebar + content)
│ ├── mocks/                                # Temporary mock data for API stubs
│ ├── router/
│ ├── stores/                               # Pinia stores (current user)
│ ├── types/                                # Shared UI types (UserRole, SemesterFilter, IconName, NavItem, ...)
│ ├── utils/                                # Shared utilities (ApiResolver, GradeFormatter, ProgressPercentage)
│ ├── views/                                # Pages (lazy-loaded by the router)
│ ├── App.vue
│ └── main.ts
├── eslint.config.ts
├── .prettierrc
├── .stylelintrc.json
├── vite.config.ts
├── vitest.config.ts
└── playwright.config.ts
```

---

## Browser DevTools

- **Chromium** (Chrome, Edge,
  Brave): [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- **Firefox**: [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
