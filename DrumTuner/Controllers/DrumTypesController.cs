using DrumTuner.Data;
using DrumTuner.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DrumTuner.Controllers;

[ApiController]
[Route("api/drum-types")]
public class DrumTypesController : ControllerBase
{
    private readonly AppDbContext _db;

    public DrumTypesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DrumTypeDto>>> Get()
    {
        var types = await _db.DrumTypes.ToListAsync();
        return Ok(types.Select(t => new DrumTypeDto(
            t.Id, t.Name, t.Category, t.LugCount, t.DefaultNote
        )));
    }

    // POST api/drum-types/1/instantiate
    [HttpPost("{drumTypeId}/instantiate")]
    public async Task<ActionResult<DrumWithLugs>> Instantiate(int drumTypeId)
    {
        var drumType = await _db.DrumTypes.FindAsync(drumTypeId);
        if (drumType == null) return NotFound();

        // Create a new drum instance
        var drum = new Drum { DrumTypeId = drumTypeId };
        _db.Drums.Add(drum);
        await _db.SaveChangesAsync();

        // Create lugs for this drum
        var lugs = new List<Lug>();
        for (int i = 1; i <= drumType.LugCount; i++)
        {
            lugs.Add(new Lug { DrumId = drum.Id, Position = i });
        }
        _db.Lugs.AddRange(lugs);
        await _db.SaveChangesAsync();

        return Ok(new DrumWithLugs(
            drum.Id,
            drumTypeId,
            drumType.Name,
            drumType.Category,
            lugs.Select(l => new LugDto(l.Id, l.Position, l.TunedNote))
        ));
    }

    public record DrumTypeDto(int Id, string Name, string Category, int LugCount, string DefaultNote);
    public record DrumWithLugs(int Id, int DrumTypeId, string Name, string Category, IEnumerable<LugDto> Lugs);
    public record LugDto(int Id, int Position, string? TunedNote);
}
