namespace DrumTuner.Models;

public class LugTuningRecord
{
    public int Id { get; set; }
    public int TuningSessionId { get; set; }
    public int Position { get; set; }
    public string Note { get; set; } = "";
}
