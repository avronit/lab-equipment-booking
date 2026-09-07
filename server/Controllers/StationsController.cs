using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LabEquipmentBooking.Api;

[ApiController, Route("api/[controller]")]
public sealed class StationsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Station>>> Get() => Ok(await db.Stations.AsNoTracking().OrderBy(x => x.Name).ToListAsync());
}
