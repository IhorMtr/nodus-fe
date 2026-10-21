# Frontend Architecture

The Nodus frontend uses a **DDD-inspired, domain-oriented architecture**. Its
purpose is to make ownership and dependencies explicit while keeping page
composition separate from reusable business functionality. It is not a literal
implementation of every DDD pattern: modules and abstractions should exist
because they serve a responsibility, not because a template requires them.

## Architectural layers

The source code is divided into five layers:

| Layer     | Responsibility                                                                      |
| --------- | ----------------------------------------------------------------------------------- |
| `shared`  | Domain-neutral infrastructure, design primitives, and reusable technical utilities. |
| `domains` | Business concepts, their operations, state, validation, and reusable business UI.   |
| `widgets` | Reusable application-level interface blocks that may compose domain capabilities.   |
| `views`   | Route-specific screens, page state, and orchestration of domain capabilities.       |
| `app`     | Routing, layouts, and providers or guards scoped to the routes that use them.       |

Dependencies flow toward lower-level capabilities:

```text
app     -> views, widgets, domains, shared
views   -> widgets, domains, shared
widgets -> domains, shared
domains -> shared
shared  -> shared, external packages
```

A domain-to-domain dependency is an exception, not a standard composition
technique. When necessary, it must use the other domain's public interface and
remain unidirectional. Cyclic dependencies are prohibited, including cycles
formed by type-only imports. Workflows involving several domains should
ordinarily be composed in `views`, `widgets`, or appropriately scoped `app`
code.

## Ownership and composition

### Shared

`shared` contains functionality without business meaning: generic UI controls,
HTTP infrastructure, query-client setup, localization infrastructure, theme
tokens, and technical helpers. A module does not become domain-neutral simply
because more than one domain uses it. Business rules and domain vocabulary
remain with their owner.

### Domains

Each domain owns a cohesive business area. Domain logic includes API access,
TanStack Query hooks, validation schemas, domain state, types, and
business-specific UI. Domains must not depend on `views`, `widgets`, or `app`.

Within `model`, organize code by **business concept or scenario**, rather than
by file type. A slice may contain its own `queries`, `mutations`, `hooks`,
`types`, `lib`, or `store` when required. A typical shape is:

```text
domains/<domain>/
  api/
    <domain>-api.ts
  model/
    <business-slice>/
      index.ts
      queries/
      mutations/
      types/
  ui/
    <business-component>/
      BusinessComponent.tsx
      BusinessComponent.module.scss
      index.ts
```

This is illustrative, not a required directory template. Files belong to the
smallest meaningful owner. Avoid catch-all folders such as `domain/shared`,
`model/shared`, or unqualified `types` and `hooks` at the root of a domain
model. A type used by multiple slices should remain in the slice that owns the
concept and be exposed through its public API.

Transport operations belonging to one domain are grouped into a clear object,
such as `authApi.login()` or `workspaceApi.create()`. Each implemented request
is exposed to React consumers through a domain-owned TanStack Query hook. Views
use these hooks rather than calling Axios or transport API objects directly.
Query keys, cache rules, and business-side effects remain with the relevant
slice.

### Widgets

Widgets are reusable application-level UI compositions, such as navigation or an
application shell. They can consume domain public APIs where the composition
requires it, but do not own the underlying business rules. Widgets must not
depend on views or app internals.

### Views

`views` mirrors the **actual route hierarchy**. A concrete screen lives in a
directory ending with `-view`; intermediate directories may represent actual URL
segments, but are not general-purpose component collections.

```text
views/
  landing-view/
  auth/
    login-view/
    register-view/
```

Each screen directory owns its view component, styles, page-specific sections,
hooks, stores, and other screen-only code. Shared UI used by multiple screens
belongs to its appropriate domain or widget instead of being placed directly in
a route-grouping folder.

Views primarily compose UI and coordinate behavior. A main `use*View` hook may
compose several smaller page hooks and domain hooks; page-specific workflows
need not live in one large hook. Reusable domain logic belongs in the domain,
while navigation decisions and page-specific state belong in the view.

### App

`app` is a thin framework layer. Route entries normally render views. Layouts
mount the interface composition, providers, and guards required at their
particular route scope. A provider belongs beside the layout that mounts it,
rather than being installed globally or detecting routes when its responsibility
is narrower.

Framework route groups, dynamic route segments, and localization do not require
separate copies of the same view. Server route handlers may provide narrowly
scoped transport integration, but should not reproduce domain business logic.

## UI boundaries and colocation

Generic controls belong to `shared/ui`. Components representing business
concepts or reusable business scenarios belong to the corresponding
`domains/<domain>/ui`. Components and sections used only by one screen belong
inside that screen's view directory.

Domain UI should ordinarily receive prepared values, errors, states, and
callbacks via props. It should not own route navigation, page orchestration, or
hidden API workflows. Local UI behavior such as focus, disclosure, and
interaction state may remain inside components.

Keep component-specific types, styles, and helpers beside the component. When
several components reuse UI-only resources, give those resources a **named,
coherent owner** at the narrowest suitable scope; do not create an unqualified
`shared` folder by default. Avoid duplication, but also avoid extracting trivial
one-use helpers or introducing wrappers solely to satisfy a folder convention.

## Public interfaces

Prefer narrow public entrypoints for business slices and UI components:

```text
domains/<domain>/model/<slice>/index.ts
domains/<domain>/ui/<component>/index.ts
```

Consumers should import through these interfaces rather than deep-importing
implementation files. Do not expose raw stores, internal transport clients, or
private helpers as public contracts. Avoid a domain-wide barrel that re-exports
everything. Internal modules can use direct imports where appropriate without
creating cycles.

## State and side effects

Use TanStack Query for remote data and its caching lifecycle. Domain stores are
appropriate for domain-owned client state; view-local state stays in its view.
Zustand should not duplicate a second copy of server data already managed by
TanStack Query. Purely presentational state can remain local to a component.

A domain owns its business lifecycle, while `views`, `widgets`, and scoped `app`
providers coordinate interactions that cross domain boundaries. Authentication,
permissions, and real-time features follow the same ownership rule; their
implementation details are not reasons to bypass layer boundaries.

## Styling and localization

Styles belong with the view or component they affect, using SCSS Modules. Shared
design tokens and global styling primitives live in `shared/styles`; components
consume semantic tokens instead of hardcoding theme-dependent values. Prefer
native semantic markup and Flexbox for straightforward layout, using Grid when
it better expresses the structure.

Translations are organized around domain concepts and reusable meanings rather
than the names of pages or React components. The localization layer handles
routing and message delivery; it does not own business content.

## Naming and code conventions

Directories and ordinary source files use lowercase **kebab-case**. React
component files use **PascalCase**, as do their corresponding SCSS Modules.
Concrete view directories end in `-view`. Framework-mandated filenames and
route-group syntax retain their required form.

Use strict TypeScript and named exports; default exports are reserved for
framework requirements or clear exceptions. Keep types straightforward, avoid
unnecessary wrappers and over-generalized abstractions, and allow small amounts
of obvious repetition when it improves readability. Logically related operations
may be grouped into objects, but unrelated responsibilities should remain
separate.

Comments and documentation are written in English. Logical section comments may
help organize substantial files; do not add commentary to obvious code or
enforce section headers in small files.

The governing principle is **explicit ownership with minimal coupling**: place
code where its responsibility belongs, compose across boundaries through public
interfaces, and introduce abstraction only when it makes the system easier to
understand and maintain.
