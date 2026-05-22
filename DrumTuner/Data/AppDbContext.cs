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
            // Drums
            new DrumType { Id = 1, Name = "Standard Snare", Category = "Snare", LugCount = 8, DefaultNote = "D3" },
            new DrumType { Id = 2, Name = "Rack Tom", Category = "Tom", LugCount = 6, DefaultNote = "C3" },
            new DrumType { Id = 3, Name = "Floor Tom", Category = "Tom", LugCount = 8, DefaultNote = "G2" },
            new DrumType { Id = 4, Name = "Bass Drum", Category = "Kick", LugCount = 6, DefaultNote = "C2" },
            // Guitars
            new DrumType { Id = 5, Name = "Acoustic Guitar", Category = "Guitar", LugCount = 6, DefaultNote = "E2" },
            new DrumType { Id = 6, Name = "Electric Guitar", Category = "Guitar", LugCount = 6, DefaultNote = "E2" },
            // Bass
            new DrumType { Id = 7, Name = "4-String Bass", Category = "Bass", LugCount = 4, DefaultNote = "E1" },
            new DrumType { Id = 8, Name = "5-String Bass", Category = "Bass", LugCount = 5, DefaultNote = "B0" },
            // Strings
            new DrumType { Id = 9, Name = "Violin", Category = "Strings", LugCount = 4, DefaultNote = "G3" },
            new DrumType { Id = 10, Name = "Cello", Category = "Strings", LugCount = 4, DefaultNote = "C2" },
            new DrumType { Id = 11, Name = "Mandolin", Category = "Strings", LugCount = 8, DefaultNote = "G3" },
            // Other
            new DrumType { Id = 12, Name = "Ukulele", Category = "Other", LugCount = 4, DefaultNote = "G4" }
        );
    }
}
