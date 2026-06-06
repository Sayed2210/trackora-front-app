# System Owner Plans Public Fields Implementation Plan

## Summary

Update the System Owner Plans UI so platform admins can manage the Plan fields used by the public marketing pricing API:

| Field | Purpose |
|-------|---------|
| `yearlyPrice` | Optional annual price displayed on pricing pages. |
| `isPublic` | Controls whether a plan appears on the marketing website. |
| `isPopular` | Marks a public plan as highlighted/popular. |
| `sortOrder` | Controls display ordering for public pricing plans. |

System Owner Plans remain the source of truth for website pricing.

## Files To Change

| File | Change |
|------|--------|
| `libs/features/platform/plans/src/lib/domain/models/platform-plan.models.ts` | Extend `PlatformPlan`, `PlanPayload`, and possibly `PlansQuery` sort options. |
| `libs/features/platform/plans/src/lib/infrastructure/dtos/platform-plans.dtos.ts` | Add DTO request/response fields for public pricing fields. |
| `libs/features/platform/plans/src/lib/infrastructure/mappers/platform-plans.mapper.ts` | Map backend fields into domain model and outgoing payload. |
| `libs/features/platform/plans/src/lib/presentation/components/plan-form.component.ts` | Add create/edit controls and patch existing values. |
| `libs/features/platform/plans/src/lib/presentation/components/plan-ui.helpers.ts` | Add payload normalization and validators. |
| `libs/features/platform/plans/src/lib/presentation/components/plan-summary.component.ts` | Display public pricing metadata on detail page. |
| `libs/features/platform/plans/src/lib/presentation/pages/plans-list-page/plans-list-page.component.ts` | Display website visibility, popular state, yearly price, and sort order on plan cards. |
| `libs/features/platform/plans/src/lib/presentation/components/plan-form.component.spec.ts` | Assert new fields are emitted in payload and validated. |
| `libs/features/platform/plans/src/lib/presentation/pages/plans-list-page/plans-list-page.component.spec.ts` | Update plan fixtures and assert public metadata renders. |
| `libs/features/platform/plans/src/lib/infrastructure/platform-plans.repository.spec.ts` | Assert DTO mapping and outgoing payload include new fields. |
| `libs/features/platform/plans/src/lib/application/plans.facade.spec.ts` | Update fixtures if strict type checking requires new fields. |

## Data Model And Type Changes

Extend `PlatformPlan` with:

```ts
yearlyPrice: number | null;
isPublic: boolean;
isPopular: boolean;
sortOrder: number;
```

Extend `PlanPayload` with:

```ts
yearlyPrice?: number | null;
isPublic?: boolean;
isPopular?: boolean;
sortOrder?: number;
```

Extend `PlatformPlanDto` to read likely backend variants:

```ts
yearlyPrice?: unknown;
yearly_price?: unknown;
isPublic?: unknown;
is_public?: unknown;
isPopular?: unknown;
is_popular?: unknown;
sortOrder?: unknown;
sort_order?: unknown;
```

Extend `PlatformPlanPayloadDto` with the backend request fields. Prefer camelCase unless backend Swagger confirms snake_case.

## Form Changes

Add controls to `PlanFormComponent`:

| Control | Type | Default | Validation |
|---------|------|---------|------------|
| `yearlyPrice` | `number | null` | `null` | blank or non-negative decimal |
| `isPublic` | `boolean` | `false` | none |
| `isPopular` | `boolean` | `false` | none |
| `sortOrder` | `number` | `0` | zero or positive integer |

Add UI fields:

| UI | Placement |
|----|-----------|
| Yearly price input | Near current monthly/base `price` input. |
| Public on website checkbox | Near active toggle or in a new marketing visibility section. |
| Popular badge checkbox | Same marketing visibility section. |
| Sort order number input | Same marketing visibility section. |

Edit mode must patch all new fields from `this.plan`.

Submit must include all new fields through `payloadFromRaw`.

## Table And List Changes

`PlansListPageComponent` currently renders card-based plan summaries, not a table. Update cards to show:

| Field | Display |
|-------|---------|
| `isPublic` | Website/Public or Private badge. |
| `isPopular` | Popular badge when true. |
| `yearlyPrice` | Annual price line when present. |
| `sortOrder` | Small metadata value for public ordering. |

