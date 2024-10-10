import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DocumentTypeSelectProps {
  onSelect: (documentType: string) => void;
}

const DocumentTypeSelect: React.FC<DocumentTypeSelectProps> = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isKeyboardNav, setIsKeyboardNav] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<(HTMLDivElement | null)[]>([]);

  const documentTypes = ["Driver's License", "Passport", "National ID"];

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
        event.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
        setIsKeyboardNav(true);
      }
    } else {
      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          setHighlightedIndex((prevIndex) => {
            const newIndex = prevIndex > 0 ? prevIndex - 1 : documentTypes.length - 1;
            scrollToOption(newIndex);
            return newIndex;
          });
          setIsKeyboardNav(true);
          break;
        case "ArrowDown":
          event.preventDefault();
          setHighlightedIndex((prevIndex) => {
            const newIndex = prevIndex < documentTypes.length - 1 ? prevIndex + 1 : 0;
            scrollToOption(newIndex);
            return newIndex;
          });
          setIsKeyboardNav(true);
          break;
        case "Enter":
          event.preventDefault();
          if (highlightedIndex !== -1) {
            setSelectedDocumentType(documentTypes[highlightedIndex]);
            onSelect(documentTypes[highlightedIndex]);
            setIsOpen(false);
          }
          break;
        case "Escape":
          event.preventDefault();
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
        htmlFor="documentType"
        className="self-start text-sm font-bold leading-6 text-[#1C544E]"
      >
        Document Type
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
        aria-controls="document-type-listbox"
      >
        <div className="flex-grow">
          {selectedDocumentType || "Select document type"}
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
            id="document-type-listbox"
            onMouseMove={handleMouseMove}
          >
            {documentTypes.map((docType, index) => (
              <div
                key={docType}
                ref={(el) => optionsRef.current[index] = el}
                className={`px-4 py-3 cursor-pointer text-[#1C544E] text-sm ${
                  index === highlightedIndex ? 'bg-[#D4E7E2]' : 'hover:bg-[#D4E7E2]'
                }`}
                onClick={() => {
                  setSelectedDocumentType(docType);
                  onSelect(docType);
                  setIsOpen(false);
                }}
                onMouseEnter={() => handleMouseEnter(index)}
                role="option"
                aria-selected={index === highlightedIndex}
              >
                {docType}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentTypeSelect;
