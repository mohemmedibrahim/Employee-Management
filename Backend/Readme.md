# Employee Management System – Backend

A beginner-friendly REST API built with **ASP.NET Core Web API (.NET 10)**, **Entity Framework Core 10 (Code First)** and **Microsoft SQL Server**. API documentation is provided by **Scalar** at `/scalar`.

---

## 1. Technology stack

| Item | Version |
|------|---------|
| C# / ASP.NET Core Web API | .NET 10 |
| Entity Framework Core + SQL Server provider | 10.0.0 |
| Microsoft.AspNetCore.OpenApi | 10.0.0 |
| Scalar.AspNetCore | 2.x |
| Database | Microsoft SQL Server (any edition, LocalDB or Express is fine) |

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download) (`dotnet --version` should print `10.x`)
- SQL Server (SQL Server Express, Developer edition, LocalDB or a Docker container)
- The EF Core command-line tool:

```bash
dotnet tool install --global dotnet-ef
# already installed? update it:
dotnet tool update --global dotnet-ef
```

---

## 2. Project structure

```
EmployeeManagement_Backend/
├── README.md
├── .gitignore
└── EmployeeManagement.API/
    ├── EmployeeManagement.API.csproj   # NuGet packages
    ├── Program.cs                      # App start-up, DI, middleware, Scalar
    ├── appsettings.json                # Connection string placeholder
    ├── appsettings.Development.json
    ├── Properties/launchSettings.json  # Opens /scalar when you run the app
    ├── Controllers/                    # HTTP endpoints (thin, call services)
    │   ├── DepartmentsController.cs
    │   └── EmployeesController.cs
    ├── Models/                         # Database entities
    │   ├── Department.cs
    │   └── Employee.cs
    ├── Data/
    │   └── ApplicationDbContext.cs     # DbContext + Fluent API configuration
    ├── DTOs/                           # Request/response objects + validation rules
    │   ├── DepartmentDtos.cs
    │   └── EmployeeDtos.cs
    ├── Interfaces/                     # Service contracts
    │   ├── IDepartmentService.cs
    │   └── IEmployeeService.cs
    ├── Services/                       # Business logic and database access
    │   ├── DepartmentService.cs
    │   └── EmployeeService.cs
    ├── Exceptions/                     # NotFound / BadRequest / Conflict exceptions
    │   └── AppExceptions.cs
    ├── Middleware/
    │   └── ExceptionHandlingMiddleware.cs   # Global exception handler
    └── Migrations/                     # EF Core migrations (InitialCreate)
```

**How a request flows:** `Controller` → `Service` (via interface, injected) → `ApplicationDbContext` → SQL Server. If anything throws, `ExceptionHandlingMiddleware` converts it into a JSON error with the right HTTP status code.

### Data model

- **Department** – `Id`, `Name` (required, max 100, unique), `Description` (optional, max 250)
- **Employee** – `Id`, `Name`, `Email` (unique), `Phone`, `Salary`, `JoiningDate`, `DepartmentId` (FK)
- One Department has many Employees; each Employee belongs to one Department.
- A department that still has employees **cannot be deleted** (returns `409 Conflict`).

---

## 3. Database configuration

Open `EmployeeManagement.API/appsettings.json`. The connection string is a **placeholder**:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER_NAME;Database=EmployeeManagementDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
}
```

Replace `YOUR_SERVER_NAME`, for example:

| Your SQL Server | `Server=` value |
|-----------------|-----------------|
| SQL Server Express | `.\SQLEXPRESS` |
| LocalDB | `(localdb)\MSSQLLocalDB` |
| Default instance | `localhost` |

`Trusted_Connection=True` uses Windows authentication, so **no password is stored anywhere**.

### If you need SQL authentication (username/password, or Docker/Linux)

Never put the password in `appsettings.json`. Use **user secrets** (stored outside the project folder, never zipped or committed):

```bash
cd EmployeeManagement.API
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost,1433;Database=EmployeeManagementDb;User Id=YOUR_USER;Password=YOUR_PASSWORD;TrustServerCertificate=True"
```

Or use an environment variable (works in any environment):

```bash
# Linux / macOS
export ConnectionStrings__DefaultConnection="Server=...;Password=...;"
# Windows PowerShell
$env:ConnectionStrings__DefaultConnection = "Server=...;Password=...;"
```

---

## 4. Restore packages

```bash
cd EmployeeManagement.API
dotnet restore
```

Packages used (already listed in the `.csproj`):

- `Microsoft.EntityFrameworkCore.SqlServer` 10.0.0
- `Microsoft.EntityFrameworkCore.Design` 10.0.0
- `Microsoft.AspNetCore.OpenApi` 10.0.0
- `Scalar.AspNetCore` 2.x

---

## 5. Migrations and database

The project already contains an **`InitialCreate`** migration in `Migrations/`, so you only need to apply it:

```bash
cd EmployeeManagement.API
dotnet ef database update
```

This creates the `EmployeeManagementDb` database with the `Departments` and `Employees` tables.

### Creating a new migration (after you change a model)

```bash
dotnet ef migrations add YourMigrationName
dotnet ef database update
```

### Starting again from scratch (optional)

If you prefer to generate the migration yourself instead of using the included one:

```bash
# delete the Migrations folder first, then:
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### Useful extra commands

```bash
dotnet ef migrations list          # show migrations
dotnet ef migrations remove        # undo the last (unapplied) migration
dotnet ef database drop            # delete the database
```

