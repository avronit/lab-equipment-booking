using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LabEquipmentBooking.Api;

[ApiController, Route("api/[controller]")]
public sealed class BookingsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Booking>>> Get() => Ok(await db.Bookings.AsNoTracking().Include(x => x.Station).OrderBy(x => x.StartDateTime).ToListAsync());

    [HttpPost]
    public async Task<ActionResult<Booking>> Create(CreateBookingRequest request)
    {
        var startDateTime = ToUtc(request.StartDateTime);
        var endDateTime = ToUtc(request.EndDateTime);
        if (endDateTime <= startDateTime) return BadRequest("End date/time must be after the start date/time.");
        if (!await db.Stations.AnyAsync(x => x.Id == request.StationId)) return BadRequest("Equipment was not found.");
        var conflict = await db.Bookings.AnyAsync(x => x.StationId == request.StationId && startDateTime < x.EndDateTime && endDateTime > x.StartDateTime);
        if (conflict) return Conflict("This instrument is already reserved during the selected time.");
        var booking = new Booking { UserName = request.UserName, ExperimentName = request.ExperimentName, Description = request.Description, StationId = request.StationId, StartDateTime = startDateTime, EndDateTime = endDateTime };
        db.Bookings.Add(booking); await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = booking.Id }, booking);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, CreateBookingRequest request)
    {
        var booking = await db.Bookings.FindAsync(id); if (booking is null) return NotFound();
        var startDateTime = ToUtc(request.StartDateTime);
        var endDateTime = ToUtc(request.EndDateTime);
        var conflict = await db.Bookings.AnyAsync(x => x.Id != id && x.StationId == request.StationId && startDateTime < x.EndDateTime && endDateTime > x.StartDateTime);
        if (conflict) return Conflict("This instrument is already reserved during the selected time.");
        booking.UserName = request.UserName; booking.ExperimentName = request.ExperimentName; booking.Description = request.Description; booking.StationId = request.StationId; booking.StartDateTime = startDateTime; booking.EndDateTime = endDateTime;
        await db.SaveChangesAsync(); return NoContent();
    }

    private static DateTime ToUtc(DateTime value) => value.Kind == DateTimeKind.Utc ? value : DateTime.SpecifyKind(value, DateTimeKind.Local).ToUniversalTime();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) { var booking = await db.Bookings.FindAsync(id); if (booking is null) return NotFound(); db.Bookings.Remove(booking); await db.SaveChangesAsync(); return NoContent(); }
}
