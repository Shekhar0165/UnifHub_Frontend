// hooks/useIntersectionObserver.js
import { useEffect, useRef, useState } from 'react';

export const useIntersectionObserver = (options = { threshold: 0.4 }) => {
    const elementRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            });
        }, options);

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            if (elementRef.current) {
                observer.disconnect();
            }
        };
    }, [options]);

    return { elementRef, isVisible };
};