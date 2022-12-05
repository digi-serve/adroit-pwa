import Api from "./api";
import store from "./store";

const fetchJson = async (url, options = {}) => {
  if (!navigator.onLine) {
    let toastWithButton = app.f7.toast
      .create({
        icon: '<i class="material-icons">wifi_off</i>',
        text: "No connection",
        position: "center",
        closeTimeout: 3000
      })
      .open();
    return false;
  }
  const requestHeaders =
    options.headers ||
    new Headers({
      Accept: "application/json"
    });
  // debugger;
  if (!(options && options.body && options.body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }

  let csrfToken = store.getters.csrfToken;

  if (csrfToken) {
    requestHeaders.set("X-CSRF-Token", csrfToken.value);
  } else {
    console.warn("CSRF token in AsyncStorage was empty");
  }

  const absoluteUrl = Api.urls.base + url;
  // debugger;
  // console.warn("fetchJson", url, options, requestHeaders);
  return fetch(absoluteUrl, {
    ...options,
    credentials: "include",
    mode: "cors",
    redirect: "follow",
    headers: requestHeaders
  })
    .then(response =>
      response.text().then(text => ({
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: text
      }))
    )
    .then(async response => {
      const { status, statusText, headers, body } = response;
      // console.warn(
      //   `${url} returned`,
      //   response,
      //   status,
      //   statusText,
      //   headers,
      //   body
      // );
      // debugger;
      let json;
      try {
        json = JSON.parse(body);
      } catch (e) {
        // not json, no big deal
        console.warn(
          `${url} response: body is not a well-formatted JSON object`
        );
      }
      if (status < 200 || status >= 300) {
        const errorMessage = (json && json.message) || statusText;
        // Don't send failed login attempts to Sentry!
        if (status === 400 && url.endsWith(Api.urls.login)) {
          console.warn(errorMessage, json);
        } else if (status !== 401) {
          // $f7.loginScreen.open("#my-login-screen");
          console.error("fetch failed", status, errorMessage, json);
        }
        return Promise.reject();
      }
      return { status, headers, body, json };
    });
  // .catch(error => {
  //   console.log('Fetch Error:', error);
  //   return Promise.reject(new HttpError(error.message, 0, {}));
  // });
};

export default fetchJson;
