namespace DrumTuner.Models;

public class DrumType
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Category { get; set; } = "";
    public int LugCount { get; set; }
    public string DefaultNote { get; set; } = "";
}
