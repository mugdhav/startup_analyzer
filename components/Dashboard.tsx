import React from 'react';
import type { CompanyEvaluation, AnalysisItem } from '../types';
import { PopularityIcon } from './icons/PopularityIcon';
import { BreakdownIcon } from './icons/BreakdownIcon';
import { ProductIcon } from './icons/ProductIcon';
import { CompetitorIcon } from './icons/CompetitorIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { MinusCircleIcon } from './icons/MinusCircleIcon';
import { LinkIcon } from './icons/LinkIcon';

const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    
    let strokeColor = '#f87171'; // Red
    if (score >= 85) {
        strokeColor = '#4ade80'; // Green
    } else if (score >= 60) {
        strokeColor = '#facc15'; // Yellow
    }

    return (
        <div className="relative w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle
                    className="text-base-300"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
                <circle
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    className="transition-all duration-1000 ease-in-out"
                    style={{ color: strokeColor }}
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold" style={{ color: strokeColor }}>{score}</span>
                <span className="text-sm text-text-secondary">Overall Score</span>
            </div>
        </div>
    );
};

const AnalysisCard: React.FC<{ title: string; analysis: AnalysisItem; icon: React.ReactNode; }> = ({ title, analysis, icon }) => {
    const { score, summary, pros, cons, sources } = analysis;
    let barColor = 'bg-red-500';
    if (score >= 85) {
        barColor = 'bg-green-500';
    } else if (score >= 60) {
        barColor = 'bg-yellow-400';
    }

    return (
        <div className="bg-base-200/50 rounded-lg border border-base-300 p-6 flex flex-col animate-slide-up h-full">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    {icon}
                    <h3 className="text-lg font-bold text-text-primary">{title}</h3>
                </div>
                <span className="text-xl font-bold text-text-primary">{score}</span>
            </div>
             <div className="w-full bg-base-300 rounded-full h-2 mb-4">
                <div
                    className={`${barColor} h-2 rounded-full transition-all duration-1000 ease-in-out`}
                    style={{ width: `${score}%` }}
                ></div>
            </div>
            
            <div className="mb-4">
                <p className="text-text-secondary leading-relaxed text-sm">{summary}</p>
                
                {(pros.length > 0 || cons.length > 0) && (
                    <div className="mt-4 pt-4 border-t border-base-300/50 space-y-3">
                        {pros.length > 0 && (
                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2">
                                    <PlusCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    <span>Strengths</span>
                                </h4>
                                <ul className="space-y-1 text-sm text-text-secondary pl-2">
                                    {pros.map((pro, i) => <li key={i} className="flex items-start gap-2"><span className="opacity-60">-</span><span>{pro}</span></li>)}
                                </ul>
                            </div>
                        )}
                        {cons.length > 0 && (
                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2">
                                    <MinusCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                                    <span>Weaknesses</span>
                                </h4>
                                <ul className="space-y-1 text-sm text-text-secondary pl-2">
                                    {cons.map((con, i) => <li key={i} className="flex items-start gap-2"><span className="opacity-60">-</span><span>{con}</span></li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {sources.length > 0 && (
                 <div className="mt-auto pt-4 border-t border-base-300/50">
                    <h4 className="text-sm font-semibold text-text-primary mb-2">Relevant Sources</h4>
                    <ul className="space-y-1">
                        {sources.map((source, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 text-text-secondary flex-shrink-0"/>
                                <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm text-text-secondary hover:text-brand-primary transition-colors truncate">
                                    {source.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


const Dashboard: React.FC<{ evaluation: CompanyEvaluation }> = ({ evaluation }) => {
    const { 
        companyName,
        logoUrl,
        industry,
        fundingStatus,
        overallScore,
        founderAnalysis,
        marketAnalysis,
        technicalAnalysis,
        competitorAnalysis,
    } = evaluation;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <aside className="lg:col-span-1 bg-base-200/50 rounded-lg border border-base-300 p-6 flex flex-col animate-slide-up">
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 flex-shrink-0 rounded-md bg-base-300 flex items-center justify-center overflow-hidden">
                        {logoUrl && (
                            <img 
                                src={logoUrl} 
                                alt={`${companyName} logo`}
                                className="h-full w-full object-contain bg-white p-0.5"
                                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                        )}
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-2xl font-bold text-text-primary truncate">{companyName}</h2>
                        {industry && <p className="text-sm text-text-secondary">{industry}</p>}
                    </div>
                </div>

                <div className="w-full flex justify-center py-6">
                    <ScoreGauge score={overallScore} />
                </div>

                {fundingStatus && (
                    <div className="mt-6 pt-6 border-t border-base-300/50 text-center">
                        <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Funding Status</h4>
                        <p className="text-lg font-bold text-text-primary">{fundingStatus}</p>
                    </div>
                )}
            </aside>

            {/* Right Column */}
            <main className="lg:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <AnalysisCard 
                        title="Founder Analysis"
                        analysis={founderAnalysis}
                        icon={<PopularityIcon className="w-6 h-6 text-text-secondary" />}
                    />
                    <AnalysisCard 
                        title="Market Analysis"
                        analysis={marketAnalysis}
                        icon={<BreakdownIcon className="w-6 h-6 text-text-secondary" />}
                    />
                    <AnalysisCard 
                        title="Technical Analysis"
                        analysis={technicalAnalysis}
                        icon={<ProductIcon className="w-6 h-6 text-text-secondary" />}
                    />
                    <AnalysisCard 
                        title="Competitor Analysis"
                        analysis={competitorAnalysis}
                        icon={<CompetitorIcon className="w-6 h-6 text-text-secondary" />}
                    />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;