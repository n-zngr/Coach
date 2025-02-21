import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

// Example subjects list
const subjects = [
"100", "101", "104", "105", "106", "106a", "106b", "114", "114a", "114b", "117", "117a", "117b", "120", "121", "122", "122a", "122b", "123", "133", "150", "151", "152", "153", "162", "162a", "162b", "164", "164a", "164b", "165", "165a", "165b", "183", "183a", "183b", "187", "187a", "187b", "214", "223", "223a", "223b", "226A", "226B", "231", "231a", "231b", "241", "241a", "241b", "242", "245", "245a", "245b", "248", "248a", "248b", "254", "254a", "254b", "293", "293a", "293b", "294", "294a", "294b", "295", "295a", "295b", "302", "304", "305", "306", "306a", "306b", "307", "319", "319a", "319b", "320", "320a", "320b", "321", "321a", "321b", "322", "322a", "322b", "323", "323a", "323b", "324", "324a", "324b", "326", "335", "335a", "335b", "346", "346a", "346b", "347", "347a", "347b", "403", "404", "411", "426", "426a", "426b", "431", "431a", "431b", "450", "450a", "450b", "AE1", "AE2", "AE3", "AG", "AKK", "AKRO", "APG", "B", "BAN", "BC", "BCP", "BG", "BG_g", "BG2", "BK", "BLF", "BP", "BR", "C", "CAE", "cB", "cC", "CEL", "cGE", "CHO", "CHOR", "CHP", "COA", "cÖK", "cP", "cW", "D", "DaT", "DaZ", "DELF", "DG", "DGa", "DGb", "DK", "DRZ", "E", "E1", "E3", "EBA", "EFZ", "EGIT", "EGK_IMS", "EIK", "Einführung FA", "ENE", "ENP", "Entwicklungsbiologie", "EPI", "ESP", "EuB", "F", "FA", "FBU", "FCHO", "FIN", "FIR", "FIT", "FM1", "FOT", "FR", "FUS", "G", "GE", "GG", "GGG", "GGO", "GIT", "GP", "GPO", "GS", "GSW", "HAR", "I", "IB", "ICT-A", "IDA", "IDAF", "IDAF_D1", "IDAF_D2", "IDAF_E", "IDAF_GPO", "IDAF_M", "IDAF_TuU", "IDAF1", "IDAF2", "IDPA", "IDPA_GS", "IDPA-NA", "IDUF", "IK_IMS", "IKA", "IKAD", "IKA-D", "IKAE", "IKA-E", "IKAF", "IKA-F", "IKAP", "IKAT1", "IKAT2", "IN", "INU", "INU_B", "INU_C", "INU_GG", "INU_ÖK", "INU_P", "INU_PR", "INüK", "IPA", "IPT", "KAM", "kBM", "kBR", "kD", "kE", "kF", "KG", "kGS", "kIKA", "kIN", "kINU", "KLA", "KLE", "KLT", "KLV", "kM", "kMod", "kMU", "kMUBG", "kNW", "KOB", "kÖKB", "kÖKC", "Kolloquium", "Kolloquium 1", "Kommunikation", "kPY", "KS", "ksB", "ksBGBG", "ksBW", "ksFB", "ksGE", "ksINU", "ksKS", "ksM", "ksMU", "kSPO", "ksPsM", "ksPY", "kVW", "kWR", "LB", "LBB", "Lebensphase 1", "Lebensphase 2", "LS", "M", "M306", "MAL", "MaS", "Methodik-Gs", "Methodik-S", "MG", "Mod01", "Mod02", "Mod03", "Mod04", "Mod05", "Mod06", "Mod07", "Mod08", "Mod09", "Mod10", "Mod11", "Mod12", "Mod13", "Mod14", "Mod15", "Mod16", "Mod17", "Mod18", "Mod19", "MU", "NW", "NW_B", "NW_C", "NW_P", "OBO", "ÖK", "ÖK_B", "ÖK_GG", "ORC", "P", "PBF", "PCG", "PCGa", "PCGb", "PE", "PIDPA", "POS", "Praxiserfahrungen", "PRE", "PROJ", "PrP", "PU", "PUF", "PY", "QUF", "QV-Vorbereitung", "rBio", "rC", "rD", "rE", "rF", "rFR", "rG", "rGE", "rGG", "RH", "rIKA", "rINS", "rM", "rMU", "rÖK", "rP", "rPY", "rSPO", "rVWL", "RW", "rWLR/PE", "rWR", "S", "SA", "SAX", "sB", "sBFU", "sBR", "sBU", "sC", "sCPR", "sD", "sDG", "sDKF", "sEuB", "sF", "sFR", "sG2D", "sG3D", "sGE", "sGE2", "sGE3", "sGG", "sI", "sINU", "sKA", "sKG", "sKoiK", "sKS", "SLZ", "sM", "sME", "sMKR", "sMU", "sÖK", "SOL", "Sonderpädagogik", "sP", "sPB", "sPBF", "SPO", "SPR", "sPY", "sSWT", "sW", "sWRG", "SWT", "sZWT", "TANZ", "TAZ", "TE", "THE", "TRO", "TuU", "UA", "VW", "WP", "WuR", "ZWT"
];

// Helper function to filter .ics events and extract unique subjects
const filterIcsFile = (filePath: string, subjects: string[]): string[] => {
  try {
    const icsFile = fs.readFileSync(filePath, 'utf-8');

    // Regular expression to match VEVENT blocks
    const eventRegex = /BEGIN:VEVENT[\s\S]*?END:VEVENT/g;

    // Regular expression to match SUMMARY field
    const summaryRegex = /SUMMARY:([^\r\n]+)/;

    // Find all VEVENT blocks
    const events = icsFile.match(eventRegex);

    // Set to store unique subject names
    const uniqueSubjects = new Set<string>();

    // Extract subjects from events
    events?.forEach((event) => {
      const summaryMatch = event.match(summaryRegex);
      if (summaryMatch && summaryMatch[1]) {
        // Extract the subject from the SUMMARY field and trim whitespace
        const subject = summaryMatch[1].split('-')[0].trim(); // Get the part before the dash
        if (subjects.includes(subject)) {
          uniqueSubjects.add(subject); // Add to set to ensure uniqueness
        }
      }
    });

    // Convert Set to Array and return
    return Array.from(uniqueSubjects);
  } catch (error) {
    console.error(`Error reading the ICS file: ${error.message}`);
    return [];
  }
};

// Path to the .ics file
const filePath = path.join(process.cwd(), 'public', 'calendar.ics');

// Export the GET method
export async function GET(request: Request) {
  const filteredSubjects = filterIcsFile(filePath, subjects);
  return NextResponse.json(filteredSubjects);
}

// Export the POST method
export async function POST(request: Request) {
  const data = await request.json(); // Example of reading JSON data from the request body
  // Handle data from the POST request as needed
  return NextResponse.json({ message: 'POST request successful', data });
}

// Optional: You can implement additional HTTP methods like PUT and DELETE if needed
