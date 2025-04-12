import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyDoctors() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-primary/10 p-4">
        <Stethoscope className="h-8 w-8 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No doctors found</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Try adjusting your search or filter criteria
      </p>
      <Button variant="outline" className="mt-4">
        Clear Filters
      </Button>
    </div>
  );
} 