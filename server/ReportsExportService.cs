using System.Globalization;

namespace LabEquipmentBooking.Api;

public static class ReportsExportService
{
    public static string ExportDirectory => Path.Combine(AppContext.BaseDirectory, "exports");

    public static void WriteCsv(Stream stream, IEnumerable<ReportRow> rows)
    {
        using var writer = new StreamWriter(stream, leaveOpen: true);
        writer.WriteLine("Group,Bookings,TotalUsageHours,ExperimentName,Description,UserName");

        foreach (var row in rows)
        {
            writer.WriteLine($"{Escape(row.Key)},{row.BookingCount},{row.TotalUsageHours.ToString(CultureInfo.InvariantCulture)},{Escape(row.ExperimentName)},{Escape(row.Description)},{Escape(row.UserName)}");
        }

        writer.Flush();
    }

    public static string SaveCsvToDisk(string fileNamePrefix, IEnumerable<ReportRow> rows)
    {
        var exportsDirectory = ExportDirectory;
        Directory.CreateDirectory(exportsDirectory);

        var fileName = $"{fileNamePrefix}-{DateTime.UtcNow:yyyyMMdd-HHmmss}.csv";
        var fullPath = Path.Combine(exportsDirectory, fileName);

        using var stream = File.Create(fullPath);
        WriteCsv(stream, rows);

        return fullPath;
    }

    public static byte[] ToCsvBytes(IEnumerable<ReportRow> rows)
    {
        using var stream = new MemoryStream();
        WriteCsv(stream, rows);
        return stream.ToArray();
    }

    private static string Escape(string value)
    {
        if (string.IsNullOrEmpty(value)) return string.Empty;

        var needsQuotes = value.Contains(',') || value.Contains('"') || value.Contains('\n') || value.Contains('\r') || value.StartsWith(' ') || value.EndsWith(' ');
        if (!needsQuotes) return value;

        var escaped = value.Replace("\"", "\"\"");
        return $"\"{escaped}\"";
    }
}
