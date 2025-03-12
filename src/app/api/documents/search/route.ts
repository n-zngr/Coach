import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/app/utils/mongodb';

const DATABASE_NAME = 'documents';
const COLLECTION_NAME = 'fs.files';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query } = body;

    const cookies = req.headers.get('cookie');
    const userId = cookies?.match(/userId=([^;]*)/)?.[1];

    if (!userId) {
      return NextResponse.json({ error: 'UserId is required' }, { status: 401 });
    }

    const usersCollection = await getCollection('users', 'users');
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!query?.trim()) {
      return NextResponse.json({ error: 'No search parameters provided' }, { status: 400 });
    }

    // 🔹 Suche nach Subjects mit explizitem Typ "subject"
    let matchingSubjects = user.semesters.flatMap((semester: any) =>
      semester.subjects
        .filter((subject: { name: string }) =>
          subject.name.toLowerCase().includes(query.toLowerCase())
        )
        .map((subject: { id: string; name: string }) => ({
          type: 'subject',
          id: subject.id,
          name: subject.name,
          semesterId: semester.id,
          semesterName: semester.name,
          files: [] // Leeres Array hinzufügen, das später befüllt wird
        }))
    );

    const filesCollection = await getCollection(DATABASE_NAME, COLLECTION_NAME);

    // 🔹 Standard-Dateisuche
    const searchQuery: any = {
      'metadata.userId': userId,
      $or: [
        { 'filename': { $regex: query, $options: 'i' } },
        { 'metadata.folderName': { $regex: query, $options: 'i' } },
        { 'metadata.subjectName': { $regex: query, $options: 'i' } },
        { 'metadata.semesterName': { $regex: query, $options: 'i' } },
        { 'metadata.tags.name': { $regex: query, $options: 'i' } } // Neue Zeile für die Tags-Suche
      ]
    };

    let files = await filesCollection.find(searchQuery).limit(6).toArray();

    // 🔹 Verbinde jedes File mit dem entsprechenden Subject und Semester
    files = files.map((file: any) => {
      let foundSubject: any = null;
      // Suche das Subject, dessen ID mit file.metadata.subjectId übereinstimmt
      for (const semester of user.semesters) {
        const subject = semester.subjects.find((subject: any) => subject.id === file.metadata.subjectId);
        if (subject) {
          foundSubject = subject;
          break;
        }
      }
      // Finde das Semester anhand der semesterId
      const foundSemester = user.semesters.find((semester: any) => semester.id === file.metadata.semesterId);

      if (foundSubject) {
        file.metadata.subjectName = foundSubject.name;
      }
      if (foundSemester) {
        file.metadata.semesterName = foundSemester.name;
      }

      return file;
    });

    // 🔹 Für alle gefundenen Subjects: Hole zusätzlich alle Files, die zum Subject gehören und hänge sie an
    if (matchingSubjects.length > 0) {
      const subjectIds = matchingSubjects.map((subject: any) => subject.id);
      const subjectFiles = await filesCollection.find({
        'metadata.userId': userId,
        'metadata.subjectId': { $in: subjectIds }
      }).toArray();

      // Auch hier sicherstellen, dass subjectName und semesterName gesetzt werden
      const updatedSubjectFiles = subjectFiles.map((file: any) => {
        let foundSubject: any = null;
        for (const semester of user.semesters) {
          const subject = semester.subjects.find((subject: any) => subject.id === file.metadata.subjectId);
          if (subject) {
            foundSubject = subject;
            break;
          }
        }
        const foundSemester = user.semesters.find((semester: any) => semester.id === file.metadata.semesterId);
        if (foundSubject) {
          file.metadata.subjectName = foundSubject.name;
        }
        if (foundSemester) {
          file.metadata.semesterName = foundSemester.name;
        }
        return file;
      });

      // Hänge zu jedem Subject die zugehörigen Files an
      matchingSubjects.forEach((subject: any) => {
        subject.files = updatedSubjectFiles.filter((file: any) => file.metadata.subjectId === subject.id);
      });

      // Filtere die Subjects ohne Files
      matchingSubjects = matchingSubjects.filter((subject: any) => subject.files.length > 0);
    }

    // 🔹 Kombiniere Subjects und Files in einer einzigen Antwort, dabei aber die doppelte Anzeige vermeiden
    let results = [...matchingSubjects, ...files];

    // 🔹 Wende die Logik an, um nur das Subject anzuzeigen, wenn sowohl ein Subject als auch ein File gefunden wurde
    const filteredResults: any[] = []; // Explizit als Array von "any" typisieren
    const subjectsMap = new Map<string, any>(); // Speichert die Subject-Ergebnisse

    // Gehe durch alle Ergebnisse und filtere die, die sowohl ein Subject als auch ein File enthalten
    results.forEach((result) => {
      if (result.type === 'subject') {
        // Wenn das Ergebnis ein Subject ist, prüfe, ob bereits ein File für dieses Subject existiert
        if (!subjectsMap.has(result.id)) {
          subjectsMap.set(result.id, result);
          filteredResults.push(result); // Füge das Subject hinzu
        }
      } else {
        // Wenn das Ergebnis ein File ist, prüfe, ob ein Subject vorhanden ist
        const subject = subjectsMap.get(result.metadata?.subjectId);
        if (!subject) {
          filteredResults.push(result); // Füge das File hinzu, wenn kein Subject gefunden wurde
        }
      }
    });

    return NextResponse.json(filteredResults, { status: 200 });
  } catch (error) {
    console.error('Error searching files: ', error);
    return NextResponse.json({ message: 'Failed to search files', error }, { status: 500 });
  }
}