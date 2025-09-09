import React, { useState, useRef } from 'react';
import { SearchIcon } from './icons/SearchIcon';
import { UploadIcon } from './icons/UploadIcon';
import { XCircleIcon } from './icons/XCircleIcon';


interface SearchBarProps {
    onSearch: (query: string, file: File | null) => void;
    isLoading: boolean;
    recentSearches: string[];
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
];
const ALLOWED_FILE_EXTENSIONS = ".pdf, .txt, .doc, .docx, .pptx";


const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, recentSearches }) => {
    const [query, setQuery] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query, selectedFile);
    };

    const handleRecentClick = (company: string) => {
        setQuery(company);
        onSearch(company, selectedFile);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (event.target) {
            event.target.value = ''; // Allow re-selecting the same file
        }
        if (!file) return;

        setFileError(null);

        if (file.size > MAX_FILE_SIZE_BYTES) {
            setFileError(`File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
            setSelectedFile(null);
            return;
        }

        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            // Fix: Replace `replaceAll` with `replace` and a global regex for broader compatibility.
            setFileError(`Invalid file type. Please upload one of: ${ALLOWED_FILE_EXTENSIONS.replace(/ /g, '')}.`);
            setSelectedFile(null);
            return;
        }

        setSelectedFile(file);
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const clearFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex gap-2">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Enter a startup name or website URL..."
                            className="w-full pl-10 pr-4 py-3 bg-base-200 border border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        disabled={isLoading || !query.trim()}
                    >
                        Evaluate
                    </button>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        Add additional documents - pitch decks, reports, documents (max 10MB)
                    </label>
                    <div className="flex items-center gap-2">
                         <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept={ALLOWED_FILE_EXTENSIONS}
                            disabled={isLoading}
                        />
                        {!selectedFile ? (
                            <button
                                type="button"
                                onClick={triggerFileSelect}
                                disabled={isLoading}
                                className="bg-base-300 hover:bg-base-300/80 text-text-primary font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                <UploadIcon className="w-5 h-5" />
                                <span>Upload</span>
                            </button>
                        ) : (
                             <div className="flex-grow flex items-center gap-2 bg-base-200 p-2 rounded-lg border border-base-300 min-w-0">
                               <span className="text-text-secondary truncate flex-grow pl-2">{selectedFile.name}</span>
                               <button onClick={clearFile} type="button" disabled={isLoading} className="text-gray-400 hover:text-white p-1 flex-shrink-0">
                                   <XCircleIcon className="w-5 h-5"/>
                               </button>
                            </div>
                        )}
                    </div>
                    {fileError && <p className="text-red-400 text-sm mt-2 animate-fade-in">{fileError}</p>}
                </div>

            </form>
            {recentSearches.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-sm">
                    <span className="text-text-secondary mr-2">Recent:</span>
                    {recentSearches.map((company) => (
                        <button
                            key={company}
                            onClick={() => handleRecentClick(company)}
                            disabled={isLoading}
                            className="bg-base-300/50 hover:bg-base-300 text-text-secondary px-3 py-1 rounded-full transition-colors disabled:opacity-50"
                        >
                            {company}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBar;