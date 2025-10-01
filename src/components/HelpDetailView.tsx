import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { 
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  MessageCircle,
  User,
  Briefcase,
  Shield,
  CreditCard,
  Camera,
  Clock,
  Phone,
  Star,
  TrendingUp,
  Package,
  FileText,
  Eye,
  Filter,
  Settings,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  X
} from "lucide-react";

interface HelpDetailViewProps {
  isOpen: boolean;
  onClose: () => void;
  helpType: 'verification-guide' | 'account-security' | 'communication-tips' | 'selling-guide' | 'quality-standards' | 'pricing-tips' | null;
  currentUser?: any;
}

interface HelpSection {
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  sections: {
    title: string;
    steps: {
      title: string;
      description: string;
      tips?: string[];
      warning?: string;
    }[];
  }[];
}

const HELP_CONTENT: Record<string, HelpSection> = {
  'verification-guide': {
    title: "Complete Verification Guide",
    icon: <CheckCircle className="w-6 h-6" />,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    sections: [
      {
        title: "Getting Started",
        steps: [
          {
            title: "Navigate to Verification",
            description: "Go to your Profile menu and click 'Get Verified' to start the process.",
            tips: [
              "Make sure you're signed in to your account",
              "Have your documents ready before starting"
            ]
          },
          {
            title: "Choose Account Type",
            description: "Select between Individual Account (for farmers/personal use) or Business Account (for registered businesses).",
            tips: [
              "Individual accounts are perfect for small farmers and personal sellers",
              "Business accounts require official business registration documents"
            ]
          }
        ]
      },
      {
        title: "Required Documents",
        steps: [
          {
            title: "National ID Card",
            description: "Upload a clear photo of your Myanmar National ID card (front and back).",
            tips: [
              "Ensure all text is clearly readable",
              "Use good lighting and avoid shadows",
              "File size should be under 5MB"
            ],
            warning: "Never share your ID with anyone outside the verification process"
          },
          {
            title: "Proof of Address (Optional)",
            description: "Upload a utility bill or bank statement showing your current address.",
            tips: [
              "Document should be dated within last 3 months",
              "Address should match your profile information"
            ]
          },
          {
            title: "Business License (Business Accounts Only)",
            description: "Upload your official business registration certificate from DICA.",
            tips: [
              "Document must be current and valid",
              "Business name should match your profile"
            ]
          }
        ]
      },
      {
        title: "Verification Process",
        steps: [
          {
            title: "Document Review",
            description: "Our team reviews your documents within 24-48 hours during business days.",
            tips: [
              "You'll receive updates via email and in-app notifications",
              "Most verifications are completed within 1 business day"
            ]
          },
          {
            title: "Verification Complete",
            description: "Once approved, you'll receive a verification badge and unlock all platform features.",
            tips: [
              "Verified sellers get priority in search results",
              "Buyers trust verified sellers more",
              "Access to advanced selling tools and analytics"
            ]
          }
        ]
      }
    ]
  },
  'account-security': {
    title: "Account Security Best Practices",
    icon: <AlertTriangle className="w-6 h-6" />,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    sections: [
      {
        title: "Password Security",
        steps: [
          {
            title: "Create Strong Passwords",
            description: "Use a combination of uppercase, lowercase, numbers, and special characters.",
            tips: [
              "Minimum 8 characters, recommended 12+ characters",
              "Avoid using personal information like birthdays",
              "Use unique passwords for each account"
            ]
          },
          {
            title: "Enable Two-Factor Authentication",
            description: "Add an extra layer of security by enabling 2FA with your phone number.",
            tips: [
              "Receive SMS codes for login verification",
              "Protects your account even if password is compromised"
            ]
          }
        ]
      },
      {
        title: "Safe Trading Practices",
        steps: [
          {
            title: "Verify Buyer/Seller Identity",
            description: "Only trade with verified users when possible, especially for large transactions.",
            tips: [
              "Look for verification badges before making deals",
              "Ask for additional proof of identity for high-value transactions"
            ],
            warning: "Be cautious of users with no verification or negative reviews"
          },
          {
            title: "Secure Payment Methods",
            description: "Use traceable payment methods and avoid cash for large transactions.",
            tips: [
              "Bank transfers provide transaction records",
              "Mobile payments like KBZPay offer buyer protection",
              "Meet in public places for cash transactions"
            ]
          },
          {
            title: "Document Everything",
            description: "Keep records of all communications and transactions.",
            tips: [
              "Screenshot important conversations",
              "Save payment receipts and delivery confirmations",
              "Take photos of products before shipping"
            ]
          }
        ]
      },
      {
        title: "Recognizing Scams",
        steps: [
          {
            title: "Common Red Flags",
            description: "Learn to identify suspicious behavior and potential scams.",
            tips: [
              "Requests for upfront payments or deposits",
              "Prices significantly below market value",
              "Pressure to complete transactions quickly",
              "Poor grammar or suspicious communication"
            ],
            warning: "If something feels too good to be true, it probably is"
          },
          {
            title: "Report Suspicious Activity",
            description: "Use our reporting system to flag suspicious users or transactions.",
            tips: [
              "Report immediately if you suspect fraud",
              "Block users who behave inappropriately",
              "Contact support for guidance on suspicious offers"
            ]
          }
        ]
      }
    ]
  },
  'communication-tips': {
    title: "Safe Communication Guidelines",
    icon: <MessageCircle className="w-6 h-6" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    sections: [
      {
        title: "Professional Communication",
        steps: [
          {
            title: "Clear Product Inquiries",
            description: "Ask specific questions about products, pricing, and availability.",
            tips: [
              "Be specific about quantities and delivery requirements",
              "Ask about product quality and freshness",
              "Clarify payment and delivery terms upfront"
            ]
          },
          {
            title: "Respectful Language",
            description: "Maintain professional and respectful communication at all times.",
            tips: [
              "Use polite greetings and appropriate language",
              "Be patient and understanding",
              "Respect cultural differences and local customs"
            ]
          }
        ]
      },
      {
        title: "Negotiation Best Practices",
        steps: [
          {
            title: "Fair Price Negotiations",
            description: "Research market prices and negotiate fairly with sellers.",
            tips: [
              "Check multiple listings for price comparison",
              "Consider quality, freshness, and delivery costs",
              "Be prepared to explain your price reasoning"
            ]
          },
          {
            title: "Bulk Order Discussions",
            description: "For large orders, discuss logistics, payment terms, and delivery schedules.",
            tips: [
              "Ask about volume discounts for bulk purchases",
              "Clarify delivery timelines and methods",
              "Discuss quality guarantees and return policies"
            ]
          }
        ]
      },
      {
        title: "Safety Guidelines",
        steps: [
          {
            title: "Keep Conversations on Platform",
            description: "Use AgriLink's messaging system for all communications when possible.",
            tips: [
              "Platform messages are monitored for safety",
              "Easier to report issues if problems arise",
              "Built-in translation for different languages"
            ],
            warning: "Be cautious when moving conversations to external apps"
          },
          {
            title: "Share Personal Information Carefully",
            description: "Only share necessary contact details with verified users.",
            tips: [
              "Wait until you're confident about the transaction",
              "Share phone numbers only for confirmed orders",
              "Never share banking passwords or PINs"
            ]
          }
        ]
      }
    ]
  },
  'selling-guide': {
    title: "Complete Selling Guide",
    icon: <CheckCircle className="w-6 h-6" />,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    sections: [
      {
        title: "Creating Great Listings",
        steps: [
          {
            title: "High-Quality Photos",
            description: "Take clear, well-lit photos that showcase your products effectively.",
            tips: [
              "Use natural lighting when possible",
              "Show products from multiple angles",
              "Include size references (coins, hands, etc.)",
              "Keep backgrounds clean and uncluttered"
            ]
          },
          {
            title: "Detailed Descriptions",
            description: "Write comprehensive descriptions that help buyers make informed decisions.",
            tips: [
              "Include variety, origin, and growing methods",
              "Mention any certifications or quality standards",
              "Be honest about product condition and freshness",
              "Specify packaging and quantity details"
            ]
          },
          {
            title: "Competitive Pricing",
            description: "Research market prices and set competitive rates for your products.",
            tips: [
              "Check similar listings on the platform",
              "Consider your costs (farming, transport, packaging)",
              "Factor in seasonal price variations",
              "Offer bulk discounts for large orders"
            ]
          }
        ]
      },
      {
        title: "Managing Orders",
        steps: [
          {
            title: "Quick Response Times",
            description: "Respond to inquiries and messages promptly to build buyer confidence.",
            tips: [
              "Aim to respond within 2-3 hours during business hours",
              "Set up notifications for new messages",
              "Use quick replies for common questions"
            ]
          },
          {
            title: "Order Confirmation",
            description: "Confirm all order details with buyers before processing.",
            tips: [
              "Verify quantities, delivery dates, and locations",
              "Clarify payment methods and timing",
              "Discuss any special handling requirements"
            ]
          },
          {
            title: "Quality Assurance",
            description: "Ensure products meet the quality standards promised in your listings.",
            tips: [
              "Inspect products before packaging",
              "Use appropriate packaging for freshness",
              "Include handling and storage instructions"
            ]
          }
        ]
      },
      {
        title: "Building Your Reputation",
        steps: [
          {
            title: "Excellent Customer Service",
            description: "Provide outstanding service to build positive reviews and repeat customers.",
            tips: [
              "Go above and beyond buyer expectations",
              "Handle complaints professionally and quickly",
              "Follow up after delivery to ensure satisfaction"
            ]
          },
          {
            title: "Consistent Quality",
            description: "Maintain consistent product quality to build trust and reliability.",
            tips: [
              "Develop standard quality control processes",
              "Be transparent about any quality issues",
              "Continuously improve your products and service"
            ]
          }
        ]
      }
    ]
  },
  'quality-standards': {
    title: "Product Quality Guidelines",
    icon: <AlertTriangle className="w-6 h-6" />,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    sections: [
      {
        title: "Product Standards",
        steps: [
          {
            title: "Freshness Requirements",
            description: "Ensure all agricultural products meet freshness standards appropriate for their type.",
            tips: [
              "Harvest at optimal ripeness for the product type",
              "Use proper post-harvest handling techniques",
              "Store in appropriate temperature and humidity conditions",
              "Clearly indicate harvest dates and expected shelf life"
            ]
          },
          {
            title: "Grade Classification",
            description: "Classify products according to standard grading systems when applicable.",
            tips: [
              "Use Grade A for premium quality products",
              "Grade B for good quality with minor imperfections",
              "Grade C for products suitable for processing",
              "Be honest about grade classifications"
            ]
          },
          {
            title: "Packaging Standards",
            description: "Use appropriate packaging that maintains product quality and presentation.",
            tips: [
              "Use clean, food-safe packaging materials",
              "Ensure packaging is appropriate for product type",
              "Include proper labeling with product information",
              "Consider environmental impact of packaging choices"
            ]
          }
        ]
      },
      {
        title: "Safety Compliance",
        steps: [
          {
            title: "Food Safety Practices",
            description: "Follow basic food safety guidelines to protect consumer health.",
            tips: [
              "Wash hands and equipment regularly",
              "Use clean water for washing products",
              "Avoid contamination during harvesting and packaging",
              "Follow proper storage temperature guidelines"
            ],
            warning: "Always prioritize food safety - when in doubt, don't sell the product"
          },
          {
            title: "Chemical Residue Limits",
            description: "Ensure products meet acceptable limits for pesticide and chemical residues.",
            tips: [
              "Follow recommended withdrawal periods for chemicals",
              "Keep records of all chemical applications",
              "Consider organic growing methods for premium pricing",
              "Get products tested if selling to commercial buyers"
            ]
          }
        ]
      },
      {
        title: "Documentation",
        steps: [
          {
            title: "Quality Records",
            description: "Maintain records of quality control measures and product handling.",
            tips: [
              "Document harvest dates and methods",
              "Keep records of storage conditions",
              "Track any quality control checks performed",
              "Maintain customer feedback and complaint records"
            ]
          },
          {
            title: "Certification Documentation",
            description: "Obtain and maintain relevant quality certifications when possible.",
            tips: [
              "GAP (Good Agricultural Practices) certification",
              "Organic certification for organic products",
              "Fair trade certification where applicable",
              "Keep all certificates current and accessible"
            ]
          }
        ]
      }
    ]
  },
  'pricing-tips': {
    title: "Smart Pricing Strategies",
    icon: <MessageCircle className="w-6 h-6" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    sections: [
      {
        title: "Market Research",
        steps: [
          {
            title: "Competitive Analysis",
            description: "Research competitor pricing to position your products effectively in the market.",
            tips: [
              "Check similar products on AgriLink regularly",
              "Monitor local market prices in your area",
              "Consider quality differences when comparing prices",
              "Track seasonal price variations for planning"
            ]
          },
          {
            title: "Cost Calculation",
            description: "Calculate all your costs to ensure profitable pricing.",
            tips: [
              "Include farming costs (seeds, fertilizer, labor)",
              "Factor in harvesting and post-harvest costs",
              "Add transportation and packaging expenses",
              "Include a reasonable profit margin (15-30%)"
            ]
          }
        ]
      },
      {
        title: "Pricing Strategies",
        steps: [
          {
            title: "Value-Based Pricing",
            description: "Price based on the value you provide to customers, not just costs.",
            tips: [
              "Highlight unique qualities (organic, local, fresh)",
              "Emphasize superior service and reliability",
              "Consider convenience factors (delivery, packaging)",
              "Build relationships that justify premium pricing"
            ]
          },
          {
            title: "Dynamic Pricing",
            description: "Adjust prices based on demand, seasonality, and market conditions.",
            tips: [
              "Increase prices during high demand periods",
              "Offer discounts for bulk orders",
              "Use promotional pricing for new customers",
              "Adjust for quality variations (weather damage, etc.)"
            ]
          },
          {
            title: "Psychological Pricing",
            description: "Use pricing psychology to make your prices more attractive to buyers.",
            tips: [
              "Use charm pricing (1,990 MMK instead of 2,000 MMK)",
              "Bundle related products for better value perception",
              "Offer multiple quantity options with savings",
              "Present price per unit clearly for easy comparison"
            ]
          }
        ]
      },
      {
        title: "Negotiation Tactics",
        steps: [
          {
            title: "Set Negotiation Boundaries",
            description: "Know your minimum acceptable price before entering negotiations.",
            tips: [
              "Calculate your absolute minimum profitable price",
              "Consider non-price factors (payment terms, delivery)",
              "Be willing to walk away from unprofitable deals",
              "Use time limits to create urgency when appropriate"
            ]
          },
          {
            title: "Win-Win Negotiations",
            description: "Aim for mutually beneficial agreements that build long-term relationships.",
            tips: [
              "Listen to buyer needs and constraints",
              "Offer multiple options (quantity, quality, timing)",
              "Consider long-term partnerships for stable pricing",
              "Be transparent about your costs and limitations"
            ]
          }
        ]
      }
    ]
  }
};

