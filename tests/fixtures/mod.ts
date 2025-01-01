import data from "./fixtures.json" with { type: "json" };

const read = (path: string) => {
  path = import.meta.resolve(path).replace("file://", "");
  return Deno.readFile(path);
};

export const fixtures = await Promise.all(
  data.map(async ({ name, input, output }) => ({
    name,
    input: await read(input),
    output: await read(output),
  })),
);

export default fixtures;
