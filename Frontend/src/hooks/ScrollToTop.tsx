import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            setVisible(window.scrollY > 300);
        };

        window.addEventListener("scroll", toggleVisibility);

        return () =>
            window.removeEventListener(
                "scroll",
                toggleVisibility
            );
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <button
            onClick={scrollToTop}
            className={`
        fixed
        bottom-6
        right-6
        z-50
        flex
        h-12
        w-12
        items-center
        justify-center
        rounded-full
        bg-[#D97757]
        text-white
        shadow-lg
        transition-all
        duration-300
        hover:scale-110
        hover:shadow-xl
        ${visible
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-10 opacity-0"
                }
      `}
            aria-label="Scroll to top"
        >
            <ChevronUp className="h-5 w-5" />
        </button>
    );
}