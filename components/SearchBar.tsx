import React, { useState, useRef, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { TrashIcon } from './icons/TrashIcon';
import { DocumentIcon } from './icons/DocumentIcon';

interface SearchBarProps {
    onSearch: (query: string, files: File[]) => void;
    isLoading: boolean;
}

const MAX_TOTAL_SIZE_MB = 20;
const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];
const ALLOWED_FILE_EXTENSIONS = ".pdf,.docx";

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
    const [query, setQuery] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const totalSize = files.reduce((acc, file) => acc + file.size, 0);

    const handleFileChange = (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;
        
        setError(null);
        const newFiles = [...files];
        let currentSize = totalSize;

        for (const file of Array.from(selectedFiles)) {
            if (!newFiles.some(f => f.name === file.name && f.size === file.size)) {
                if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                    setError(`Invalid file type: ${file.name}. Only PDF and DOCX are allowed.`);
                    continue;
                }

                if (currentSize + file.size > MAX_TOTAL_SIZE_BYTES) {
                    setError(`Total file size cannot exceed ${MAX_TOTAL_SIZE_MB}MB.`);
                    break; 
                }
                newFiles.push(file);
                currentSize += file.size;
            }
        }
        setFiles(newFiles);
    };

    const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); }, []);
    const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); }, []);
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files) {
            handleFileChange(e.dataTransfer.files);
        }
    }, [files, totalSize]);

    const removeFile = (indexToRemove: number) => {
        setFiles(files.filter((_, index) => index !== indexToRemove));
        setError(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        onSearch(query, files);
    };

    return (
        <div className="bg-base-200 p-6 sm:p-8 rounded-2xl border border-base-300 w-full max-w-3xl mx-auto shadow-lg animate-fade-in">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div>
                    <label htmlFor="startup-name" className="block text-sm font-medium text-text-secondary mb-2">
                        Enter Startup Name or Website <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="startup-name"
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., 'Kredily' or 'www.kredily.com'"
                        className="w-full px-4 py-3 bg-base-300 border border-transparent rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all text-text-primary"
                        disabled={isLoading}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Upload Startup Documents - coming soon</label>
                    <div
                        className={`relative block w-full border-2 border-dashed rounded-lg p-8 text-center transition-colors border-base-300 opacity-50 cursor-not-allowed`}
                        role="button"
                        aria-label="File upload area - coming soon"
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => {
                                handleFileChange(e.target.files);
                                e.target.value = ''; // Allow re-selecting the same file
                            }}
                            className="hidden"
                            accept={ALLOWED_FILE_EXTENSIONS}
                            multiple
                            disabled
                        />
                        <div className="flex flex-col items-center">
                            <UploadIcon className="mx-auto h-10 w-10 text-gray-400" />
                            <span className="mt-2 block text-sm font-semibold text-sky-500">
                                Click to upload <span className="text-text-secondary font-normal">or drag and drop</span>
                            </span>
                            <p className="text-xs text-gray-500 mt-1">PDF or DOCX (Max 20MB total)</p>
                        </div>
                    </div>
                </div>
                
                {error && <p className="text-red-400 text-sm animate-fade-in -mt-2">{error}</p>}

                {files.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-text-secondary">
                            Selected files: ({(totalSize / 1024 / 1024).toFixed(2)}MB)
                        </h3>
                        <ul className="space-y-2">
                            {files.map((file, index) => (
                                <li key={`${file.name}-${file.lastModified}`} className="flex items-center justify-between bg-base-300 p-2 pl-3 rounded-lg text-sm animate-fade-in">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <DocumentIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                        <span className="truncate text-text-primary">{file.name}</span>
                                    </div>
                                    <button 
                                      type="button" 
                                      onClick={() => removeFile(index)} 
                                      disabled={isLoading} 
                                      className="text-gray-500 hover:text-red-400 p-1 flex-shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
                                      aria-label={`Remove ${file.name}`}
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                <button
                    type="submit"
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-200 focus:ring-sky-500"
                    disabled={isLoading || !query.trim()}
                >
                    {isLoading ? 'Analyzing...' : 'Analyze Startup'}
                </button>
            </form>
        </div>
    );
};

export default SearchBar;