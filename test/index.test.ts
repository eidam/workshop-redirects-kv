import worker from "../src/index";

const redirects = new Map();
redirects.set('/workers', "https://workers.cloudflare.com/");
redirects.set('/pages', "https://pages.cloudflare.com/");
redirects.set('/google', "https://google.com/");

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
    const res = await worker.fetch(req, {KV_REDIRECTS});
    expect(res.status).toBe(404);
  })

  test(`${randomPath} redirects to ${randomLocation}`, async () => {
    await KV_REDIRECTS.put(randomPath, randomLocation);
    const req = new Request(`http://localhost${randomPath}`);
    const res = await worker.fetch(req, {KV_REDIRECTS});
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe(randomLocation);
  })
})
