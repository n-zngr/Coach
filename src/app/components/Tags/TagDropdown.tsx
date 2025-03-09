"use client";

import { Tag } from "../FileView";

interface TagDropdownProps {
    filteredTags: Tag[];
    onSelect: (tag: Tag) => void;
}

const TagDropdown: React.FC<TagDropdownProps> = ({ filteredTags, onSelect }) => {
    if (!filteredTags.length) return null;

    return (
        <ul className="absolute z-10 bg-white dark:bg-gray-800 border rounded-md mt-1 w-full max-h-40 overflow-y-auto">
            {filteredTags.map((tag) => (
                <li
                    key={tag._id || tag.id}
                    onMouseDown={() => onSelect(tag)}
                    className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                >
                    {tag.name}
                </li>
            ))}
        </ul>
    );
}

export default TagDropdown;