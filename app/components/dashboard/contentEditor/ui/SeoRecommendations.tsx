"use client";

import React, { useEffect, useState } from "react";

import type { JSONContent } from "novel";

import { Badge } from "@/components/ui/badge";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";

// Status icon component for SEO checks
const StatusIcon = ({ status }: { status: CheckStatus }) => {
  switch (status) {
    case "pass":
      return <SimpleIcon name="check" size={16} className="text-green-600 dark:text-green-400" />;
    case "fail":
      return <SimpleIcon name="alertcircle" size={16} className="text-red-600 dark:text-red-400" />;
    case "warning":
      return <SimpleIcon name="info" size={16} className="text-amber-600 dark:text-amber-400" />;
    default:
      return null;
  }
};

// Create simplified Accordion components if the UI components are not available
const AccordionItem = ({
  children,
  value,
  className,
}: {
  children: React.ReactNode;
  value: string;
  className?: string;
}) => <div className={`mb-2 overflow-hidden rounded-md border ${className || ""}`}>{children}</div>;

const AccordionTrigger = ({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <div className={`flex cursor-pointer items-center justify-between p-3 ${className || ""}`} onClick={onClick}>
    {children}
    <ChevronIcon />
  </div>
);

const AccordionContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-3 ${className || ""}`}>{children}</div>
);

const Accordion = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`w-full ${className || ""}`}>{children}</div>
);

// Simple chevron icon for accordion
const ChevronIcon = () => <SimpleIcon name="chevrondown" size={20} className="text-current" />;

interface SeoRecommendationsProps {
  content: JSONContent | undefined;
  title: string;
  smallDescription: string;
  keywords?: string;
}

type CheckStatus = "pass" | "fail" | "warning";

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
export function SeoRecommendations({ content, title, smallDescription, keywords }: SeoRecommendationsProps) {
  const [seoResults, setSeoResults] = useState<SeoCheckResult[]>([]);
  const [overallScore, setOverallScore] = useState<CheckStatus>("warning");
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
          id: "empty-content",
          title: "Empty Content",
          description: "Your article has no content",
          status: "fail",
          recommendation: "Add content to your article",
        },
      ]);
      setOverallScore("fail");
      setPassCount(0);
      setFailCount(1);
      setWarningCount(0);
      return;
    }

    // Debug logging for keywords
    console.log("SEO Analysis - Keywords value:", keywords);
    console.log("SEO Analysis - Keywords type:", typeof keywords);

    // Normalize keywords parameter for more robust handling
    const normalizedKeywords = (() => {
      // If keywords is explicitly undefined or null, return empty string
      if (keywords === undefined || keywords === null) return "";

      // If keywords is already a string, return it
      if (typeof keywords === "string") return keywords;

      // If we get here, try to stringify it (should never happen, but just in case)
      try {
        return String(keywords);
      } catch (e) {
        console.error("Failed to normalize keywords:", e);
        return "";
      }
    })();

    const results: SeoCheckResult[] = [];
    let passCountTemp = 0;
    let failCountTemp = 0;
    let warningCountTemp = 0;

    // Calculate word count once for use throughout the analysis
    const wordCount = countWords(content);

    if (wordCount === 0) {
      results.push({
        id: "no-words",
        title: "No Words Detected",
        description: "Your article appears to be empty or contains only non-text content",
        status: "fail",
        recommendation: "Add meaningful text content to your article",
      });
      failCountTemp++;

      setSeoResults(results);
      setOverallScore("fail");
      setPassCount(0);
      setFailCount(1);
      setWarningCount(0);
      return;
    }

    // Check 1: Title length
    if (title) {
      const titleCheck: SeoCheckResult = {
        id: "title-length",
        title: "Title Length",
        description: `Your title is ${title.length} characters`,
        status: "pass",
        recommendation: "Ideal title length is 50-60 characters",
      };

      if (title.length < 30) {
        titleCheck.status = "warning";
        titleCheck.description = `Your title is too short (${title.length} characters)`;
      } else if (title.length > 60) {
        titleCheck.status = "warning";
        titleCheck.description = `Your title is too long (${title.length} characters)`;
      }

      results.push(titleCheck);
      if (titleCheck.status === "pass") passCountTemp++;
      else if (titleCheck.status === "fail") failCountTemp++;
      else warningCountTemp++;
    } else {
      results.push({
        id: "title-missing",
        title: "Missing Title",
        description: "Your article has no title",
        status: "fail",
        recommendation: "Add a title to your article (50-60 characters)",
      });
      failCountTemp++;
    }

    // Check 2: Meta description (small description)
    if (smallDescription) {
      const descCheck: SeoCheckResult = {
        id: "meta-description",
        title: "Meta Description",
        description: `Your meta description is ${smallDescription.length} characters`,
        status: "pass",
        recommendation: "Ideal meta description length is 120-160 characters",
      };

      if (smallDescription.length < 80) {
        descCheck.status = "warning";
        descCheck.description = `Your meta description is too short (${smallDescription.length} characters)`;
      } else if (smallDescription.length > 160) {
        descCheck.status = "warning";
        descCheck.description = `Your meta description is too long (${smallDescription.length} characters)`;
      }

      results.push(descCheck);
      if (descCheck.status === "pass") passCountTemp++;
      else if (descCheck.status === "fail") failCountTemp++;
      else warningCountTemp++;
    } else {
      results.push({
        id: "meta-description-missing",
        title: "Missing Meta Description",
        description: "Your article has no meta description",
        status: "fail",
        recommendation: "Add a meta description to your article (120-160 characters)",
      });
      failCountTemp++;
    }

    // Check 3: Analyze headings
    const headings = extractHeadings(content);
    const h1Count = headings.filter((h) => h.level === 1).length;
    const h2Count = headings.filter((h) => h.level === 2).length;
    const h3Count = headings.filter((h) => h.level === 3).length;
    const h4Count = headings.filter((h) => h.level === 4).length;
    const h5Count = headings.filter((h) => h.level === 5).length;
    const h6Count = headings.filter((h) => h.level === 6).length;

    // Check heading structure
    const headingStructureCheck: SeoCheckResult = {
      id: "heading-structure",
      title: "Heading Structure",
      description: `Your article has ${h1Count} H1, ${h2Count} H2, and ${h3Count} H3 tags`,
      status: "pass",
      recommendation: "Good heading structure helps both readers and search engines understand your content.",
    };

    // Check for heading structure issues
    const headingIssues: string[] = [];

    // Check if H1 is present
    if (h1Count === 0) {
      headingIssues.push("Missing H1 tag - every page should have one main heading");
      headingStructureCheck.status = "fail";
    } else if (h1Count > 1) {
      headingIssues.push(`Multiple H1 tags (${h1Count}) - consider using only one H1 for the main topic`);
      headingStructureCheck.status = "warning";
    }

    // Check if H2s are present
    if (h2Count === 0 && wordCount > 300) {
      headingIssues.push("No H2 tags - consider adding section headings for longer content");
      headingStructureCheck.status = headingStructureCheck.status === "fail" ? "fail" : "warning";
    }

    // Check for proper heading hierarchy - only if H3 tags are present
    if (h3Count > 0 && h2Count === 0) {
      headingIssues.push("H3 tags used without H2 tags - consider adding H2 headings for better structure");
      headingStructureCheck.status = headingStructureCheck.status === "fail" ? "fail" : "warning";
    }

    // Check for keyword usage in headings
    if (normalizedKeywords !== "") {
      const keywordsList = normalizedKeywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      if (keywordsList.length > 0) {
        // Check if any H1 contains keywords
        const h1Headings = headings.filter((h) => h.level === 1);
        const h1WithKeywords = h1Headings.some((h) =>
          keywordsList.some((keyword) => h.text.toLowerCase().includes(keyword.toLowerCase()))
        );

        if (h1Count > 0 && !h1WithKeywords) {
          headingIssues.push("H1 tag doesn't contain any of your keywords - consider including your primary keyword");
          headingStructureCheck.status = headingStructureCheck.status === "fail" ? "fail" : "warning";
        }

        // Check if any H2 contains keywords
        const h2Headings = headings.filter((h) => h.level === 2);
        const h2WithKeywords = h2Headings.some((h) =>
          keywordsList.some((keyword) => h.text.toLowerCase().includes(keyword.toLowerCase()))
        );

        if (h2Count > 0 && !h2WithKeywords) {
          headingIssues.push(
            "None of your H2 tags contain keywords - consider including keywords in some section headings"
          );
          headingStructureCheck.status = headingStructureCheck.status === "fail" ? "fail" : "warning";
        }
      }
    }

    // Analyze heading content quality
    const headingQuality = analyzeHeadingQuality(headings);

    // Add heading quality issues to the list
    if (headingQuality.issues.length > 0) {
      headingIssues.push(...headingQuality.issues);

      // Update status based on heading quality
      if (headingQuality.quality === "poor" && headingStructureCheck.status === "pass") {
        headingStructureCheck.status = "warning";
      }
    }

    // Update description and recommendation based on issues
    if (headingIssues.length > 0) {
      headingStructureCheck.description = `Heading structure issues found: ${h1Count} H1, ${h2Count} H2, ${h3Count} H3 tags`;

      // Filter out any contradictory recommendations
      const filteredHeadingQualityRecommendations = headingQuality.recommendations.filter((rec) => {
        // If there's a missing H1 issue, don't include the "headings look good" recommendation
        if (h1Count === 0 && rec.includes("Your headings look good")) {
          return false;
        }
        return true;
      });

      // Combine structural issues with content quality recommendations
      const allRecommendations = [
        ...headingIssues.map((issue) => `${issue}.`),
        ...filteredHeadingQualityRecommendations,
      ];

      // Format recommendations as a bulleted list for better readability
      headingStructureCheck.recommendation = `Improve your heading structure:\n• ${allRecommendations.join("\n• ")}`;
    } else {
      // Provide positive feedback for good structure
      headingStructureCheck.description = `Great heading structure with ${h1Count} H1, ${h2Count} H2, and ${h3Count} H3 tags`;
      headingStructureCheck.recommendation =
        "Your heading structure follows SEO best practices with a clear H1 title and well-organized sections.";
    }

    // Add detailed heading analysis to the description
    if (headings.length > 0) {
      let headingAnalysis = "\n\nHeadings:";

      // Group headings by level
      const h1Headings = headings.filter((h) => h.level === 1);
      const h2Headings = headings.filter((h) => h.level === 2);
      const h3Headings = headings.filter((h) => h.level === 3);

      // Add H1 analysis
      if (h1Headings.length > 0) {
        const h1Text = h1Headings.map((h) => h.text.trim()).join(", ");
        headingAnalysis += `\nH1: "${h1Text.length > 50 ? `${h1Text.substring(0, 47)}...` : h1Text}"`;
      }

      // Add H2 analysis (limited to first 3 for brevity)
      if (h2Headings.length > 0) {
        const h2Display =
          h2Headings.length > 3
            ? `${h2Headings
                .slice(0, 3)
                .map((h) => `"${h.text.trim().substring(0, 30)}${h.text.trim().length > 30 ? "..." : ""}"`)
                .join(", ")} (+ ${h2Headings.length - 3} more)`
            : h2Headings
                .map((h) => `"${h.text.trim().substring(0, 30)}${h.text.trim().length > 30 ? "..." : ""}"`)
                .join(", ");

        headingAnalysis += `\nH2: ${h2Display}`;
      }

      // Add H3 analysis (limited to first 3 for brevity)
      if (h3Headings.length > 0) {
        const h3Display =
          h3Headings.length > 3
            ? `${h3Headings
                .slice(0, 3)
                .map((h) => `"${h.text.trim().substring(0, 30)}${h.text.trim().length > 30 ? "..." : ""}"`)
                .join(", ")} (+ ${h3Headings.length - 3} more)`
            : h3Headings
                .map((h) => `"${h.text.trim().substring(0, 30)}${h.text.trim().length > 30 ? "..." : ""}"`)
                .join(", ");

        headingAnalysis += `\nH3: ${h3Display}`;
      }

      headingStructureCheck.description += headingAnalysis;
    }

    results.push(headingStructureCheck);
    if (headingStructureCheck.status === "pass") passCountTemp++;
    else if (headingStructureCheck.status === "fail") failCountTemp++;
    else warningCountTemp++;

    // Only add separate H1 check if it's not already covered in the heading structure check
    // This avoids duplicate recommendations
    if (!headingIssues.some((issue) => issue.includes("H1 tag"))) {
      // Check H1
      if (h1Count === 0) {
        results.push({
          id: "missing-h1",
          title: "Missing H1 Heading",
          description: "Your article has no H1 headings",
          status: "fail",
          recommendation: "Add an H1 heading to your article (main title)",
        });
        failCountTemp++;
      } else if (h1Count > 1) {
        results.push({
          id: "too-many-h1",
          title: "Too Many H1 Headings",
          description: `Your article has ${h1Count} H1 headings`,
          status: "warning",
          recommendation: "Use only one H1 heading per article",
        });
        warningCountTemp++;
      } else {
        results.push({
          id: "correct-h1",
          title: "H1 Heading",
          description: "Your article has one H1 heading",
          status: "pass",
          recommendation: "Good job! This follows SEO best practices.",
        });
        passCountTemp++;
      }
    }

    // Check 4: Content length
    const contentLengthCheck: SeoCheckResult = {
      id: "content-length",
      title: "Content Length",
      description: `Your article has approximately ${wordCount} words`,
      status: "pass",
      recommendation: "Aim for at least 300 words for basic articles, 1000+ for in-depth content",
    };

    if (wordCount < 300) {
      contentLengthCheck.status = "warning";
      contentLengthCheck.description = `Your article is too short (${wordCount} words)`;
    } else if (wordCount > 300 && wordCount < 600) {
      contentLengthCheck.status = "pass";
    } else if (wordCount >= 600) {
      contentLengthCheck.status = "pass";
      contentLengthCheck.description = `Excellent length! Your article has ${wordCount} words`;
    }

    results.push(contentLengthCheck);
    if (contentLengthCheck.status === "pass") passCountTemp++;
    else if (contentLengthCheck.status === "fail") failCountTemp++;
    else warningCountTemp++;

    // Check 5: Keywords
    if (normalizedKeywords !== "") {
      const keywordsList = normalizedKeywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      if (keywordsList.length > 0) {
        // Check if keywords are used in title
        const keywordsInTitle = keywordsList.filter((keyword) => title.toLowerCase().includes(keyword.toLowerCase()));

        if (keywordsInTitle.length > 0) {
          results.push({
            id: "keywords-in-title",
            title: "Keywords in Title",
            description: `Your title contains ${keywordsInTitle.length} of your specified keywords`,
            status: "pass",
            recommendation: "Good job including keywords in your title!",
          });
          passCountTemp++;
        } else {
          results.push({
            id: "missing-keywords-in-title",
            title: "Keywords in Title",
            description: "Your title doesn't contain any of your specified keywords",
            status: "warning",
            recommendation: "Consider including at least one of your main keywords in the title",
          });
          warningCountTemp++;
        }

        // Check if keywords are used in description
        const keywordsInDesc = keywordsList.filter((keyword) =>
          smallDescription.toLowerCase().includes(keyword.toLowerCase())
        );

        if (keywordsInDesc.length > 0) {
          results.push({
            id: "keywords-in-desc",
            title: "Keywords in Meta Description",
            description: `Your meta description contains ${keywordsInDesc.length} of your specified keywords`,
            status: "pass",
            recommendation: "Good job including keywords in your meta description!",
          });
          passCountTemp++;
        } else {
          results.push({
            id: "missing-keywords-in-desc",
            title: "Keywords in Meta Description",
            description: "Your meta description doesn't contain any of your specified keywords",
            status: "warning",
            recommendation: "Consider including at least one of your main keywords in the meta description",
          });
          warningCountTemp++;
        }
      } else {
        results.push({
          id: "empty-keywords",
          title: "Keywords",
          description: "You've provided empty keywords",
          status: "warning",
          recommendation: "Add 3-5 relevant keywords separated by commas",
        });
        warningCountTemp++;
      }
    } else {
      results.push({
        id: "missing-keywords",
        title: "Missing Keywords",
        description: "You haven't provided any keywords",
        status: "warning",
        recommendation: "Add 3-5 relevant keywords to improve SEO",
      });
      warningCountTemp++;
    }

    // Check 6: Keyword density (using the provided keywords instead of extracting from title)
    if (normalizedKeywords !== "") {
      const keywordsList = normalizedKeywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      if (keywordsList.length > 0 && wordCount > 0) {
        // Calculate density for all keywords combined
        let totalKeywordOccurrences = 0;
        const keywordDensities: {
          keyword: string;
          count: number;
          density: number;
          status: "optimal" | "low" | "high" | "none";
        }[] = [];

        // Calculate individual keyword densities
        keywordsList.forEach((keyword) => {
          const keywordCount = countKeywordOccurrences(content, keyword);
          totalKeywordOccurrences += keywordCount;

          // Determine status based on density
          let status: "optimal" | "low" | "high" | "none" = "none";
          const density = keywordCount > 0 ? (keywordCount / wordCount) * 100 : 0;

          if (keywordCount === 0) {
            status = "none";
          } else if (density < 0.5) {
            status = "low";
          } else if (density > 3) {
            status = "high";
          } else if (density >= 1 && density <= 2) {
            status = "optimal";
          } else {
            status = "low"; // Between 0.5 and 1 or between 2 and 3
          }

          keywordDensities.push({
            keyword,
            count: keywordCount,
            density,
            status,
          });
        });

        // Calculate overall density
        const overallDensity = wordCount > 0 ? (totalKeywordOccurrences / wordCount) * 100 : 0;

        // Group keywords by status for better reporting
        const missingKeywords = keywordDensities.filter((k) => k.status === "none").map((k) => k.keyword);
        const lowDensityKeywords = keywordDensities.filter((k) => k.status === "low").map((k) => k.keyword);
        const highDensityKeywords = keywordDensities.filter((k) => k.status === "high").map((k) => k.keyword);
        const optimalKeywords = keywordDensities.filter((k) => k.status === "optimal").map((k) => k.keyword);

        if (keywordDensities.filter((k) => k.count > 0).length === 0) {
          results.push({
            id: "keyword-density",
            title: "Keyword Usage",
            description: `None of your keywords were found in the content: ${keywordsList.map((k) => `"${k}"`).join(", ")}`,
            status: "warning",
            recommendation: "Include your keywords naturally throughout your content to improve SEO",
          });
          warningCountTemp++;
        } else {
          // Find the highest density keyword for reporting
          keywordDensities.sort((a, b) => b.density - a.density);
          const highestDensityKeyword = keywordDensities.filter((k) => k.count > 0)[0];

          // Determine overall status
          let overallStatus: CheckStatus = "pass";
          if (missingKeywords.length > keywordsList.length / 2) {
            overallStatus = "warning";
          } else if (highDensityKeywords.length > 0) {
            overallStatus = "warning";
          } else if (missingKeywords.length === keywordsList.length) {
            overallStatus = "fail";
          }

          // Create description with detailed breakdown
          let description = `Overall keyword density is approximately ${overallDensity.toFixed(1)}%`;

          if (highestDensityKeyword) {
            description += ` (highest: "${highestDensityKeyword.keyword}" at ${highestDensityKeyword.density.toFixed(1)}%)`;
          }

          // Add status summaries
          const statusSummaries = [];
          if (missingKeywords.length > 0) {
            statusSummaries.push(`${missingKeywords.length} missing`);
          }
          if (lowDensityKeywords.length > 0) {
            statusSummaries.push(`${lowDensityKeywords.length} low density`);
          }
          if (optimalKeywords.length > 0) {
            statusSummaries.push(`${optimalKeywords.length} optimal`);
          }
          if (highDensityKeywords.length > 0) {
            statusSummaries.push(`${highDensityKeywords.length} too high`);
          }

          if (statusSummaries.length > 0) {
            description += `\n\nKeyword status: ${statusSummaries.join(", ")}`;
          }

          // Add specific missing keywords
          if (missingKeywords.length > 0) {
            description += `\n\nMissing keywords: ${missingKeywords.map((k) => `"${k}"`).join(", ")}`;
          }

          // Create recommendations based on analysis
          const recommendation = getKeywordDensityRecommendations(keywordDensities);

          const keywordCheck: SeoCheckResult = {
            id: "keyword-density",
            title: "Keyword Density",
            description,
            status: overallStatus,
            recommendation,
          };

          // Add detailed keyword density breakdown
          if (keywordDensities.filter((k) => k.count > 0).length > 0) {
            let densityDetails = "Keyword density breakdown:\n";
            keywordDensities.forEach((kw) => {
              const densityClass =
                kw.count === 0
                  ? "missing"
                  : kw.density > 3
                    ? "too high"
                    : kw.density >= 1 && kw.density <= 2
                      ? "optimal"
                      : kw.density < 0.5
                        ? "low"
                        : "acceptable";

              densityDetails += `• "${kw.keyword}": ${kw.count === 0 ? "not found" : `${kw.density.toFixed(1)}% (${kw.count} occurrences) - ${densityClass}`}\n`;
            });

            keywordCheck.description += `\n\n${densityDetails}`;
          }

          results.push(keywordCheck);
          if (keywordCheck.status === "pass") passCountTemp++;
          else if (keywordCheck.status === "fail") failCountTemp++;
          else warningCountTemp++;
        }
      } else if (wordCount > 0) {
        // Keywords string exists but has no valid keywords after filtering
        results.push({
          id: "invalid-keywords",
          title: "Invalid Keywords",
          description: "Your keywords field doesn't contain valid keywords",
          status: "warning",
          recommendation: "Add 3-5 relevant keywords separated by commas",
        });
        warningCountTemp++;
      }
    } else if (title && wordCount > 0) {
      // Only fall back to title-based keyword check if no keywords were provided
      const extractedKeywords = extractPotentialKeywords(title);

      if (extractedKeywords.length > 0) {
        const mainKeyword = extractedKeywords[0]; // Just take the first potential keyword
        const keywordCount = countKeywordOccurrences(content, mainKeyword);
        const keywordDensity = (keywordCount / wordCount) * 100;

        if (keywordCount === 0) {
          results.push({
            id: "keyword-density-fallback",
            title: "Keyword Usage",
            description: `Main keyword "${mainKeyword}" from title not found in content`,
            status: "warning",
            recommendation:
              "Include your main keyword from the title in your content or add specific keywords in the keywords field",
          });
          warningCountTemp++;
        } else {
          const keywordCheck: SeoCheckResult = {
            id: "keyword-density-fallback",
            title: "Keyword Density",
            description: `Title keyword "${mainKeyword}" density is approximately ${keywordDensity.toFixed(1)}%`,
            status: "pass",
            recommendation: "For better analysis, add specific keywords in the keywords field",
          };

          results.push(keywordCheck);
          if (keywordCheck.status === "pass") passCountTemp++;
          else warningCountTemp++;
        }
      }
    }

    // Update state values
    setPassCount(passCountTemp);
    setFailCount(failCountTemp);
    setWarningCount(warningCountTemp);

    // Set overall score
    if (failCountTemp > 0) {
      setOverallScore("fail");
    } else if (warningCountTemp > 0) {
      setOverallScore("warning");
    } else {
      setOverallScore("pass");
    }

    setSeoResults(results);
  }, [content, title, smallDescription, keywords]);

  // Get background color based on status
  const getBgColor = (status: CheckStatus) => {
    switch (status) {
      case "pass":
        return "bg-green-100 dark:bg-green-900/20";
      case "fail":
        return "bg-red-100 dark:bg-red-900/20";
      case "warning":
        return "bg-yellow-100 dark:bg-yellow-900/20";
      default:
        return "";
    }
  };

  // Get icon based on status
  const getStatusIcon = (status: CheckStatus) => {
    switch (status) {
      case "pass":
        return <SimpleIcon name="check" size={20} className="text-green-500" />;
      case "fail":
        return <SimpleIcon name="alertcircle" size={20} className="text-red-500" />;
      case "warning":
        return <SimpleIcon name="info" size={20} className="text-yellow-500" />;
      default:
        return null;
    }
  };

  // Get text color based on status
  const getTextColor = (status: CheckStatus) => {
    switch (status) {
      case "pass":
        return "text-green-800 dark:text-green-200";
      case "fail":
        return "text-red-800 dark:text-red-200";
      case "warning":
        return "text-yellow-800 dark:text-yellow-200";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <StatusIcon status={overallScore} />
          <h3 className="text-base font-medium">
            SEO Score: {passCount} passed, {warningCount} warnings, {failCount} failed
          </h3>
        </div>
        <div className="flex space-x-1">
          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
            {passCount} Passed
          </Badge>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            {warningCount} Warnings
          </Badge>
          <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
            {failCount} Failed
          </Badge>
        </div>
      </div>

      <Accordion className="space-y-2">
        {seoResults.map((result) => (
          <AccordionItem
            key={result.id}
            value={result.id}
            className={` ${result.status === "pass" ? "border-green-200 dark:border-green-800" : ""} ${result.status === "warning" ? "border-amber-200 dark:border-amber-800" : ""} ${result.status === "fail" ? "border-red-200 dark:border-red-800" : ""} `}
          >
            <AccordionTrigger
              onClick={() => toggleItem(result.id)}
              className={` ${result.status === "pass" ? "bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-200" : ""} ${result.status === "warning" ? "bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200" : ""} ${result.status === "fail" ? "bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-200" : ""} `}
            >
              <div className="flex items-center space-x-2">
                <StatusIcon status={result.status} />
                <span>{result.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm">
              <div className="space-y-2">
                <p>{result.description.split("\n\n")[0]}</p>

                {/* Special handling for keyword density breakdown */}
                {result.id === "keyword-density" && result.description.includes("Keyword density breakdown:") && (
                  <div className="mt-3 rounded-md border bg-gray-50 p-2 dark:bg-gray-900">
                    <h4 className="mb-2 font-medium">Keyword Density Analysis</h4>
                    <div className="space-y-1">
                      {result.description
                        .split("\n\n")[1]
                        .split("\n")
                        .map((line, i) => {
                          if (!line.startsWith("Keyword density breakdown:")) {
                            const [keywordPart, densityClass] = line.split(" - ");
                            return (
                              <div key={i} className="flex items-center justify-between">
                                <span>{keywordPart}</span>
                                <Badge
                                  variant="outline"
                                  className={
                                    densityClass === "optimal"
                                      ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                                      : densityClass === "too high"
                                        ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                                        : densityClass === "low"
                                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                          : densityClass === "missing"
                                            ? "bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300"
                                            : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                  }
                                >
                                  {densityClass}
                                </Badge>
                              </div>
                            );
                          }
                          return null;
                        })}
                    </div>

                    <div className="mt-3 border-t pt-2 text-xs text-gray-600 dark:text-gray-400">
                      <h5 className="mb-1 font-medium">Keyword Density Reference:</h5>
                      <ul className="list-disc space-y-1 pl-4">
                        <li>
                          <span className="font-medium text-green-600 dark:text-green-400">Optimal:</span> 1-2% for
                          primary keywords
                        </li>
                        <li>
                          <span className="font-medium text-blue-600 dark:text-blue-400">Acceptable:</span> 0.5-3% range
                        </li>
                        <li>
                          <span className="font-medium text-amber-600 dark:text-amber-400">Low:</span> Below 0.5% (may
                          need more emphasis)
                        </li>
                        <li>
                          <span className="font-medium text-red-600 dark:text-red-400">Too High:</span> Above 3% (risk
                          of keyword stuffing)
                        </li>
                        <li>
                          <span className="font-medium text-gray-600 dark:text-gray-400">Missing:</span> Not found in
                          content
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Special handling for missing keywords */}
                {result.id === "keyword-density" && result.description.includes("Missing keywords:") && (
                  <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-2 dark:border-amber-800 dark:bg-amber-950/20">
                    <div className="flex items-start">
                      <SimpleIcon
                        name="alerttriangle"
                        size={20}
                        className="mr-2 mt-0.5 text-amber-600 dark:text-amber-400"
                      />
                      <div>
                        <h4 className="mb-1 font-medium text-amber-800 dark:text-amber-300">Missing Keywords</h4>
                        <p>{result.description.split("Missing keywords: ")[1].split("\n")[0]}</p>
                        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                          Try to naturally incorporate these keywords into your content to improve SEO.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Special handling for heading structure guide */}
                {result.id === "heading-structure" && (
                  <div className="mt-3 rounded-md border bg-gray-50 p-2 dark:bg-gray-900">
                    <h4 className="mb-2 font-medium">Heading Structure Best Practices</h4>

                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <h5 className="font-medium text-gray-800 dark:text-gray-200">H1 Tags</h5>
                          <ul className="list-disc space-y-1 pl-4 text-gray-600 dark:text-gray-400">
                            <li>Use exactly one H1 per page</li>
                            <li>Include your primary keyword</li>
                            <li>Keep it clear and descriptive</li>
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-medium text-gray-800 dark:text-gray-200">H2 Tags</h5>
                          <ul className="list-disc space-y-1 pl-4 text-gray-600 dark:text-gray-400">
                            <li>Divide content into major sections</li>
                            <li>Include relevant keywords</li>
                            <li>Support the main H1 topic</li>
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-medium text-gray-800 dark:text-gray-200">H3-H6 Tags</h5>
                          <ul className="list-disc space-y-1 pl-4 text-gray-600 dark:text-gray-400">
                            <li>Optional for deeper structure</li>
                            <li>Use when needed for subsections</li>
                            <li>Improve content scanability</li>
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-medium text-gray-800 dark:text-gray-200">Keywords in Headings</h5>
                          <ul className="list-disc space-y-1 pl-4 text-gray-600 dark:text-gray-400">
                            <li>Primary keyword in H1</li>
                            <li>Keyword variations in H2/H3</li>
                            <li>Use question-based headings</li>
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-800 dark:text-gray-200">Length Guidelines</h5>
                        <div className="mt-1 grid grid-cols-1 gap-2 md:grid-cols-3">
                          <div className="rounded bg-blue-50 p-2 text-center dark:bg-blue-900/20">
                            <span className="font-medium text-blue-700 dark:text-blue-300">H1:</span>
                            <span className="block text-gray-600 dark:text-gray-400">5-10 words</span>
                          </div>
                          <div className="rounded bg-green-50 p-2 text-center dark:bg-green-900/20">
                            <span className="font-medium text-green-700 dark:text-green-300">H2:</span>
                            <span className="block text-gray-600 dark:text-gray-400">3-8 words</span>
                          </div>
                          <div className="rounded bg-amber-50 p-2 text-center dark:bg-amber-900/20">
                            <span className="font-medium text-amber-700 dark:text-amber-300">H3+:</span>
                            <span className="block text-gray-600 dark:text-gray-400">3-7 words</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 border-t pt-2 text-xs text-gray-600 dark:text-gray-400">
                      <h5 className="mb-1 font-medium">Example Structure:</h5>
                      <div className="rounded bg-gray-100 p-2 font-mono text-xs dark:bg-gray-800">
                        <div className="text-blue-600 dark:text-blue-400">
                          &lt;h1&gt;Complete Guide to SEO&lt;/h1&gt;
                        </div>
                        <div className="ml-2 text-green-600 dark:text-green-400">
                          &lt;h2&gt;On-Page SEO Factors&lt;/h2&gt;
                        </div>
                        <div className="ml-2 text-green-600 dark:text-green-400">
                          &lt;h2&gt;Technical SEO&lt;/h2&gt;
                        </div>
                        <div className="ml-4 text-amber-600 opacity-70 dark:text-amber-400">
                          &lt;h3&gt;Optional Subsection&lt;/h3&gt; <span className="text-gray-500">(optional)</span>
                        </div>
                      </div>
                      <p className="mt-1 italic">
                        Note: H3-H6 tags are optional and should be used only when needed for deeper content
                        organization.
                      </p>
                    </div>
                  </div>
                )}

                <div className="border-t pt-2">
                  <h4 className="mb-1 font-medium">Recommendation:</h4>
                  {result.id === "heading-structure" && result.recommendation.includes("\n") ? (
                    <div className="text-gray-700 dark:text-gray-300">
                      {result.recommendation.split("\n").map((line, i) => (
                        <p key={i} className={i === 0 ? "mb-2" : "mb-1"}>
                          {line}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">{result.recommendation}</p>
                  )}
                </div>
              </div>
            </AccordionContent>
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
function extractHeadings(content: JSONContent): { level: number; text: string }[] {
  const headings: { level: number; text: string }[] = [];

  function traverse(node: unknown) {
    if (!node) return;

    // Check if this is a heading
    if (node.type === "heading" && node.attrs && node.attrs.level) {
      const text = extractTextFromNode(node);
      headings.push({
        level: node.attrs.level,
        text,
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
function extractTextFromNode(node: unknown): string {
  let text = "";

  if (node.text) {
    return node.text;
  }

  if (node.content && Array.isArray(node.content)) {
    node.content.forEach((child: unknown) => {
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
  let text = "";

  function traverse(node: unknown) {
    if (!node) return;

    if (node.text) {
      text += `${node.text} `;
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
  const stopWords = ["the", "a", "an", "and", "or", "but", "is", "are", "in", "on", "at", "to", "for", "with", "by"];
  const words = title.toLowerCase().split(/\s+/).filter(Boolean);

  // Filter out stop words and words less than 3 characters
  return words.filter((word) => !stopWords.includes(word) && word.length > 2).map((word) => word.replace(/[^\w]/g, "")); // Remove non-word characters
}

/**
 * Count occurrences of a keyword in content
 */
function countKeywordOccurrences(content: JSONContent, keyword: string): number {
  if (!keyword || keyword.trim().length === 0) return 0;

  const text = getFullText(content).toLowerCase();
  const cleanKeyword = keyword.toLowerCase().trim();

  try {
    // Escape special regex characters in the keyword to avoid errors
    const escapedKeyword = cleanKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escapedKeyword}\\b`, "gi");
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  } catch (error) {
    // Fallback method in case regex fails
    const words = text.split(/\s+/);
    return words.filter((word) => word === cleanKeyword).length;
  }
}

