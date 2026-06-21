import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTopOnRouteChange() {
    const { hash, pathname } = useLocation();

    useEffect(() => {
        if (hash) {
            const element = document.querySelector(hash);

            if (element) {
                window.setTimeout(() => {
                    element.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                }, 80);
                return;
            }
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }, [hash, pathname]);

    return null;
}
