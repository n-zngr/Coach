import { useState } from 'react';
import FolderDropdown from '../Dropdowns/FolderDropdown';

interface AddButtonProps {
    onTriggerNewItem: () => void;
    onTriggerUpload: () => void;
    onTriggerImport: () => void;
    itemType?: 'semester' | 'subject' | 'topics';
}

/**
 * Add Button displaying dropdown to add or upload items in documents page.
*/
const AddButton: React.FC<AddButtonProps> = ({ onTriggerNewItem, onTriggerUpload, onTriggerImport, itemType = 'semester' }) => {
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <div className='relative'>
            <button onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center
                bg-black-100 dark:bg-white-900 hover:bg-white-900 dark:hover:bg-black-100
                border hover:border-black-100 dark:hover:border-white-900 rounded-full
                text-white-900 hover:text-black-100 dark:text-black-100 dark:hover:text-white-900
                gap-2 py-1 px-4 mb-2
                transition-colors duration-300
            ">
                <div className="h-4 w-4 flex justify-center">
                    <svg width="100%" height="100%" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 1V9M1 4.97538H9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <p>Add</p>
            </button>
            {showDropdown && (
                <FolderDropdown
                    isOpen={showDropdown}
                    onClose={() => setShowDropdown(false)}
                    showNewItemOnly={true}
                    itemType={itemType}
                    onAddItem={() => {
                        setShowDropdown(false);
                        onTriggerNewItem();
                    }}
                    onTriggerUpload={() => {
                        setShowDropdown(false);
                        onTriggerUpload();
                    }}
                    onTriggerImport={() => {
                        setShowDropdown(false);
                        onTriggerImport();
                    }}
                />
            )}
        </div>
    )
}

export default AddButton;