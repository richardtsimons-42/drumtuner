namespace DrumTuner.Models;

public class Lug
{
    public int Id { get; set; }
    public int DrumId { get; set; }
    public int Position { get; set; }
    public string? TunedNote { get; set; }
    public bool IsTuned => TunedNote != null;
}
