"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AppLink } from "../LinkView";
import { AppFile } from "../FileView";

interface DisplayFilesProps {
    onFileClick: (file: AppFile) => void;
    onLinkClick: (link: AppLink) => void;
}

const DisplayFiles: React.FC<DisplayFilesProps> = ({ onFileClick, onLinkClick }) => {
    const [files, setFiles] = useState<AppFile[]>([]);
    const [links, setLinks] = useState<AppLink[]>([]);
    const [loading, setLoading] = useState(true);
    
    const pathname = usePathname();
    const pathSegments = pathname.split("/").filter(Boolean);
    const semesterId = pathSegments[1] || null;
    const subjectId = pathSegments[2] || null;
    const topicId = pathSegments[3] || null;

    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [fileRes, linkRes] = await Promise.all([
                    fetch(`/api/documents/files`, {
                        method: "GET",
                        credentials: "include",
                        headers: {
                            semesterId: semesterId ?? "",
                            subjectId: subjectId ?? "",
                            topicId: topicId ?? "",
                        },
                    }),
                    fetch(`/api/documents/links`, {
                        method: "GET",
                        credentials: "include",
                        headers: {
                            semesterId: semesterId ?? "",
                            subjectId: subjectId ?? "",
                            topicId: topicId ?? "",
                        },
                    }),
                ]);
    
                if (!fileRes.ok) {
                    throw new Error("Failed to fetch files");
                } 
                
                if (!linkRes.ok) {
                    throw new Error("Failed to fetch links");
                }
    
                const fileData = await fileRes.json();
                const linkData = await linkRes.json();
    
                setFiles(fileData);
                setLinks(linkData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [semesterId, subjectId, topicId, onFileClick, onLinkClick]);

    return (
        <>
            { loading && (
                <div className="flex items-center justify-center h-full w-full">
                    <svg className="animate-spin h-10 w-10 text-gray-200" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8.00994,8.00994,0,0,1,12,20Z"/>
                        <path fill="currentColor" d="M12.5,3H11.5V12h1Z"/>
                    </svg>
                </div>
            )}
            { !loading && (
                <div>
                    <header className="border-b border-black-500 dark:border-white-500 mb-8">
                        <div className="flex justify-between">
                            <h1 className="font-base text-xl self-end pb-1">Documents & Links</h1>
                        </div>
                    </header>
                    <ul className="grid grid-cols-1 gap-4">
                        {files.map((file) => (
                            <button
                                key={file._id}
                                onClick={() => onFileClick(file)}
                                className="group flex items-center text-left
                                bg-transparent hover:bg-white-800 hover:dark:bg-black-200
                                border border-black-900 hover:border-black-100 dark:border-white-100 hover:dark:border-white-900 rounded-xl
                                p-4 gap-4
                                transition-colors duration-300"
                            >
                                <div className="w-12 h-12 flex justify-center items-center
                                bg-white-800 dark:bg-black-200
                                border border-black-900 dark:border-white-100 rounded-md">
                                    <svg width="16" height="19" viewBox="0 0 13 16" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M1.625 1.14286C1.48134 1.14286 1.34357 1.20306 1.24198 1.31022C1.1404 1.41739 1.08333 1.56273 1.08333 1.71429V14.2857C1.08333 14.4373 1.1404 14.5826 1.24198 14.6898C1.34357 14.7969 1.48134 14.8571 1.625 14.8571H11.375C11.5187 14.8571 11.6564 14.7969 11.758 14.6898C11.8596 14.5826 11.9167 14.4373 11.9167 14.2857V6.85714H7.04167C6.74251 6.85714 6.5 6.60131 6.5 6.28571V1.14286H1.625ZM7.58333 1.95098L11.1506 5.71429H7.58333V1.95098ZM0.475951 0.502103C0.780698 0.180612 1.19402 0 1.625 0H7.04167C7.18533 0 7.3231 0.0602039 7.42468 0.167368L12.8414 5.88165C12.9429 5.98882 13 6.13416 13 6.28571V14.2857C13 14.7404 12.8288 15.1764 12.524 15.4979C12.2193 15.8194 11.806 16 11.375 16H1.625C1.19402 16 0.780698 15.8194 0.475951 15.4979C0.171205 15.1764 0 14.7404 0 14.2857V1.71429C0 1.25963 0.171205 0.823594 0.475951 0.502103Z" fill="currentColor"/>
                                    </svg>
                                </div>
                                <span className="text-lg font-medium flex-1">{file.filename}</span>
                                <div className="flex items-center justify-center opacity-0 group-hover:opacity-100
                                    bg-black-100 dark:bg-white-900 hover:bg-transparent hover:dark:bg-transparent 
                                    border hover:border-black-100 hover:dark:border-white-900 rounded-full
                                    px-4 py-2 font-light text-white-900 dark:text-black-100 text-nowrap
                                    hover:text-black-100 hover:dark:text-white-900
                                    transition-all duration-300"
                                >
                                    View File
                                </div>
                            </button>
                        ))}

                        {links.map((link) => (
                            <button
                                key={link._id}
                                onClick={() => onLinkClick(link)}
                                className="group flex items-center
                                hover:bg-white-800 dark:hover:bg-black-200
                                text-left 
                                border rounded-lg
                                p-4 gap-4
                                transition-colors duration-300"
                            >
                                <div className="flex justify-center items-center
                                    w-12 h-12 bg-white-800 dark:bg-black-200
                                    border border-black-500 dark:border-white-500 rounded-md"
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M7.74285 2.60014C7.59145 2.76261 7.50902 2.97752 7.51294 3.19957C7.51686 3.42162 7.60681 3.63348 7.76385 3.79053C7.92089 3.94756 8.13275 4.03752 8.3548 4.04144C8.57685 4.04536 8.79176 3.96294 8.95425 3.81153L10.3828 2.383C10.5951 2.17064 10.8472 2.00218 11.1247 1.88725C11.4022 1.77232 11.6995 1.71317 11.9999 1.71317C12.3002 1.71317 12.5976 1.77232 12.8751 1.88725C13.1525 2.00218 13.4046 2.17064 13.617 2.383C13.8293 2.59536 13.9978 2.84747 14.1127 3.12492C14.2276 3.40239 14.2868 3.69978 14.2868 4.0001C14.2868 4.30042 14.2276 4.5978 14.1127 4.87526C13.9978 5.15272 13.8293 5.40483 13.617 5.6172L10.7599 8.47426C10.5476 8.68677 10.2956 8.85536 10.0181 8.97037C9.7406 9.0854 9.44318 9.14461 9.14282 9.14461C8.84244 9.14461 8.54502 9.0854 8.26754 8.97037C7.99007 8.85536 7.73799 8.68677 7.52572 8.47426C7.36323 8.32286 7.14832 8.24043 6.92627 8.24435C6.70422 8.24827 6.49236 8.33822 6.33532 8.49526C6.17828 8.6523 6.08833 8.86416 6.08441 9.08621C6.08049 9.30826 6.16292 9.52317 6.31432 9.68566C6.68575 10.0571 7.12671 10.3518 7.61202 10.5528C8.09734 10.7539 8.6175 10.8573 9.14282 10.8573C9.66812 10.8573 10.1883 10.7539 10.6736 10.5528C11.1589 10.3518 11.5999 10.0571 11.9713 9.68566L14.8284 6.82859C15.5785 6.07842 16 5.06098 16 4.0001C16 2.9392 15.5785 1.92177 14.8284 1.17161C14.0782 0.421432 13.0608 0 11.9999 0C10.939 0 9.92155 0.421432 9.17138 1.17161L7.74285 2.60014ZM2.383 13.617C2.17048 13.4046 2.00189 13.1526 1.88688 12.8752C1.77185 12.5977 1.71264 12.3002 1.71264 11.9999C1.71264 11.6995 1.77185 11.4021 1.88688 11.1246C2.00189 10.8471 2.17048 10.595 2.383 10.3828L5.24007 7.52572C5.45233 7.3132 5.70442 7.14461 5.98189 7.02959C6.25936 6.91457 6.55678 6.85536 6.85716 6.85536C7.15753 6.85536 7.45495 6.91457 7.73243 7.02959C8.0099 7.14461 8.26198 7.3132 8.47426 7.52572C8.63674 7.67712 8.85165 7.75954 9.0737 7.75562C9.29575 7.7517 9.50761 7.66175 9.66465 7.50471C9.82169 7.34767 9.91164 7.13581 9.91556 6.91376C9.91948 6.69171 9.83706 6.4768 9.68566 6.31432C9.31423 5.94285 8.87326 5.64818 8.38795 5.44715C7.90263 5.24611 7.38246 5.14263 6.85716 5.14263C6.33185 5.14263 5.81168 5.24611 5.32637 5.44715C4.84106 5.64818 4.4001 5.94285 4.02867 6.31432L1.17161 9.17138C0.421432 9.92155 0 10.939 0 11.9999C0 13.0608 0.421432 14.0782 1.17161 14.8284C1.92177 15.5785 2.9392 16 4.0001 16C5.06098 16 6.07842 15.5785 6.82859 14.8284L8.25713 13.3998C8.40853 13.2373 8.49095 13.0225 8.48703 12.8004C8.48311 12.5784 8.39316 12.3665 8.23612 12.2095C8.07907 12.0525 7.86722 11.9624 7.64517 11.9585C7.42311 11.9546 7.20821 12.037 7.04573 12.1884L5.6172 13.617C5.40492 13.8294 5.15283 13.9981 4.87537 14.1131C4.59789 14.2282 4.30047 14.2874 4.0001 14.2874C3.69972 14.2874 3.4023 14.2282 3.12482 14.1131C2.84735 13.9981 2.59527 13.8294 2.383 13.617Z" fill="currentColor"/>
                                    </svg>
                                </div>
                                <span className="text-lg font-medium flex-1">{link.name}</span>
                                <div className="flex items-center justify-center opacity-0 group-hover:opacity-100
                                    bg-black-100 dark:bg-white-900 hover:bg-transparent hover:dark:bg-transparent 
                                    border hover:border-black-800 hover:dark:border-white-800 rounded-full
                                    px-4 py-2 font-light text-white-900 dark:text-black-100 text-nowrap
                                    hover:text-black-100 hover:dark:text-white-900
                                    transition-all duration-300"
                                >
                                    View Link
                                </div>
                            </button>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
};

export default DisplayFiles;
