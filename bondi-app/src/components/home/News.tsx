import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface NewsItem {
  link: string;
  backgroundImage?: string;
  buttonText: string;
}

const newsItems: NewsItem[] = [
  {
    link: "/primary-market",
    backgroundImage: "/assets/dashboard/bondcertificate.jpg",
    buttonText: "Join now"
  },
  {
    link: "/dashboard",
    backgroundImage: "/assets/dashboard/platform-upgrade.jpg",
    buttonText: "Learn more"
  },
  {
    link: "/blog",
    backgroundImage: "/assets/dashboard/financial-times.jpg",
    buttonText: "Read article"
  }
];

const News: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const newsRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef(Date.now());
  const scrollThreshold = 20;

  const changeSlide = useCallback((direction: 'up' | 'down') => {
    const now = Date.now();
    if (now - lastScrollTime.current > 700) {
      lastScrollTime.current = now;
      setCurrentIndex(prevIndex => {
        if (direction === 'down') {
          return (prevIndex + 1) % newsItems.length;
        } else {
          return (prevIndex - 1 + newsItems.length) % newsItems.length;
        }
      });
    }
  }, []);

  const handleScroll = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY;

    if (Math.abs(delta) >= scrollThreshold) {
      if (delta > 0) {
        changeSlide('down');
      } else {
        changeSlide('up');
      }
    }
  }, [changeSlide]);

  useEffect(() => {
    const newsElement = newsRef.current;
    if (newsElement) {
      newsElement.addEventListener('wheel', handleScroll, { passive: false });
      return () => {
        newsElement.removeEventListener('wheel', handleScroll);
      };
    }
  }, [handleScroll]);

  const currentItem = newsItems[currentIndex];

  return (
    <div 
      ref={newsRef}
      className="bg-[#1C544E] rounded-[12px] w-full h-full relative overflow-hidden"
    >
      <div 
        className="h-full"
        style={{
          backgroundImage: currentItem.backgroundImage ? `linear-gradient(to right, rgba(7, 31, 30, 0.95) 0%, rgba(7, 31, 30, 0.4) 60%, rgba(7, 31, 30, 0) 100%), url(${currentItem.backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Link 
          to={currentItem.link}
          className="absolute left-[5%] bottom-[5%] w-[40%] max-w-[221px] h-[14%] min-h-[30px] max-h-[50px] 3xl:max-h-[60px] 4xl:max-h-[70px] bg-[#F49C4A] hover:bg-[#e08b39] transition-colors duration-300 rounded-[8px] flex items-center justify-center"
        >
          <span className="font-inter font-bold text-[10px] sm:text-[12px] md:text-[16px] 3xl:text-[18px] 4xl:text-[20px] leading-[24px] text-white text-center">
            {currentItem.buttonText}
          </span>
        </Link>
        <div className="flex flex-col items-center space-y-3 absolute top-1/2 right-4 transform -translate-y-1/2">
          {newsItems.map((_, index) => (
            <div 
              key={index}
              className={`w-3 h-3 3xl:w-4 3xl:h-4 4xl:w-5 4xl:h-5 rounded-full cursor-pointer ${index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-60'}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default News;