---

## 6. Run the project

```bash
cd EmployeeManagement.API
dotnet run
```

The `https` launch profile starts the API on:

- `https://localhost:7080`
- `http://localhost:5080`

and opens the Scalar UI automatically. (If your browser warns about the development certificate, run `dotnet dev-certs https --trust` once.)

> Scalar and the OpenAPI document are enabled only in the **Development** environment (the default when using `dotnet run`).

---

## 7. Test the APIs with Scalar

1. Run the project and open **https://localhost:7080/scalar** (the raw OpenAPI JSON is at `/openapi/v1.json`).
2. In the left sidebar choose a group (**Departments** or **Employees**) and click an endpoint.
3. Click **Test Request**, edit the sample JSON body or parameters, then click **Send**.
4. The response status code and body appear on the right.

**Suggested first test order**

1. `POST /api/departments` → create a department (note the returned `id`)
2. `POST /api/employees` → create an employee using that `departmentId`
3. `GET /api/employees` → see the list
4. `GET /api/employees?name=john&departmentId=1` → search and filter
5. `PUT` / `DELETE` to update and remove records

---

## 8. API endpoints

### Departments

| Method | URL | Description | Success |
|--------|-----|-------------|---------|
| GET | `/api/departments` | Get all departments | 200 |
| GET | `/api/departments/{id}` | Get one department | 200 |
| POST | `/api/departments` | Create a department | 201 |
| PUT | `/api/departments/{id}` | Update a department | 200 |
| DELETE | `/api/departments/{id}` | Delete a department | 204 |

**POST / PUT request body**

```json
{
  "name": "Engineering",
  "description": "Builds and maintains our software products"
}
```

**Response (200 / 201)**

```json
{
  "id": 1,
  "name": "Engineering",
  "description": "Builds and maintains our software products",
  "employeeCount": 0
}
```

### Employees

| Method | URL | Description | Success |
|--------|-----|-------------|---------|
| GET | `/api/employees` | Get all employees | 200 |
| GET | `/api/employees?name=john` | Search employees by name (partial match) | 200 |
| GET | `/api/employees?departmentId=1` | Filter employees by department | 200 |
| GET | `/api/employees?name=john&departmentId=1` | Search and filter together | 200 |
| GET | `/api/employees/{id}` | Get one employee | 200 |
| POST | `/api/employees` | Create an employee | 201 |
| PUT | `/api/employees/{id}` | Update an employee | 200 |
| DELETE | `/api/employees/{id}` | Delete an employee | 204 |

**POST / PUT request body**

```json
{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "phone": "+91 98765 43210",
  "salary": 65000.50,
  "joiningDate": "2026-01-15T00:00:00",
  "departmentId": 1
}
```

**Response (200 / 201)**

```json
{
  "id": 1,
  "name": "John Smith",
  "email": "john.smith@example.com",
  "phone": "+91 98765 43210",
  "salary": 65000.50,
  "joiningDate": "2026-01-15T00:00:00",
  "departmentId": 1,
  "departmentName": "Engineering"
}
```

### Validation rules

| Field | Rule |
|-------|------|
| Department `name` | Required, 2–100 characters, must be unique |
| Department `description` | Optional, max 250 characters |
| Employee `name` | Required, 2–100 characters |
| Employee `email` | Required, valid email format, max 150 characters, must be unique |
| Employee `phone` | Required, valid phone format, max 20 characters |
| Employee `salary` | Between 0 and 999,999,999 |
| Employee `joiningDate` | Required |
| Employee `departmentId` | Must be positive **and must exist** in the database |

### HTTP status codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 OK | Success | GET / PUT |
| 201 Created | Resource created (includes a `Location` header) | POST |
| 204 No Content | Deleted successfully | DELETE |
| 400 Bad Request | Validation failed, or `departmentId` does not exist | Invalid email |
| 404 Not Found | Record not found | `GET /api/employees/999` |
| 409 Conflict | Duplicate name/email, or deleting a department that has employees | Same email twice |
| 500 Internal Server Error | Unexpected error (details hidden outside Development) | – |

### Sample error responses

All errors are returned as JSON (RFC 7807 problem details).

**400 – validation error**

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Email": ["Email is not a valid email address."]
  }
}
```

**400 – unknown department**

```json
{
  "title": "Bad request",
  "status": 400,
  "detail": "Department with ID 99 does not exist.",
  "instance": "/api/employees"
}
```

**404 – not found**

```json
{
  "title": "Resource not found",
  "status": 404,
  "detail": "Employee with ID 999 was not found.",
  "instance": "/api/employees/999"
}
```

**409 – conflict**

```json
{
  "title": "Conflict",
  "status": 409,
  "detail": "An employee with email 'john.smith@example.com' already exists.",
  "instance": "/api/employees"
}
```

---

## 9. Troubleshooting

| Problem | Fix |
|---------|-----|
| `dotnet ef` not found | `dotnet tool install --global dotnet-ef` |
| `Connection string 'DefaultConnection' was not found` | Check `appsettings.json` / user secrets |
| `A network-related or instance-specific error` | Check the `Server=` value and that SQL Server is running |
| Certificate error with SQL Server | Keep `TrustServerCertificate=True` for local development |
| Browser warns about HTTPS certificate | Run `dotnet dev-certs https --trust` |
| `/scalar` returns 404 | Make sure `ASPNETCORE_ENVIRONMENT=Development` |

