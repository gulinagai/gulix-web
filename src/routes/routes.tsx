import type { RouteObject } from "react-router";
import { CatalogPage } from "../pages/CatalogPage.tsx";
import { HomePage } from "../pages/HomePage.tsx";
import { NotFoundPage } from "../pages/NotFoundPage.tsx";
import { ProdutoPage } from "../pages/ProdutoPage.tsx";
import { AppShell } from "./AppShell.tsx";

export const appRoutes: RouteObject[] = [
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "produtos", element: <CatalogPage /> },
      { path: "produtos/:id", element: <ProdutoPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
