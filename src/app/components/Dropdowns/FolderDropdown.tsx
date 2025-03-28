import { useState, useRef, useEffect } from 'react';

type DropdownProps = {
    onRename: () => void;
    onDelete: () => void;
}

const FolderDropdown: React.FC<DropdownProps> = ({ onRename, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEscapePressed = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
                if (buttonRef.current) {
                    buttonRef.current.blur();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscapePressed);

        return () => { 
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapePressed);
        }
    }, []);

    

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={toggleDropdown} ref={buttonRef} className='h-8 w-8
                bg-transparent hover:bg-black-100 dark:hover:bg-white-900
                rounded-full
                text-black-500 hover:text-white-500 dark:text-white-900 dark:hover:text-black-100
                p-2
                transition-colors duration-300 -z-0 focus:outline-none
            '>
                <svg width="100%" height="100%" viewBox="0 0 14 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3.5C12.8284 3.5 13.5 2.82843 13.5 2C13.5 1.17157 12.8284 0.5 12 0.5C11.1716 0.5 10.5 1.17157 10.5 2C10.5 2.82843 11.1716 3.5 12 3.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 3.5C7.82843 3.5 8.5 2.82843 8.5 2C8.5 1.17157 7.82843 0.5 7 0.5C6.17157 0.5 5.5 1.17157 5.5 2C5.5 2.82843 6.17157 3.5 7 3.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 3.5C2.82843 3.5 3.5 2.82843 3.5 2C3.5 1.17157 2.82843 0.5 2 0.5C1.17157 0.5 0.5 1.17157 0.5 2C0.5 2.82843 1.17157 3.5 2 3.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-2 w-32 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-10">
                    <button onClick={onRename} className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700">
                        Rename
                    </button>
                    <button onClick={onDelete} className="block w-full px-4 py-2 text-left text-red-500 hover:bg-red-100 dark:hover:bg-red-700">
                        Delete
                    </button>
                </div>
            )}
        </div>
    )
}

export default FolderDropdown;