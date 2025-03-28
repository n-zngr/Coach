"use client";

import { useState } from 'react';
import LinkView from '../LinkView';

interface LinkItemProps {
    link: any;
}
  
const SearchLinkItem: React.FC<LinkItemProps> = ({ link }) => {
    const [selectedLink, setSelectedLink] = useState(null);
    
    const getLinkPath = () => {
        let path = "";
        if (link.semesterName) {
            path += link.semesterName + " / ";
        }
        if (link.subjectName) {
            path += link.subjectName + " / ";
        }
        if (link.topicName) {
            path += link.topicName;
        }
        return path;
    };

    
    const getUrl = () => {
        return link.url || "No URL";
    };
    
    /*const handleLinkClick = () => {
        setSelectedLink(link); // Used in future implementation of LinkView.
    }*/

    const handleCloseLinkView = () => { // Used in future implementation of LinkView.
        setSelectedLink(null);
    }
    
    
    return ( 
        <div>
            <div className='w-full flex
                bg-transparent hover:white-800 hover:dark:bg-black-200
                border border-white-500 dark:border-white-500 rounded-xl
                gap-4 p-4
                text-black-100 dark:text-white-900
                transition-colors duration-300 cursor-pointer'
            > { /* onClick={handleLinkClick} added when LinkView is implemented */}
                <div className='flex justify-center items-center'>
                    <div className="min-w-12 min-h-12
                        flex justify-center items-center
                        bg-white-800 dark:bg-black-200
                        border border-black-900 dark:border-white-900 rounded-md
                        text-black-500 dark:text-white-500 
                        p-2"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M7.74285 2.60014C7.59145 2.76261 7.50902 2.97752 7.51294 3.19957C7.51686 3.42162 7.60681 3.63348 7.76385 3.79053C7.92089 3.94756 8.13275 4.03752 8.3548 4.04144C8.57685 4.04536 8.79176 3.96294 8.95425 3.81153L10.3828 2.383C10.5951 2.17064 10.8472 2.00218 11.1247 1.88725C11.4022 1.77232 11.6995 1.71317 11.9999 1.71317C12.3002 1.71317 12.5976 1.77232 12.8751 1.88725C13.1525 2.00218 13.4046 2.17064 13.617 2.383C13.8293 2.59536 13.9978 2.84747 14.1127 3.12492C14.2276 3.40239 14.2868 3.69978 14.2868 4.0001C14.2868 4.30042 14.2276 4.5978 14.1127 4.87526C13.9978 5.15272 13.8293 5.40483 13.617 5.6172L10.7599 8.47426C10.5476 8.68677 10.2956 8.85536 10.0181 8.97037C9.7406 9.0854 9.44318 9.14461 9.14282 9.14461C8.84244 9.14461 8.54502 9.0854 8.26754 8.97037C7.99007 8.85536 7.73799 8.68677 7.52572 8.47426C7.36323 8.32286 7.14832 8.24043 6.92627 8.24435C6.70422 8.24827 6.49236 8.33822 6.33532 8.49526C6.17828 8.6523 6.08833 8.86416 6.08441 9.08621C6.08049 9.30826 6.16292 9.52317 6.31432 9.68566C6.68575 10.0571 7.12671 10.3518 7.61202 10.5528C8.09734 10.7539 8.6175 10.8573 9.14282 10.8573C9.66812 10.8573 10.1883 10.7539 10.6736 10.5528C11.1589 10.3518 11.5999 10.0571 11.9713 9.68566L14.8284 6.82859C15.5785 6.07842 16 5.06098 16 4.0001C16 2.9392 15.5785 1.92177 14.8284 1.17161C14.0782 0.421432 13.0608 0 11.9999 0C10.939 0 9.92155 0.421432 9.17138 1.17161L7.74285 2.60014ZM2.383 13.617C2.17048 13.4046 2.00189 13.1526 1.88688 12.8752C1.77185 12.5977 1.71264 12.3002 1.71264 11.9999C1.71264 11.6995 1.77185 11.4021 1.88688 11.1246C2.00189 10.8471 2.17048 10.595 2.383 10.3828L5.24007 7.52572C5.45233 7.3132 5.70442 7.14461 5.98189 7.02959C6.25936 6.91457 6.55678 6.85536 6.85716 6.85536C7.15753 6.85536 7.45495 6.91457 7.73243 7.02959C8.0099 7.14461 8.26198 7.3132 8.47426 7.52572C8.63674 7.67712 8.85165 7.75954 9.0737 7.75562C9.29575 7.7517 9.50761 7.66175 9.66465 7.50471C9.82169 7.34767 9.91164 7.13581 9.91556 6.91376C9.91948 6.69171 9.83706 6.4768 9.68566 6.31432C9.31423 5.94285 8.87326 5.64818 8.38795 5.44715C7.90263 5.24611 7.38246 5.14263 6.85716 5.14263C6.33185 5.14263 5.81168 5.24611 5.32637 5.44715C4.84106 5.64818 4.4001 5.94285 4.02867 6.31432L1.17161 9.17138C0.421432 9.92155 0 10.939 0 11.9999C0 13.0608 0.421432 14.0782 1.17161 14.8284C1.92177 15.5785 2.9392 16 4.0001 16C5.06098 16 6.07842 15.5785 6.82859 14.8284L8.25713 13.3998C8.40853 13.2373 8.49095 13.0225 8.48703 12.8004C8.48311 12.5784 8.39316 12.3665 8.23612 12.2095C8.07907 12.0525 7.86722 11.9624 7.64517 11.9585C7.42311 11.9546 7.20821 12.037 7.04573 12.1884L5.6172 13.617C5.40492 13.8294 5.15283 13.9981 4.87537 14.1131C4.59789 14.2282 4.30047 14.2874 4.0001 14.2874C3.69972 14.2874 3.4023 14.2282 3.12482 14.1131C2.84735 13.9981 2.59527 13.8294 2.383 13.617Z" fill="currentColor"/>
                        </svg>
                    </div>
                </div>
                <div className="flex flex-col justify-center">
                    <h4 className="text-left text-lg text-medium text-black-100 dark:text-white-900">
                        {link.name}
                    </h4>
                    <p className="text-left text-black-900 dark:text-white-100 text-nowrap">
                        {getLinkPath()}
                    </p>
                    <p className="text-left text-black-900 dark:text-white-100 text-nowrap">
                        {getUrl()}
                    </p>
                </div>

                {link.metadata?.tags && link.metadata.tags.length > 0 && (
                    <div className="
                        flex flex-wrap gap-2
                        font-light text-black-500 dark:text-white-500 border-black-100 dark:border-white-900
                    ">
                        {link.metadata.tags.map((tag: any) => (
                            <div
                                key={tag._id || tag.id}
                                className='
                                h-fit w-fit
                                flex items-center bg-none
                                border hover:bg-black-100 hover:dark:bg-white-900 rounded-full
                                px-3 py-1
                                hover:text-white-900 hover:dark:text-black-100
                                transition-colors duration-300 cursor-pointer
                                '
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
            </div>
            {selectedLink && (
                <LinkView file={selectedLink} onClose={handleCloseLinkView} />
            )}
        </div>
    )
}
export default SearchLinkItem;