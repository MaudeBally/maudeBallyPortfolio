export default defineNuxtRouteMiddleware(async (to, from) => {
  if (to.path.startsWith("/adminInterface")) {
    const headers = useRequestHeaders(["cookie"])
    const res = await $fetch("/api/me", {
      headers
    })
    console.log(res)
    if (!res.loggedIn) {
      return navigateTo("/behindTheScene");
    }
  }
});