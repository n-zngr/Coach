import { useState, useRef, useEffect } from 'react';

type DropdownProps = {
    onRename?: () => void;
    onDelete?: () => void;
    [key: string]: any;
}

const FolderDropdown: React.FC<DropdownProps> = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isRightAligned, setIsRightAligned] = useState(false);
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
                buttonRef.current?.blur();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscapePressed);

        return () => { 
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapePressed);
        }
    }, []);

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const dropdownWidth = 128;
            const isClipping = buttonRect.left + dropdownWidth > window.innerWidth;

            setIsRightAligned(isClipping);
        }
    }, [isOpen])

    const actions: { label: string; action?: () => void; style?: string }[] = [];

    Object.entries(props).forEach(([key, value]) => {
        if (typeof value === "function") {
            actions.push({
                label: key.replace(/^on/, ""), // Remove "on" prefix (e.g., "onRename" -> "Rename")
                action: value,
                style:
                key === "onDelete"
                    ? "text-red-500 hover:bg-red-100 dark:hover:!bg-red-500"
                    : "",
            });
        }
      });

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={toggleDropdown}
                ref={buttonRef}
                className='h-8 w-8
                bg-transparent hover:bg-black-100 dark:hover:bg-white-900
                rounded-full
                text-black-500 hover:text-white-500 dark:text-white-900 dark:hover:text-black-100
                p-2
                active:scale-95 transition-all duration-300 -z-0 focus:outline-none
            '>
                <svg width="100%" height="100%" viewBox="0 0 14 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3.5C12.8284 3.5 13.5 2.82843 13.5 2C13.5 1.17157 12.8284 0.5 12 0.5C11.1716 0.5 10.5 1.17157 10.5 2C10.5 2.82843 11.1716 3.5 12 3.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 3.5C7.82843 3.5 8.5 2.82843 8.5 2C8.5 1.17157 7.82843 0.5 7 0.5C6.17157 0.5 5.5 1.17157 5.5 2C5.5 2.82843 6.17157 3.5 7 3.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 3.5C2.82843 3.5 3.5 2.82843 3.5 2C3.5 1.17157 2.82843 0.5 2 0.5C1.17157 0.5 0.5 1.17157 0.5 2C0.5 2.82843 1.17157 3.5 2 3.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>

            {isOpen && actions.length > 0 && (
                <div className={`absolute ${isRightAligned ? 'right-0' : 'left-0'} w-32
                flex flex-col
                bg-white-900 dark:bg-black-100
                border border-black-500 dark:border-white-500 rounded-lg
                gap-1 p-1 mt-2
                font-light
                transition-colors duration-300 z-10`}>
                    {actions.map(({ label, action, style }) => (
                        <button
                            key={label}
                            onClick={action}
                            className={`
                                ${style} block w-full px-4 py-2 hover:bg-black-100 dark:hover:bg-white-900 text-left hover:text-white-900 dark:hover:text-black-100
                                capitalize rounded-md transition-colors`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default FolderDropdown;