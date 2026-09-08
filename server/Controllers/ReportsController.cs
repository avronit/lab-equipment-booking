using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LabEquipmentBooking.Api;

[ApiController, Route("api/[controller]")]
public sealed class ReportsController(AppDbContext db) : ControllerBase
{
    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<ReportRow>>> Users(DateTime? from = null, DateTime? to = null) => Ok(await BuildReport(db.Bookings, x => x.UserName, from, to));
    [HttpGet("stations")]
    public async Task<ActionResult<IEnumerable<ReportRow>>> Stations(DateTime? from = null, DateTime? to = null) => Ok(await BuildReport(db.Bookings.Include(x => x.Station), x => x.Station!.Name, from, to));
    private static async Task<List<ReportRow>> BuildReport(IQueryable<Booking> source, Func<Booking, string> key, DateTime? from, DateTime? to)
    {
        var bookings = await source.AsNoTracking().Where(x => (!from.HasValue || x.EndDateTime >= from) && (!to.HasValue || x.StartDateTime <= to)).ToListAsync();
        return bookings.GroupBy(key).Select(group => new ReportRow(
            group.Key,
            group.Count(),
            group.Sum(x => (x.EndDateTime - x.StartDateTime).TotalHours),
            string.Join(", ", group.Select(x => x.ExperimentName).Distinct()),
            string.Join(" | ", group.Select(x => x.Description).Where(x => !string.IsNullOrWhiteSpace(x)).Distinct()),
            string.Join(", ", group.Select(x => x.UserName).Distinct()))).OrderByDescending(x => x.BookingCount).ToList();
    }
}
