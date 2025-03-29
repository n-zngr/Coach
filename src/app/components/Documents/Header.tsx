import AddButton from "../Buttons/AddButton";

interface DocumentsHeaderProps {
    children: React.ReactNode;
}

const DocumentsHeader: React.FC<DocumentsHeaderProps> = ({ children }) => {

    return (
        <header className="border-b border-black-500 dark:border-white-500 mb-8">
            <div className="flex justify-between">
                <h1 className="font-base text-xl self-end pb-1">{children}</h1>
                <AddButton />
            </div>
        </header>
    )
}

export default DocumentsHeader;