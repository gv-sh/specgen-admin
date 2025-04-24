// This file is used to configure the shadcn/ui library

export const shadcnConfig = {
  style: "default",
  tailwind: {
    config: "./tailwind.config.js",
    css: "./src/index.css",
    baseColor: "slate",
    cssVariables: true,
  },
  aliases: {
    components: "./src/components",
    utils: "./src/lib/utils",
  },
  tsx: false,
}