"use client";

// Portfolio homepage. Chat is the default, first tab — visible on load with
// no click, per docs/adr/0004-chat-first-homepage.md. Other tabs hold the
// CV sections. Layout promoted from the winning prototype variant (C); see
// docs/adr/0005-brand-palette-60-30-10.md for the color system.

import { useTranslations } from "next-intl";
import { ChatPanel } from "@/components/chat-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockCv } from "@/lib/mock-cv";

export default function Home() {
  const cv = mockCv;
  const t = useTranslations("Tabs");

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <header className="mb-8">
        <h1 className="text-xl font-semibold text-foreground">{cv.name}</h1>
        <p className="text-sm text-muted-foreground">{cv.title}</p>
      </header>

      <Tabs defaultValue="chat">
        <TabsList>
          <TabsTrigger value="chat">{t("chat")}</TabsTrigger>
          <TabsTrigger value="experience">{t("experience")}</TabsTrigger>
          <TabsTrigger value="skills">{t("skills")}</TabsTrigger>
          <TabsTrigger value="languages">{t("languages")}</TabsTrigger>
          <TabsTrigger value="hobbies">{t("hobbies")}</TabsTrigger>
          <TabsTrigger value="contacts">{t("contacts")}</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="pt-4">
          <ChatPanel />
        </TabsContent>

        <TabsContent value="experience" className="space-y-3 pt-4">
          {cv.experiences.map((exp) => (
            <Card key={exp.role + exp.context}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {exp.role} · {exp.context}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{exp.period}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{exp.description}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="skills" className="pt-4">
          <div className="flex flex-wrap gap-2">
            {cv.skills.map((s) => (
              <Badge key={s} variant="secondary">
                {s}
              </Badge>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="languages" className="space-y-1 pt-4">
          {cv.languages.map((l) => (
            <div key={l.name} className="flex justify-between text-sm">
              <span>{l.name}</span>
              <span className="text-muted-foreground">{l.level}</span>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="hobbies" className="pt-4">
          <div className="flex flex-wrap gap-2">
            {cv.hobbies.map((h) => (
              <Badge key={h} variant="outline" className="border-secondary-alt text-text">
                {h}
              </Badge>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-1 pt-4">
          {cv.contacts.map((c) => (
            <a key={c.label} href={c.href} className="block text-sm hover:underline">
              {c.label}: {c.value}
            </a>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