/**
 * Get keyword density optimization recommendations
 */
function getKeywordDensityRecommendations(
  keywordDensities: { keyword: string; count: number; density: number; status: string }[]
): string {
  const highDensityKeywords = keywordDensities.filter((kw) => kw.status === "high");
  const lowDensityKeywords = keywordDensities.filter((kw) => kw.status === "low" && kw.count > 0);
  const missingKeywords = keywordDensities.filter((kw) => kw.status === "none");
  const optimalKeywords = keywordDensities.filter((kw) => kw.status === "optimal");

  const recommendations = [];

  // Recommendations for missing keywords
  if (missingKeywords.length > 0) {
    const keywordsList = missingKeywords.map((kw) => `"${kw.keyword}"`).join(", ");
    recommendations.push(`Add these missing keywords to your content: ${keywordsList}.`);
  }

  // Recommendations for high density keywords
  if (highDensityKeywords.length > 0) {
    const keywordsList = highDensityKeywords.map((kw) => `"${kw.keyword}" (${kw.density.toFixed(1)}%)`).join(", ");
    recommendations.push(
      `Consider reducing the frequency of overused keywords: ${keywordsList}. Use synonyms, related terms, or LSI (Latent Semantic Indexing) keywords instead.`
    );
  }

  // Recommendations for low density keywords
  if (lowDensityKeywords.length > 0 && optimalKeywords.length === 0) {
    const keywordsList = lowDensityKeywords.map((kw) => `"${kw.keyword}" (${kw.density.toFixed(1)}%)`).join(", ");
    recommendations.push(
      `Try to increase usage of these keywords: ${keywordsList}. Aim for 1-2% density for primary keywords.`
    );
  }

  // General recommendations
  if (recommendations.length === 0) {
    if (optimalKeywords.length > 0) {
      recommendations.push(
        `Good job! Your keyword density is optimal for: ${optimalKeywords.map((kw) => `"${kw.keyword}"`).join(", ")}.`
      );
    } else {
      recommendations.push(
        "Aim for 1-2% density for primary keywords and 0.5-1% for secondary keywords. Avoid exceeding 3% for any single keyword to prevent keyword stuffing penalties."
      );
    }
  }

  recommendations.push(
    "For best SEO results, include keywords naturally in headings, the first paragraph, and throughout the content."
  );

  return recommendations.join("\n\n");
}

