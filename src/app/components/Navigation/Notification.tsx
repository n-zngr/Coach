import { useState, useEffect } from 'react';
interface NotificationProps {
    notificationTitle?: string;
    notificationDescription?: string;
    isVisible: boolean;
    onDismiss: () => void;
}

const Notification: React.FC<NotificationProps> = ({ notificationTitle, notificationDescription, isVisible, onDismiss }) => {
    const [show, setShow] = useState(isVisible);
    const [animate, setAnimate] = useState(false);
  
    useEffect(() => {
        if (isVisible) {
            setShow(true);
            setAnimate(true);
            const timer = setTimeout(() => {
                setAnimate(false);
                setTimeout(() => {
                    setShow(false);
                    onDismiss();
                }, 300);
            }, 5 * 1000);
        
            console.log("Notifciation:", isVisible);
  
            return () => clearTimeout(timer);
        }
    }, [isVisible, onDismiss]);
  
    if (!show) return null;

    return (
        <div
            className={`relative bg-green-200 border border-green-400 text-green-700 px-4 py-3 rounded transition-transform duration-300 ease-in-out ${
                animate ? "transform translate-x-0" : "transform -translate-x-full"
            }`}
        >
            <strong className="font-bold">{notificationTitle}</strong>
            <span className="block sm:inline">{notificationDescription}</span>
        </div>
    );
};
    
export default Notification;