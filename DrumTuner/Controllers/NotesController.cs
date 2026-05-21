using Microsoft.AspNetCore.Mvc;

namespace DrumTuner.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotesController : ControllerBase
{
    // Note names to frequencies in Hz (equal temperament, A4 = 440Hz)
    private static readonly Dictionary<string, double> _frequencies = new()
    {
        // Octave 1
        ["C1"] = 32.70, ["C#1"] = 34.65, ["D1"] = 36.71, ["D#1"] = 38.89, ["E1"] = 41.20, ["F1"] = 43.65, ["F#1"] = 46.25, ["G1"] = 49.00, ["G#1"] = 51.91, ["A1"] = 55.00, ["A#1"] = 58.27, ["B1"] = 61.74,
        // Octave 2
        ["C2"] = 65.41, ["C#2"] = 69.30, ["D2"] = 73.42, ["D#2"] = 77.78, ["E2"] = 82.41, ["F2"] = 87.31, ["F#2"] = 92.50, ["G2"] = 98.00, ["G#2"] = 103.83, ["A2"] = 110.00, ["A#2"] = 116.54, ["B2"] = 123.47,
        // Octave 3
        ["C3"] = 130.81, ["C#3"] = 138.59, ["D3"] = 146.83, ["D#3"] = 155.56, ["E3"] = 164.81, ["F3"] = 174.61, ["F#3"] = 185.00, ["G3"] = 196.00, ["G#3"] = 207.65, ["A3"] = 220.00, ["A#3"] = 233.08, ["B3"] = 246.94,
        // Octave 4
        ["C4"] = 261.63, ["C#4"] = 277.18, ["D4"] = 293.66, ["D#4"] = 311.13, ["E4"] = 329.63, ["F4"] = 349.23, ["F#4"] = 369.99, ["G4"] = 392.00, ["G#4"] = 415.30, ["A4"] = 440.00, ["A#4"] = 466.16, ["B4"] = 493.88
    };

    [HttpGet("frequencies")]
    public ActionResult<Dictionary<string, double>> GetFrequencies()
        => Ok(_frequencies);
}
