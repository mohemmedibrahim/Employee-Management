using EmployeeManagement.API.DTOs;
using EmployeeManagement.API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class DepartmentsController : ControllerBase
{
    private readonly IDepartmentService _departmentService;

    public DepartmentsController(IDepartmentService departmentService)
    {
        _departmentService = departmentService;
    }

    /// <summary>Get all departments.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<DepartmentDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<DepartmentDto>>> GetAll()
    {
        var departments = await _departmentService.GetAllAsync();
        return Ok(departments);
    }

    /// <summary>Get a department by ID.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(DepartmentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DepartmentDto>> GetById(int id)
    {
        var department = await _departmentService.GetByIdAsync(id);
        return Ok(department);
    }

    /// <summary>Create a new department.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(DepartmentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<DepartmentDto>> Create([FromBody] CreateDepartmentDto dto)
    {
        var created = await _departmentService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>Update an existing department.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(DepartmentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<DepartmentDto>> Update(int id, [FromBody] UpdateDepartmentDto dto)
    {
        var updated = await _departmentService.UpdateAsync(id, dto);
        return Ok(updated);
    }

    /// <summary>Delete a department (only allowed when it has no employees).</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(int id)
    {
        await _departmentService.DeleteAsync(id);
        return NoContent();
    }
}
