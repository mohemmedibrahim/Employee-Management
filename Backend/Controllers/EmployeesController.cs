using EmployeeManagement.API.DTOs;
using EmployeeManagement.API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _employeeService;

    public EmployeesController(IEmployeeService employeeService)
    {
        _employeeService = employeeService;
    }

    /// <summary>
    /// Get all employees. Optionally search by name and/or filter by department.
    /// </summary>
    /// <param name="name">Part of the employee name to search for (optional).</param>
    /// <param name="departmentId">Only return employees of this department (optional).</param>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<EmployeeDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetAll(
        [FromQuery] string? name,
        [FromQuery] int? departmentId)
    {
        var employees = await _employeeService.GetAllAsync(name, departmentId);
        return Ok(employees);
    }

    /// <summary>Get an employee by ID.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(EmployeeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EmployeeDto>> GetById(int id)
    {
        var employee = await _employeeService.GetByIdAsync(id);
        return Ok(employee);
    }

    /// <summary>Create a new employee.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(EmployeeDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<EmployeeDto>> Create([FromBody] CreateEmployeeDto dto)
    {
        var created = await _employeeService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>Update an existing employee.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(EmployeeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<EmployeeDto>> Update(int id, [FromBody] UpdateEmployeeDto dto)
    {
        var updated = await _employeeService.UpdateAsync(id, dto);
        return Ok(updated);
    }

    /// <summary>Delete an employee.</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        await _employeeService.DeleteAsync(id);
        return NoContent();
    }
}
