import { useState, useRef, useEffect } from 'react';

type DropdownProps = {
    isOpen: boolean;
    onClose: () => void;
    onRename?: () => void;
    onDelete?: () => void;
    onAddSemester?: () => void;
    showNewSemesterOnly?: boolean;
    [key: string]: any;
}

const FolderDropdown: React.FC<DropdownProps> = ({ isOpen, onClose, onRename, onDelete, onAddSemester, showNewSemesterOnly }) => {
    const [isRightAligned, setIsRightAligned] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleEscapePressed = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscapePressed);

        return () => { 
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapePressed);
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            const dropdownWidth = 160; // Adjust as needed
            const isRight = rect.left + dropdownWidth > window.innerWidth;
            if (isRight !== isRightAligned) {
                setIsRightAligned(isRight);
            }
        }
    }, [isOpen, isRightAligned]);
/*
    const actions = [];

    if (onRename) {
        actions.push({
            label: 'Rename',
            action: onRename
        });
    }

    if (onDelete) {
        actions.push({
            label: 'Delete',
            action: onDelete,
            style: 'text-red-500 hover:bg-red-100 dark:hover:bg-red-500'
        });
    }

    if (onAddSemester) {
        actions.push({
            label: 'New Semester',
            action: () => {
                onAddSemester?.();
                onClose();
            }
        });
    }
*/
    if (!isOpen) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <div className={`absolute ${isRightAligned ? 'right-0' : 'left-0'} min-w-32 top-2
                flex flex-col
                bg-white-900 dark:bg-black-100
                border border-black-500 dark:border-white-500 rounded-lg
                gap-1 p-1
                font-light
                transition-colors duration-300 z-10`}
            >
                {showNewSemesterOnly ? (
                    <button
                        onClick={() => {
                            onAddSemester?.();
                            onClose();
                        }}
                        className="block w-full px-4 py-2 
                                hover:bg-black-100 dark:hover:bg-white-900 text-left 
                                hover:text-white-900 dark:hover:text-black-100
                                capitalize rounded-md transition-colors"
                    >
                        New Semester
                    </button>
                ) : (
                    <>
                        {onRename && (
                            <button onClick={onRename}
                                className="
                                block w-full px-4 py-2 
                                hover:bg-black-100 dark:hover:bg-white-900 text-left 
                                hover:text-white-900 dark:hover:text-black-100
                                capitalize rounded-md transition-colors"
                                >
                                Rename
                            </button>
                        )}
                        {onDelete && (
                            <button onClick={onDelete}
                                className="
                                block w-full px-4 py-2 
                                hover:bg-red-500 dark:hover:bg-red-500
                                text-left hover:text-white-900 dark:hover:text-black-100
                                capitalize rounded-md transition-colors"
                            >
                                Delete
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default FolderDropdown;

