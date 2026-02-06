import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { CopyButton } from "@/components/ui/copy-button";
import { useProject } from "@/hooks/useProjects";
import { useCountryProfile } from "@/hooks/useCountryProfiles";
import { useGenerate } from "@/hooks/useGenerate";
import { Skeleton } from "@/components/ui/skeleton";

export default function Delegation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading: projectLoading } = useProject(id);
  const { data: existingProfile, isLoading: profileLoading } = useCountryProfile(id);
  const { generate, isLoading: generating, result } = useGenerate();
  
  const [country, setCountry] = useState("");

  const handleGenerate = async () => {
    if (!id || !country.trim()) return;
    
    await generate(
      { project_id: id, mode: "country_profile" },
      country.trim()
    );
  };

  if (projectLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <PageHeader title="Delegation" backTo="/" backLabel="Dashboard" />
        <main className="container py-8 max-w-2xl">
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <PageHeader title="Project Not Found" backTo="/" backLabel="Dashboard" />
      </div>
    );
  }

  const profile = existingProfile?.profile_json;
  const displayCountry = existingProfile?.country || country;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageHeader 
        title="Delegation" 
        subtitle={project.name}
        backTo={`/project/${id}`}
        backLabel="Project"
      />

      <main className="container py-8 max-w-2xl animate-fade-in">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Your Country</CardTitle>
            <CardDescription>
              Enter the country or delegation you're representing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country/Delegation</Label>
              <div className="flex gap-2">
                <Input
                  id="country"
                  placeholder="e.g., United States, France, NGO name..."
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={!!existingProfile}
                />
                {!existingProfile && (
                  <Button 
                    onClick={handleGenerate} 
                    disabled={!country.trim() || generating}
                    className="gap-2 shrink-0"
                  >
                    {generating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Generate Profile
                  </Button>
                )}
              </div>
            </div>

            {existingProfile && (
              <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                <Check className="h-4 w-4" />
                Profile already generated for {existingProfile.country}
              </div>
            )}
          </CardContent>
        </Card>

        {profile && (
          <Card className="animate-fade-in">
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>{displayCountry} Profile</CardTitle>
                <CardDescription>Based on Chair Report analysis</CardDescription>
              </div>
              <CopyButton 
                text={JSON.stringify(profile, null, 2)} 
                variant="outline" 
                size="sm"
              />
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">UN Behavior Style</h4>
                <Badge variant="secondary" className="text-sm">
                  {profile.behavior_style}
                </Badge>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Key Priorities</h4>
                <ul className="space-y-1">
                  {profile.priorities?.map((p: string, i: number) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-primary font-medium">{i + 1}.</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Red Lines</h4>
                <ul className="space-y-1">
                  {profile.red_lines?.map((r: string, i: number) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-destructive font-medium">✕</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Likely Allies</h4>
                  <p className="text-sm">{profile.allies || "Unknown"}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Likely Opponents</h4>
                  <p className="text-sm">{profile.opponents || "Unknown"}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Stance Summary</h4>
                <p className="text-sm">{profile.stance_summary}</p>
              </div>

              {profile.anchors && profile.anchors.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    Anchors from Chair Report
                  </h4>
                  <ul className="space-y-2">
                    {profile.anchors.map((anchor: string, i: number) => (
                      <li key={i} className="text-sm italic text-muted-foreground border-l-2 border-primary/30 pl-3">
                        "{anchor}"
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={() => navigate(`/project/${id}/toolbox`)} disabled={!existingProfile}>
            Continue to Toolbox
          </Button>
        </div>
      </main>
    </div>
  );
}
