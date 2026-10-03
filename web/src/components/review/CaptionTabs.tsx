import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// The two captions of a post: Instagram and LinkedIn, one tab each.
export function CaptionTabs({ instagram, linkedin }: { instagram: string | null; linkedin: string | null }) {
  return (
    <Tabs defaultValue="instagram" className="min-w-0">
      <TabsList>
        <TabsTrigger value="instagram">Instagram</TabsTrigger>
        <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
      </TabsList>
      <TabsContent value="instagram"><p className="whitespace-pre-wrap text-sm">{instagram || "No caption yet."}</p></TabsContent>
      <TabsContent value="linkedin"><p className="whitespace-pre-wrap text-sm">{linkedin || "No caption yet."}</p></TabsContent>
    </Tabs>
  );
}
