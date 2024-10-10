import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CircleArrowLeft01Icon, CircleArrowRight01Icon } from '@hugeicons/react';

interface HighlightItem {
  link: string;
  backgroundImage: string;
  buttonText: string;
}

const highlightItems: HighlightItem[] = [
  {
    link: "/dashboard/primary-market",
    backgroundImage: "/assets/dashboard/highlight1.jpg",
    buttonText: "Explore"
  },
  {
    link: "/dashboard/secondary-market",
    backgroundImage: "/assets/dashboard/highlight2.jpg",
    buttonText: "Trade Now"
  },
  {
    link: "/dashboard/portfolio",
    backgroundImage: "/assets/dashboard/highlight3.jpg",
    buttonText: "View Portfolio"
  }
];

const Highlights: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const highlightsRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef(Date.now());
  const scrollThreshold = 20;

  const changeSlide = useCallback((direction: 'left' | 'right') => {
    const now = Date.now();
    if (now - lastScrollTime.current > 700) {
      lastScrollTime.current = now;
      setCurrentIndex(prevIndex => {
        if (direction === 'right') {
          return (prevIndex + 1) % highlightItems.length;
        } else {
          return (prevIndex - 1 + highlightItems.length) % highlightItems.length;
        }
      });
    }
  }, []);

  const handleScroll = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaX;

    if (Math.abs(delta) >= scrollThreshold) {
      if (delta > 0) {
        changeSlide('right');
      } else if (delta < 0) {
        changeSlide('left');
      }
    }
  }, [changeSlide]);

  useEffect(() => {
    const highlightsElement = highlightsRef.current;
    if (highlightsElement) {
      highlightsElement.addEventListener('wheel', handleScroll, { passive: false });
      return () => {
        highlightsElement.removeEventListener('wheel', handleScroll);
      };
    }
  }, [handleScroll]);

  const currentItem = highlightItems[currentIndex];

  return (
    <div 
      ref={highlightsRef}
      className="bg-[#1C544E] rounded-[12px] w-full h-full relative overflow-hidden"
    >
      <div 
        className="h-full relative"
        style={{
          backgroundImage: `url(${currentItem.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(7,31,30,0.95)] via-[rgba(7,31,30,0.4)] to-transparent" />
        <div className="absolute inset-x-0 bottom-[5%] flex justify-center">
          <Link 
            to={currentItem.link}
            className="w-[40%] max-w-[199px] py-2 sm:py-3 px-3 sm:px-4 bg-[#F2FBF9] hover:bg-[#D2DBD9] transition-colors duration-300 rounded-[8px] flex items-center justify-center"
          >
            <span className="font-inter font-bold text-[10px] sm:text-[12px] md:text-[14px] text-[#071F1E] text-center whitespace-nowrap">
              {currentItem.buttonText}
            </span>
          </Link>
        </div>
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
          <button 
            onClick={() => changeSlide('left')}
            className="text-white opacity-60 hover:opacity-100 transition-opacity duration-300"
          >
            <CircleArrowLeft01Icon size={24} />
          </button>
        </div>
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
          <button 
            onClick={() => changeSlide('right')}
            className="text-white opacity-60 hover:opacity-100 transition-opacity duration-300"
          >
            <CircleArrowRight01Icon size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Highlights;