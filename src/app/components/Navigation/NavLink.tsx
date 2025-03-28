
interface NavLinkProps {
    href: string;
    icon: React.ReactElement;
    children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ href, icon, children }) => {
    return (
        <a href={href} className="
            flex mx-2 p-2 rounded-full
            hover:bg-black-100 dark:hover:bg-white-900
            transition-colors duration-300
            text-black-500 dark:text-white-500 hover:text-white-900 dark:hover:text-black-100
        ">
            <div className="flex gap-2">
                <div className="flex justify-center items-center pl-1">
                    {icon}
                </div>
                <div>
                    <p>{children}</p>
                </div>
            </div>
        </a>
    )
}

export default NavLink;