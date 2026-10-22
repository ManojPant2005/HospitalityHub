# Angular Cheat Sheet

A quick reference for building Angular features, using this project as an example.

## The app startup path

```text
src/main.ts
  → app/app.config.ts     Registers router, HTTP client, and interceptors
  → app/app.ts            Root component
  → app/app.html          Contains <router-outlet>
  → app/app.routes.ts     Chooses the page for the current URL
```

## Where things belong

```text
src/app/
  core/
    config/       App-wide configuration, such as the API base URL
    guards/       Route access checks
    interceptors/ Shared HTTP behavior, such as auth headers and errors
    models/       TypeScript interfaces for API data
    services/     Reusable API and application logic
  features/
    auth/         Login and registration screens
    rooms/        Room screens
    bookings/     Booking screens
  app.config.ts   Application providers
  app.routes.ts   URL-to-page configuration
```

## Build a feature in this order

1. **Describe the user action.** What page, input, result, loading state, and error state are needed?
2. **Check the API contract.** Confirm the endpoint, request body, and response shape.
3. **Define or reuse a model.** Example: `Room` in `src/app/core/models/room.ts`.
4. **Write the service method.** Put the `HttpClient` call in a service, not in the template.
5. **Build the component and template.** The component coordinates the page; the template displays state and handles user actions.
6. **Add the route.** Register the page in `src/app/app.routes.ts`.
7. **Test the important behavior.** Cover success, validation, and failure cases as appropriate.
8. **Verify the project.** Run `npm test` and `npm run build`.

The route can be added earlier while developing; this is a helpful order for thinking through a feature, not a strict rule.

## The usual data flow

```text
User action
  → Component method
  → Service method
  → HttpClient request
  → Backend API
  → Component updates state
  → Template displays the result
```

Example: the room list component calls `ApiService.getRooms()`, then saves the response in its `rooms` signal. Its template displays those rooms.

## Quick Angular vocabulary

| Term | What it does | Project example |
|---|---|---|
| Component | A screen or piece of UI: behavior plus a template | `features/rooms/room-list/room-list.ts` |
| Template | HTML that displays data and handles UI events | `features/rooms/room-list/room-list.html` |
| Model/interface | Describes the shape of data in TypeScript | `core/models/room.ts` |
| Service | Reusable logic, often API calls | `core/services/api.ts` |
| Route | Maps a URL to a page | `app.routes.ts` |
| Guard | Decides whether navigation is allowed | `core/guards/auth.guard.ts` |
| Interceptor | Adds shared behavior to HTTP requests/responses | `core/interceptors/auth.interceptor.ts` |
| Signal | Holds reactive state; read it with `signalName()` | `rooms`, `loading` in `room-list.ts` |
| Computed signal | Derives a value from other signals | `filteredRooms` in `room-list.ts` |
| Reactive form | Form model with validation rules | `loginForm` in `features/auth/login.ts` |

## Common patterns

### Model

```ts
export interface Room {
  id: number;
  roomNumber: string;
  type: string;
}
```

Keep API request and response types near the other models. TypeScript types help during development, but they do not validate untrusted data at runtime.

### Service

```ts
getRooms(): Observable<Room[]> {
  return this.http.get<Room[]>(`${this.baseUrl}/rooms`);
}
```

Keep HTTP requests in services. Use a focused service per domain as the app grows, for example `RoomService` and `BookingService`.

### Component state

```ts
readonly rooms = signal<Room[]>([]);
readonly loading = signal(true);
readonly roomCount = computed(() => this.rooms().length);
```

Use signals for local UI state and `computed()` for values derived from that state.

### Route

```ts
{ path: 'rooms', component: RoomListComponent }
```

For a page that should only be accessible after sign-in, the project uses `canActivate: [authGuard]`.

### Form

```ts
readonly loginForm = this.formBuilder.nonNullable.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', Validators.required],
});
```

Check `form.invalid` before submitting, show validation feedback, and represent submission and API errors in the UI.

## Authentication: end-to-end

```text
Login form
  → LoginComponent.onSubmit()
  → AuthService.login()
  → POST /api/auth/login
  → AuthController verifies credentials and returns a token
  → AuthService stores the token
  → Auth interceptor adds the bearer token to API requests
```

- **Login UI:** `src/app/features/auth/login.ts` and `login.html`
- **Auth API calls:** `src/app/core/services/auth.ts`
- **Token storage:** `src/app/core/services/auth-token-storage.ts`
- **Request Authorization header:** `src/app/core/interceptors/auth.interceptor.ts`
- **Protected page navigation:** `src/app/core/guards/auth.guard.ts`
- **Shared HTTP loading/errors:** `src/app/core/interceptors/loading-error.interceptor.ts`
- **Backend login/register endpoints:** `HospitalityHub.Api/Controllers/AuthController.cs`

**Security reminder:** a route guard is a navigation convenience, not backend security. The API must authorize protected operations itself. Browser-stored tokens are exposed if an attacker can execute script in the site, so XSS prevention and token-storage choices matter.

## Naming and everyday practices

- Components and classes: `PascalCase` — `RoomListComponent`
- Methods and properties: `camelCase` — `loadRooms()`, `isLoading`
- Models: clear domain names — `Room`, `Booking`
- Keep components focused on one page or UI responsibility.
- Keep templates readable; move complex logic into TypeScript.
- Prefer strong types over `any`.
- Include loading, empty, success, and error states where relevant.
- Use accessible labels, keyboard-friendly controls, and visible focus styles.
- Add dependencies only when the project needs them.

## Libraries: what should I install?

- **Angular CLI:** create and run the Angular application.
- **Angular Router, HttpClient, Reactive Forms, RxJS:** Angular features already used in this project.
- **Angular Material:** already installed here; provides Angular UI components.
- **Bootstrap:** an optional alternative styling/component toolkit. Usually choose Material or Bootstrap rather than installing both without a clear need.

For a new project, begin with the Angular CLI and add a UI library only when you know what it will provide. This project uses Material for some UI elements and also has custom CSS.

## Daily practice (30 minutes)

1. Pick one small feature or improvement.
2. Write down what “done” means.
3. Try implementing it before looking at the existing code.
4. Handle at least one failure or edge case.
5. Test the behavior.
6. Explain the data flow: “The user does this, the component does this, the service calls this endpoint, and the UI shows this.”

### Suggested next exercise

Build a **Room Details** page using the existing `getRoom(id)` method:

1. Add a route such as `/rooms/:id`.
2. Read the room ID from the route.
3. Call the service and show loading, success, and error states.
4. Add a link to the details page from the room list.
5. Test a successful load and a failed request.

## Commands

Run these from the `hospitality-client` folder:

```bash
npm start        # Start the development server
npm test         # Run unit tests
npm run build    # Build the application
```

This project uses Angular 21. For current Angular guidance, see the [Angular documentation](https://angular.dev/).
