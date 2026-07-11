import { defineCommand } from "citty";

export default defineCommand({
  meta: {
    name: "init",
    version: "1.0.0",
    description: "Initialize the project",
  },
  args: {
    name: {
      type: "positional",
      description: "Your name",
      required: true,
    },
    friendly: {
      type: "boolean",
      description: "Use friendly greeting",
    },
  },
  setup({ args }) {
    console.log(`now setup ${args.command}`);
  },
  cleanup({ args }) {
    console.log(`now cleanup ${args.command}`);
  },
  run({ args }) {
    console.log(`${args.friendly ? "Hi" : "Greetings"} ${args.name}!`);
  },
});
