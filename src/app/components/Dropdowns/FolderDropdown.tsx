import { useState, useRef, useEffect } from 'react';

type DropdownProps = {
    onRename: () => void;
    onDelete: () => void;
}

const FolderDropdown: React.FC<DropdownProps> = ({ onRename, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative">
            <button onClick={toggleDropdown} className='
            p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition
            '>⋮</button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
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