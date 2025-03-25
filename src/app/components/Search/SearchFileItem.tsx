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
            path += file.metadata.semesterName + " / ";
        }
        if (file.metadata?.subjectName) {
            path += file.metadata.subjectName + " / ";
        }
        if (file.metadata?.topicName) {
            path += file.metadata.topicName;
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
        <div>
            <div className='
                w-full flex
                bg-transparent hover:white-800 hover:dark:bg-black-200
                border border-white-500 dark:border-white-500 rounded-xl
                gap-4 p-4
                text-black-100 dark:text-white-900
                transition-colors duration-300 cursor-pointer'
            onClick={handleFileClick}>
                <div className='flex justify-center items-center'>
                    <div className="
                        min-w-12 min-h-12
                        flex justify-center items-center
                        bg-white-800 dark:bg-black-200
                        border border-black-900 dark:border-white-900 rounded-md
                        text-black-500 dark:text-white-500 
                        p-2">
                        <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.63636 1H2.27273C1.93518 1 1.61146 1.12967 1.37277 1.36048C1.13409 1.5913 1 1.90435 1 2.23077V15.7692C1 16.0957 1.13409 16.4087 1.37277 16.6395C1.61146 16.8703 1.93518 17 2.27273 17H13.7273C14.0648 17 14.3885 16.8703 14.6272 16.6395C14.8659 16.4087 15 16.0957 15 15.7692V7.15385M8.63636 1L15 7.15385M8.63636 1V7.15385H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
                <div className="flex flex-col justify-center">
                    <h4 className="text-left text-lg text-medium text-black-100 dark:text-white-900">
                        {file.filename}
                    </h4>
                    <p className="text-left text-black-900 dark:text-white-100 text-nowrap">
                        {getFilePath() || "No subject"}
                    </p>
                </div>
                
                {/* Tags Section */}
                {file.metadata?.tags && file.metadata.tags.length > 0 && (
                    <div className="
                    flex flex-wrap gap-2
                    font-light text-black-500 dark:text-white-500 border-black-100 dark:border-white-900
                    ">
                        {file.metadata.tags.map((tag: any) => (
                            <div
                                key={tag._id || tag.id}
                                className='h-fit w-fit
                                flex items-center bg-none
                                border hover:bg-black-100 hover:dark:bg-white-900 rounded-full
                                px-3 py-1
                                hover:text-white-900 hover:dark:text-black-100
                                transition-colors duration-300 cursor-pointer'
                            >
                                <div className='flex justify-center items-center gap-2'>
                                    <svg width="16" height="16" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1.6172 7.04857L4.95149 10.3829C5.07203 10.5032 5.23542 10.5709 5.40578 10.5709C5.57613 10.5709 5.73953 10.5032 5.86006 10.3829L10.6623 5.86717C10.8609 5.67839 10.9733 5.41639 10.9733 5.1424V2.02673C10.9733 1.47445 10.5256 1.02673 9.97333 1.02673L6.85777 1.02673C6.58377 1.02673 6.32177 1.13916 6.13299 1.33774L1.6172 6.14C1.49682 6.26053 1.4292 6.42393 1.4292 6.59428C1.4292 6.76464 1.49682 6.92803 1.6172 7.04857Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M7.75 3.625C7.75 3.97018 8.02982 4.25 8.375 4.25C8.72018 4.25 9 3.97018 9 3.625C9 3.27982 8.72018 3 8.375 3C8.02982 3 7.75 3.27982 7.75 3.625Z" fill="currentColor" />
                                    </svg>
                                    <span>{tag.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className='
                    flex items-center ml-auto
                '>
                    <p className='flex items-center justify-center
                        bg-black-100 dark:bg-white-900 hover:bg-transparent hover:dark:bg-transparent 
                        border hover:border-black-800 hover:dark:border-white-800 rounded-full
                        px-4 py-2 font-light text-white-900 dark:text-black-100 text-nowrap
                        hover:text-black-100 hover:dark:text-white-900
                        transition-colors duration-300'
                    >
                        View File
                    </p>
                </div>
            </div>
            {selectedFile && (
                <FileView file={selectedFile} onClose={handleCloseFileView} />
            )}
        </div>
    );
};
  
  export default SearchFileItem;