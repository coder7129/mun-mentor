import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCreateProject } from "@/hooks/useProjects";

export default function NewProject() {
  const navigate = useNavigate();
  const createProject = useCreateProject();
  
  const [form, setForm] = useState({
    name: "",
    committee: "",
    topic: "",
    chair_report: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.committee || !form.topic || !form.chair_report) {
      return;
    }

    try {
      const project = await createProject.mutateAsync(form);
      navigate(`/project/${project.id}/delegation`);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isValid = form.name && form.committee && form.topic && form.chair_report;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageHeader 
        title="New Project" 
        subtitle="Set up your debate preparation"
        backTo="/"
        backLabel="Dashboard"
      />

      <main className="container py-8 max-w-2xl animate-fade-in">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Enter the committee information and paste the Chair Report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., DISEC Fall Conference"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="committee">Committee</Label>
                  <Input
                    id="committee"
                    placeholder="e.g., DISEC, ECOSOC, UNHRC"
                    value={form.committee}
                    onChange={(e) => setForm({ ...form, committee: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Nuclear Disarmament"
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chair_report">Chair Report</Label>
                <p className="text-sm text-muted-foreground">
                  Paste the complete Chair Report. This is your source of truth for all generated content.
                </p>
                <Textarea
                  id="chair_report"
                  placeholder="Paste the full Chair Report here..."
                  className="min-h-[300px] font-mono text-sm"
                  value={form.chair_report}
                  onChange={(e) => setForm({ ...form, chair_report: e.target.value })}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full gap-2" 
                size="lg"
                disabled={!isValid || createProject.isPending}
              >
                {createProject.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save & Continue
              </Button>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  );
}