export function HelpDetailView({ isOpen, onClose, helpType, currentUser }: HelpDetailViewProps) {
  const [expandedSection, setExpandedSection] = useState<number | null>(0);
  
  if (!helpType || !HELP_CONTENT[helpType]) {
    return null;
  }

  const content = HELP_CONTENT[helpType];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className={`${content.bgColor} ${content.borderColor} border-b p-6`}>
          <div className="flex items-center gap-3">
            <div className={`${content.color}`}>
              {content.icon}
            </div>
            <div>
              <DialogTitle className="text-xl">{content.title}</DialogTitle>
              <DialogDescription className="text-base mt-1">
                Complete guide to help you succeed on AgriLink
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] p-6">
          <div className="space-y-6">
            {content.sections.map((section, sectionIndex) => (
              <Card key={sectionIndex} className="border-2">
                <CardHeader
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedSection(
                    expandedSection === sectionIndex ? null : sectionIndex
                  )}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full ${content.bgColor} ${content.color} flex items-center justify-center text-sm font-bold`}>
                        {sectionIndex + 1}
                      </span>
                      {section.title}
                    </CardTitle>
                    <ChevronRight 
                      className={`w-5 h-5 transition-transform duration-200 ${
                        expandedSection === sectionIndex ? 'rotate-90' : ''
                      }`} 
                    />
                  </div>
                </CardHeader>
                
                {expandedSection === sectionIndex && (
                  <CardContent className="pt-0">
                    <div className="space-y-6">
                      {section.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full ${content.bgColor} ${content.color} flex items-center justify-center text-sm font-bold mt-1`}>
                              {stepIndex + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-base">{step.title}</h4>
                              <p className="text-muted-foreground mt-1">{step.description}</p>
                            </div>
                          </div>
                          
                          {step.warning && (
                            <div className="ml-11 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-800">{step.warning}</p>
                              </div>
                            </div>
                          )}
                          
                          {step.tips && step.tips.length > 0 && (
                            <div className="ml-11 space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">💡 Pro Tips:</p>
                              <ul className="space-y-1">
                                {step.tips.map((tip, tipIndex) => (
                                  <li key={tipIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {stepIndex < section.steps.length - 1 && (
                            <div className="ml-11">
                              <Separator className="my-4" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
            
            {/* Additional Resources */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  Need More Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  If you still have questions after reading this guide, our support team is here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Contact Support
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Watch Video Tutorial
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
        
        <div className="p-6 border-t bg-muted/20">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <Button onClick={onClose} variant="outline">
              Close Guide
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}