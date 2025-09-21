
import React, { useState, useCallback, useEffect } from 'react';
import { CompanyEvaluation } from './types';
import { evaluateCompany, extractInfoFromFiles } from './services/geminiService';
import SearchBar from './components/SearchBar';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';
import { LogoIcon } from './components/icons/LogoIcon';

const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64String = (reader.result as string)?.split(',')[1];
            if (base64String) {
                resolve(base64String);
            } else {
                reject(new Error("Failed to read file as base64 string."));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [evaluation, setEvaluation] = useState<CompanyEvaluation | null>(null);
    const [currentQuery, setCurrentQuery] = useState<string>('');
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [loadingMessage, setLoadingMessage] = useState<string>('');

    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem('unicornFinderHistory');
            if (storedHistory) {
                setSearchHistory(JSON.parse(storedHistory));
            }
        } catch (err) {
            console.error("Failed to parse search history from localStorage", err);
            setSearchHistory([]);
        }
    }, []);

    const handleSearch = useCallback(async (query: string, files: File[]) => {
        if (!query.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setEvaluation(null);
        setCurrentQuery(query);
        setLoadingMessage(`Preparing analysis for ${query}...`);

        try {
            let extractedText: string | null = null;
            if (files.length > 0) {
                setLoadingMessage('Extracting key info from your documents...');
                let filesData: { mimeType: string; data: string }[] = [];
                try {
                     filesData = await Promise.all(
                        files.map(async (file) => {
                            const base64Data = await readFileAsBase64(file);
                            return {
                                mimeType: file.type,
                                data: base64Data,
                            };
                        })
                    );
                } catch (readError) {
                    console.error("Error reading files:", readError);
                    setError("Could not read one or more of the uploaded files. Please try again.");
                    setIsLoading(false);
                    return;
                }
                
                extractedText = await extractInfoFromFiles(filesData);
            }

            setLoadingMessage(`Performing AI analysis for ${query}...`);
            const result = await evaluateCompany(query, extractedText);
            setEvaluation(result);
            
            const newHistory = [query, ...searchHistory.filter(item => item.toLowerCase() !== query.toLowerCase())].slice(0, 5);
            setSearchHistory(newHistory);
            localStorage.setItem('unicornFinderHistory', JSON.stringify(newHistory));
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to evaluate company. ${errorMessage} Please try again.`);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [isLoading, searchHistory]);

    return (
        <div className="min-h-screen bg-base-100 text-text-primary font-sans flex flex-col p-4 sm:p-6 lg:p-8">
            <header className="w-full max-w-4xl mx-auto text-center pt-6 pb-2">
                <div className="flex items-center justify-center gap-4">
                    <LogoIcon className="h-10 sm:h-12 w-10 sm:w-12 text-sky-400" />
                    <h1 className="text-3xl sm:text-5xl font-bold text-text-primary tracking-tight">Startup Analyzer</h1>
                </div>
                <p className="text-md sm:text-lg text-text-secondary mt-4 max-w-2xl mx-auto">
                    AI-powered, in-depth startup analysis for venture capitalists.
                </p>
            </header>

            <main className="w-full flex-grow flex flex-col items-center">
                 <div className="w-full max-w-3xl mx-auto mt-4">
                    <SearchBar onSearch={handleSearch} isLoading={isLoading} />
                </div>

                <div className="mt-8 w-full max-w-7xl mx-auto">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center gap-4 p-8">
                            <LoadingSpinner />
                            <p className="text-lg text-text-secondary animate-pulse">{loadingMessage}</p>
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-center animate-fade-in" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    {evaluation && !isLoading && (
                        <div className="animate-fade-in">
                            <Dashboard evaluation={evaluation} />
                        </div>
                    )}
                </div>
            </main>
             <footer className="w-full max-w-7xl mx-auto text-center mt-12 text-sm text-gray-500">
                <p>Powered by Google Gemini. For informational purposes only.</p>
            </footer>
        </div>
    );
};

export default App;
