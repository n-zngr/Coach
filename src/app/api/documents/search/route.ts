import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/app/utils/mongodb';

const DOCUMENTS_DB = 'documents';
const DOCUMENTS_COL = 'fs.files';
const LINKS_COL = 'links';


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

        // Search by subjects
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
                    files: []
                }))
        );
        

        const filesCollection = await getCollection(DOCUMENTS_DB, DOCUMENTS_COL);

        // Default search
        const searchQuery: any = {
            'metadata.userId': userId,
            $or: [
                { 'filename': { $regex: query, $options: 'i' } },
                { 'metadata.folderName': { $regex: query, $options: 'i' } },
                { 'metadata.subjectName': { $regex: query, $options: 'i' } },
                { 'metadata.semesterName': { $regex: query, $options: 'i' } },
                { 'metadata.tags.name': { $regex: query, $options: 'i' } }
            ]
        };

        let files = await filesCollection.find(searchQuery).limit(6).toArray();

        // Ties every file to semester and subject
        files = files.map((file: any) => {
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

            if (file.metadata && file.metadata.topicId) {
                let topicName = null;
                user.semesters.forEach((semester: any) => {
                    semester.subjects.forEach((subject: any) => {
                        subject.topics.forEach((topic: any) => {
                            if (topic.id === file.metadata.topicId) {
                                topicName = topic.name;
                            }
                        });
                    });
                });
                if (topicName) {
                    file.metadata.topicName = topicName;
                }
            }

            return file;
        });

        // Für alle gefundenen Subjects: Hole zusätzlich alle Files, die zum Subject gehören und hänge sie an
        if (matchingSubjects.length > 0) {
            const subjectIds = matchingSubjects.map((subject: any) => subject.id);
            const subjectFiles = await filesCollection.find({
                'metadata.userId': userId,
                'metadata.subjectId': { $in: subjectIds }
            }).toArray();

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

            matchingSubjects.forEach((subject: any) => {
                subject.files = updatedSubjectFiles.filter((file: any) => file.metadata.subjectId === subject.id);
            });

            matchingSubjects = matchingSubjects.filter((subject: any) => subject.files.length > 0);
        }

        // Search by links
        const linksCollection = await getCollection(DOCUMENTS_DB, LINKS_COL);
        const linkSearchQuery: any = {
            'metadata.userId': userId,
            $or: [
                { 'name': { $regex: query, $options: 'i' } },
                { 'url': { $regex: query, $options: 'i' } },
                { 'metadata.tags.name': { $regex: query, $options: 'i' } } // Tags hinzufügen
            ]
        };

        let links = await linksCollection.find(linkSearchQuery).limit(6).toArray();

        // Adds contextual info to every link
        links = links.map((link: any) => {
            let foundSemester: any = null;
            let foundSubject: any = null;
            let foundTopic: any = null;

            for (const semester of user.semesters) {
                if (semester.id === link.metadata.semesterId) {
                    foundSemester = semester;
                    for (const subject of semester.subjects) {
                        if (subject.id === link.metadata.subjectId) {
                            foundSubject = subject;
                            for (const topic of subject.topics) {
                                if (topic.id === link.metadata.topicId) {
                                    foundTopic = topic;
                                    break;
                                }
                            }
                            break;
                        }
                    }
                    break;
                }
            }

            return {
                ...link,
                semesterName: foundSemester?.name || "Unbekanntes Semester",
                subjectName: foundSubject?.name || "Unbekanntes Fach",
                topicName: foundTopic?.name || "Unbekanntes Thema",
            };
        });

        const results = [...matchingSubjects, ...files, ...links]; // Combines subjects, files, links in results answer

        // Logic avoiding duplicate entries
        const filteredResults: any[] = [];
        const subjectsMap = new Map<string, any>();

        results.forEach((result) => {
            if (result.type === 'subject') {
                if (!subjectsMap.has(result.id)) {
                    subjectsMap.set(result.id, result);
                    filteredResults.push(result);
                }
            } else {
                const subject = subjectsMap.get(result.metadata?.subjectId);
                if (!subject) {
                    filteredResults.push(result);
                }
            }
        });

        return NextResponse.json(filteredResults, { status: 200 });
    } catch (error) {
        console.error('Error searching files: ', error);
        return NextResponse.json({ message: 'Failed to search files', error }, { status: 500 });
    }
}