"use client";

import { Tag } from "../FileView";

interface TagDropdownProps {
    filteredTags: Tag[];
    onSelect: (tag: Tag) => void;
}

const TagDropdown: React.FC<TagDropdownProps> = ({ filteredTags, onSelect }) => {
    if (!filteredTags.length) return null;

    return (
        <ul className="absolute min-w-full max-h-40
            bg-white-900 dark:bg-black-100
            border border-white-500 dark:border-black-500
            text-black-100 dark:text-white-900 hover:text-black-100 hover:dark:text-white-900
            z-10 mt-2 rounded-xl
            overflow-y-auto transition-all duration-300">
            {filteredTags.map((tag) => (
                <li
                    key={tag._id || tag.id}
                    onMouseDown={() => onSelect(tag)}
                    className="px-4 py-2 hover:bg-white-700 dark:hover:bg-black-300 cursor-pointer transition-colors duration-300"
                >
                    {tag.name}
                </li>
            ))}
        </ul>
    );
}

export default TagDropdown;