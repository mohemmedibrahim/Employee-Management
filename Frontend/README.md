
# Employee Management System – Angular Frontend

A responsive admin dashboard for the **Employee Management System** ASP.NET Core backend.
Built with **Angular 22 (standalone components)**, TypeScript, Angular Router, HttpClient, RxJS and Reactive Forms – plain CSS only (no Bootstrap or other UI framework).

All data comes from the backend REST API. There is **no fake data** and the frontend never talks to SQL Server directly.

---

## 1. Required software

| Software | Version | Check with |
|----------|---------|------------|
| Node.js | 20.19+ , 22.12+ or 24+ (LTS recommended) | `node -v` |
| npm | 10+ (comes with Node.js) | `npm -v` |
| Backend API | the `EmployeeManagement_Backend` project, running | – |
| A modern browser | Chrome, Edge, Firefox or Safari | – |

You do **not** need to install the Angular CLI globally – the project uses the local one through `npm` scripts.

---

## 2. Install dependencies

```bash
cd employee-management-frontend
npm install
```

---

## 3. Run the project

```bash
npm start
```

Open **http://localhost:4200**. The app reloads automatically when you change a file.

Other commands:

| Command | What it does |
|---------|--------------|
| `npm start` | Development server on http://localhost:4200 |
| `npm run build` | Production build into `dist/` |
| `npm run watch` | Development build that rebuilds on every change |

---

## 4. Configure the Backend API URL

The API address lives in the Angular environment files:

| File | Used by | Default |
|------|---------|---------|
| `src/environments/environment.development.ts` | `npm start` (development) | `https://localhost:7080` |
| `src/environments/environment.ts` | `npm run build` (production) | `https://localhost:7080` |

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'https://localhost:7080',   // <- change this (no trailing slash)
  currencyCode: 'INR',                    // <- currency used to display salaries (ISO 4217)
};
```

The backend launch profiles are `https://localhost:7080` and `http://localhost:5080`.
**Use the HTTPS address.** The backend calls `UseHttpsRedirection()`, and browsers cannot follow a redirect during a CORS pre-flight request, so `http://localhost:5080` fails from Angular.

After changing an environment file, restart `npm start`.

---

## 5. Connect the frontend and the backend

1. **Start the backend** (see the backend README) and make sure SQL Server is configured and the migration has been applied:

   ```bash
   cd EmployeeManagement.API
   dotnet ef database update
   dotnet run
   ```

2. **Trust the ASP.NET Core development certificate** (once), so the browser accepts `https://localhost:7080`:

   ```bash
   dotnet dev-certs https --trust
   ```

   Then open https://localhost:7080/scalar in the browser to confirm the API answers.

3. **Enable CORS in the backend** (see section 6 – required, the browser blocks the calls otherwise).

4. **Start the frontend** with `npm start` and open http://localhost:4200.

If the backend cannot be reached, the app shows a clear message such as *"Cannot reach the backend at https://localhost:7080 …"* with a **Retry** button.

---

## 6. Backend CORS configuration

The Angular dev server runs on `http://localhost:4200`, the API on `https://localhost:7080`. These are different origins, so the backend must explicitly allow Angular.

> The `EmployeeManagement_Backend_with_CORS.zip` delivered with this frontend **already contains** this change. If you keep your own copy of the backend, apply the three steps below.

### Where to add it in `Program.cs`

**Step 1 – register the policy** (after `AddControllers()` / `AddOpenApi()` and *before* `var app = builder.Build();`):

```csharp
const string AngularCorsPolicy = "AngularClient";

builder.Services.AddCors(options =>
{
    options.AddPolicy(AngularCorsPolicy, policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod());
});
```

**Step 2 – use the policy** (after `app.UseHttpsRedirection();` and *before* `app.UseAuthorization();`):

```csharp
app.UseHttpsRedirection();

app.UseCors(AngularCorsPolicy);   // <-- add this line

app.UseAuthorization();
app.MapControllers();
```

**Step 3 – keep error messages visible.** If your exception middleware calls `context.Response.Clear()`, remove that call. It wipes the CORS headers, and the browser would then show a generic "CORS error" instead of your 404/409 message.

> The supplied backend reads the allowed origins from `appsettings.json` (`"Cors": { "AllowedOrigins": [ "http://localhost:4200" ] }`), so you can add your deployed frontend URL there later without changing code.

Restart the backend after changing `Program.cs`.

---

## 7. Test Department CRUD

Open **Departments** in the sidebar.

| Action | How | Expected result |
|--------|-----|-----------------|
| **Create** | Click **Add Department**, enter a name (e.g. `Engineering`) and optional description, click **Create Department** | Green success toast; the department appears in the table |
| **Validation** | Submit the empty form | "Department name is required." |
| **Duplicate name** | Create `Engineering` twice | Error shown in the dialog: *A department named 'Engineering' already exists.* (HTTP 409) |
| **Read (list)** | Open the Departments page | Table with name, description and employee count |
| **Read (details)** | Click a department name or the eye icon | Details page with the employees of that department |
| **Update** | Click the pencil icon, change the text, **Save Changes** | Success toast; the table updates |
| **Delete** | Click the trash icon and confirm | Success toast and the row disappears |
| **Delete with employees** | Delete a department that still has employees | Error toast: *This department still has employees…* (HTTP 409) – move or delete the employees first |

The **Employees** badge in each row opens the Employees page already filtered to that department.

---

## 8. Test Employee CRUD

> Create at least one department first – every employee belongs to a department.

Open **Employees** in the sidebar.

