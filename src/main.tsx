import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

import { Provider } from "react-redux";
import { store } from "./stores";
import { ConfigProvider } from "antd";
import { theme } from "./configs/theme";
import { validateMessages } from "./configs/inputRule.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import WebBackground from "./components/templates/WebBackground.tsx";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import "./configs/axios";
import "./i18n";
import "antd/dist/reset.css";
import "./index.css";

dayjs.extend(utc);
dayjs.extend(timezone);
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider theme={theme} form={{ validateMessages }}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <WebBackground>
            <App />
          </WebBackground>
        </QueryClientProvider>
      </Provider>
    </ConfigProvider>
  </React.StrictMode>
);
