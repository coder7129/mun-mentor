import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { Output } from "@/types/mun";

interface OutputCardProps {
  output: Output;
  expanded?: boolean;
  onClick?: () => void;
}

const typeLabels: Record<string, string> = {
  country_profile: "Country Profile",
  opening_speech: "Opening Speech",
  yield_for: "Yield FOR",
  yield_against: "Yield AGAINST",
  pois: "POIs",
  explain_topic: "Topic Explainer",
  amend_recommend: "Amendment Recommendations",
  amend_for: "Amendment Speech FOR",
  amend_against: "Amendment Speech AGAINST",
};

const typeColors: Record<string, string> = {
  country_profile: "bg-blue-100 text-blue-800",
  opening_speech: "bg-purple-100 text-purple-800",
  yield_for: "bg-green-100 text-green-800",
  yield_against: "bg-red-100 text-red-800",
  pois: "bg-orange-100 text-orange-800",
  explain_topic: "bg-teal-100 text-teal-800",
  amend_recommend: "bg-indigo-100 text-indigo-800",
  amend_for: "bg-emerald-100 text-emerald-800",
  amend_against: "bg-rose-100 text-rose-800",
};

export function OutputCard({ output, expanded = false, onClick }: OutputCardProps) {
  return (
    <Card 
      className={`transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-diplomatic hover:border-primary/30' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <Badge className={typeColors[output.type] || "bg-gray-100 text-gray-800"}>
            {typeLabels[output.type] || output.type}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {format(new Date(output.created_at), "MMM d, h:mm a")}
          </span>
        </div>
        <CopyButton text={output.result_text} />
      </CardHeader>
      <CardContent>
        <div className={`text-sm whitespace-pre-wrap ${expanded ? '' : 'line-clamp-4'}`}>
          {output.result_text}
        </div>
      </CardContent>
    </Card>
  );
}
