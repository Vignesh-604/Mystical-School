import { Geometry } from "@/components/geometry";
import { Container, LinkButton } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="max-w-xl py-24 text-center">
      <Geometry motif="vesica" className="mx-auto size-20 text-gold" />
      <h1 className="font-display mt-8 text-5xl">Not every path leads somewhere</h1>
      <p className="mt-4 text-lg text-muted">This page doesn&rsquo;t exist, or it has moved.</p>
      <div className="mt-8 flex justify-center gap-3">
        <LinkButton href="/">Return home</LinkButton>
        <LinkButton href="/guide" variant="secondary">
          Ask Sophia
        </LinkButton>
      </div>
    </Container>
  );
}
