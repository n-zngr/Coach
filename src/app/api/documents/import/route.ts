import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    // Load the .ics file (adjust path as needed)
    const filePath = path.join(process.cwd(), "public", "calendar.ics");
    const icsData = fs.readFileSync(filePath, "utf-8");

    // Define valid subjects from extracted list
    const validSubjects = new Set([
      "AKRO", "BA", "BAN", "BG", "BI", "BK", "BM", "BO", "BP", "BR", "BS", "BU", "BW", "BÜ", "CAE", "CH", "CHOR", "DELF", "DK", "DO", "DU", "ED", "EG", "FE", "FOT", "FR", "FS", "FU", "FUS", "GE", "GG", "GL", "GPO", "GU", "HL", "HN", "HO", "ICT", "IDPA", "IKA", "IN", "ITA", "KE", "KF", "KG", "KH", "KI", "KLA", "KM", "KN", "KO", "KS", "LC", "LD", "LE", "LÜ", "MA", "MN", "MO", "MU", "NI", "NW", "OC", "PA", "PE", "PL", "PY", "RA", "REF", "RG", "RH", "RI", "RO", "RT", "RÜ", "SB", "SC", "SH", "SJ", "SL", "SPA", "SPO", "SR", "ST", "SV", "SW", "THE", "TL", "TO", "TR", "UA", "VG", "VOL", "VS", "VW", "WA", "WD", "WE", "WI", "WLR", "WN", "WO", "WP", "WT", "WW", "WX", "ZA", "ÖK"
    ]);

    // Extract subjects from SUMMARY fields
    const summaryRegex = /SUMMARY:([^\n]+)/g;
    const subjects = new Set<string>();
    let match;

    while ((match = summaryRegex.exec(icsData)) !== null) {
      const fullSummary = match[1].trim();
      const subject = fullSummary.split("-")[0]; // Extract first part
      if (subject.length <= 4 && validSubjects.has(subject)) {
        subjects.add(subject);
      }
    }

    // Log the unique subjects
    console.log("Unique Subjects:", Array.from(subjects));

    return NextResponse.json({ subjects: Array.from(subjects) });
  } catch (error) {
    console.error("Error reading calendar file:", error);
    return NextResponse.json({ error: "Failed to process the .ics file" }, { status: 500 });
  }
}
