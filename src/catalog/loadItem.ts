const modules = import.meta.glob("./items/*.json");

export async function loadItem(id: string) {
  const path = `./items/${id}.json`;
  const loader = modules[path];

  if (!loader) {
    throw new Error("Item not found");
  }

  const mod: any = await loader();
  return mod.default;
}