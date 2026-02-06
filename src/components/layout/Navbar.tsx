import { Link } from "react-router-dom";
import { Scale } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b bg-primary text-primary-foreground">
      <div className="container flex h-14 items-center">
        <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <Scale className="h-5 w-5" />
          <span>MUN Coach</span>
        </Link>
      </div>
    </nav>
  );
}
