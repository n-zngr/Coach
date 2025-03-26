import Link from "next/link";

/*interface TopbarProps {
    path: string;
}*/

const Topbar: React.FC = () => {
    return (
        <header className='fixed
            flex items-center justify-start
            bg-white-900 dark:bg-black-100
            border-b border-black-900 dark:border-white-100
            transition-transform duration-300
            w-[100%] h-[4.5rem]'
        >
            <div className="flex items-center h-full px-10">
                <Link href="/documents" className="bg-none
                    border border-white-900 hover:border-black-100 dark:border-black-100 dark:hover:border-white-900 rounded-full
                    text-lg font-light text-black-500 dark:text-white-500
                    px-2 transition-colors duration-300">
                    Documents
                </Link>
            </div>
        </header>
    )
}

export default Topbar;