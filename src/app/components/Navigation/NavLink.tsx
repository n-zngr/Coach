
interface NavLinkProps {
    href: string;
    icon: React.ReactElement;
    children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ href, icon, children }) => {
    return (
        <a href={href} className="flex mx-2 p-2 rounded-full hover:bg-white-600 dark:hover:bg-black-400 transition-colors duartion-500">
            <div className="flex gap-2">
                <div className="flex justify-center items-center pl-1">
                    {icon}
                </div>
                <div className="font-metropolis font-medium text-black-900 dark:text-white-100">
                    <p>{children}</p>
                </div>
            </div>
        </a>
    )
}

export default NavLink;