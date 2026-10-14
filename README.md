# Fluent

Frontend application built with **Vue 3**, **TypeScript**, and **Vite**.

---

> **Application Configurations:** the procedure for working with Doppler configs, local
> development and GitHub Environments are described in [Doppler instructions](docs/doppler.md).

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

E2e test files are located in `e2e/` (shared locators and helpers — in `e2e/helpers.ts`).

#### Setup

```sh
# Install dependencies (also pins the Playwright version from package-lock.json)
npm ci

# Install browsers matching that Playwright version (chromium, firefox, webkit)
npm run test:e2e:install

# Linux only: also install system libraries the browsers need (uses sudo)
npm run test:e2e:install -- --with-deps
```

Environment variables: while the API is stubbed (`src/api/*Api.ts`), none are required.
Playwright passes `VITE_API_URL` / `VITE_API_SOCKET_URL` from your environment if they are set
(e.g. `doppler run -- npm run test:e2e`). `VITE_SENTRY_DSN_URL` is always empty during e2e runs,
so test sessions never reach Sentry.

#### Run

```sh
# Run all e2e tests in all three browsers (headless, non-interactive)
npm run test:e2e
```

Playwright starts its own dev server on `http://localhost:5180` (`--strictPort`, so it fails fast
if the port is busy instead of silently switching). If a server is already running on that port,
it is reused. Your regular `npm run dev` on 5173 is not affected.

#### Targeted runs

```sh
# One browser
npm run test:e2e -- --project=chromium

# One file
npm run test:e2e -- e2e/courses.spec.ts

# One test by line number
npm run test:e2e -- e2e/courses.spec.ts:11

# Tests whose title matches a pattern
npm run test:e2e -- -g "Повторить"
```

#### Debugging

```sh
# Watch the browser while tests run
npm run test:e2e -- --headed

# Step through a test with the Playwright Inspector
npm run test:e2e -- --debug

# Interactive UI mode: pick tests, time-travel through each step
npm run test:e2e -- --ui

# Open the HTML report of the last run
npx playwright show-report

# Open a trace of a failed test
npx playwright show-trace test-results/<test-folder>/trace.zip
```

On failure, Playwright prints the expected/received values to the console and saves a screenshot,
a trace and `error-context.md` to `test-results/`; the HTML report goes to `playwright-report/`.
The report never opens automatically, so the command does not block a terminal or CI.

#### CI

The `code-e2e-testing` job in `.github/workflows/ci.yml` builds the app, serves it with
`npm run preview` on port 4173 and runs `npm run test:e2e -- --project=chromium` with 2 retries.
Only Chromium runs in CI: the scenarios test application logic, not engine differences.
The HTML report (with traces of failed tests) is uploaded as the `playwright-report` artifact.

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
