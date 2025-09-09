
import React, { useState, useCallback, useEffect } from 'react';
import { CompanyEvaluation } from './types';
import { evaluateCompany } from './services/geminiService';
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

    const handleSearch = useCallback(async (query: string, file: File | null) => {
        if (!query.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setEvaluation(null);
        setCurrentQuery(query);

        try {
            let fileData: { mimeType: string; data: string } | null = null;
            if (file) {
                try {
                    const base64Data = await readFileAsBase64(file);
                    fileData = {
                        mimeType: file.type,
                        data: base64Data,
                    };
                } catch (readError) {
                    console.error("Error reading file:", readError);
                    setError("Could not read the uploaded file. Please try again or select a different file.");
                    setIsLoading(false);
                    return;
                }
            }

            const result = await evaluateCompany(query, fileData);
            setEvaluation(result);
            
            const newHistory = [query, ...searchHistory.filter(item => item.toLowerCase() !== query.toLowerCase())].slice(0, 5);
            setSearchHistory(newHistory);
            localStorage.setItem('unicornFinderHistory', JSON.stringify(newHistory));

        } catch (err) {
            console.error(err);
            setError('Failed to evaluate company. The model may be unavailable or the request timed out. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, searchHistory]);

    return (
        <div className="min-h-screen bg-base-100 text-text-primary font-sans flex flex-col p-4 sm:p-6 lg:p-8">
            <header className="w-full max-w-7xl mx-auto text-left py-2 mb-4">
                 <div className="flex items-center gap-3">
                    <LogoIcon className="h-10 w-10 text-brand-primary" />
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">UnicornFinder MVP</h1>
                        <p className="text-sm text-text-secondary">AI-Powered Startup Evaluation for VCs</p>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-7xl mx-auto">
                <SearchBar onSearch={handleSearch} isLoading={isLoading} recentSearches={searchHistory} />

                <div className="mt-8">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center gap-4 p-8">
                            <LoadingSpinner />
                            <p className="text-lg text-text-secondary animate-pulse">Evaluating {currentQuery}...</p>
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
                    {!isLoading && !error && !evaluation && (
                        <div className="text-center p-8 bg-base-200/50 rounded-lg border border-base-300">
                            <h2 className="text-2xl font-semibold mb-2">Welcome to UnicornFinder</h2>
                            <p className="text-text-secondary">Enter a startup name or URL above to begin your analysis.</p>
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
