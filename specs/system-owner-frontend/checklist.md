# Trackora System Owner Frontend App Checklist

## Build And Workspace

| Check | Status |
|-------|--------|
| Owner Angular app named `owner` exists. | Pending |
| Owner app builds. | Pending |
| Owner app has Nx targets aligned with workspace conventions. | Pending |
| Owner app is isolated from admin, merchant, courier, and public website apps. | Pending |
| No dashboard app leaks into public website. | Pending |

## Routing

| Check | Status |
|-------|--------|
| `/owner` route exists. | Pending |
| `/owner/overview` route exists. | Pending |
| `/owner/tenants` route exists. | Pending |
| `/owner/tenants/create` route exists. | Pending |
| `/owner/tenants/:tenantId` route exists. | Pending |
| `/owner/tenants/:tenantId/usage` route exists. | Pending |
| `/owner/tenants/:tenantId/users` route exists. | Pending |
| `/owner/tenants/:tenantId/billing` route exists. | Pending |
| `/owner/tenants/:tenantId/feature-flags` route exists. | Pending |
| `/owner/plans` route exists. | Pending |
| `/owner/plans/create` route exists. | Pending |
| `/owner/plans/:planId` route exists. | Pending |
| `/owner/plans/:planId/edit` route exists. | Pending |
| `/owner/subscriptions` route exists. | Pending |
| `/owner/subscriptions/:subscriptionId` route exists. | Pending |
| `/owner/usage` route exists. | Pending |
| `/owner/billing` route exists. | Pending |
| `/owner/invoices` route exists. | Pending |
| `/owner/feature-flags` route exists. | Pending |
| `/owner/audit-logs` route exists. | Pending |
| `/owner/support` route exists. | Pending |
| `/owner/settings` route exists. | Pending |

## Auth And Permissions

| Check | Status |
|-------|--------|
| Auth guard works. | Pending |
| Platform-only route protection works. | Pending |
| `PLATFORM_OWNER` role is supported. | Pending |
| `PLATFORM_ADMIN` role is supported. | Pending |
| `PLATFORM_SUPPORT` role is supported. | Pending |
| `PLATFORM_FINANCE` role is supported. | Pending |
| Permission guard works. | Pending |
| `manage_tenants` controls tenant mutations. | Pending |
| `manage_plans` controls plan mutations. | Pending |
| `manage_subscriptions` controls subscription mutations. | Pending |
| `view_platform_analytics` controls analytics routes. | Pending |
| `manage_feature_flags` controls feature flag routes and actions. | Pending |
| `view_audit_logs` controls audit log route. | Pending |
| `impersonate_tenant_admin` controls impersonation actions. | Pending |
| `view_billing` controls billing and invoice routes. | Pending |
| `suspend_tenants` controls tenant suspension. | Pending |
| Permissions hide/show actions correctly. | Pending |
| Forbidden page appears for unauthorized direct access. | Pending |

## API And Data

| Check | Status |
|-------|--------|
| Frontend matches backend Swagger. | Pending |
| PlatformApiClient is defined. | Pending |
| Auth interceptor is used. | Pending |
| API errors are handled. | Pending |
| Pagination mapper exists. | Pending |
| DTO to domain mappers exist. | Pending |
| Platform tenants repository exists. | Pending |
| Platform plans repository exists. | Pending |
| Platform subscriptions repository exists. | Pending |
| Platform feature flags repository exists. | Pending |
| Platform analytics repository exists. | Pending |
| Platform billing repository exists. | Pending |
| Platform audit logs repository exists. | Pending |
| Platform support repository exists. | Pending |

## UI And UX

| Check | Status |
|-------|--------|
| Sidebar exists. | Pending |
| Topbar exists. | Pending |
| Global search exists or is explicitly scoped. | Pending |
| Breadcrumbs exist. | Pending |
| Page headers exist. | Pending |
| Filters exist where required. | Pending |
| Data tables exist where required. | Pending |
| Stat cards exist where required. | Pending |
| Status badges exist. | Pending |
| Confirmation dialogs exist. | Pending |
| Reason-required modal exists. | Pending |
| Loading states exist. | Pending |
| Empty states exist. | Pending |
| Error states exist. | Pending |
| Forbidden states exist. | Pending |
| No random colors are used. | Pending |
| Trackora tokens are used consistently. | Pending |
| Arabic RTL works. | Pending |
| English LTR works. | Pending |
| Desktop/laptop layout is prioritized. | Pending |
| Tablet layout remains usable. | Pending |

## Feature Modules

| Check | Status |
|-------|--------|
| Overview dashboard displays total tenants. | Pending |
| Overview dashboard displays active tenants. | Pending |
| Overview dashboard displays trial tenants. | Pending |
| Overview dashboard displays suspended tenants. | Pending |
| Overview dashboard displays total shipments. | Pending |
| Overview dashboard displays active merchants. | Pending |
| Overview dashboard displays active couriers. | Pending |
| Overview dashboard displays COD volume. | Pending |
| Overview dashboard displays payout volume. | Pending |
| Overview dashboard displays fraud flagged shipments. | Pending |
| Overview dashboard displays top tenants by shipment volume. | Pending |
| Overview dashboard displays alerts. | Pending |
| Tenants table has pagination/filtering. | Pending |
| Tenants create form validates correctly. | Pending |
| Tenant status changes require reason. | Pending |
| Tenant usage page works. | Pending |
| Tenant users summary works. | Pending |
| Tenant billing summary works. | Pending |
| Tenant feature flags summary works. | Pending |
| Plans list/cards work. | Pending |
| Plans create/edit forms validate correctly. | Pending |
| Plan archive/delete safe behavior works. | Pending |
| Subscriptions table has pagination/filtering. | Pending |
| Subscription details work. | Pending |
| Subscription mutations require reason. | Pending |
| Feature flags global view works. | Pending |
| Tenant feature flag override view works. | Pending |
| Override/inherit/null semantics work. | Pending |
| Billing overview works. | Pending |
| Invoices view works. | Pending |
| Audit log filters work. | Pending |
| Audit sensitive values are masked. | Pending |
| Support tenant search works. | Pending |
| Tenant health view works. | Pending |
| Impersonation banner works. | Pending |
| End impersonation button works. | Pending |
| Dangerous actions require confirmation. | Pending |

## Security UX

| Check | Status |
|-------|--------|
| Reason-required actions work. | Pending |
| Destructive actions require confirmation. | Pending |
| Active impersonation banner is always visible during impersonation. | Pending |
| Dangerous action warnings are clear. | Pending |
| Sensitive audit values are masked. | Pending |
| 403 responses show forbidden state. | Pending |
| Auth failures redirect or recover consistently. | Pending |

## Final QA

| Check | Status |
|-------|--------|
| Owner app builds. | Pending |
| Relevant tests pass. | Pending |
| Relevant lint passes. | Pending |
| API errors handled. | Pending |
| Tables have pagination/filtering. | Pending |
| Forms validate correctly. | Pending |
| Arabic RTL works. | Pending |
| English LTR works. | Pending |
| Frontend matches backend Swagger. | Pending |
| No owner routes leak into public website. | Pending |
| No owner routes leak into tenant admin dashboard. | Pending |
| No owner routes leak into merchant portal. | Pending |
| No owner routes leak into courier app. | Pending |
