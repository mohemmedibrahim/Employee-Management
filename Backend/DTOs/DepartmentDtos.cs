using System.ComponentModel.DataAnnotations;

namespace EmployeeManagement.API.DTOs;

/// <summary>Data returned to the client for a department.</summary>
public class DepartmentDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int EmployeeCount { get; set; }
}

/// <summary>Data the client sends to create a department.</summary>
public class CreateDepartmentDto
{
    [Required(ErrorMessage = "Department name is required.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Department name must be between 2 and 100 characters.")]
    public string Name { get; set; } = string.Empty;

    [StringLength(250, ErrorMessage = "Description cannot be longer than 250 characters.")]
    public string? Description { get; set; }
}

/// <summary>Data the client sends to update a department (same rules as create).</summary>
public class UpdateDepartmentDto : CreateDepartmentDto
{
}
