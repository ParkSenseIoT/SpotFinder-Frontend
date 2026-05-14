# 6.2.1.5. Testing Suite Evidence for Sprint Review

Para este Sprint el alcance de pruebas automatizadas se concentra en **Unit Tests** sobre la **Web Application (PWA) SpotFinder**, implementados con **Karma + Jasmine** sobre el builder oficial `@angular-devkit/build-angular:karma` y **Angular TestBed**. Las pruebas cubren las capas de **dominio** (utilidades y reglas de negocio del bounded context de Payments y Notifications) y **aplicación** (stores con `@ngrx/signals` y `computed`), además de la **infraestructura** (`TokenStorageService` y `authGuard`), aplicando el patrón de mocks vía `TestBed.configureTestingModule({ providers: [{ provide: …, useValue: … }] })` y `jasmine.createSpyObj(...)` para aislar las dependencias de `HttpClient`, `Router` y `localStorage`. Los **Integration Tests** y **Acceptance Tests** bajo el enfoque **BDD** (archivos `.feature` con Gherkin y Steps) no aplican en el Sprint 1 y se incorporarán en el Sprint 2 cuando se conecte la Web App al backend monolítico REST API en escenarios end-to-end.

## Unit Tests — Web Application (PWA)

| Test File | Clase / Componente bajo prueba | Comportamientos verificados |
|---|---|---|
| `iam/infrastructure/storage/token-storage.service.spec.ts` | `TokenStorageService` (Infrastructure Service) | Persistencia del JWT y del usuario en `localStorage` vía `saveSession`; sobreescritura cuando se guarda una segunda sesión; retorno `null` para `getToken`/`getUser` cuando no hay sesión; limpieza completa de `localStorage` en `clearSession` (logout). |
| `iam/application/guards/auth.guard.spec.ts` | `authGuard` (CanActivateFn) | Acceso concedido cuando `TokenStorageService.getToken()` retorna un JWT; redirección a `/auth/login` y retorno `false` cuando no hay token; mocks de `Router` y `TokenStorageService` provistos vía `TestBed`. |
| `iam/application/store/auth.store.spec.ts` | `AuthStore` (Application Store con `signalStore` de NgRx) | Estado signed-out por defecto (`user=null`, `isAuthenticated=false`); `login()` persiste el mock JWT, marca `isAuthenticated=true` y redirige a `/dashboard`; `logout()` limpia la sesión, resetea el estado y redirige a `/auth/login`. |
| `parking-monitoring/application/store/monitoring.store.spec.ts` | `MonitoringStore` (Application Store con `withComputed`) | Estado inicial con fleet vacío y sin sector seleccionado; cómputo del computed signal `sectorGroups` que agrupa los slots de 6 en 6 (`SECTOR A`, `SECTOR B`…) y calcula `occupiedCount`/`totalCount` por sector a partir de los slots cargados por `loadAllSlots`; `selectSector()` y `clearSelection()` mutan correctamente el sector seleccionado. |
| `payments/domain/utils/payment-filter.utils.spec.ts` | `applyPaymentFilters` (Domain Utility) | Resultado completo y ordenado por `paidAt` descendente con los filtros por defecto; filtrado por `paymentMethod`, por `status` y por `transactionQuery` (case-insensitive sobre `transactionId`); ventana `dateFrom`/`dateTo` aplicada sobre `paidAt` (descarta pagos fuera del rango y los que tengan `paidAt=null` cuando se aplica rango). |
| `notifications/domain/utils/notification-display.utils.spec.ts` | `notification-display.utils` (Domain Utility) | `isUnreadStatus`: trata `PENDING`, `SENT` y `DELIVERED` como no leídas (alimenta el badge del topbar) y descarta `READ`/`FAILED`; `severityFromNotificationType`: mapea `EMERGENCY_ALERT→CRITICAL`, `PAYMENT_FAILED`/`PAYMENT_REMINDER`/`SYSTEM_ALERT→WARNING`, `PAYMENT_SUCCESS→SUCCESS` y eventos operacionales→`INFO`; `isActivitySystemType`: identifica los tipos que alimentan el Activity Feed (`ENTRY_CONFIRMED`, `SESSION_END`, `SYSTEM_ALERT`). |
| `app.component.spec.ts` | `AppComponent` (root component) | Creación del componente raíz con `provideRouter([])`; expone el `title='spotfinder-web'` usado como nombre de la PWA; renderiza el `<router-outlet>` que monta las rutas de los bounded contexts (IAM, Parking Monitoring, Payments, Notifications). |

**Resultado del último run:** **27 tests pasando en 7 spec files** (`npx ng test --watch=false --browsers=ChromeHeadless` ejecuta el builder `@angular-devkit/build-angular:karma` con Karma 6.4.4 y Jasmine 5.6.0 sobre Chrome Headless 148).

