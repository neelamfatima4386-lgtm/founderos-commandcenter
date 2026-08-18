import { useNavigate } from "@tanstack/react-router";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useActivity, useContent, useLeads, useNotes, useTasks } from "@/lib/data";

export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const navigate = useNavigate();
  const { data: leads = [] } = useLeads();
  const { data: tasks = [] } = useTasks();
  const { data: content = [] } = useContent();
  const { data: notes = [] } = useNotes();
  const { data: activity = [] } = useActivity();

  const go = (to: string) => {
    onOpenChange(false);
    void navigate({ to });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search leads, tasks, content, notes, activity…" />
      <CommandList>
        <CommandEmpty>No matches found.</CommandEmpty>

        <CommandGroup heading="Leads">
          {leads.slice(0, 30).map((lead) => (
            <CommandItem
              key={lead.id}
              value={`${lead.business_name} ${lead.industry ?? ""} ${lead.location ?? ""}`}
              onSelect={() => go(`/leads/${lead.id}`)}
            >
              {lead.business_name}
              <span className="ml-auto text-xs text-muted-foreground">{lead.industry}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Tasks">
          {tasks.slice(0, 30).map((task) => (
            <CommandItem key={task.id} value={task.title} onSelect={() => go("/tasks")}>
              {task.title}
              <span className="ml-auto text-xs text-muted-foreground">{task.status}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Content">
          {content.slice(0, 30).map((item) => (
            <CommandItem key={item.id} value={item.title} onSelect={() => go("/content")}>
              {item.title}
              <span className="ml-auto text-xs text-muted-foreground">{item.status}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Notes">
          {notes.slice(0, 30).map((note) => (
            <CommandItem key={note.id} value={`${note.title} ${note.body ?? ""}`} onSelect={() => go("/notes")}>
              {note.title}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Activity">
          {activity.slice(0, 20).map((entry) => (
            <CommandItem
              key={entry.id}
              value={entry.description ?? entry.action}
              onSelect={() => go("/activity")}
            >
              {entry.description ?? entry.action}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