Optional lightweight metrics:

| Metric | Calculation |
|--------|-------------|
| Public plans | `plans.filter(plan => plan.isPublic && !plan.archived).length` |
| Popular plans | `plans.filter(plan => plan.isPopular && !plan.archived).length` |

Add `sortOrder` to sort options only if backend supports `sort=sortOrder`.

Do not add public/popular filters unless backend supports corresponding query params.

## API Payload Changes

Update `mapPlatformPlan` to read:

```ts
yearlyPrice: readNullableNumber(dto.yearlyPrice ?? dto.yearly_price),
isPublic: readBoolean(dto.isPublic ?? dto.is_public, false),
isPopular: readBoolean(dto.isPopular ?? dto.is_popular, false),
sortOrder: readNumber(dto.sortOrder ?? dto.sort_order, 0),
```

Update `mapPlanPayload` to send:

```ts
yearlyPrice: payload.yearlyPrice ?? null,
isPublic: payload.isPublic,
isPopular: payload.isPopular,
sortOrder: payload.sortOrder,
```

Keep existing endpoints unchanged unless backend requires different routes:

| Operation | Endpoint |
|-----------|----------|
| List | `GET /platform/plans` |
| Detail | `GET /platform/plans/:id` |
| Create | `POST /platform/plans` |
| Update | `PATCH /platform/plans/:id` |
| Archive/delete | `DELETE /platform/plans/:id` |

## Validation Changes

Current Plans validation is implemented in `plan-ui.helpers.ts`, not a separate schema file.

Required changes:

| Validator | Rule |
|-----------|------|
| Existing `positiveDecimalValidator` | Keep for required base `price`. |
| New optional yearly price validator | Blank/null is valid; otherwise value must be zero or positive decimal. |
| New sort order validator | Must be integer and `>= 0`. |
| Existing `positiveLimitValidator` | Keep unchanged for plan limits. |

Normalization changes in `payloadFromRaw`:

| Field | Normalization |
|-------|---------------|
| `yearlyPrice` | `null` when blank; otherwise `Number(value)`. |
| `isPublic` | `Boolean(raw['isPublic'])`. |
| `isPopular` | `Boolean(raw['isPopular'])`. |
| `sortOrder` | `Number(raw['sortOrder'] ?? 0)`. |

## Tests To Update

| Test File | Assertions |
|-----------|------------|
| `plan-form.component.spec.ts` | Valid form emits `yearlyPrice`, `isPublic`, `isPopular`, `sortOrder`; invalid yearly price/sort order blocks submit. |
| `platform-plans.repository.spec.ts` | Mapper reads backend fields and maps outgoing create/update payload. |
| `plans-list-page.component.spec.ts` | Rendered cards include public/private and popular metadata. |
| `plans.facade.spec.ts` | Fixture compatibility with extended `PlatformPlan` type. |

## Verification Commands

Run after dependencies are installed:

```bash
npm exec nx test plans
npm exec nx lint plans
npm exec nx build owner
```

If route integration or owner-level behavior changes, also run:

```bash
npm exec nx test owner
```

Current local note: `npm exec nx show project plans --json` failed because Nx modules were not found in the workspace. Run `npm install` before Nx verification if `node_modules` is missing.

## Backend Risks And Mismatches

| Risk | Needed Confirmation |
|------|---------------------|
| Field casing | Confirm request and response casing: camelCase vs snake_case. |
| `yearlyPrice` nullability | Confirm whether `null` is accepted, or if field must be omitted when blank. |
| `yearlyPrice` rules | Confirm whether required when `isPublic = true`. |
| `sortOrder` type conflict | Existing docs use `sortOrder` as query direction elsewhere; confirm Plan `sortOrder` is a numeric model field. |
| Popular plan constraints | Confirm whether `isPopular = true` requires `isPublic = true`. |
| Public plan constraints | Confirm whether `isPublic = true` requires `active = true` and `archived = false`. |
| List sorting/filtering | Confirm whether backend supports `sort=sortOrder`, `isPublic`, or `isPopular` query params before adding filters. |
