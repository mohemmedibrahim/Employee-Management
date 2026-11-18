using System.ComponentModel.DataAnnotations;

namespace EmployeeManagement.API.DTOs;

/// <summary>Data returned to the client for an employee.</summary>
public class EmployeeDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public decimal Salary { get; set; }

    public DateTime JoiningDate { get; set; }

    public int DepartmentId { get; set; }

    public string DepartmentName { get; set; } = string.Empty;
}

/// <summary>Data the client sends to create an employee.</summary>
public class CreateEmployeeDto
{
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Email is not a valid email address.")]
    [StringLength(150, ErrorMessage = "Email cannot be longer than 150 characters.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Phone is required.")]
    [Phone(ErrorMessage = "Phone is not a valid phone number.")]
    [StringLength(20, ErrorMessage = "Phone cannot be longer than 20 characters.")]
    public string Phone { get; set; } = string.Empty;

    [Range(0.0, 999999999.0, ErrorMessage = "Salary must be between 0 and 999,999,999.")]
    public decimal Salary { get; set; }

    // Nullable so that "missing" can be detected and reported as an error
    [Required(ErrorMessage = "JoiningDate is required.")]
    public DateTime? JoiningDate { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "DepartmentId must be a positive number.")]
    public int DepartmentId { get; set; }
}

/// <summary>Data the client sends to update an employee (same rules as create).</summary>
public class UpdateEmployeeDto : CreateEmployeeDto
{
}
