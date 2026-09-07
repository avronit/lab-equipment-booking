namespace LabEquipmentBooking.Api;

public enum StationStatus { Available, Occupied, Maintenance }

public sealed class Station
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public StationStatus Status { get; set; } = StationStatus.Available;
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}

public sealed class Booking
{
    public int Id { get; set; }
    public required string UserName { get; set; }
    public required string ExperimentName { get; set; }
    public string Description { get; set; } = string.Empty;
    public int StationId { get; set; }
    public Station? Station { get; set; }
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
}

public sealed record CreateBookingRequest(string UserName, string ExperimentName, string Description, int StationId, DateTime StartDateTime, DateTime EndDateTime);
public sealed record ReportRow(string Key, int BookingCount, double TotalUsageHours);
