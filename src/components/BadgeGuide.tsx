import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  UserBadge, 
  BadgeExplanation, 
  USER_TYPES, 
  VERIFICATION_LEVELS,
  SPECIALTY_BADGES
} from "./UserBadgeSystem";
import { Button } from "./ui/button";
import { 
  Shield, 
  ChevronLeft, 
  Info, 
  Star,
  CheckCircle,
  Award
} from "lucide-react";

interface BadgeGuideProps {
  onBack?: () => void;
}

export function BadgeGuide({ onBack }: BadgeGuideProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            AgriLink Badge System
          </h1>
          <p className="text-muted-foreground">
            6 account types supporting Myanmar's diverse agricultural community - from individual farmers to registered businesses
          </p>
        </div>
      </div>

      {/* Overview */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Why Badges Matter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            AgriLink's badge system helps build trust in Myanmar's agricultural marketplace by clearly 
            showing user types, verification levels, and specialties. This transparency helps buyers 
            make informed decisions and sellers build credibility.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-medium">Trust Building</h4>
              <p className="text-sm text-muted-foreground">
                Clear verification levels help build confidence between buyers and sellers
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-medium">Identity Clarity</h4>
              <p className="text-sm text-muted-foreground">
                Easy identification of farmers, traders, cooperatives, and other user types
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-medium">Quality Indicators</h4>
              <p className="text-sm text-muted-foreground">
                Specialty badges highlight certifications and agricultural practices
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* The 6 Account Types System */}
      <Card>
        <CardHeader>
          <CardTitle>AgriLink's 6 Account Types</CardTitle>
          <p className="text-sm text-muted-foreground">
            Farmer • Trader • Buyer (each can choose Individual or Business account)
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Account Type Explanation */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-3">Individual vs Business Accounts</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <h5 className="font-medium text-green-700">Individual Account</h5>
                  <p className="text-sm text-muted-foreground mt-1">
                    Personal activities without formal business registration. Supports Myanmar's informal agricultural economy.
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <strong>Badge:</strong> Just user type (Farmer, Trader, Buyer)<br/>
                    <strong>Verification:</strong> Myanmar ID/NRC only
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <h5 className="font-medium text-primary">Business Account</h5>
                  <p className="text-sm text-muted-foreground mt-1">
                    Registered businesses with formal documentation. Higher trust level for commercial operations.
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <strong>Badge:</strong> 🏢 User type + verification status<br/>
                    <strong>Verification:</strong> Myanmar ID/NRC + Business License
                  </div>
                </div>
              </div>
            </div>

            {/* The 6 Account Types */}
            <div>
              <h4 className="font-medium mb-3">All 6 Account Type Combinations</h4>
              <div className="grid gap-3">
                {Object.values(USER_TYPES)
                  .filter(userType => userType.key !== 'admin')
                  .map((userType) => (
                    <div key={userType.key} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <userType.icon className="w-5 h-5 text-muted-foreground" />
                        <h5 className="font-medium">{userType.label}</h5>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-3">
                        {/* Individual Account */}
                        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <UserBadge userType={userType.key} accountType="individual" size="sm" />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Personal {userType.key} account
                          </p>
                        </div>
                        
                        {/* Business Account */}
                        <div className="bg-primary/5 border border-primary/20 rounded p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <UserBadge userType={userType.key} accountType="business" size="sm" />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Registered {userType.key} business (note the 🏢 building icon)
                          </p>
                        </div>
                      </div>
                      
                      {/* Examples */}
                      <div className="mt-3 text-xs text-muted-foreground">
                        {userType.key === 'farmer' && (
                          <>
                            <strong>Personal:</strong> Small rice farm, family vegetable garden<br/>
                            <strong>Business:</strong> Commercial plantation, agricultural company
                          </>
                        )}
                        {userType.key === 'trader' && (
                          <>
                            <strong>Personal:</strong> Local market vendor, small distributor<br/>
                            <strong>Business:</strong> Export company, wholesale distribution business
                          </>
                        )}
                        {userType.key === 'buyer' && (
                          <>
                            <strong>Personal:</strong> Restaurant owner, individual consumer<br/>
                            <strong>Business:</strong> Food processing company, retail chain
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                
                {/* Admin Account */}
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <h5 className="font-medium">Platform Administrator</h5>
                  </div>
                  <UserBadge userType="admin" size="sm" className="mb-2" />
                  <p className="text-xs text-muted-foreground">
                    AgriLink platform administrators with system management privileges
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Levels */}
      <Card>
        <CardHeader>
          <CardTitle>Verification & Trust Levels</CardTitle>
          <p className="text-sm text-muted-foreground">
            Progressive verification system designed for Myanmar's diverse agricultural community
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.values(VERIFICATION_LEVELS)
              .filter(level => level.key !== 'under-review')
              .sort((a, b) => a.level - b.level)
              .map((level, index) => (
                <div key={level.key} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="text-2xl font-bold text-muted-foreground">
                      {index + 1}
                    </div>
                    <UserBadge 
                      userType="farmer" 
                      accountType={level.key === 'business-verified' ? 'business' : 'individual'}
                      verificationLevel={level.key}
                      size="sm"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{level.label}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {level.description}
                    </p>
                    

                    
                    {/* Requirements */}
                    <div className="mt-3">
                      <div className="text-xs font-medium text-muted-foreground mb-1">Requirements:</div>
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        {level.requirements.map((req, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-primary rounded-full flex-shrink-0"></span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Specialty Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Specialty & Quality Badges</CardTitle>
          <p className="text-sm text-muted-foreground">
            Additional badges that highlight specific certifications and practices
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(SPECIALTY_BADGES).map(([key, specialty]) => (
              <div key={key} className="flex items-center gap-3 p-3 border rounded-lg">
                <Badge 
                  variant="outline"
                  className={`${specialty.color} ${specialty.bgColor} ${specialty.borderColor} flex items-center gap-1.5`}
                >
                  <specialty.icon className="w-3 h-3" />
                  {specialty.label}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  {key === 'organic-certified' && 'Certified organic farming practices'}
                  {key === 'export-ready' && 'Meets international export standards'}
                  {key === 'local-champion' && 'Strong local community presence'}
                  {key === 'sustainable' && 'Environmentally sustainable methods'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Considerations */}
      <Card className="border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10">
        <CardHeader>
          <CardTitle className="text-primary">
            Mobile-First Design
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-primary">
            AgriLink badges are designed for Myanmar's mobile-first agricultural community:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-primary mb-2">
                Mobile Optimization
              </h4>
              <ul className="text-sm text-primary/80 space-y-1">
                <li>• Touch-friendly badge sizes</li>
                <li>• Clear icons for low-literacy users</li>
                <li>• Consistent color coding</li>
                <li>• Minimal data usage</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-primary mb-2">
                Cultural Sensitivity
              </h4>
              <ul className="text-sm text-primary/80 space-y-1">
                <li>• Respects traditional farming</li>
                <li>• Supports informal businesses</li>
                <li>• Multiple verification paths</li>
                <li>• Local agricultural roles</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Badge Examples in Action</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">New Individual Farmer (Unverified)</h4>
              <div className="flex flex-wrap gap-2 mb-2">
                <UserBadge 
                  userType="farmer" 
                  accountType="individual"
                  verificationLevel="unverified" 
                  size="md" 
                />
              </div>
              <p className="text-sm text-muted-foreground">
                New farmer account - clearly shows "Unverified" status. All accounts display verification level for transparency.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Individual Rice Farmer (Verified)</h4>
              <div className="flex flex-wrap gap-2 mb-2">
                <UserBadge 
                  userType="farmer" 
                  accountType="individual"
                  verificationLevel="id-verified" 
                  specialties={['sustainable']}
                  size="md" 
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Individual farmer with ID verification - trusted for direct sales. Clean badge without business designation.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Business Agricultural Trader</h4>
              <div className="flex flex-wrap gap-2 mb-2">
                <UserBadge 
                  userType="trader" 
                  accountType="business"
                  verificationLevel="business-verified" 
                  specialties={['export-ready']}
                  size="md" 
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Registered business trader with full verification. Note the 🏢 building icon indicating formal business registration.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Individual Restaurant Buyer</h4>
              <div className="flex flex-wrap gap-2 mb-2">
                <UserBadge 
                  userType="buyer" 
                  accountType="individual"
                  verificationLevel="id-verified" 
                  size="md" 
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Individual restaurant owner verified for trusted purchasing. Clean badge without business designation.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">New Business Trader (Unverified)</h4>
              <div className="flex flex-wrap gap-2 mb-2">
                <UserBadge 
                  userType="trader" 
                  accountType="business"
                  verificationLevel="unverified" 
                  size="md" 
                />
              </div>
              <p className="text-sm text-muted-foreground">
                New business trader account - shows both 🏢 building icon and "Unverified" status for complete transparency.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Business Food Processing Company (Verified)</h4>
              <div className="flex flex-wrap gap-2 mb-2">
                <UserBadge 
                  userType="buyer" 
                  accountType="business"
                  verificationLevel="business-verified" 
                  specialties={['organic-certified', 'export-ready']}
                  size="md" 
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Registered food processing business with certifications. 🏢 Building icon shows formal registration status.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Badge Explanation */}
      <BadgeExplanation />
    </div>
  );
}