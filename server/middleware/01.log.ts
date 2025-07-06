export default defineEventHandler((event) => {
    console.log("New request: " + getRequestURL(event));
    // setResponseStatus(event, 400);
    // return { hello: "world" };
});
