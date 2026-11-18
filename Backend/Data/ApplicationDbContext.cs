using EmployeeManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Department> Departments => Set<Department>();

    public DbSet<Employee> Employees => Set<Employee>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ----- Department -----
        modelBuilder.Entity<Department>(entity =>
        {
            entity.ToTable("Departments");

            entity.HasKey(d => d.Id);

            entity.Property(d => d.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(d => d.Description)
                .HasMaxLength(250);

            // Two departments cannot have the same name
            entity.HasIndex(d => d.Name).IsUnique();
        });

        // ----- Employee -----
        modelBuilder.Entity<Employee>(entity =>
        {
            entity.ToTable("Employees");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(e => e.Phone)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(e => e.Salary)
                .HasPrecision(18, 2);

            entity.Property(e => e.JoiningDate)
                .IsRequired();

            // Two employees cannot share the same email
            entity.HasIndex(e => e.Email).IsUnique();

            // One Department -> Many Employees
            // Restrict: a department that still has employees cannot be deleted
            entity.HasOne(e => e.Department)
                .WithMany(d => d.Employees)
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
