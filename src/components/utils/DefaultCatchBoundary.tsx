import { ErrorComponent, type ErrorComponentProps } from "@tanstack/react-router";

export default function DefaultCatchBoundary({ error }: ErrorComponentProps) {
    return <ErrorComponent error={error} />;
}
