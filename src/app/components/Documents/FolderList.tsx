"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import FolderDropdown from '../Dropdowns/FolderDropdown';
import AddButton from '../Buttons/AddButton';

type FolderItem = {
    id: string;
    name: string;
}

type FolderListProps = {
    items: FolderItem[];
    basePath: string;
    onRename: (id: string, newName: string) => void;
    onDelete: (id: string) => void;
    onAddSemester: (id: string) => void;
    onTriggerUpload: () => void;
    children: React.ReactNode;
}

const FolderList: React.FC<FolderListProps> = ({ items, basePath, onRename, onDelete, onAddSemester, onTriggerUpload, children }) => {
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [folderName, setFolderName] = useState('');
    const [originalName, setOriginalName] = useState('');
    const [showDropdown, setShowDropdown] = useState<string | null>(null);
    const [showNewSemesterFolder, setShowNewSemesterFolder] = useState(false);
    const [newSemesterName, setNewSemesterName] = useState('');

    const toggleDropdown = (id: string) => {
        setShowDropdown(showDropdown === id ? null : id);
    };

    useEffect(() => {
        if (editingFolderId) {
            const folder = items.find(item => item.id === editingFolderId);
            if (folder) {
                setFolderName(folder.name);
                setOriginalName(folder.name);
            }
        }
    }, [editingFolderId, items]);

    const handleRenameClick = (id: string, currentName: string) => {
        setEditingFolderId(id);
        setFolderName(currentName);
    };

    const handleRenameInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFolderName(event.target.value);
    };

    const handleRenameConfirm = () => {
        if (!editingFolderId) return;

        const trimmedName = folderName.trim();
        if (trimmedName && trimmedName !== originalName.trim()) {
            onRename(editingFolderId, trimmedName);
        }

        setEditingFolderId(null);
    };

    const handleRenameInputBlur = () => {
        handleRenameConfirm();
    }

    const handleRenameInputEnterPressed = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleRenameConfirm();
        }
    };

    return (
        <div>
            <header className="border-b border-black-500 dark:border-white-500 mb-8">
                <div className="flex justify-between">
                    <h1 className="font-base text-xl self-end pb-1">{children}</h1>
                    <AddButton onTriggerNewSemester={() => setShowNewSemesterFolder(true)} onTriggerUpload={onTriggerUpload} />
                </div>
            </header>
            <ul className="grid grid-cols-3 gap-4 mb-4">
                {items.map((item) => (
                    <li
                    key={item.id}
                    className="flex items-center justify-between
                    p-4 border rounded-lg bg-white 
                    bg-white-900 hover:bg-white-800 dark:bg-black-100 dark:hover:bg-black-200
                    transition-colors duration-300"
                    >
                        <Link href={`${basePath}/${item.id}`} className="flex gap-4 flex-1">
                            <div className='flex justify-center items-center'>
                                <div className="
                                    min-w-12 min-h-12
                                    flex justify-center items-center
                                    bg-white-800 dark:bg-black-200
                                    border border-black-900 dark:border-white-900 rounded-md
                                    text-black-500 dark:text-white-500
                                    p-2">
                                    <svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M0.794996 0.781049C1.30402 0.280952 1.99441 0 2.71429 0H7.54571C7.80668 0 8.04453 0.147036 8.15746 0.378179L9.92698 4H16.2857C17.0056 4 17.696 4.28095 18.205 4.78105C18.714 5.28115 19 5.95942 19 6.66667V13.3333C19 14.0406 18.714 14.7189 18.205 15.219C17.696 15.719 17.0056 16 16.2857 16H2.71429C1.99441 16 1.30402 15.719 0.794996 15.219C0.285968 14.7189 0 14.0406 0 13.3333V2.66667C0 1.95942 0.285969 1.28115 0.794996 0.781049ZM2.71429 1.33333C2.35435 1.33333 2.00915 1.47381 1.75464 1.72386C1.50013 1.97391 1.35714 2.31304 1.35714 2.66667V13.3333C1.35714 13.687 1.50013 14.0261 1.75464 14.2761C2.00915 14.5262 2.35435 14.6667 2.71429 14.6667H16.2857C16.6457 14.6667 16.9908 14.5262 17.2454 14.2761C17.4999 14.0261 17.6429 13.687 17.6429 13.3333V6.66667C17.6429 6.31304 17.4999 5.97391 17.2454 5.72386C16.9908 5.47381 16.6457 5.33333 16.2857 5.33333H9.5C9.23903 5.33333 9.00118 5.1863 8.88825 4.95515L7.11873 1.33333H2.71429Z" fill="currentColor"/>
                                    </svg>
                                </div>
                            </div>

                            {/* Folder Name & Rename Input */}
                            {editingFolderId === item.id ? (
                                <input
                                    type="text"
                                    value={folderName}
                                    onChange={handleRenameInputChange}
                                    onBlur={handleRenameInputBlur}
                                    onKeyDown={handleRenameInputEnterPressed}
                                    className="w-full bg-transparent border-b border-transparent focus:border-gray-500 focus:outline-none font-medium text-lg text-black-500 dark:text-white-500"
                                    autoFocus
                                />
                            ) : (
                                <p className="font-bold capitalize">{item.name}</p>
                            )}
                        </Link>
                        <button onClick={() => toggleDropdown(item.id)}
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
                        <FolderDropdown
                            isOpen={showDropdown === item.id}
                            onClose={() => setShowDropdown(null)}
                            onRename={() => handleRenameClick(item.id, item.name)}
                            onDelete={() => onDelete(item.id)}
                        />
                    </li>
                ))}
                {showNewSemesterFolder && (
                    <li className="flex items-center justify-between p-4 border rounded-lg bg-white-900 dark:bg-black-100">
                        <input 
                            type="text" 
                            value={newSemesterName} 
                            onChange={(e) => setNewSemesterName(e.target.value)} 
                            placeholder="New Semester Name"
                            className="w-full bg-transparent border-b border-gray-500 focus:outline-none font-medium text-lg"
                            />
                        <button 
                            onClick={() => {
                                if (newSemesterName.trim()) {
                                    onAddSemester(newSemesterName.trim());
                                    setShowNewSemesterFolder(false);
                                }
                            }}
                            className="bg-blue-500 text-white px-4 py-2 rounded ml-2">
                            Add Semester
                        </button>
                    </li>
                )}
            </ul>
        </div>
    )
}

export default FolderList;