import { Link, useParams } from "react-router-dom";
import { FileText, Users, Wrench, BookOpen, Save, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { useProject } from "@/hooks/useProjects";
import { useCountryProfile } from "@/hooks/useCountryProfiles";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectHome() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading } = useProject(id);
  const { data: profile } = useCountryProfile(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <PageHeader title="Project Not Found" backTo="/" backLabel="Dashboard" />
        <main className="container py-8">
          <p className="text-muted-foreground">This project doesn't exist or was deleted.</p>
        </main>
      </div>
    );
  }

  const sections = [
    {
      title: "Delegation",
      description: profile 
        ? `${profile.country} - Profile ready` 
        : "Select country and generate profile",
      icon: Users,
      href: `/project/${id}/delegation`,
      status: profile ? "complete" : "pending",
    },
    {
      title: "Toolbox",
      description: "Speeches, yields, POIs, topic explainer",
      icon: Wrench,
      href: `/project/${id}/toolbox`,
      status: profile ? "ready" : "locked",
    },
    {
      title: "Resolutions & Amendments",
      description: "Work with resolution texts",
      icon: BookOpen,
      href: `/project/${id}/resolutions`,
      status: "ready",
    },
    {
      title: "Saved Outputs",
      description: "View all generated content",
      icon: Save,
      href: `/project/${id}/outputs`,
      status: "ready",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageHeader 
        title={project.name}
        subtitle={`${project.committee} • ${project.topic}`}
        backTo="/"
        backLabel="Dashboard"
      />

      <main className="container py-8 animate-fade-in">
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <Link 
              key={section.title} 
              to={section.href}
              className={section.status === "locked" ? "pointer-events-none" : ""}
            >
              <Card className={`h-full transition-all duration-200 ${
                section.status === "locked" 
                  ? "opacity-50" 
                  : "hover:shadow-diplomatic hover:border-primary/30 cursor-pointer"
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      section.status === "complete" 
                        ? "bg-emerald-100 dark:bg-emerald-900/30" 
                        : "bg-muted"
                    }`}>
                      <section.icon className={`h-5 w-5 ${
                        section.status === "complete" 
                          ? "text-emerald-600 dark:text-emerald-400" 
                          : "text-muted-foreground"
                      }`} />
                    </div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{section.description}</CardDescription>
                  {section.status === "locked" && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      Complete delegation setup first
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-base">Chair Report Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-6 whitespace-pre-wrap">
              {project.chair_report}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
