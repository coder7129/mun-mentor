import { Link } from "react-router-dom";
import { ChevronRight, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Project } from "@/types/mun";
import { format } from "date-fns";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link to={`/project/${project.id}`}>
      <Card className="group hover:shadow-diplomatic transition-all duration-200 border-border/60 hover:border-primary/30">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <p className="text-muted-foreground text-sm mt-1 truncate">
                {project.committee} • {project.topic}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3">
                <Calendar className="h-3.5 w-3.5" />
                <span>{format(new Date(project.created_at), "MMM d, yyyy")}</span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
