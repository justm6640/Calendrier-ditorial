"use client";

import dynamic from "next/dynamic";

// Dynamically import Agentation with SSR disabled since it relies on window/DOM
const Agentation = dynamic(
    () => import("agentation").then((mod) => mod.Agentation),
    { ssr: false }
);

export function AgentationProvider() {
    // Only render in development
    if (process.env.NODE_ENV !== "development") {
        return null;
    }

    // Connects to the local MCP server on port 4747
    return <Agentation endpoint="http://localhost:4747" />;
}
