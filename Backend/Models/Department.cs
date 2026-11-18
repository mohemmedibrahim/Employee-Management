namespace EmployeeManagement.API.Models;

/// <summary>
/// A department of the company. One department can have many employees.
/// </summary>
public class Department
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    // Navigation property: all employees working in this department
    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
}