```text
TOTAL: 27 SUCCESS
✔ Browser application bundle generation complete.
```

## Commits relacionados con Testing — Web Application (PWA)

**URL del repositorio:** [https://github.com/ParkSenseIoT/SpotFinder-Frontend](https://github.com/ParkSenseIoT/SpotFinder-Frontend)

| Repository | Branch | Commit Id | Commit Message | Commit Message Body | Committed on (Date) |
|---|---|---|---|---|---|
| ParkSenseIoT/SpotFinder-Frontend | feature/testing | - | `test(iam): cover token storage, auth guard and auth store` | Añade unit tests del bounded context IAM: persistencia del JWT y usuario en `TokenStorageService`, redirección de `authGuard` cuando no hay sesión, y comportamiento del `AuthStore` para los flujos de login/logout. Los specs mockean `TokenStorageService` y `Router` vía `TestBed` para no depender de `localStorage` real ni de la navegación de Angular. | 2026-05-14 |
| ParkSenseIoT/SpotFinder-Frontend | feature/testing | - | `test(parking-monitoring): cover sector grouping computed signal` | Añade unit tests del bounded context Parking Monitoring: estado inicial del `MonitoringStore`, agrupación automática de slots en sectores de 6 (computed `sectorGroups`) con `occupiedCount`/`totalCount` correctos, y los métodos `selectSector`/`clearSelection`. El spec mockea `MonitoringHttpService` con `jasmine.createSpyObj` para entregar un fleet determinístico de 8 slots. | 2026-05-14 |
| ParkSenseIoT/SpotFinder-Frontend | feature/testing | - | `test(payments): cover applyPaymentFilters pipeline` | Añade unit tests sobre la utilidad de dominio `applyPaymentFilters` del bounded context Payments: filtros por método de pago (YAPE, CREDIT_CARD, DEBIT_CARD), por status (PENDING/COMPLETED/FAILED), búsqueda case-insensitive sobre `transactionId`, ventana `dateFrom`/`dateTo` sobre `paidAt`, y ordenamiento descendente por fecha de pago. | 2026-05-14 |
| ParkSenseIoT/SpotFinder-Frontend | feature/testing | - | `test(notifications): cover display utils mapping` | Añade unit tests sobre las utilidades de presentación de `Notifications`: `isUnreadStatus` para el badge del topbar, `severityFromNotificationType` (mapeo a CRITICAL/WARNING/SUCCESS/INFO) y `isActivitySystemType` que alimenta el Activity Feed. | 2026-05-14 |
| ParkSenseIoT/SpotFinder-Frontend | feature/testing | - | `test(app): fix root spec to match router-outlet template` | El spec raíz fallaba porque la plantilla de `AppComponent` ya no renderiza `Hello, spotfinder-web` sino sólo `<router-outlet />` y el componente requiere `Router`. Provee `provideRouter([])` en el módulo de test y reemplaza el assertion obsoleto por uno que verifica que el `<router-outlet>` se monta en el DOM. | 2026-05-14 |
| ParkSenseIoT/SpotFinder-Frontend | feature/testing → develop | - | `Merge branch 'feature/testing' into develop` | Incorpora la suite de Unit Tests del Sprint 1 cubriendo IAM (`TokenStorageService`, `authGuard`, `AuthStore`), Parking Monitoring (sector grouping computed), Payments (`applyPaymentFilters`) y Notifications (display utils), más el fix del spec raíz para dejar la suite completa en verde (27 tests / 7 spec files). | 2026-05-14 |

> Los `Commit Id` quedarán definitivos al ejecutar `git add . && git commit` sobre la rama `feature/testing` y serán reemplazados en este documento antes del Sprint Review.

## Cómo correr las pruebas

```bash
# Modo CI (one-shot, headless, exit code 0/1 para pipelines)
npx ng test --watch=false --browsers=ChromeHeadless

# Modo dev (watch + Chrome con DevTools)
npm test
```

## Estructura de archivos de test

```
src/app/
├── app.component.spec.ts                                          # root component
├── iam/
│   ├── application/
│   │   ├── guards/auth.guard.spec.ts                              # CanActivateFn
│   │   └── store/auth.store.spec.ts                               # signalStore
│   └── infrastructure/
│       └── storage/token-storage.service.spec.ts                  # localStorage adapter
├── parking-monitoring/
│   └── application/store/monitoring.store.spec.ts                 # computed sectorGroups
├── payments/
│   └── domain/utils/payment-filter.utils.spec.ts                  # filter pipeline
└── notifications/
    └── domain/utils/notification-display.utils.spec.ts            # severity & inbox mapping
```
