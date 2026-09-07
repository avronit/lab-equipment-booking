using Microsoft.EntityFrameworkCore;

namespace LabEquipmentBooking.Api;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Station> Stations => Set<Station>();
    public DbSet<Booking> Bookings => Set<Booking>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Station>().HasIndex(x => x.Name).IsUnique();
        modelBuilder.Entity<Booking>().HasOne(x => x.Station).WithMany(x => x.Bookings).HasForeignKey(x => x.StationId).OnDelete(DeleteBehavior.Restrict);
        var names = new[] { "Sensys", "C80 Calvet", "Calvet DC", "Alexsys", "Themys LV", "Themys", "Labsys STA", "STA449 Jupiter", "DSC404", "STA509 Jupiter", "MicroDSC III", "MicroDSC VII", "DSC131", "LFA717 HyperFlash", "LFA467 HT HyperFlash", "LFA427 HT HyperFlash", "DIL L75 Horizontal", "DIL L75 Vertical", "DIL Vertical Combined with TGA-TOM", "Levitation" };
        for (var i = 0; i < names.Length; i++) modelBuilder.Entity<Station>().HasData(new Station { Id = i + 1, Name = names[i], Status = StationStatus.Available });
    }
}
