using DrumTuner.Models;
using Microsoft.EntityFrameworkCore;

namespace DrumTuner.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<DrumType> DrumTypes => Set<DrumType>();
    public DbSet<Drum> Drums => Set<Drum>();
    public DbSet<Lug> Lugs => Set<Lug>();
    public DbSet<TuningSession> TuningSessions => Set<TuningSession>();
    public DbSet<LugTuningRecord> LugTuningRecords => Set<LugTuningRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<DrumType>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Category).IsRequired().HasMaxLength(50);
        });

        modelBuilder.Entity<Drum>(entity =>
        {
            entity.HasKey(e => e.Id);
            // Convention will map DrumTypeId + DrumType navigation automatically
        });

        modelBuilder.Entity<Lug>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne<Drum>()
                  .WithMany()
                  .HasForeignKey(e => e.DrumId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TuningSession>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Notes).HasMaxLength(2000);
        });

        modelBuilder.Entity<LugTuningRecord>(entity =>
        {
            entity.HasKey(e => e.Id);
        });

        // Seed drum type presets
        modelBuilder.Entity<DrumType>().HasData(
            new DrumType { Id = 1, Name = "Standard Snare", Category = "Snare", LugCount = 8, DefaultNote = "D3" },
            new DrumType { Id = 2, Name = "Rack Tom", Category = "Tom", LugCount = 6, DefaultNote = "C3" },
            new DrumType { Id = 3, Name = "Floor Tom", Category = "Tom", LugCount = 8, DefaultNote = "G2" },
            new DrumType { Id = 4, Name = "Bass Drum", Category = "Kick", LugCount = 6, DefaultNote = "C2" }
        );
    }
}
