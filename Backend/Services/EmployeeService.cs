using System.Linq.Expressions;
using EmployeeManagement.API.Data;
using EmployeeManagement.API.DTOs;
using EmployeeManagement.API.Exceptions;
using EmployeeManagement.API.Interfaces;
using EmployeeManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.API.Services;

public class EmployeeService : IEmployeeService
{
    private readonly ApplicationDbContext _context;

    public EmployeeService(ApplicationDbContext context)
    {
        _context = context;
    }

    // Converts an Employee row into an EmployeeDto directly inside the SQL query.
    private static readonly Expression<Func<Employee, EmployeeDto>> ToDtoExpression = e => new EmployeeDto
    {
        Id = e.Id,
        Name = e.Name,
        Email = e.Email,
        Phone = e.Phone,
        Salary = e.Salary,
        JoiningDate = e.JoiningDate,
        DepartmentId = e.DepartmentId,
        DepartmentName = e.Department.Name
    };

    public async Task<IEnumerable<EmployeeDto>> GetAllAsync(string? name, int? departmentId)
    {
        var query = _context.Employees.AsNoTracking();

        // Search employees by name
        if (!string.IsNullOrWhiteSpace(name))
        {
            var term = name.Trim();
            query = query.Where(e => e.Name.Contains(term));
        }

        // Filter employees by department
        if (departmentId.HasValue)
        {
            query = query.Where(e => e.DepartmentId == departmentId.Value);
        }

        return await query
            .OrderBy(e => e.Name)
            .Select(ToDtoExpression)
            .ToListAsync();
    }

    public async Task<EmployeeDto> GetByIdAsync(int id)
    {
        var employee = await _context.Employees
            .AsNoTracking()
            .Where(e => e.Id == id)
            .Select(ToDtoExpression)
            .FirstOrDefaultAsync();

        return employee ?? throw new NotFoundException($"Employee with ID {id} was not found.");
    }

    public async Task<EmployeeDto> CreateAsync(CreateEmployeeDto dto)
    {
        // Validate DepartmentId before creating the employee
        var department = await GetDepartmentOrThrowAsync(dto.DepartmentId);

        var email = dto.Email.Trim();
        if (await _context.Employees.AnyAsync(e => e.Email == email))
        {
            throw new ConflictException($"An employee with email '{email}' already exists.");
        }

        var employee = new Employee
        {
            Name = dto.Name.Trim(),
            Email = email,
            Phone = dto.Phone.Trim(),
            Salary = dto.Salary,
            JoiningDate = dto.JoiningDate!.Value,
            DepartmentId = department.Id
        };

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        return ToDto(employee, department.Name);
    }

    public async Task<EmployeeDto> UpdateAsync(int id, UpdateEmployeeDto dto)
    {
        var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Id == id)
            ?? throw new NotFoundException($"Employee with ID {id} was not found.");

        var department = await GetDepartmentOrThrowAsync(dto.DepartmentId);

        var email = dto.Email.Trim();
        if (await _context.Employees.AnyAsync(e => e.Email == email && e.Id != id))
        {
            throw new ConflictException($"An employee with email '{email}' already exists.");
        }

        employee.Name = dto.Name.Trim();
        employee.Email = email;
        employee.Phone = dto.Phone.Trim();
        employee.Salary = dto.Salary;
        employee.JoiningDate = dto.JoiningDate!.Value;
        employee.DepartmentId = department.Id;

        await _context.SaveChangesAsync();

        return ToDto(employee, department.Name);
    }

    public async Task DeleteAsync(int id)
    {
        var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Id == id)
            ?? throw new NotFoundException($"Employee with ID {id} was not found.");

        _context.Employees.Remove(employee);
        await _context.SaveChangesAsync();
    }

    private async Task<Department> GetDepartmentOrThrowAsync(int departmentId)
    {
        var department = await _context.Departments
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == departmentId);

        return department
            ?? throw new BadRequestException($"Department with ID {departmentId} does not exist.");
    }

    private static EmployeeDto ToDto(Employee employee, string departmentName)
    {
        return new EmployeeDto
        {
            Id = employee.Id,
            Name = employee.Name,
            Email = employee.Email,
            Phone = employee.Phone,
            Salary = employee.Salary,
            JoiningDate = employee.JoiningDate,
            DepartmentId = employee.DepartmentId,
            DepartmentName = departmentName
        };
    }
}
