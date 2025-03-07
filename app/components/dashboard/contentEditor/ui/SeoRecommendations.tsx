"use client";

import React, { useState, useEffect } from 'react';
import { JSONContent } from 'novel';
import { AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Create simplified Accordion components if the UI components are not available
const AccordionItem = ({ children, value, className }: { children: React.ReactNode, value: string, className?: string }) => (
  <div className={`mb-2 border rounded-md overflow-hidden ${className || ''}`}>
    {children}
  </div>
);

const AccordionTrigger = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div className={`flex justify-between items-center p-3 cursor-pointer ${className || ''}`} onClick={onClick}>
    {children}
    <ChevronIcon />
  </div>
);

const AccordionContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-3 ${className || ''}`}>
    {children}
  </div>
);

const Accordion = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`w-full ${className || ''}`}>
    {children}
  </div>
);

// Simple chevron icon for accordion
const ChevronIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface SeoRecommendationsProps {
  content: JSONContent | undefined;
  title: string;
  smallDescription: string;
}

type CheckStatus = 'pass' | 'fail' | 'warning';

interface SeoCheckResult {
  id: string;
  title: string;
  description: string;
  status: CheckStatus;
  recommendation: string;
}

/**
 * SEO Recommendations component for content analysis
 * Provides guidance on improving content for SEO
 */
export function SeoRecommendations({ content, title, smallDescription }: SeoRecommendationsProps) {
  const [seoResults, setSeoResults] = useState<SeoCheckResult[]>([]);
  const [overallScore, setOverallScore] = useState<CheckStatus>('warning');
  const [passCount, setPassCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Toggle accordion item
  const toggleItem = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  // Analyze content for SEO best practices
  useEffect(() => {
    if (!content) {
      setSeoResults([
        {
          id: 'empty-content',
          title: 'Empty Content',
          description: 'Your article has no content',
          status: 'fail',
          recommendation: 'Add content to your article'
        }
      ]);
      setOverallScore('fail');
      setPassCount(0);
      setFailCount(1);
      setWarningCount(0);
      return;
    }

    const results: SeoCheckResult[] = [];
    let passCountTemp = 0;
    let failCountTemp = 0;
    let warningCountTemp = 0;

    // Check 1: Title length
    if (title) {
      const titleCheck: SeoCheckResult = {
        id: 'title-length',
        title: 'Title Length',
        description: `Your title is ${title.length} characters`,
        status: 'pass',
        recommendation: 'Ideal title length is 50-60 characters'
      };
      
      if (title.length < 30) {
        titleCheck.status = 'warning';
        titleCheck.description = `Your title is too short (${title.length} characters)`;
      } else if (title.length > 60) {
        titleCheck.status = 'warning';
        titleCheck.description = `Your title is too long (${title.length} characters)`;
      }

      results.push(titleCheck);
      if (titleCheck.status === 'pass') passCountTemp++;
      else if (titleCheck.status === 'fail') failCountTemp++;
      else warningCountTemp++;
    } else {
      results.push({
        id: 'title-missing',
        title: 'Missing Title',
        description: 'Your article has no title',
        status: 'fail',
        recommendation: 'Add a title to your article (50-60 characters)'
      });
      failCountTemp++;
    }

    // Check 2: Meta description (small description)
    if (smallDescription) {
      const descCheck: SeoCheckResult = {
        id: 'meta-description',
        title: 'Meta Description',
        description: `Your meta description is ${smallDescription.length} characters`,
        status: 'pass',
        recommendation: 'Ideal meta description length is 120-155 characters'
      };
      
      if (smallDescription.length < 80) {
        descCheck.status = 'warning';
        descCheck.description = `Your meta description is too short (${smallDescription.length} characters)`;
      } else if (smallDescription.length > 160) {
        descCheck.status = 'warning';
        descCheck.description = `Your meta description is too long (${smallDescription.length} characters)`;
      }

      results.push(descCheck);
      if (descCheck.status === 'pass') passCountTemp++;
      else if (descCheck.status === 'fail') failCountTemp++;
      else warningCountTemp++;
    } else {
      results.push({
        id: 'meta-description-missing',
        title: 'Missing Meta Description',
        description: 'Your article has no meta description',
        status: 'fail',
        recommendation: 'Add a meta description to your article (120-155 characters)'
      });
      failCountTemp++;
    }

    // Check 3: Analyze headings
    const headings = extractHeadings(content);
    const h1Count = headings.filter(h => h.level === 1).length;
    const h2Count = headings.filter(h => h.level === 2).length;
    
    // Check H1
    if (h1Count === 0) {
      results.push({
        id: 'missing-h1',
        title: 'Missing H1 Heading',
        description: 'Your article has no H1 headings',
        status: 'fail',
        recommendation: 'Add an H1 heading to your article (main title)'
      });
      failCountTemp++;
    } else if (h1Count > 1) {
      results.push({
        id: 'too-many-h1',
        title: 'Too Many H1 Headings',
        description: `Your article has ${h1Count} H1 headings`,
        status: 'warning',
        recommendation: 'Use only one H1 heading per article'
      });
      warningCountTemp++;
    } else {
      results.push({
        id: 'correct-h1',
        title: 'H1 Heading',
        description: 'Your article has one H1 heading',
        status: 'pass',
        recommendation: 'Good job! This follows SEO best practices.'
      });
      passCountTemp++;
    }
    
    // Check H2
    if (h2Count === 0) {
      results.push({
        id: 'missing-h2',
        title: 'Missing H2 Headings',
        description: 'Your article has no H2 headings',
        status: 'warning',
        recommendation: 'Consider adding H2 subheadings to structure your content'
      });
      warningCountTemp++;
    } else {
      results.push({
        id: 'has-h2',
        title: 'H2 Headings',
        description: `Your article has ${h2Count} H2 headings`,
        status: 'pass',
        recommendation: 'Good job using H2 headings to structure your content!'
      });
      passCountTemp++;
    }

    // Check 4: Content length
    const wordCount = countWords(content);
    const contentLengthCheck: SeoCheckResult = {
      id: 'content-length',
      title: 'Content Length',
      description: `Your article has approximately ${wordCount} words`,
      status: 'pass',
      recommendation: 'Aim for at least 300 words for basic articles, 1000+ for in-depth content'
    };
    
    if (wordCount < 300) {
      contentLengthCheck.status = 'warning';
      contentLengthCheck.description = `Your article is too short (${wordCount} words)`;
    } else if (wordCount > 300 && wordCount < 600) {
      contentLengthCheck.status = 'pass';
    } else if (wordCount >= 600) {
      contentLengthCheck.status = 'pass';
      contentLengthCheck.description = `Excellent length! Your article has ${wordCount} words`;
    }
    
    results.push(contentLengthCheck);
    if (contentLengthCheck.status === 'pass') passCountTemp++;
    else if (contentLengthCheck.status === 'fail') failCountTemp++;
    else warningCountTemp++;

    // Check 5: Keyword density (assuming the title contains the main keyword)
    if (title) {
      // Extract potential keywords from title (simplistic approach)
      const keywords = extractPotentialKeywords(title);
      
      let keywordFound = false;
      let keywordDensity = 0;
      
      if (keywords.length > 0 && wordCount > 0) {
        const mainKeyword = keywords[0]; // Just take the first potential keyword
        const keywordCount = countKeywordOccurrences(content, mainKeyword);
        keywordDensity = (keywordCount / wordCount) * 100;
        
        if (keywordDensity > 0) {
          keywordFound = true;
        }
      }
      
      if (!keywordFound) {
        results.push({
          id: 'keyword-density',
          title: 'Keyword Usage',
          description: 'No potential keywords from title found in content',
          status: 'warning',
          recommendation: 'Include your main keyword from the title in your content'
        });
        warningCountTemp++;
      } else {
        const keywordCheck: SeoCheckResult = {
          id: 'keyword-density',
          title: 'Keyword Density',
          description: `Keyword density is approximately ${keywordDensity.toFixed(1)}%`,
          status: 'pass',
          recommendation: 'Aim for a keyword density between 1-2%'
        };
        
        if (keywordDensity < 0.5) {
          keywordCheck.status = 'warning';
          keywordCheck.recommendation = 'Consider increasing your keyword usage slightly';
        } else if (keywordDensity > 3) {
          keywordCheck.status = 'warning';
          keywordCheck.recommendation = 'Your keyword density might be too high, which could be seen as keyword stuffing';
        }
        
        results.push(keywordCheck);
        if (keywordCheck.status === 'pass') passCountTemp++;
        else if (keywordCheck.status === 'fail') failCountTemp++;
        else warningCountTemp++;
      }
    }

    // Update state values
    setPassCount(passCountTemp);
    setFailCount(failCountTemp);
    setWarningCount(warningCountTemp);

    // Set overall score
    if (failCountTemp > 0) {
      setOverallScore('fail');
    } else if (warningCountTemp > 0) {
      setOverallScore('warning');
    } else {
      setOverallScore('pass');
    }

    setSeoResults(results);
  }, [content, title, smallDescription]);

  // Get background color based on status
  const getBgColor = (status: CheckStatus) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 dark:bg-green-900/20';
      case 'fail':
        return 'bg-red-100 dark:bg-red-900/20';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/20';
      default:
        return '';
    }
  };

  // Get icon based on status
  const getStatusIcon = (status: CheckStatus) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <HelpCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  // Get text color based on status
  const getTextColor = (status: CheckStatus) => {
    switch (status) {
      case 'pass':
        return 'text-green-800 dark:text-green-200';
      case 'fail':
        return 'text-red-800 dark:text-red-200';
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200';
      default:
        return '';
    }
  };

  return (
    <div className={`mt-4 rounded-lg p-4 ${getBgColor(overallScore)}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {getStatusIcon(overallScore)}
          <span>SEO Recommendations</span>
        </h3>
        <div className="flex gap-2">
          <Badge variant={overallScore === 'pass' ? 'default' : 'outline'} className={overallScore === 'pass' ? 'bg-green-500' : ''}>
            {passCount} Passed
          </Badge>
          <Badge variant={overallScore === 'warning' ? 'default' : 'outline'} className={overallScore === 'warning' ? 'bg-yellow-500' : ''}>
            {warningCount} Warnings
          </Badge>
          <Badge variant={overallScore === 'fail' ? 'default' : 'outline'} className={overallScore === 'fail' ? 'bg-red-500' : ''}>
            {failCount} Failed
          </Badge>
        </div>
      </div>

      <Accordion className="w-full">
        {seoResults.map((result) => (
          <AccordionItem key={result.id} value={result.id} className={`mb-2 border ${getBgColor(result.status)}`}>
            <AccordionTrigger 
              className={`px-4 py-2 ${getTextColor(result.status)}`}
              onClick={() => toggleItem(result.id)}
            >
              <div className="flex items-center gap-2">
                {getStatusIcon(result.status)}
                <span>{result.title}</span>
              </div>
            </AccordionTrigger>
            {expandedItem === result.id && (
              <AccordionContent className="px-4 py-2">
                <p className="mb-2">{result.description}</p>
                <p className="text-sm font-medium">Recommendation: {result.recommendation}</p>
              </AccordionContent>
            )}
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

// Helper functions for analyzing content

/**
 * Extract headings from content
 */
function extractHeadings(content: JSONContent): {level: number, text: string}[] {
  const headings: {level: number, text: string}[] = [];
  
  function traverse(node: any) {
    if (!node) return;
    
    // Check if this is a heading
    if (node.type === 'heading' && node.attrs && node.attrs.level) {
      const text = extractTextFromNode(node);
      headings.push({
        level: node.attrs.level,
        text
      });
    }
    
    // Traverse any children
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(traverse);
    }
  }
  
  traverse(content);
  return headings;
}

/**
 * Extract text content from a node
 */
function extractTextFromNode(node: any): string {
  let text = '';
  
  if (node.text) {
    return node.text;
  }
  
  if (node.content && Array.isArray(node.content)) {
    node.content.forEach((child: any) => {
      text += extractTextFromNode(child);
    });
  }
  
  return text;
}

/**
 * Count words in content
 */
function countWords(content: JSONContent): number {
  const text = getFullText(content);
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Extract full text from content
 */
function getFullText(content: JSONContent): string {
  let text = '';
  
  function traverse(node: any) {
    if (!node) return;
    
    if (node.text) {
      text += node.text + ' ';
    }
    
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(traverse);
    }
  }
  
  traverse(content);
  return text;
}

/**
 * Extract potential keywords from title
 */
function extractPotentialKeywords(title: string): string[] {
  // Simple algorithm: split by spaces and remove common words
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'in', 'on', 'at', 'to', 'for', 'with', 'by'];
  const words = title.toLowerCase().split(/\s+/).filter(Boolean);
  
  // Filter out stop words and words less than 3 characters
  return words
    .filter(word => !stopWords.includes(word) && word.length > 2)
    .map(word => word.replace(/[^\w]/g, '')); // Remove non-word characters
}

/**
 * Count occurrences of a keyword in content
 */
function countKeywordOccurrences(content: JSONContent, keyword: string): number {
  const text = getFullText(content).toLowerCase();
  const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
  const matches = text.match(regex);
  return matches ? matches.length : 0;
} 