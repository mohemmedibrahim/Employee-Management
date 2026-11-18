namespace EmployeeManagement.API.Exceptions;

/// <summary>
/// Base class for expected business errors.
/// The global exception middleware turns these into proper HTTP responses.
/// </summary>
public abstract class AppException : Exception
{
    protected AppException(string message) : base(message)
    {
    }
}

/// <summary>The requested record does not exist -> HTTP 404.</summary>
public class NotFoundException : AppException
{
    public NotFoundException(string message) : base(message)
    {
    }
}

/// <summary>The request is invalid (for example an unknown DepartmentId) -> HTTP 400.</summary>
public class BadRequestException : AppException
{
    public BadRequestException(string message) : base(message)
    {
    }
}

/// <summary>The request conflicts with existing data (duplicate email, etc.) -> HTTP 409.</summary>
public class ConflictException : AppException
{
    public ConflictException(string message) : base(message)
    {
    }
}
