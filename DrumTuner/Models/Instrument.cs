namespace DrumTuner.Models;

public class Instrument
{
    public int Id { get; set; }
    public int InstrumentTypeId { get; set; }
    public string StringNotes { get; set; } = "[]"; // JSON array of tuned note names
}
