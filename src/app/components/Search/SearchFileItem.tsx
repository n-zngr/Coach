"use client";

import { useState } from 'react';
import FileView from '@/app/components/FileView';

interface FileItemProps {
    file: any;
}
  
  const SearchFileItem: React.FC<FileItemProps> = ({ file }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const getFilePath = () => {
        let path = "";
        if (file.metadata?.semesterName) {
            path += file.metadata.semesterName + "/";
        }
        if (file.metadata?.subjectName) {
            path += file.metadata.subjectName + "/";
        }
        if (file.metadata?.topicName) {
            path += file.metadata.topicName + "/";
        }
        return path;
    };

    const handleFileClick = () => {
        setSelectedFile(file);
    }

    const handleCloseFileView = () => {
        setSelectedFile(null);
    }

    return (
        <>
            <div className='w-full flex bg-white-700 dark:bg-black-300 border border-white-500 dark:border-black-500 rounded-xl gap-4 p-4 text-black-100 dark:text-white-900'>
                <div className="flex rounded-md justify-center items-center bg-white-900 dark:bg-black-100 p-2">
                    <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.63636 1H2.27273C1.93518 1 1.61146 1.12967 1.37277 1.36048C1.13409 1.5913 1 1.90435 1 2.23077V15.7692C1 16.0957 1.13409 16.4087 1.37277 16.6395C1.61146 16.8703 1.93518 17 2.27273 17H13.7273C14.0648 17 14.3885 16.8703 14.6272 16.6395C14.8659 16.4087 15 16.0957 15 15.7692V7.15385M8.63636 1L15 7.15385M8.63636 1V7.15385H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div className="flex flex-col">
                    <h4 className="text-md font-semibold text-gray-800 dark:text-gray-300 mt-1">
                        {getFilePath() || "No subject"}
                    </h4>
                    <p className="text-gray-700 dark:text-gray-400 mt-1">
                        {file.filename}
                    </p>
                    {file.metadata?.tags && file.metadata.tags.length > 0 && (
                        <div className="mt-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Tags: </span>
                            {file.metadata.tags.map((tag: any) => (
                                <span key={tag.id} className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded mr-2">
                                {tag.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    onClick={handleFileClick}
                    className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg font-bold text-black dark:text-white transition-colors duration-300"
                >
                    View File
                </button>
            </div>
            {selectedFile && (
                <FileView file={selectedFile} onClose={handleCloseFileView} />
            )}
        </>
    );
};
  
  export default SearchFileItem;