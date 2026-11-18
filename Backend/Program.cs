using EmployeeManagement.API.Data;
using EmployeeManagement.API.Interfaces;
using EmployeeManagement.API.Middleware;
using EmployeeManagement.API.Services;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ----- Database (SQL Server + EF Core) -----
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// ----- Dependency injection: services -----
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();

// ----- Web API + OpenAPI document -----
builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();
app.UseCors("AllowAngular");

// Global exception handling (must be first so it catches everything below)
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    // OpenAPI JSON:  /openapi/v1.json
    app.MapOpenApi();

    // Scalar UI:     /scalar
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
