namespace DrumTuner.Models;

public class TuningSession
{
    public int Id { get; set; }
    public int DrumTypeId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }
    public List<LugTuningRecord> LugTuningRecords { get; set; } = new();
}
