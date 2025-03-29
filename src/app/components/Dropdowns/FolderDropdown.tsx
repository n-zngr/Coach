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

const FolderDropdown: React.FC<DropdownProps> = ({ isOpen, onClose, onRename, onDelete, onAddSemester, showNewSemesterOnly, onTriggerUpload }) => {
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
                    <>
                        <button
                            onClick={() => {
                                onAddSemester?.();
                                onClose();
                            }}
                            className="flex w-full items-center
                                    hover:bg-black-100 dark:hover:bg-white-900 text-left 
                                    hover:text-white-900 dark:hover:text-black-100
                                    gap-2 px-2 py-2
                                    capitalize rounded-md transition-colors text-nowrap"
                        >
                            <div className="h-4 w-4 flex justify-center">
                                <svg width="100%" height="100%" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 1V9M1 4.97538H9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <p>New Semester</p>
                        </button>
                        <button
                            onClick={() => {
                                onTriggerUpload?.();
                                onClose();
                            }}
                            className="flex w-full items-center
                                    hover:bg-black-100 dark:hover:bg-white-900 text-left 
                                    hover:text-white-900 dark:hover:text-black-100
                                    gap-2 px-2 py-2
                                    capitalize rounded-md transition-colors text-nowrap"
                        >
                            <div className="h-4 w-4 flex justify-center">
                                <svg width="100%" height="100%" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 10V4M4 7H10M1 4.2V9.8C1 10.9201 1 11.4802 1.21799 11.908C1.40973 12.2843 1.71569 12.5903 2.09202 12.782C2.51984 13 3.07989 13 4.2 13H9.8C10.9201 13 11.4802 13 11.908 12.782C12.2843 12.5903 12.5903 12.2843 12.782 11.908C13 11.4802 13 10.9201 13 9.8V4.2C13 3.0799 13 2.51984 12.782 2.09202C12.5903 1.71569 12.2843 1.40973 11.908 1.21799C11.4802 1 10.9201 1 9.8 1H4.2C3.0799 1 2.51984 1 2.09202 1.21799C1.71569 1.40973 1.40973 1.71569 1.21799 2.09202C1 2.51984 1 3.07989 1 4.2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <p>Upload File</p>
                        </button>
                    </>
                ) : (
                    <>
                        {onRename && (
                            <button onClick={onRename}
                                className="block w-full 
                                hover:bg-black-100 dark:hover:bg-white-900 text-left 
                                hover:text-white-900 dark:hover:text-black-100
                                px-4 py-2
                                capitalize rounded-md transition-colors"
                                >
                                Rename
                            </button>
                        )}
                        {onDelete && (
                            <button onClick={onDelete}
                                className="block w-full 
                                hover:bg-red-500 dark:hover:bg-red-500
                                text-left text-red-500 hover:text-white-900 dark:hover:text-black-100
                                px-4 py-2
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

