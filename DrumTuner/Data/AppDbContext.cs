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
    public DbSet<InstrumentType> InstrumentTypes => Set<InstrumentType>();
    public DbSet<Instrument> Instruments => Set<Instrument>();

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

        modelBuilder.Entity<InstrumentType>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Category).IsRequired().HasMaxLength(50);
            entity.Property(e => e.DefaultNotes).HasDefaultValue("[]");
        });

        modelBuilder.Entity<Instrument>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.StringNotes).HasDefaultValue("[]");
        });

        // Seed drum type presets (legacy)
        modelBuilder.Entity<DrumType>().HasData(
            new DrumType { Id = 1, Name = "Standard Snare", Category = "Snare", LugCount = 8, DefaultNote = "D3" },
            new DrumType { Id = 2, Name = "Rack Tom", Category = "Tom", LugCount = 6, DefaultNote = "C3" },
            new DrumType { Id = 3, Name = "Floor Tom", Category = "Tom", LugCount = 8, DefaultNote = "G2" },
            new DrumType { Id = 4, Name = "Bass Drum", Category = "Kick", LugCount = 6, DefaultNote = "C2" }
        );

        // Seed instrument type presets
        modelBuilder.Entity<InstrumentType>().HasData(
            // Guitar
            new InstrumentType { Id = 1, Name = "Acoustic Guitar", Category = "Guitar", StringCount = 6, DefaultNotes = "[\"E2\",\"A2\",\"D3\",\"G3\",\"B3\",\"E4\"]", MinFrequency = 82.0, MaxFrequency = 1318.0 },
            new InstrumentType { Id = 2, Name = "Electric Guitar", Category = "Guitar", StringCount = 6, DefaultNotes = "[\"E2\",\"A2\",\"D3\",\"G3\",\"B3\",\"E4\"]", MinFrequency = 82.0, MaxFrequency = 1318.0 },
            new InstrumentType { Id = 3, Name = "7-String Guitar", Category = "Guitar", StringCount = 7, DefaultNotes = "[\"B1\",\"E2\",\"A2\",\"D3\",\"G3\",\"B3\",\"E4\"]", MinFrequency = 58.0, MaxFrequency = 1318.0 },
            // Bass
            new InstrumentType { Id = 4, Name = "4-String Bass", Category = "Bass", StringCount = 4, DefaultNotes = "[\"E1\",\"A1\",\"D2\",\"G2\"]", MinFrequency = 41.0, MaxFrequency = 392.0 },
            new InstrumentType { Id = 5, Name = "5-String Bass", Category = "Bass", StringCount = 5, DefaultNotes = "[\"B0\",\"E1\",\"A1\",\"D2\",\"G2\"]", MinFrequency = 37.0, MaxFrequency = 392.0 },
            new InstrumentType { Id = 6, Name = "6-String Bass", Category = "Bass", StringCount = 6, DefaultNotes = "[\"B0\",\"E1\",\"A1\",\"D2\",\"G2\",\"C3\"]", MinFrequency = 37.0, MaxFrequency = 490.0 },
            // Piano
            new InstrumentType { Id = 7, Name = "Piano (88 keys)", Category = "Piano", StringCount = 88, DefaultNotes = "[\"A0\",\"A#0\",\"B0\",\"C1\",\"C#1\",\"D1\",\"D#1\",\"E1\",\"F1\",\"F#1\",\"G1\",\"G#1\",\"A1\",\"A#1\",\"B1\",\"C2\",\"C#2\",\"D2\",\"D#2\",\"E2\",\"F2\",\"F#2\",\"G2\",\"G#2\",\"A2\",\"A#2\",\"B2\",\"C3\",\"C#3\",\"D3\",\"D#3\",\"E3\",\"F3\",\"F#3\",\"G3\",\"G#3\",\"A3\",\"A#3\",\"B3\",\"C4\",\"C#4\",\"D4\",\"D#4\",\"E4\",\"F4\",\"F#4\",\"G4\",\"G#4\",\"A4\",\"A#4\",\"B4\",\"C5\",\"C#5\",\"D5\",\"D#5\",\"E5\",\"F5\",\"F#5\",\"G5\",\"G#5\",\"A5\",\"A#5\",\"B5\",\"C6\",\"C#6\",\"D6\",\"D#6\",\"E6\",\"F6\",\"F#6\",\"G6\",\"G#6\",\"A6\",\"A#6\",\"B6\",\"C7\",\"C#7\",\"D7\",\"D#7\",\"E7\",\"F7\",\"F#7\",\"G7\",\"G#7\",\"A7\",\"A#7\",\"B7\"]", MinFrequency = 27.5, MaxFrequency = 4186.0 },
            // Strings
            new InstrumentType { Id = 8, Name = "Violin", Category = "Strings", StringCount = 4, DefaultNotes = "[\"G3\",\"D4\",\"A4\",\"E5\"]", MinFrequency = 196.0, MaxFrequency = 1318.0 },
            new InstrumentType { Id = 9, Name = "Viola", Category = "Strings", StringCount = 4, DefaultNotes = "[\"G3\",\"D4\",\"A4\",\"E5\"]", MinFrequency = 196.0, MaxFrequency = 1318.0 },
            new InstrumentType { Id = 10, Name = "Cello", Category = "Strings", StringCount = 4, DefaultNotes = "[\"G2\",\"D3\",\"A3\",\"E4\"]", MinFrequency = 98.0, MaxFrequency = 659.0 },
            new InstrumentType { Id = 11, Name = "Double Bass", Category = "Strings", StringCount = 4, DefaultNotes = "[\"E1\",\"A1\",\"D2\",\"G2\"]", MinFrequency = 41.0, MaxFrequency = 392.0 },
            // Other fretted
            new InstrumentType { Id = 12, Name = "Ukulele (Standard)", Category = "Other", StringCount = 4, DefaultNotes = "[\"G4\",\"C4\",\"E4\",\"A4\"]", MinFrequency = 262.0, MaxFrequency = 880.0 },
            new InstrumentType { Id = 13, Name = "Banjo (5-string)", Category = "Other", StringCount = 5, DefaultNotes = "[\"G4\",\"D3\",\"G3\",\"B3\",\"D4\"]", MinFrequency = 262.0, MaxFrequency = 1175.0 },
            new InstrumentType { Id = 14, Name = "Mandolin", Category = "Other", StringCount = 8, DefaultNotes = "[\"G3\",\"D4\",\"G4\",\"B4\",\"E5\"]", MinFrequency = 196.0, MaxFrequency = 1318.0 },
            new InstrumentType { Id = 15, Name = "Dobro", Category = "Other", StringCount = 6, DefaultNotes = "[\"G2\",\"B2\",\"D3\",\"G3\",\"B3\",\"D4\"]", MinFrequency = 98.0, MaxFrequency = 1175.0 },
            // Percussion (tuned)
            new InstrumentType { Id = 16, Name = "Timpani", Category = "Percussion", StringCount = 1, DefaultNotes = "[\"C3\"]", MinFrequency = 40.0, MaxFrequency = 500.0 },
            new InstrumentType { Id = 17, Name = "Tuned Congas", Category = "Percussion", StringCount = 2, DefaultNotes = "[\"D3\",\"A2\"]", MinFrequency = 80.0, MaxFrequency = 400.0 }
        );
    }
}
