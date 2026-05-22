using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace DrumTuner.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Drums",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    DrumTypeId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Drums", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DrumTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Category = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    LugCount = table.Column<int>(type: "INTEGER", nullable: false),
                    DefaultNote = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DrumTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Instruments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    InstrumentTypeId = table.Column<int>(type: "INTEGER", nullable: false),
                    StringNotes = table.Column<string>(type: "TEXT", nullable: false, defaultValue: "[]")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Instruments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "InstrumentTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Category = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    StringCount = table.Column<int>(type: "INTEGER", nullable: false),
                    DefaultNotes = table.Column<string>(type: "TEXT", nullable: false, defaultValue: "[]"),
                    MinFrequency = table.Column<double>(type: "REAL", nullable: false),
                    MaxFrequency = table.Column<double>(type: "REAL", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InstrumentTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TuningSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    DrumTypeId = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TuningSessions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Lugs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    DrumId = table.Column<int>(type: "INTEGER", nullable: false),
                    Position = table.Column<int>(type: "INTEGER", nullable: false),
                    TunedNote = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Lugs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Lugs_Drums_DrumId",
                        column: x => x.DrumId,
                        principalTable: "Drums",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LugTuningRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TuningSessionId = table.Column<int>(type: "INTEGER", nullable: false),
                    Position = table.Column<int>(type: "INTEGER", nullable: false),
                    Note = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LugTuningRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LugTuningRecords_TuningSessions_TuningSessionId",
                        column: x => x.TuningSessionId,
                        principalTable: "TuningSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "DrumTypes",
                columns: new[] { "Id", "Category", "DefaultNote", "LugCount", "Name" },
                values: new object[,]
                {
                    { 1, "Snare", "D3", 8, "Standard Snare" },
                    { 2, "Tom", "C3", 6, "Rack Tom" },
                    { 3, "Tom", "G2", 8, "Floor Tom" },
                    { 4, "Kick", "C2", 6, "Bass Drum" }
                });

            migrationBuilder.InsertData(
                table: "InstrumentTypes",
                columns: new[] { "Id", "Category", "DefaultNotes", "MaxFrequency", "MinFrequency", "Name", "StringCount" },
                values: new object[,]
                {
                    { 1, "Guitar", "[\"E2\",\"A2\",\"D3\",\"G3\",\"B3\",\"E4\"]", 1318.0, 82.0, "Acoustic Guitar", 6 },
                    { 2, "Guitar", "[\"E2\",\"A2\",\"D3\",\"G3\",\"B3\",\"E4\"]", 1318.0, 82.0, "Electric Guitar", 6 },
                    { 3, "Guitar", "[\"B1\",\"E2\",\"A2\",\"D3\",\"G3\",\"B3\",\"E4\"]", 1318.0, 58.0, "7-String Guitar", 7 },
                    { 4, "Bass", "[\"E1\",\"A1\",\"D2\",\"G2\"]", 392.0, 41.0, "4-String Bass", 4 },
                    { 5, "Bass", "[\"B0\",\"E1\",\"A1\",\"D2\",\"G2\"]", 392.0, 37.0, "5-String Bass", 5 },
                    { 6, "Bass", "[\"B0\",\"E1\",\"A1\",\"D2\",\"G2\",\"C3\"]", 490.0, 37.0, "6-String Bass", 6 },
                    { 7, "Piano", "[\"A0\",\"A#0\",\"B0\",\"C1\",\"C#1\",\"D1\",\"D#1\",\"E1\",\"F1\",\"F#1\",\"G1\",\"G#1\",\"A1\",\"A#1\",\"B1\",\"C2\",\"C#2\",\"D2\",\"D#2\",\"E2\",\"F2\",\"F#2\",\"G2\",\"G#2\",\"A2\",\"A#2\",\"B2\",\"C3\",\"C#3\",\"D3\",\"D#3\",\"E3\",\"F3\",\"F#3\",\"G3\",\"G#3\",\"A3\",\"A#3\",\"B3\",\"C4\",\"C#4\",\"D4\",\"D#4\",\"E4\",\"F4\",\"F#4\",\"G4\",\"G#4\",\"A4\",\"A#4\",\"B4\",\"C5\",\"C#5\",\"D5\",\"D#5\",\"E5\",\"F5\",\"F#5\",\"G5\",\"G#5\",\"A5\",\"A#5\",\"B5\",\"C6\",\"C#6\",\"D6\",\"D#6\",\"E6\",\"F6\",\"F#6\",\"G6\",\"G#6\",\"A6\",\"A#6\",\"B6\",\"C7\",\"C#7\",\"D7\",\"D#7\",\"E7\",\"F7\",\"F#7\",\"G7\",\"G#7\",\"A7\",\"A#7\",\"B7\"]", 4186.0, 27.5, "Piano (88 keys)", 88 },
                    { 8, "Strings", "[\"G3\",\"D4\",\"A4\",\"E5\"]", 1318.0, 196.0, "Violin", 4 },
                    { 9, "Strings", "[\"G3\",\"D4\",\"A4\",\"E5\"]", 1318.0, 196.0, "Viola", 4 },
                    { 10, "Strings", "[\"G2\",\"D3\",\"A3\",\"E4\"]", 659.0, 98.0, "Cello", 4 },
                    { 11, "Strings", "[\"E1\",\"A1\",\"D2\",\"G2\"]", 392.0, 41.0, "Double Bass", 4 },
                    { 12, "Other", "[\"G4\",\"C4\",\"E4\",\"A4\"]", 880.0, 262.0, "Ukulele (Standard)", 4 },
                    { 13, "Other", "[\"G4\",\"D3\",\"G3\",\"B3\",\"D4\"]", 1175.0, 262.0, "Banjo (5-string)", 5 },
                    { 14, "Other", "[\"G3\",\"D4\",\"G4\",\"B4\",\"E5\"]", 1318.0, 196.0, "Mandolin", 8 },
                    { 15, "Other", "[\"G2\",\"B2\",\"D3\",\"G3\",\"B3\",\"D4\"]", 1175.0, 98.0, "Dobro", 6 },
                    { 16, "Percussion", "[\"C3\"]", 500.0, 40.0, "Timpani", 1 },
                    { 17, "Percussion", "[\"D3\",\"A2\"]", 400.0, 80.0, "Tuned Congas", 2 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Lugs_DrumId",
                table: "Lugs",
                column: "DrumId");

            migrationBuilder.CreateIndex(
                name: "IX_LugTuningRecords_TuningSessionId",
                table: "LugTuningRecords",
                column: "TuningSessionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DrumTypes");

            migrationBuilder.DropTable(
                name: "Instruments");

            migrationBuilder.DropTable(
                name: "InstrumentTypes");

            migrationBuilder.DropTable(
                name: "Lugs");

            migrationBuilder.DropTable(
                name: "LugTuningRecords");

            migrationBuilder.DropTable(
                name: "Drums");

            migrationBuilder.DropTable(
                name: "TuningSessions");
        }
    }
}
