import Link from "next/link";

interface TopbarProps {
    path?: string | undefined;
}

const Topbar: React.FC<TopbarProps> = ({ path }) => {
    const getBreadcrumbLabel = (segment: string) => {
        return segment
            .replace(/-/g, " ")
            .replace(/(\D)(\d)/, "$1 $2") // Insert space before numbers (e.g., "math101" → "Math 101")
            .replace(/(\d)([A-Za-z])/, "$1 $2") // Handle cases like "M103" → "M 103"
            .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
    }

    const generateBreadcrumbs = (path: string | undefined) => {
        if (!path) return null;

        const segments = path.split("/").filter(Boolean);
        return segments.map((segment, index) => {
            const href = `/documents/${segments.slice(0, index + 1).join("/")}`;
            const isLast = index === segments.length - 1;

            return (
                <span key={href} className="flex items-center">
                    <Link
                        href={href}
                        className='capitalize bg-none
                        border border-white-900 hover:border-black-100 dark:border-black-100 dark:hover:border-white-900 rounded-full
                        text-lg font-light text-black-500 hover:text-black-100 dark:text-white-500 dark:hover:text-white-900
                        px-2 transition-colors duration-300'
                    >
                        {getBreadcrumbLabel(segment)}
                    </Link>
                    {!isLast && <span className="mx-2 text-lg font-light text-black-500 dark:text-white-500">/</span>}
                </span>
            );
        });
    };


    return (
        <header className='fixed
        flex items-center justify-start
        bg-white-900 dark:bg-black-100
        border-b border-black-900 dark:border-white-100
        transition-transform duration-300
        w-[100%] h-[4.5rem]'>
        <div className="flex items-center h-full px-10">
            <Link href="/documents" className="bg-none
                border border-white-900 hover:border-black-100 dark:border-black-100 dark:hover:border-white-900 rounded-full
                text-lg font-light text-black-500 dark:text-white-500
                px-2 transition-colors duration-300">
                Documents
            </Link>
            {/* Render breadcrumbs only if path is defined */}
            {path && (
                <>
                    <span className="mx-2 text-lg font-light text-black-500 dark:text-white-500">/</span>
                    {generateBreadcrumbs(path)}
                </>
            )}
        </div>
    </header>
    )
}

export default Topbar;