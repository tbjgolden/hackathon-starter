import React, { Suspense, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import { Client as Styletron } from "styletron-engine-monolithic";
import { Provider as StyletronProvider } from "styletron-react";
import { BaseProvider } from "baseui";
import { theme, primitives } from "_/theme";
import { MenuLayout } from "_c/Layouts";
import routes from "~react-pages";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import "_/global.css";

const client = new ApolloClient({
  uri: "//localhost:3001/api/graphql",
  cache: new InMemoryCache(),
});

// eslint-disable-next-line baseui/deprecated-component-api
import { Spinner } from "baseui/spinner";

// Make baseweb primitives available as CSS properties
const styleEl = document.createElement("style");
let customPropertiesCSS = "";
for (const [k, v] of Object.entries(primitives)) {
  customPropertiesCSS += `--${k}:${v};`;
}
styleEl.innerHTML = `:root{${customPropertiesCSS}}`;
document.head.append(styleEl);

// Initialise and attach React app to DOM
const engine = new Styletron();

// Loading indicator (that only appears after 2s, to minimise loading time perception)
const LoadingIndicator = () => {
  const [isLoadingIndicatorVisible, setIsLoadingIndicatorVisible] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoadingIndicatorVisible(true);
    }, 2000);
    return () => {
      clearTimeout(timeout);
    };
  }, []);
  return isLoadingIndicatorVisible ? <Spinner $size={100} /> : null;
};

const App = () => {
  return (
    <Suspense
      fallback={
        <MenuLayout>
          <LoadingIndicator />
        </MenuLayout>
      }
    >
      {useRoutes([
        ...routes,
        {
          path: "*",
          element: (
            <MenuLayout>
              <h1 style={{ color: "var(--mono600)" }}>Page Not Found</h1>
            </MenuLayout>
          ),
        },
      ])}
    </Suspense>
  );
};

ReactDOM.render(
  <StyletronProvider value={engine}>
    <BaseProvider theme={theme}>
      <ApolloProvider client={client}>
        <React.StrictMode>
          <Router>
            <App />
          </Router>
        </React.StrictMode>
      </ApolloProvider>
    </BaseProvider>
  </StyletronProvider>,
  document.querySelector("#root")
);
