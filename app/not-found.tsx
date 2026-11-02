import { ButtonLink, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-medium text-teal-600">404</p>
      <h1 className="mt-2 text-3xl font-semibold text-navy">This door doesn&apos;t lead anywhere.</h1>
      <p className="mt-3 text-ink-muted">The page you&apos;re looking for doesn&apos;t exist.</p>
      <div className="mt-6 flex gap-3">
        <ButtonLink href="/">Go home</ButtonLink>
        <ButtonLink href="/mentors" variant="outline">Find a mentor</ButtonLink>
      </div>
    </Container>
  );
}