| Action | How | Expected result |
|--------|-----|-----------------|
| **Create** | **Add Employee** → fill the form → **Add Employee** | Success toast; you return to the list |
| **Validation** | Submit the empty form, or enter `abc` as email | Clear message under each invalid field |
| **Department dropdown** | Open the *Department* field | Lists the real departments from the API |
| **Duplicate email** | Add a second employee with the same email | Error message on the form (HTTP 409) |
| **Search** | Type part of a name in the search box | List updates after a short pause (calls `GET /api/employees?name=…`) |
| **Filter** | Pick a department in the filter dropdown | Only that department's employees (`?departmentId=…`); search + filter can be combined |
| **Read (details)** | Click an employee name or the eye icon | Details page with all fields and the department name |
| **Update** | Pencil icon → change values → **Save Changes** | Success toast; list shows the new values |
| **Delete** | Trash icon → confirm in the dialog | Success toast; the row disappears |

### Dashboard

The **Dashboard** shows, all computed from live API data: total employees, total departments, total payroll, the largest department, the department-wise employee count, and the most recently added employees (newest first, with its own search and department filter).

### Validation rules (same as the backend)

| Field | Rule |
|-------|------|
| Employee name | Required, 2–100 characters |
| Email | Required, valid format, max 150 characters |
| Phone | Required, 7–20 characters (digits, spaces, `+ ( ) . -`) |
| Salary | Required, 0 – 999,999,999, at most 2 decimals |
| Joining date | Required, between 1900 and one year from today |
| Department | Required, must be an existing department |
| Department name | Required, 2–100 characters, unique |
| Department description | Optional, max 250 characters |

If the backend rejects something the browser accepted (for example a duplicate email), its message is shown next to the field or at the top of the form.

---

## 9. API endpoints used

The services in `src/app/core/services/` use exactly these backend endpoints:

| Service method | HTTP | URL |
|----------------|------|-----|
| `DepartmentService.getAll()` | GET | `/api/departments` |
| `DepartmentService.getById(id)` | GET | `/api/departments/{id}` |
| `DepartmentService.create(body)` | POST | `/api/departments` |
| `DepartmentService.update(id, body)` | PUT | `/api/departments/{id}` |
| `DepartmentService.delete(id)` | DELETE | `/api/departments/{id}` |
| `EmployeeService.getAll({ name, departmentId })` | GET | `/api/employees?name=&departmentId=` |
| `EmployeeService.getById(id)` | GET | `/api/employees/{id}` |
| `EmployeeService.create(body)` | POST | `/api/employees` |
| `EmployeeService.update(id, body)` | PUT | `/api/employees/{id}` |
| `EmployeeService.delete(id)` | DELETE | `/api/employees/{id}` |

Request and response property names (camelCase JSON) match the backend DTOs and are typed in `src/app/models/`.

---

## 10. Project structure

```
employee-management-frontend/
├── angular.json  package.json  tsconfig.json  README.md  .gitignore
├── public/favicon.svg
└── src/
    ├── index.html  main.ts  styles.css          # global design tokens + component styles
    ├── environments/
    │   ├── environment.ts                       # production settings (API URL)
    │   └── environment.development.ts           # development settings (API URL)
    └── app/
        ├── app.component.ts|html|css            # shell: sidebar + top bar + <router-outlet>
        ├── app.config.ts  app.routes.ts         # providers, HttpClient, lazy-loaded routes
        ├── core/
        │   ├── services/                        # department, employee, notification, confirm, page-title
        │   ├── interceptors/api-error.interceptor.ts   # turns HTTP errors into friendly messages
        │   └── utils/                           # date + form helpers and validators
        ├── models/                              # TypeScript interfaces matching the backend DTOs
        ├── shared/components/                   # icon, toast, confirm dialog, loading, empty state,
        │                                        # page header, error banner, field error
        └── features/
            ├── dashboard/
            ├── departments/                     # list, add/edit dialog, details
            ├── employees/                       # list, add/edit form, details
            └── not-found/
```

Routes: `/dashboard`, `/departments`, `/departments/:id`, `/employees`, `/employees/new`, `/employees/:id`, `/employees/:id/edit`.

---

## 11. Common errors and solutions

| Problem | Cause and fix |
|---------|---------------|
| **"Cannot reach the backend at …"** in the app | The API is not running, or the URL is wrong. Start the backend and check `apiBaseUrl`. Open the URL + `/scalar` in a browser tab to test. |
| Console: *"blocked by CORS policy: No 'Access-Control-Allow-Origin' header"* | CORS is not enabled in the backend, or the backend was not restarted. Apply section 6. Make sure the origin is exactly `http://localhost:4200` (no trailing slash). |
| Console: `net::ERR_CERT_AUTHORITY_INVALID` | The browser does not trust the dev certificate. Run `dotnet dev-certs https --trust`, restart the browser, and open `https://localhost:7080/scalar` once. |
| Requests to `http://localhost:5080` fail | The backend redirects HTTP to HTTPS and browsers block this for CORS pre-flights. Use `https://localhost:7080`. |
| Empty department dropdown on the employee form | No departments exist yet – create one first (the form shows a link). |
| *"A network-related or instance-specific error"* shown as HTTP 500 | The backend cannot reach SQL Server. Check the connection string and run `dotnet ef database update`. |
| `This department still has employees` | Delete or move the department's employees first. |
| `npm install` fails or the wrong Node version | Check `node -v` (needs 20.19+ / 22.12+ / 24+). Delete `node_modules` and `package-lock.json`, then run `npm install` again. |
| `Port 4200 is already in use` | Run `npx ng serve --port 4300` and add `http://localhost:4300` to the backend CORS origins. |
| Changes to `environment.*.ts` are ignored | Stop and restart `npm start`. |
| Salaries show the wrong currency symbol | Change `currencyCode` in the environment files (for example `USD`, `EUR`, `INR`). |
