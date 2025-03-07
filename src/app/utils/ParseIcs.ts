// Mapping of Kürzel (short codes) to Bezeichnung (full names)
const subjectMap: Record<string, string> = {
    "100": "Modul 100", "101": "Modul 101", "104": "Modul 104", "105": "Modul 105", "106": "Modul 106", "106a": "Modul 106", "106b": "Modul 106", "114": "Modul 114", "114a": "Modul 114", "114b": "Modul 114", "117": "Modul 117", "117a": "Modul 117", "117b": "Modul 117", "120": "Modul 120", "121": "Modul 121", "122": "Modul 122", "122a": "Modul 122", "122b": "Modul 122", "123": "Modul 123", "133": "Modul 133", "150": "Modul 150", "151": "Modul 151", "152": "Modul 152", "153": "Modul 153", "162": "Modul 162", "162a": "Modul 162", "162b": "Modul 162", "164": "Modul 164", "164a": "Modul 164", "164b": "Modul 164", "165": "Modul 165", "165a": "Modul 165", "165b": "Modul 165", "183": "Modul 183", "183a": "Modul 183", "183b": "Modul 183", "187": "Modul 187", "187a": "Modul 187", "187b": "Modul 187", "214": "Modul 214", "223": "Modul 223", "223a": "Modul 223", "223b": "Modul 223", "226A": "Modul 226", "226B": "Modul 226", "231": "Modul 231", "231a": "Modul 231", "231b": "Modul 231", "241": "Modul 241", "241a": "Modul 241", "241b": "Modul 241", "242": "Modul 242", "245": "Modul 245", "245a": "Modul 245", "245b": "Modul 245", "248": "Modul 248", "248a": "Modul 248", "248b": "Modul 248", "254": "Modul 254", "254a": "Modul 254", "254b": "Modul 254", "293": "Modul 293", "293a": "Modul 293", "293b": "Modul 293", "294": "Modul 294", "294a": "Modul 294", "294b": "Modul 294", "295": "Modul 295", "295a": "Modul 295", "295b": "Modul 295", "302": "Modul 302", "304": "Modul 304", "305": "Modul 305", "306": "Modul 306", "306a": "Modul 306", "306b": "Modul 306", "307": "Modul 307", "319": "Modul 319", "319a": "Modul 319", "319b": "Modul 319", "320": "Modul 320", "320a": "Modul 320", "320b": "Modul 320", "321": "Modul 321", "321a": "Modul 321", "321b": "Modul 321", "322": "Modul 322", "322a": "Modul 322", "322b": "Modul 322", "323": "Modul 323", "323a": "Modul 323", "323b": "Modul 323", "324": "Modul324", "324a": "Modul 324", "324b": "Modul 324", "326": "Modul 326", "335": "Modul 335", "335a": "Modul 335", "335b": "Modul 335", "346": "Modul 346", "346a": "Modul 346", "346b": "Modul 346", "347": "Modul 347", "347a": "Modul 347", "347b": "Modul 347", "403": "Modul 403", "404": "Modul 404", "411": "Modul 411", "426": "Modul 426", "426a": "Modul 426", "426b": "Modul 426", "431": "Modul 431", "431a": "Modul 431", "431b": "Modul 431", "450": "Modul 450", "450a": "Modul 450", "450b": "Modul 450", "AE1": "Ausbildungseinheit 1", "AE2": "Ausbildungseinheit 2", "AE3": "Ausbildungseinheit 3", "AG": "Aktuelles Geschehen", "AKK": "Instrument: Akkordeon", "AKRO": "Akrobatik", "APG": "Aktuelles politisches Geschehen", "B": "Biologie", "BAN": "Band", "BC": "Biologie und Chemie", "BCP": "Biologie, Chemie, Physik", "BG": "Bildnerisches Gestalten", "BG_g": "Bildnerisches Gestalten (G)", "BG2": "Bildnerisches Gestalten", "BK": "Berufskunde", "BLF": "Instrument: Blockflöte", "BP": "Berufliche Praxis", "BR": "Betriebswirtschaft und Recht", "C": "Chemie", "CAE": "Certificate in Advanced English", "cB": "Biologie", "cC": "Chemie", "CEL": "Cello", "cGE": "Gestalten", "CHO": "Chor", "CHOR": "Chor", "CHP": "Chemie, Physik", "COA": "Coaching", "cÖK": "Ökologie", "cP": "Physik", "cW": "Wirtschaft und Recht", "D": "Deutsch", "DaT": "Kplus Design & Technology", "DaZ": "Deutsch als Zweitsprache", "DELF": "Französisch Delf", "DG": "Digitales Gestalten", "DGa": "Digitales Gestalten", "DGb": "Digitales Gestalten", "DK": "Digitale Kompetenzen", "DRZ": "Deutsch Repetition Zitieren", "E": "Englisch", "E1": "Englisch", "E3": "Englisch", "EBA": "Instrument: E-Bass", "EFZ": "EFZ-Bereich", "EGIT": "Gitarre elektronisch", "EGK_IMS": "Erweiterte Grundkompetenzen", "EIK": "Informatikkompetenzen", "Einführung FA": "Einführung FA", "ENE": "Englisch: Erfahrungsnote QV", "ENP": "Englisch: Prüfung QV", "Entwicklungsbiologie": "Entwicklungsbiologie", "EPI": "E-Piano", "ESP": "Einführung in die Spieltheorie", "EuB": "Erziehen und Begleiten", "F": "Französisch", "FA": "Fachmaturitätsarbeit", "FBU": "Fussball, Basketball, Unihockey", "FCHO": "Fame Chor", "FIN": "Sport: Fitness", "FIR": "English First", "FIT": "Sport: Fitnesstraining", "FM1": "Fachmaturitätspraktikum", "FOT": "Fotografisches Gestalten", "FR": "Finanz- und Rechnungswesen", "FUS": "Fussball", "G": "Geschichte", "GE": "Gestalten", "GG": "Geografie", "GGG": "Geschichte und Geografie", "GGO": "Geografie/Ökologie", "GIT": "Gitarre", "GP": "Geschichte und politische Bildung", "GPO": "Geschichte und Politik", "GS": "Geschichte und Staatslehre", "GSW": "Geistes- und Sozialwissenschaften", "HAR": "Instrument: Harfe", "I": "Italienisch", "IB": "ICT: Informatik und Bürokommunikation", "ICT-A": "ICT-Anwendungen", "IDA": "Interdisziplinäres Arbeiten", "IDAF": "Interdisziplinäres Arbeiten in den Fächern", "IDAF_D1": "Interdisziplinäres Arbeiten in den Fächern Deutsch 1", "IDAF_D2": "Interdisziplinäres Arbeiten in den Fächern Deutsch 2", "IDAF_E": "Interdisziplinäres Arbeiten in den Fächern Englisch", "IDAF_GPO": "Interdisziplinäres Arbeiten in den Fächern GPO", "IDAF_M": "Interdisziplinäres Arbeiten in den Fächern Mathematik", "IDAF_TuU": "Interdisziplinäres Arbeiten in den Fächern TuT", "IDAF1": "IDAF1", "IDAF2": "IDAF2", "IDPA": "Interdisziplinäre Projektarbeit", "IDPA_GS": "Interdisziplinäre Projektarbeit", "IDPA-NA": "Interdisziplinäre Projektarbeit (Notenabgabe)", "IDUF": "Berufliche Identität+Umfeld", "IK_IMS": "Informatikkompetenzen", "IKA": "Information-Kommunikation-Administration", "IKAD": "IKA und Deutsch", "IKA-D": "IKA & Deutsch", "IKAE": "IKA Erfa QV", "IKA-E": "IKA & Englisch", "IKAF": "IKA und Französisch", "IKA-F": "IKA & Französisch", "IKAP": "IKA Prüfung QV", "IKAT1": "IKA Teilnote 1xGew.", "IKAT2": "IKA Teilnote 2xGew.", "IN": "Informatik", "INU": "Integrierter Naturwissenschaftlicher Unterricht", "INU_B": "INU (Biologie)", "INU_C": "INU (Chemie)", "INU_GG": "INU (Geografie)", "INU_ÖK": "INU (Ökologie)", "INU_P": "INU (Physik)", "INU_PR": "INU (Praktikum)", "INüK": "Informatik üK", "IPA": "IPA-Fokuskurs", "IPT": "Integrierte Praxisteile", "KAM": "Instrument: Kammermusik", "kBM": "Bildn.Gestalt/Musik (techn)", "kBR": "BR (techn.)", "kD": "Deutsch (techn)", "kE": "Englisch (techn)", "kF": "Französisch (techn)", "KG": "Kunstgeschichte", "kGS": "Geschichte und Staatslehre (techn)", "kIKA": "Information-Kommunikation- Administration (techn)", "kIN": "Informatik (techn)", "kINU": "Integrierte Naturwissenschaften (techn)", "KLA": "Klassenstunde", "KLE": "Sport: Klettern", "KLT": "Klarinette", "KLV": "Klavier", "kM": "Mathematik (techn)", "kMod": "IKA-Module", "kMU": "Musik", "kMUBG": "Musik und Bildnerisches Gestalten", "kNW": "Naturwissenschaften (Biologie,Chemie, Physik) (techn)", "KOB": "Instrument: Kontrabass", "kÖKB": "Ökologie (techn)", "kÖKC": "Ökologie (techn)", "Kolloquium": "Kolloquium", "Kolloquium 1": "Einführung Kolloquium und Kolloquium", "Kommunikation": "Kommunikation-Berufsfeld Soziales", "kPY": "Psychologie (techn)", "KS": "Klassenstunde", "ksB": "Biologie und Chemie (techn)", "ksBGBG": "Bildnerisches Gestalten (techn)", "ksBW": "Wirtschaft und Recht (techn)", "ksFB": "Wirtschaft und Recht (techn)", "ksGE": "Gestalten (techn)", "ksINU": "Integrierte Naturwissenschaften (techn)", "ksKS": "Berufskundlicher Unterricht (techn)", "ksM": "Mathematik (techn)", "ksMU": "Musik (techn)", "kSPO": "Sport / Rhythmik (techn)", "ksPsM": "Physik und Anwendungen der Mathematik (techn)", "ksPY": "Psychologie (techn)", "kVW": "Volkswirtschaft (techn)", "kWR": "Wirtschaft und Recht", "LB": "Lernbegleitung / Berufskunde", "LBB": "Lernbegleitung / Berufskunde", "Lebensphase 1": "Entwicklungsbiologie", "Lebensphase 2": "Entwicklungsbiologie", "LS": "Kplus Lernstudio", "M": "Mathematik", "M306": "Modul 306", "MAL": "Mallets", "MaS": "Mathematik Standortbestimmung", "Methodik-Gs": "Gesundheitswissenschaftliche Methodik", "Methodik-S": "Sozialwissenschaftliche Methodik", "MG": "Musik und Bildnerisches Gestalten", "Mod01": "Modul 01 (IKA Textverarbeitung)", "Mod02": "Modul 02 (IKA Präsentation)", "Mod03": "Modul 03 (IKA BS, Security)", "Mod04": "Modul 04 (IKA Tabellenkalkulation)", "Mod05": "Modul 05 (Datenbank)", "Mod06": "Modul 06 (Gestalten I)", "Mod07": "Modul 07 (Internet I)", "Mod08": "Modul 08 (Netzwerke)", "Mod09": "Modul 09 (Programmieren (DB))", "Mod10": "Modul 10 (IKA Office Integration)", "Mod11": "Modul 11 (IKA Programmieren)", "Mod12": "Modul 12 (Gestalten II)", "Mod13": "Modul 13 (Projektmanagement I)", "Mod14": "Modul 14 (Gestalten III)", "Mod15": "Modul 15 (Robotik)", "Mod16": "Modul 16 (IKA CMS Internet II)", "Mod17": "Modul 17 (Multimedia)", "Mod18": "Modul 18 (Praxissupport)", "Mod19": "Modul 19 (Projekt interdisziplinär).", "MU": "Musik", "NW": "Naturwissenschaften (Biologie, Chemie, Physik)", "NW_B": "Naturwissenschaften (Biologie)", "NW_C": "Naturwissenschaften (Chemie)", "NW_P": "Naturwissenschaften (Physik)", "OBO": "Oboe", "ÖK": "Ökologie", "ÖK_B": "Ökologie (Biologie)", "ÖK_GG": "Ökologie (Geografie)", "ORC": "Instrument: Orchester", "P": "Physik", "PBF": "Politik des Berufsfeldes", "PCG": "PC Grundlagen", "PCGa": "PC Grundlagen", "PCGb": "PC Grundlagen", "PE": "Philosophie / Ethik", "PIDPA": "Projekte / IDPA", "POS": "Instrument: Posaune", "Praxiserfahrungen": "Austausch Praxiserfahrungen", "Praxiserfahrungen 1": "Austausch Praxiserfahrungen", "Praxiserfahrungen 2": "Austausch Praxiserfahrungen", "Praxiserfahrungen 4": "Austausch Praxiserfahrungen", "PRE": "Prozesseinheit", "PROJ": "Projekt", "PrP": "Praxis Programmieren", "PU": "Integrierter Projektunterricht", "PUF": "Projektunterricht fachübergreifend", "PY": "Psychologie", "QUF": "Querflöte", "QV-Vorbereitung": "QV-Vorbereitung", "rBio": "Referat Biologie", "rC": "Referat Chemie", "rD": "Referat Deutsch", "rE": "Referat Englisch", "rF": "Referat Französisch", "rFR": "Referat Finanz- Rechnungswesen", "rG": "Referat Geschichte", "rGE": "Referat Gestalten", "rGG": "Referat Geographie", "RH": "Rhythmik", "rIKA": "Referat IKA", "rINS": "Referat Instrumental", "rM": "Referat Mathematik", "rMU": "Referat Musik", "rÖK": "Referat Ökologie", "rP": "Referat Physik", "rPY": "Referat Psychologie", "rSPO": "Referat Sport", "rVWL": "Referat Volkswirtschaftslehre", "RW": "Rechnungswesen", "rWLR/PE": "Referat WLR/PE", "rWR": "Referat Wirtschaft und Recht", "S": "Spanisch", "SA": "Selbstständige Arbeit", "SAX": "Saxophon", "sB": "Biologie", "sBFU": "Berufsfeldunterricht", "sBFU1": "Berufsfeldunterricht 1", "sBFU2": "Berufsfeldunterricht 2", "sBFU3": "Berufsfeldunterricht 3", "sBFU4": "Berufsfeldunterricht 4", "sBG": "Bildnerisches Gestalten", "sBR": "Betriebswirtschaft und Recht", "sBU": "Berufskundlicher Unterricht", "sC": "Chemie", "sCPR": "Chemie Praktikum", "sD": "Deutsch", "sDG": "Digitales Gestalten", "sDKF": "Digitale Kommunikationsformen", "sEuB": "Erziehen und Begleiten", "sF": "Französisch", "sFR": "Finanz- und Rechnungswesen", "sG2D": "Zweidimensionales Gestalten", "sG3D": "Dreidimensionales Gestalten", "sGE": "Gestalten", "sGE2": "Gestalten 2", "sGE3": "Gestalten 3", "sGG": "Geografie", "sI": "Italienisch", "sINU": "Integrierter Naturwissenschaftlicher Unterricht", "sINUBF": "Integrierte Naturwissenschaften", "sKA": "Kommunikation allgemein", "sKG": "Kunstgeschichte", "sKoiK": "Kommunikation in anderen Kulturen", "sKS": "Kommunikation und Sozialpsychologie", "SLZ": "Schlagzeug", "sM": "Mathematik", "sME": "Mensch und Entwicklung", "sMKR": "Medienkunde und Recht", "sMU": "Musik", "sMU2": "Gesangs- und Sprechstimme", "sMU3": "Ensemble- und Klassenmusizieren", "sÖK": "Ökologie", "sÖK_C": "Ökologie (Chemie)", "sÖK_GG": "Ökologie (Geografie)", "SOL": "Sologesang", "Sonderpädagogik": "Ausgewählte Themen der Sonderpädagogik", "sP": "Physik", "sPB": "Politische Bildung", "sPBF": "Politik des Berufsfeldes", "SPO": "Sport", "SPO-RH": "Sport-Rhythmik", "SPR": "Sport / Rhythmik", "sPY": "Psychologie", "sPY2": "Psychologie 2", "sSK": "Sozialkunde", "sSWT": "Schreibwerkstatt", "sW": "Wirtschaft und Recht", "sWRG": "Wirtschaft / Recht / Gesellschaft", "SWT": "Schreibwerkstatt", "sZWT": "Zeichnungswerkstatt", "TANZ": "Tanz", "TAZ": "Tanzen", "TE": "Technisches Englisch", "THE": "Theater", "TRO": "Trompete", "TuU": "Technik und Umwelt", "UA": "Umsetzungsaufträge", "V133": "Modul V133", "V151": "Modul V151", "V226": "Modul V226", "V293": "Modul V293", "V319": "Vertiefung - Applikationen entwerfen und implementieren", "V319a": "Vertiefung - Applikationen entwerfen und implementieren", "V319b": "Vertiefung - Applikationen entwerfen und implementieren", "V320": "Vertiefung - Objektorientiert Programmieren", "V320a": "Vertiefung - Objektorientiert Programmieren", "V320b": "Vertiefung - Objektorientiert Programmieren", "V326": "Modul V326", "V403": "Modul V403", "V404": "Modul V404", "V411": "Modul V411", "V426": "Modul V426", "VBR": "Volkswirtschaft/Betriebswirtschaft/Recht", "VIC": "Violoncello", "VIO": "Violine", "VOL": "Volleyball", "VV": "Vernetzen & Vertiefen", "VV1": "Vertiefen und Vernetzen", "VV2": "Vertiefen und Vernetzen", "VV3": "Vertiefen und Vernetzen", "VW": "Volkswirtschaftslehre", "VWeb": "Vertiefung - Frontend und Backend für Applikationen realisieren", "VWeba": "Vertiefung - Frontend und Backend für Applikationen realisieren", "VWebb": "Vertiefung - Frontend und Backend für Applikationen realisieren", "W": "Wirtschaft und Recht", "WE": "Wirtschaftsethik", "WG1": "Windows, Internet & Outlook Grundlagen", "WG2": "Windows, Internet & Outlook Grundlagen", "WI": "Wirtschaft", "WLR": "Welt / Leben / Religion", "WP": "WMS-Projekte", "WuR": "Wirtschaft und Recht", "ZWT": "Zeichnungswerkstatt"
};
  
// Function to parse ICS file content and return unique subjects
export const parseIcsFile = (icsContent: string): { name: string }[] => {
    try {
        const eventRegex = /BEGIN:VEVENT[\s\S]*?END:VEVENT/g;
        const summaryRegex = /SUMMARY:([^\r\n]+)/;
    
        const events = icsContent.match(eventRegex);
        const uniqueSubjects = new Set<string>();
    
        events?.forEach((event) => {
            const summaryMatch = event.match(summaryRegex);
            if (summaryMatch && summaryMatch[1]) {
                const subjectCode = summaryMatch[1].split('-')[0].trim();
                if (subjectMap[subjectCode]) {
                    uniqueSubjects.add(subjectCode);
                }
            }
        });

        return Array.from(uniqueSubjects).map((code) => ({
            name: subjectMap[code] || `Unbekannt (${code})`,
        }));
    } catch (error) {
        console.error(`Error parsing the ICS file: ${(error as Error).message}`);
        return [];
    }
};