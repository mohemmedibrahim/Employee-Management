namespace EmployeeManagement.API.Models;

/// <summary>
/// An employee. Each employee belongs to exactly one department.
/// </summary>
public class Employee
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public decimal Salary { get; set; }

    public DateTime JoiningDate { get; set; }

    // Foreign key
    public int DepartmentId { get; set; }

    // Navigation property: the department this employee belongs to
    public Department Department { get; set; } = null!;
}
