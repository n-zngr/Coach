import NavLink from "./NavLink";

interface AccountInfo {
    isExpanded: boolean;
}

const AccountInfo: React.FC = (isExpanded) => {
    return (
        <div>
            {isExpanded && ( 
                <div className="">
                    <NavLink
                        href="/account" 
                        icon={
                            <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.5 9C10.6783 9 12.4442 7.20914 12.4442 5C12.4442 2.79086 10.6783 1 8.5 1C6.32169 1 4.55583 2.79086 4.55583 5C4.55583 7.20914 6.32169 9 8.5 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M14.635 17C15.311 17 15.7901 16.3404 15.4804 15.7395C14.9226 14.657 14.1244 13.713 13.1417 12.986C11.7938 11.9888 10.1685 11.4515 8.5 11.4515C6.83155 11.4515 5.2062 11.9888 3.85827 12.986C2.87562 13.713 2.07742 14.657 1.51958 15.7395C1.20989 16.3404 1.68896 17 2.36501 17H14.635Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        }
                    >
                        Account
                    </NavLink>
                </div>
            )}
        </div>
        
    )
}

export default AccountInfo;