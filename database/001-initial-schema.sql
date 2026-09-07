CREATE TABLE Stations (Id SERIAL PRIMARY KEY, Name VARCHAR(200) NOT NULL UNIQUE, Status VARCHAR(30) NOT NULL DEFAULT 'Available');
CREATE TABLE Bookings (Id SERIAL PRIMARY KEY, UserName VARCHAR(200) NOT NULL, ExperimentName VARCHAR(300) NOT NULL, Description TEXT NULL, StationId INT NOT NULL REFERENCES Stations(Id), StartDateTime TIMESTAMPTZ NOT NULL, EndDateTime TIMESTAMPTZ NOT NULL, CONSTRAINT CK_Bookings_DateRange CHECK (EndDateTime > StartDateTime));
CREATE INDEX IX_Bookings_Station_Dates ON Bookings (StationId, StartDateTime, EndDateTime);
