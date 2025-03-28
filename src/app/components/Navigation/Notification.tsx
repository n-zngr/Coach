import { useState } from 'react';
interface NotificationProps {
    notificationTitle?: string;
    notificationDescription?: string;
}

const Notification: React.FC<NotificationProps> = () => {
    const [animate, ] = useState(false); // add setAnimate when implementing

    return (
        <div
            className={`relative bg-green-200 border border-green-400 text-green-700 px-4 py-3 rounded transition-transform duration-300 ease-in-out ${
                animate ? "transform translate-x-0" : "transform -translate-x-full"
            }`}
        >
            <strong className="font-bold"></strong>
            <span className="block sm:inline"></span>
        </div>
    );
};
    
export default Notification;