/**
 * Analyze heading content quality
 */
function analyzeHeadingQuality(headings: { level: number; text: string }[]): {
  quality: "good" | "average" | "poor";
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check for empty headings
  const emptyHeadings = headings.filter((h) => h.text.trim().length === 0);
  if (emptyHeadings.length > 0) {
    issues.push(`Found ${emptyHeadings.length} empty heading(s)`);
    recommendations.push("Add text to empty headings");
  }

  // Check for very short headings (less than 3 words)
  const shortHeadings = headings.filter((h) => h.text.trim().split(/\s+/).length < 3 && h.text.trim().length > 0);
  if (shortHeadings.length > 0) {
    issues.push(`Found ${shortHeadings.length} very short heading(s)`);
    recommendations.push("Make short headings more descriptive (3-10 words ideal)");
  }

  // Check for very long headings (more than 15 words)
  const longHeadings = headings.filter((h) => h.text.trim().split(/\s+/).length > 15);
  if (longHeadings.length > 0) {
    issues.push(`Found ${longHeadings.length} very long heading(s)`);
    recommendations.push("Make long headings more concise (3-10 words ideal)");
  }

  // Check for duplicate headings
  const headingTexts = headings.map((h) => h.text.trim().toLowerCase());
  const duplicateHeadings = headingTexts.filter((text, index) => headingTexts.indexOf(text) !== index);
  if (duplicateHeadings.length > 0) {
    issues.push(`Found ${duplicateHeadings.length} duplicate heading(s)`);
    recommendations.push("Use unique headings throughout your content");
  }

  // Check for proper capitalization (at least first letter should be capitalized)
  const improperCapitalization = headings.filter((h) => {
    const text = h.text.trim();
    return text.length > 0 && text[0] === text[0].toLowerCase();
  });
  if (improperCapitalization.length > 0) {
    issues.push(`Found ${improperCapitalization.length} heading(s) without proper capitalization`);
    recommendations.push("Capitalize the first letter of each heading");
  }

  // Determine overall quality
  let quality: "good" | "average" | "poor" = "good";
  if (issues.length > 3) {
    quality = "poor";
  } else if (issues.length > 0) {
    quality = "average";
  }

  // Add general recommendations only if no specific issues found
  if (recommendations.length === 0) {
    recommendations.push("Your headings look good! Continue using descriptive, keyword-rich headings");
    recommendations.push("Consider using questions in some headings for voice search");
  } else {
    // Always add the voice search recommendation as it's helpful regardless of issues
    recommendations.push("Consider using questions in some headings for voice search");
  }

  return { quality, issues, recommendations };
}
