import { useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Sparkles, Save, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { CopyButton } from "@/components/ui/copy-button";
import { useProject } from "@/hooks/useProjects";
import { useSources, useSaveSource } from "@/hooks/useSources";
import { useGenerate } from "@/hooks/useGenerate";
import { Skeleton } from "@/components/ui/skeleton";

export default function Resolutions() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading: projectLoading } = useProject(id);
  const { data: sources, isLoading: sourcesLoading } = useSources(id);
  const saveSource = useSaveSource();
  const { generate, isLoading, result, setResult } = useGenerate();

  const mainResolution = sources?.find(s => s.type === "main_resolution");
  const coResolution = sources?.find(s => s.type === "co_resolution");

  const [mainText, setMainText] = useState(mainResolution?.text || "");
  const [coText, setCoText] = useState(coResolution?.text || "");
  const [activeMode, setActiveMode] = useState<string | null>(null);

  // Update form when data loads
  useState(() => {
    if (mainResolution) setMainText(mainResolution.text);
    if (coResolution) setCoText(coResolution.text);
  });

  const handleSaveMain = async () => {
    if (!id) return;
    await saveSource.mutateAsync({ project_id: id, type: "main_resolution", text: mainText });
  };

  const handleSaveCo = async () => {
    if (!id) return;
    await saveSource.mutateAsync({ project_id: id, type: "co_resolution", text: coText });
  };

  const handleGenerate = async (mode: string) => {
    if (!id) return;
    
    setActiveMode(mode);
    setResult(null);
    
    try {
      await generate({
        project_id: id,
        mode: mode as "amend_recommend" | "amend_for" | "amend_against",
        amendment_text: mainText || coText,
      });
    } catch {
      // Error handled in hook
    }
  };

  if (projectLoading || sourcesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <PageHeader title="Resolutions" backTo="/" />
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

  const tools = [
    {
      id: "amend_recommend",
      title: "Recommend Amendments",
      description: "Propose 3-6 amendments with reasoning",
    },
    {
      id: "amend_for",
      title: "Amendment Speech FOR",
      description: "Support an amendment",
    },
    {
      id: "amend_against",
      title: "Amendment Speech AGAINST",
      description: "Oppose an amendment",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageHeader 
        title="Resolutions & Amendments" 
        subtitle={project.name}
        backTo={`/project/${id}`}
        backLabel="Project"
      />

      <main className="container py-8 animate-fade-in">
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Main-Sponsored Resolution
              </CardTitle>
              <CardDescription>Optional - paste the resolution text</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste the main-sponsored resolution text here..."
                className="min-h-[200px] font-mono text-sm"
                value={mainText}
                onChange={(e) => setMainText(e.target.value)}
              />
              <Button 
                onClick={handleSaveMain} 
                variant="outline" 
                className="w-full gap-2"
                disabled={saveSource.isPending}
              >
                {saveSource.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Resolution
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Co-Sponsored Resolution
              </CardTitle>
              <CardDescription>Optional - paste the resolution text</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste the co-sponsored resolution text here..."
                className="min-h-[200px] font-mono text-sm"
                value={coText}
                onChange={(e) => setCoText(e.target.value)}
              />
              <Button 
                onClick={handleSaveCo} 
                variant="outline" 
                className="w-full gap-2"
                disabled={saveSource.isPending}
              >
                {saveSource.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Resolution
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Amendment Tools</CardTitle>
            <CardDescription>
              Generate amendment recommendations and speeches based on your resolutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {tools.map((tool) => (
                <Button
                  key={tool.id}
                  onClick={() => handleGenerate(tool.id)}
                  disabled={isLoading && activeMode === tool.id}
                  variant={activeMode === tool.id && result ? "secondary" : "outline"}
                  className="h-auto py-4 flex-col gap-1"
                >
                  {isLoading && activeMode === tool.id ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                  <span className="font-medium">{tool.title}</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {tool.description}
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card className="animate-fade-in">
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <CardTitle>Generated Output</CardTitle>
              <CopyButton text={result} variant="outline" size="sm" />
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap font-sans text-sm bg-muted/50 p-4 rounded-lg">
                {result}
              </pre>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
