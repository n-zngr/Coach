interface CloseButtonProps {
    onClick: () => void;
}

const CloseButton: React.FC<CloseButtonProps> = ({ onClick }) => {

    return (
        <button
            className="
                w-8 h-8
                flex justify-center items-center
                bg-transparent hover:bg-black-100 dark:hover:bg-white-900
                rounded-full
                text-black-100 dark:text-white-900 hover:text-white-900 hover:dark:text-black-100
                active:scale-95 transition-all duration-300"
            onClick={onClick}
        >
            <svg width="10" height="10" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 1L1 17M1 1L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </button>
    )
}

export default CloseButton;