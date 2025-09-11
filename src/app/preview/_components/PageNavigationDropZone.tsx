import { ChevronLeft, ChevronRight } from "lucide-react";

interface PageNavigationDropZoneProps {
    side: 'left' | 'right';
    active: boolean;
    isHighlighted: boolean;
    targetPage: number;
}

export default function PageNavigationDropZone({ side, active, isHighlighted, targetPage }: PageNavigationDropZoneProps) {
    if (!active) return null;

    const isLeft = side === 'left';

    return (
        <div
            className={`absolute top-0 ${isLeft ? 'left-0' : 'right-0'} h-full w-16 z-50 flex items-center justify-center transition-all duration-200 ease-in-out ${isHighlighted
                ? 'bg-blue-500 bg-opacity-40 shadow-lg'
                : 'bg-blue-400 bg-opacity-25'
                }`}
            style={{
                clipPath: isLeft
                    ? 'polygon(0 0, 80% 20%, 80% 80%, 0 100%)'
                    : 'polygon(20% 20%, 100% 0, 100% 100%, 20% 80%)'
            }}
        >
            <div className={`flex flex-col items-center justify-center text-white text-xs font-bold ${isHighlighted ? 'scale-110' : ''
                } transition-transform duration-200 drop-shadow-md`}>
                {isLeft ? (
                    <>
                        <ChevronLeft size={20} />
                        <span>PAGE</span>
                        <span className="text-lg">{targetPage}</span>
                    </>
                ) : (
                    <>
                        <ChevronRight size={20} />
                        <span>PAGE</span>
                        <span className="text-lg">{targetPage}</span>
                    </>
                )}
            </div>
        </div>
    );
};