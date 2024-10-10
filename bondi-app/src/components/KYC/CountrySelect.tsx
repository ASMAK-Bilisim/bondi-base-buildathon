import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CountrySelectProps {
  onSelect: (country: string) => void;
}

const CountrySelect: React.FC<CountrySelectProps> = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isKeyboardNav, setIsKeyboardNav] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<(HTMLDivElement | null)[]>([]);

  const restrictedCountries = [
    "Afghanistan", "Albania", "Belarus", "Bulgaria", "Bosnia and Herzegovina", 
    "Central African Republic", "Croatia", "Congo", "Cuba", "Ethiopia", "Greece", 
    "Hong Kong", "Iran", "Iraq", "Ivory Coast", "Lebanon", "Libya", "Mali", 
    "Burma", "Myanmar", "Nicaragua", "North Korea", "Russia", "Serbia", "Slovenia", 
    "Somalia", "Somaliland", "South Ossetia", "South Sudan", "Sudan", "Syria", 
    "United States", "Venezuela", "Yemen", "Zimbabwe"
  ];

  const countries = [
    "Andorra", "Argentina", "Australia", "Austria", "Belgium", "Brazil", "Canada", 
    "Chile", "China", "Colombia", "Czech Republic", "Denmark", "Egypt", "Estonia", 
    "Finland", "France", "Germany", "Hungary", "Iceland", "India", "Indonesia", 
    "Ireland", "Israel", "Italy", "Japan", "Kazakhstan", "Latvia", "Liechtenstein", 
    "Lithuania", "Luxembourg", "Malaysia", "Malta", "Mexico", "Monaco", "Netherlands", 
    "New Zealand", "Norway", "Peru", "Philippines", "Poland", "Portugal", "Romania", 
    "San Marino", "Saudi Arabia", "Singapore", "Slovakia", "South Africa", "South Korea", 
    "Spain", "Sweden", "Switzerland", "Thailand", "Turkey", "Ukraine", "United Arab Emirates", 
    "United Kingdom", "Vatican City", "Vietnam"
  ].filter(country => !restrictedCountries.includes(country)).sort();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setHighlightedIndex(-1);
      setIsKeyboardNav(false);
    }
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
        setIsOpen(true);
        setHighlightedIndex(0);
        setIsKeyboardNav(true);
      }
    } else {
      switch (event.key) {
        case "ArrowUp":
          setHighlightedIndex((prevIndex) => {
            const newIndex = prevIndex > 0 ? prevIndex - 1 : countries.length - 1;
            scrollToOption(newIndex);
            return newIndex;
          });
          setIsKeyboardNav(true);
          break;
        case "ArrowDown":
          setHighlightedIndex((prevIndex) => {
            const newIndex = prevIndex < countries.length - 1 ? prevIndex + 1 : 0;
            scrollToOption(newIndex);
            return newIndex;
          });
          setIsKeyboardNav(true);
          break;
        case "Enter":
          if (highlightedIndex !== -1) {
            setSelectedCountry(countries[highlightedIndex]);
            onSelect(countries[highlightedIndex]);
            setIsOpen(false);
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
      }
    }
  };

  const scrollToOption = (index: number) => {
    if (optionsRef.current[index]) {
      optionsRef.current[index]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  };

  const handleMouseEnter = (index: number) => {
    if (!isKeyboardNav) {
      setHighlightedIndex(index);
    }
  };

  const handleMouseMove = () => {
    setIsKeyboardNav(false);
  };

  return (
    <div className="flex flex-col flex-1 grow shrink-0 basis-0 w-fit relative" ref={dropdownRef}>
      <label
        htmlFor="country"
        className="self-start text-sm font-bold leading-6 text-[#1C544E]"
      >
        Your Country
      </label>
      <div 
        ref={selectRef}
        className="flex gap-10 items-center pr-3 pl-4 mt-3.5 text-xs font-medium leading-7 rounded-md border-teal-900 border-solid border-[0.5px] min-h-[40px] cursor-pointer text-[#1C544E] bg-[#F2FBF9]"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="country-listbox"
      >
        <div className="flex-grow">
          {selectedCountry || "Select country"}
        </div>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/8ff608bbc4590944dba82d4086e80733191bfcee1467eac8dda9797d54756753?placeholderIfAbsent=true&apiKey=a06ef9eb8abe48b8ac6053587476251b"
          alt=""
          className="object-contain shrink-0 self-stretch my-auto aspect-square w-[18px]"
        />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 w-full bg-white border border-teal-900 rounded-md shadow-lg max-h-60 overflow-y-auto"
            style={{
              top: selectRef.current ? `${selectRef.current.offsetHeight}px` : '100%'
            }}
            role="listbox"
            id="country-listbox"
            onMouseMove={handleMouseMove}
          >
            {countries.map((country, index) => (
              <div
                key={country}
                ref={(el) => optionsRef.current[index] = el}
                className={`px-4 py-3 cursor-pointer text-[#1C544E] text-sm ${
                  index === highlightedIndex ? 'bg-[#D4E7E2]' : 'hover:bg-[#D4E7E2]'
                }`}
                onClick={() => {
                  setSelectedCountry(country);
                  onSelect(country);
                  setIsOpen(false);
                }}
                onMouseEnter={() => handleMouseEnter(index)}
                role="option"
                aria-selected={index === highlightedIndex}
              >
                {country}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CountrySelect;
