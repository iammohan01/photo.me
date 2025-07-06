export default defineEventHandler(async (event) => {
    const KV: KVNamespace = event.context.cloudflare.env.KV;
    // await KV.put("hello", "1234");
    const name = getRouterParam(event, "name");
    return `Hello, ${await KV.get("hello")}!`;
});
