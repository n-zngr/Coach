import Navigation from '@/app/components/Navigation';

export default function Home() {

    return (
        <div className="flex h-screen">
            <Navigation />
            <main className="flex-1 p-8">
                <h1 className="text-3xl font-bold">Coach Proof of Concept</h1>
                <p className="mt-4 text-lg">Use the navigation bar to access different sections of the application.</p>
            </main>
        </div>
    );
}
