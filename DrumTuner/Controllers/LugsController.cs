using DrumTuner.Data;
using DrumTuner.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DrumTuner.Controllers;

[ApiController]
[Route("api/lugs")]
public class LugsController : ControllerBase
{
    private readonly AppDbContext _db;

    public LugsController(AppDbContext db) => _db = db;

    [HttpGet("drum/{drumId}")]
    public async Task<ActionResult<IEnumerable<Lug>>> GetByDrum(int drumId)
        => await _db.Lugs.Where(l => l.DrumId == drumId).OrderBy(l => l.Position).ToListAsync();

    [HttpPut("{lugId}")]
    public async Task<ActionResult> Update(int lugId, [FromBody] LugUpdateRequest request)
    {
        var lug = await _db.Lugs.FindAsync(lugId);
        if (lug == null) return NotFound();

        lug.TunedNote = request.Note;
        await _db.SaveChangesAsync();

        return Ok(lug);
    }

    public record LugUpdateRequest(string? Note);
}
