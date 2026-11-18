using EmployeeManagement.API.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.API.Middleware;

/// <summary>
/// Global exception handler. Any exception that escapes a controller or service is
/// caught here and converted into a clean JSON error (RFC 7807 "problem details").
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        // If the response already started we can no longer change it.
        if (context.Response.HasStarted)
        {
            throw exception;
        }

        int statusCode;
        string title;
        string detail;

        switch (exception)
        {
            case NotFoundException:
                statusCode = StatusCodes.Status404NotFound;
                title = "Resource not found";
                detail = exception.Message;
                _logger.LogWarning("Not found: {Message}", exception.Message);
                break;

            case BadRequestException:
                statusCode = StatusCodes.Status400BadRequest;
                title = "Bad request";
                detail = exception.Message;
                _logger.LogWarning("Bad request: {Message}", exception.Message);
                break;

            case ConflictException:
                statusCode = StatusCodes.Status409Conflict;
                title = "Conflict";
                detail = exception.Message;
                _logger.LogWarning("Conflict: {Message}", exception.Message);
                break;

            case DbUpdateException:
                statusCode = StatusCodes.Status409Conflict;
                title = "Database conflict";
                detail = "The change could not be saved because it conflicts with existing data.";
                _logger.LogError(exception, "Database update failed.");
                break;

            default:
                statusCode = StatusCodes.Status500InternalServerError;
                title = "An unexpected error occurred";
                // Never leak internal details in production.
                detail = _environment.IsDevelopment()
                    ? exception.Message
                    : "Something went wrong on the server. Please try again later.";
                _logger.LogError(exception, "Unhandled exception.");
                break;
        }

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path
        };

        context.Response.Clear();
        context.Response.StatusCode = statusCode;

        await context.Response.WriteAsJsonAsync(
            problem,
            options: null,
            contentType: "application/problem+json");
    }
}
