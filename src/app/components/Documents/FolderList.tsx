"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import FolderDropdown from '../Dropdowns/FolderDropdown';

type FolderItem = {
    id: string;
    name: string;
}

type FolderListProps = {
    items: FolderItem[];
    basePath: string;
    onRename: (id: string, newName: string) => void;
    onDelete: (id: string) => void;
}

const FolderList: React.FC<FolderListProps> = ({ items, basePath, onRename, onDelete }) => {
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [folderName, setFolderName] = useState('');
    const [originalName, setOriginalName] = useState('');

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
        <ul className="grid grid-cols-3 gap-4 mb-4">
            {items.map((item) => (
                <li
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors duration-300"
                >
                    <Link href={`${basePath}/${item.id}`} className="flex gap-4 flex-1">
                        <div className="flex items-center">
                            {/* Folder Icon */}
                            <div className="w-12 h-12 rounded">
                                <svg width="50%" height="50%" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0.794996 0.781049C1.30402 0.280952 1.99441 0 2.71429 0H7.54571C7.80668 0 8.04453 0.147036 8.15746 0.378179L9.92698 4H16.2857C17.0056 4 17.696 4.28095 18.205 4.78105C18.714 5.28115 19 5.95942 19 6.66667V13.3333C19 14.0406 18.714 14.7189 18.205 15.219C17.696 15.719 17.0056 16 16.2857 16H2.71429C1.99441 16 1.30402 15.719 0.794996 15.219C0.285968 14.7189 0 14.0406 0 13.3333V2.66667C0 1.95942 0.285969 1.28115 0.794996 0.781049ZM2.71429 1.33333C2.35435 1.33333 2.00915 1.47381 1.75464 1.72386C1.50013 1.97391 1.35714 2.31304 1.35714 2.66667V13.3333C1.35714 13.687 1.50013 14.0261 1.75464 14.2761C2.00915 14.5262 2.35435 14.6667 2.71429 14.6667H16.2857C16.6457 14.6667 16.9908 14.5262 17.2454 14.2761C17.4999 14.0261 17.6429 13.687 17.6429 13.3333V6.66667C17.6429 6.31304 17.4999 5.97391 17.2454 5.72386C16.9908 5.47381 16.6457 5.33333 16.2857 5.33333H9.5C9.23903 5.33333 9.00118 5.1863 8.88825 4.95515L7.11873 1.33333H2.71429Z" fill="white"/>
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

                <FolderDropdown
                    onRename={() => handleRenameClick(item.id, item.name)}
                    onDelete={() => onDelete(item.id)}
                />
            </li>
            ))}
        </ul>
    )
}

export default FolderList;