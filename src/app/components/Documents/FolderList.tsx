"use client";

import { useState } from 'react';
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

    const handleRenameClick = (id: string, currentName: string) => {
        setEditingFolderId(id);
        setFolderName(currentName);
    };

    const handleRenameInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFolderName(event.target.value);
    }

    const handleRenameInputBlur = () => {
        if (editingFolderId && folderName.trim()) {
            onRename(editingFolderId, folderName);
        }
        setEditingFolderId(null);
    }

    const handleRenameInputEnterPressed = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
          handleRenameInputBlur();
        }
    };

    return (
        <ul className="grid grid-cols-3 gap-4 mb-4">
            {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors duration-300">
                    <Link href={`${basePath}/${item.id}`} className="flex gap-4 flex-1">
                        <div className="flex items-center">
                        {/* Folder Icon */}
                        <div className="w-12 h-12 bg-gray-300 rounded"></div>
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