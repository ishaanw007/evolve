import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/PageHeader"

type SectionPageProps = {
  title: string
  description: string
}

export function SectionPage({ title, description }: SectionPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <PageHeader title={title} description={description} />

      <Card>
        <CardContent className="pt-(--card-spacing)">
          <div className="flex min-h-52 items-center justify-center rounded-xl border border-dashed border-border bg-muted/25 px-6 text-center">
            <div className="max-w-md space-y-1.5">
              <p className="text-sm font-medium text-foreground">{title} coming next</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                This section is ready in the sidebar. Wire it to your backend APIs next
                (list, create, update, filters).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
