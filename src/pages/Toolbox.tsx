import { useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Sparkles, Mic, MessageSquare, HelpCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { CopyButton } from "@/components/ui/copy-button";
import { useProject } from "@/hooks/useProjects";
import { useCountryProfile } from "@/hooks/useCountryProfiles";
import { useGenerate } from "@/hooks/useGenerate";
import { Skeleton } from "@/components/ui/skeleton";

type SpeechTone = "legal" | "aggressive" | "calm" | "cold";
type SpeechLength = 60 | 90 | 120;

export default function Toolbox() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading: projectLoading } = useProject(id);
  const { data: profile, isLoading: profileLoading } = useCountryProfile(id);
  const { generate, isLoading, result, setResult } = useGenerate();

  const [speechTone, setSpeechTone] = useState<SpeechTone>("calm");
  const [speechLength, setSpeechLength] = useState<SpeechLength>(90);
  const [activeMode, setActiveMode] = useState<string | null>(null);

  const handleGenerate = async (mode: string) => {
    if (!id) return;
    
    setActiveMode(mode);
    setResult(null);
    
    const request: Record<string, unknown> = { project_id: id, mode };
    
    if (mode === "opening_speech") {
      request.tone = speechTone;
      request.length = speechLength;
    }
    
    try {
      await generate(request as { project_id: string; mode: "opening_speech" | "yield_for" | "yield_against" | "pois" | "explain_topic" });
    } catch {
      // Error handled in hook
    }
  };

  if (projectLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <PageHeader title="Toolbox" backTo="/" />
        <main className="container py-8">
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <PageHeader 
          title="Toolbox" 
          subtitle={project.name}
          backTo={`/project/${id}`}
          backLabel="Project"
        />
        <main className="container py-8 max-w-2xl">
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
            <CardContent className="py-6">
              <p className="text-amber-800 dark:text-amber-200">
                Please complete the delegation setup first before using the toolbox.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const tools = [
    {
      id: "opening_speech",
      title: "Opening Speech",
      description: "Generate a structured opening speech",
      icon: Mic,
      hasOptions: true,
    },
    {
      id: "yield_for",
      title: "Yield FOR",
      description: "Rapid-fire lines, 2-question traps, and POIs to support",
      icon: MessageSquare,
    },
    {
      id: "yield_against",
      title: "Yield AGAINST",
      description: "Rapid-fire lines, 2-question traps, and POIs to oppose",
      icon: MessageSquare,
    },
    {
      id: "pois",
      title: "Points of Information",
      description: "6 offensive + 6 defensive POIs",
      icon: HelpCircle,
    },
    {
      id: "explain_topic",
      title: "Explain Topic",
      description: "Definitions, core debate, arguments, misconceptions",
      icon: BookOpen,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageHeader 
        title="Toolbox" 
        subtitle={`${project.name} • ${profile?.country}`}
        backTo={`/project/${id}`}
        backLabel="Project"
      />

      <main className="container py-8 animate-fade-in">
        <div className="grid gap-4 lg:grid-cols-2">
          {tools.map((tool) => (
            <Card key={tool.id} className={activeMode === tool.id && result ? "ring-2 ring-primary" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <tool.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{tool.title}</CardTitle>
                    <CardDescription className="text-xs">{tool.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {tool.hasOptions && (
                  <div className="grid gap-3 grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Length</Label>
                      <Select 
                        value={speechLength.toString()} 
                        onValueChange={(v) => setSpeechLength(parseInt(v) as SpeechLength)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="60">60 seconds</SelectItem>
                          <SelectItem value="90">90 seconds</SelectItem>
                          <SelectItem value="120">120 seconds</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Tone</Label>
                      <Select 
                        value={speechTone} 
                        onValueChange={(v) => setSpeechTone(v as SpeechTone)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="legal">Legal</SelectItem>
                          <SelectItem value="aggressive">Aggressive</SelectItem>
                          <SelectItem value="calm">Calm</SelectItem>
                          <SelectItem value="cold">Cold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={() => handleGenerate(tool.id)}
                  disabled={isLoading && activeMode === tool.id}
                  className="w-full gap-2"
                  variant={activeMode === tool.id && result ? "secondary" : "default"}
                >
                  {isLoading && activeMode === tool.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Generate
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {result && (
          <Card className="mt-8 animate-fade-in">
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <CardTitle>Generated Output</CardTitle>
              <CopyButton text={result} variant="outline" size="sm" />
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm bg-muted/50 p-4 rounded-lg">
                  {result}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
