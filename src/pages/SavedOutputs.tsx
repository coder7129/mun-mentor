import { useState } from "react";
import { useParams } from "react-router-dom";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { OutputCard } from "@/components/project/OutputCard";
import { useProject } from "@/hooks/useProjects";
import { useOutputs } from "@/hooks/useOutputs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CopyButton } from "@/components/ui/copy-button";
import { Output } from "@/types/mun";

const outputTypes = [
  { value: "all", label: "All Types" },
  { value: "country_profile", label: "Country Profile" },
  { value: "opening_speech", label: "Opening Speech" },
  { value: "yield_for", label: "Yield FOR" },
  { value: "yield_against", label: "Yield AGAINST" },
  { value: "pois", label: "POIs" },
  { value: "explain_topic", label: "Topic Explainer" },
  { value: "amend_recommend", label: "Amendment Recommendations" },
  { value: "amend_for", label: "Amendment FOR" },
  { value: "amend_against", label: "Amendment AGAINST" },
];

export default function SavedOutputs() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading: projectLoading } = useProject(id);
  const { data: outputs, isLoading: outputsLoading } = useOutputs(id);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedOutput, setSelectedOutput] = useState<Output | null>(null);

  if (projectLoading || outputsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <PageHeader title="Saved Outputs" backTo="/" />
        <main className="container py-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
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

  const filteredOutputs = outputs?.filter((output) => {
    const matchesType = typeFilter === "all" || output.type === typeFilter;
    const matchesSearch = !search || 
      output.result_text.toLowerCase().includes(search.toLowerCase()) ||
      output.type.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  }) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageHeader 
        title="Saved Outputs" 
        subtitle={`${project.name} • ${outputs?.length || 0} items`}
        backTo={`/project/${id}`}
        backLabel="Project"
      />

      <main className="container py-8 animate-fade-in">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search outputs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {outputTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredOutputs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground text-center">
                {outputs?.length === 0 
                  ? "No outputs generated yet. Use the Toolbox to create content."
                  : "No outputs match your search criteria."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOutputs.map((output) => (
              <OutputCard 
                key={output.id} 
                output={output} 
                onClick={() => setSelectedOutput(output)}
              />
            ))}
          </div>
        )}

        <Dialog open={!!selectedOutput} onOpenChange={() => setSelectedOutput(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader className="flex-row items-start justify-between space-y-0">
              <DialogTitle>
                {outputTypes.find(t => t.value === selectedOutput?.type)?.label || selectedOutput?.type}
              </DialogTitle>
              {selectedOutput && (
                <CopyButton text={selectedOutput.result_text} variant="outline" size="sm" />
              )}
            </DialogHeader>
            <div className="mt-4">
              <pre className="whitespace-pre-wrap font-sans text-sm bg-muted/50 p-4 rounded-lg">
                {selectedOutput?.result_text}
              </pre>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
