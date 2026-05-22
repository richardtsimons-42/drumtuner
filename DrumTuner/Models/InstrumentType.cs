namespace DrumTuner.Models;

public class InstrumentType
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Category { get; set; } = "";
    public int StringCount { get; set; }
    public string DefaultNotes { get; set; } = "[]"; // JSON array of note names
    public double MinFrequency { get; set; }
    public double MaxFrequency { get; set; }
}
