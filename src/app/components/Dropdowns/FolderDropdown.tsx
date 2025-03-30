import { useState, useRef, useEffect } from 'react';

type DropdownProps = {
    isOpen: boolean;
    onClose: () => void;
    onRename?: () => void;
    onDelete?: () => void;
    onAddItem?: () => void;
    showNewItemOnly?: boolean;
    itemType?: 'semester' | 'subject' | 'topics';
    onTriggerUpload?: () => void;
    onTriggerImport?: () => void;
    [key: string]: any;
}

const FolderDropdown: React.FC<DropdownProps> = ({ isOpen, onClose, onRename, onDelete, onAddItem, showNewItemOnly, onTriggerUpload, onTriggerImport, itemType = 'semester' }) => {
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
                {showNewItemOnly ? (
                    <>
                        <button
                            onClick={() => {
                                onAddItem?.();
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
                            <p>New {itemType}</p>
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
                            <svg width="100%" height="100%" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.25 7.92308H15.75C15.9489 7.92308 16.1397 8.00412 16.2803 8.14838C16.421 8.29264 16.5 8.4883 16.5 8.69231V20.2308C16.5 20.4348 16.421 20.6304 16.2803 20.7747C16.1397 20.919 15.9489 21 15.75 21H2.25C2.05109 21 1.86032 20.919 1.71967 20.7747C1.57902 20.6304 1.5 20.4348 1.5 20.2308V8.69231C1.5 8.4883 1.57902 8.29264 1.71967 8.14838C1.86032 8.00412 2.05109 7.92308 2.25 7.92308H3.75M9 11.7692V1M9 1L6 4.07692M9 1L12 4.07692" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            </div>
                            <p>Upload File</p>
                        </button>
                        {itemType === 'subject' && (
                            <button
                                onClick={() => {
                                    onTriggerImport?.();
                                    onClose();
                                }}
                                className="flex w-full items-center
                                    hover:bg-black-100 dark:hover:bg-white-900 text-left 
                                    hover:text-white-900 dark:hover:text-black-100
                                    gap-2 px-2 py-2
                                    capitalize rounded-md transition-colors text-nowrap"
                            >
                                <div className="h-4 w-4 flex justify-center">
                                    {/* Add an appropriate icon for import */}
                                    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12M12 2V16M12 16L8 12M12 16L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <p>Import</p>
                            </button>
                        )}
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

