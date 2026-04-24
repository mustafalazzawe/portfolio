import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      order: z.number(),
      status: z.enum(["Ongoing", "Work in Progress", "Completed"]),
      title: z.string(),
      description: z.string(),
      tags: z.array(z.string()),
      thumbnail: image().optional(),
      repoURL: z.string().url().optional(),
      liveURL: z.string().url().optional(),
    }),
});

export const collections = { projects };
