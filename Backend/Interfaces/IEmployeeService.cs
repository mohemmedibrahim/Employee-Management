using EmployeeManagement.API.DTOs;

namespace EmployeeManagement.API.Interfaces;

public interface IEmployeeService
{
    /// <param name="name">Optional: return only employees whose name contains this text.</param>
    /// <param name="departmentId">Optional: return only employees of this department.</param>
    Task<IEnumerable<EmployeeDto>> GetAllAsync(string? name, int? departmentId);

    Task<EmployeeDto> GetByIdAsync(int id);

    Task<EmployeeDto> CreateAsync(CreateEmployeeDto dto);

    Task<EmployeeDto> UpdateAsync(int id, UpdateEmployeeDto dto);

    Task DeleteAsync(int id);
}
