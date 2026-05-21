using DrumTuner.Data;
using DrumTuner.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DrumTuner.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TuningSessionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public TuningSessionsController(AppDbContext db) => _db = db;

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateSessionRequest request)
    {
        var session = new TuningSession
        {
            DrumTypeId = request.DrumTypeId,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow
        };

        _db.TuningSessions.Add(session);
        await _db.SaveChangesAsync();

        foreach (var record in request.LugRecords)
        {
            _db.LugTuningRecords.Add(new LugTuningRecord
            {
                TuningSessionId = session.Id,
                Position = record.Position,
                Note = record.Note
            });
        }

        await _db.SaveChangesAsync();

        return Ok(new { session.Id });
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SessionDto>>> Get()
    {
        var sessions = await _db.TuningSessions
            .Include(s => s.LugTuningRecords)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        return sessions.Select(s => new SessionDto(
            s.Id,
            s.DrumTypeId,
            s.CreatedAt,
            s.Notes,
            s.LugTuningRecords.OrderBy(r => r.Position).Select(r => new LugRecordDto(r.Position, r.Note)).ToList()
        )).ToList();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SessionDto>> Get(int id)
    {
        var session = await _db.TuningSessions
            .Include(s => s.LugTuningRecords)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (session == null) return NotFound();

        return new SessionDto(
            session.Id,
            session.DrumTypeId,
            session.CreatedAt,
            session.Notes,
            session.LugTuningRecords.OrderBy(r => r.Position).Select(r => new LugRecordDto(r.Position, r.Note)).ToList()
        );
    }

    public record CreateSessionRequest(int DrumTypeId, string? Notes, List<LugRecordDto> LugRecords);
    public record SessionDto(int Id, int DrumTypeId, DateTime CreatedAt, string? Notes, List<LugRecordDto> LugRecords);
    public record LugRecordDto(int Position, string Note);
}
