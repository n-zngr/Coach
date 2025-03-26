
/*interface TopbarProps {
    path: string;
}*/

const Topbar: React.FC = () => {
    return (
        <header
            className={`
                relative
                flex items-center justify-start
                bg-none
                border-b border-black-900 dark:border-white-100
                transition-transform duration-300
                w-{100%} h-16
            `}
        >
        <div className="flex items-center h-full px-6">
            <h1 className="text-xl font-light text-black-900 dark:text-white-100">
                Documents
            </h1>
        </div>
        </header>
    )
}

export default Topbar;