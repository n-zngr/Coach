import NavLink from "./NavLink";

interface NavListProps {
    isExpanded: boolean;
}

const NavList: React.FC<NavListProps> = (isExpanded) => {
    return (
        <div>
            {isExpanded && (
                <div>
                    <NavLink 
                        href="/documents" 
                        icon={
                            <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.63636 1H2.27273C1.93518 1 1.61146 1.12967 1.37277 1.36048C1.13409 1.5913 1 1.90435 1 2.23077V15.7692C1 16.0957 1.13409 16.4087 1.37277 16.6395C1.61146 16.8703 1.93518 17 2.27273 17H13.7273C14.0648 17 14.3885 16.8703 14.6272 16.6395C14.8659 16.4087 15 16.0957 15 15.7692V7.15385M8.63636 1L15 7.15385M8.63636 1V7.15385H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        }
                    >
                        Documents
                    </NavLink>
                </div>
            )}
        </div>
    )
}

export default NavList;