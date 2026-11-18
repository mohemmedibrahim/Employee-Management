using EmployeeManagement.API.Data;
using EmployeeManagement.API.DTOs;
using EmployeeManagement.API.Exceptions;
using EmployeeManagement.API.Interfaces;
using EmployeeManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.API.Services;

public class DepartmentService : IDepartmentService
{
    private readonly ApplicationDbContext _context;

    public DepartmentService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<DepartmentDto>> GetAllAsync()
    {
        return await _context.Departments
            .AsNoTracking()
            .OrderBy(d => d.Name)
            .Select(d => new DepartmentDto
            {
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                EmployeeCount = d.Employees.Count
            })
            .ToListAsync();
    }

    public async Task<DepartmentDto> GetByIdAsync(int id)
    {
        var department = await _context.Departments
            .AsNoTracking()
            .Where(d => d.Id == id)
            .Select(d => new DepartmentDto
            {
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                EmployeeCount = d.Employees.Count
            })
            .FirstOrDefaultAsync();

        return department ?? throw new NotFoundException($"Department with ID {id} was not found.");
    }

    public async Task<DepartmentDto> CreateAsync(CreateDepartmentDto dto)
    {
        var name = dto.Name.Trim();

        if (await _context.Departments.AnyAsync(d => d.Name == name))
        {
            throw new ConflictException($"A department named '{name}' already exists.");
        }

        var department = new Department
        {
            Name = name,
            Description = dto.Description?.Trim()
        };

        _context.Departments.Add(department);
        await _context.SaveChangesAsync();

        return ToDto(department, employeeCount: 0);
    }

    public async Task<DepartmentDto> UpdateAsync(int id, UpdateDepartmentDto dto)
    {
        var department = await _context.Departments.FirstOrDefaultAsync(d => d.Id == id)
            ?? throw new NotFoundException($"Department with ID {id} was not found.");

        var name = dto.Name.Trim();

        if (await _context.Departments.AnyAsync(d => d.Name == name && d.Id != id))
        {
            throw new ConflictException($"A department named '{name}' already exists.");
        }

        department.Name = name;
        department.Description = dto.Description?.Trim();

        await _context.SaveChangesAsync();

        var employeeCount = await _context.Employees.CountAsync(e => e.DepartmentId == id);
        return ToDto(department, employeeCount);
    }

    public async Task DeleteAsync(int id)
    {
        var department = await _context.Departments.FirstOrDefaultAsync(d => d.Id == id)
            ?? throw new NotFoundException($"Department with ID {id} was not found.");

        if (await _context.Employees.AnyAsync(e => e.DepartmentId == id))
        {
            throw new ConflictException(
                "This department still has employees. Move or delete them before deleting the department.");
        }

        _context.Departments.Remove(department);
        await _context.SaveChangesAsync();
    }

    private static DepartmentDto ToDto(Department department, int employeeCount)
    {
        return new DepartmentDto
        {
            Id = department.Id,
            Name = department.Name,
            Description = department.Description,
            EmployeeCount = employeeCount
        };
    }
}
