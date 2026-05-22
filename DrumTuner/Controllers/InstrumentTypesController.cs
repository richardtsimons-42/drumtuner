using DrumTuner.Data;
using DrumTuner.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DrumTuner.Controllers;

[ApiController]
[Route("api/instruments")]
public class InstrumentTypesController : ControllerBase
{
    private readonly AppDbContext _db;

    public InstrumentTypesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InstrumentTypeDto>>> Get()
    {
        var types = await _db.InstrumentTypes.ToListAsync();
        return Ok(types.Select(t => new InstrumentTypeDto(
            t.Id, t.Name, t.Category, t.StringCount, t.DefaultNotes,
            t.MinFrequency, t.MaxFrequency
        )));
    }

    // POST api/instruments/1/instantiate
    [HttpPost("{instrumentTypeId}/instantiate")]
    public async Task<ActionResult<InstrumentWithStrings>> Instantiate(int instrumentTypeId)
    {
        var instrumentType = await _db.InstrumentTypes.FindAsync(instrumentTypeId);
        if (instrumentType == null) return NotFound();

        var instrument = new Instrument
        {
            InstrumentTypeId = instrumentTypeId,
            StringNotes = instrumentType.DefaultNotes
        };
        _db.Instruments.Add(instrument);
        await _db.SaveChangesAsync();

        return Ok(new InstrumentWithStrings(
            instrument.Id,
            instrumentTypeId,
            instrumentType.Name,
            instrumentType.Category,
            instrumentType.StringCount,
            ParseDefaultNotes(instrumentType.DefaultNotes)
        ));
    }

    // PUT api/instruments/1/strings/0
    [HttpPut("{instrumentId}/strings/{index}")]
    public async Task<ActionResult<string>> UpdateString(int instrumentId, int index, [FromBody] string note)
    {
        var instrument = await _db.Instruments.FindAsync(instrumentId);
        if (instrument == null) return NotFound();

        var notes = ParseDefaultNotes(instrument.StringNotes);
        if (index < 0 || index >= notes.Count) return BadRequest("Invalid string index");

        notes[index] = note;
        instrument.StringNotes = System.Text.Json.JsonSerializer.Serialize(notes);
        await _db.SaveChangesAsync();

        return Ok(note);
    }

    private static List<string> ParseDefaultNotes(string json)
    {
        try
        {
            var arr = System.Text.Json.JsonSerializer.Deserialize<List<string>>(json);
            return arr ?? new List<string>();
        }
        catch
        {
            return new List<string>();
        }
    }

    public record InstrumentTypeDto(
        int Id, string Name, string Category, int StringCount,
        string DefaultNotes, double MinFrequency, double MaxFrequency);

    public record InstrumentWithStrings(
        int Id, int InstrumentTypeId, string Name, string Category,
        int StringCount, IEnumerable<string> DefaultNotes);
}
