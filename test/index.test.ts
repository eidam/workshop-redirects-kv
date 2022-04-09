import worker from "../src/index";

// @ts-ignore
const { KV_REDIRECTS } = getMiniflareBindings()

describe('Wrangler configuration', () => {
  test("KV_REDIRECTS KV namespace binding exists", async () => {
    expect(KV_REDIRECTS).toBeDefined()
  })
})

describe('Default behaviour', () => {
  test("homepage responds with hello redirects", async () => {
    const req = new Request("http://localhost/");
    // @ts-ignore
    const res = await worker.fetch(req, {KV_REDIRECTS});
    expect(await res.text()).toBe("Hello Redirects!");
  });
})

describe('KV Redirects', () => {
  const uuid = crypto.randomUUID()
  const randomPath = "/random"
  const randomLocation = `https://${uuid}.example.com/`

  test(`/nonexistent returns 404`, async () => {
    const req = new Request("http://localhost/nonexistent");
    // @ts-ignore
    const res = await worker.fetch(req, {KV_REDIRECTS});
    expect(res.status).toBe(404);
  })

  test(`${randomPath} redirects to ${randomLocation}`, async () => {
    await KV_REDIRECTS.put(randomPath, randomLocation);
    const req = new Request(`http://localhost${randomPath}`);
    // @ts-ignore
    const res = await worker.fetch(req, {KV_REDIRECTS});
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe(randomLocation);
  })
})
