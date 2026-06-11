import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("dashboard", "routes/dashboard.tsx", [
        index("routes/dashboardInicio.tsx"), 
        route("settings", "routes/settings.tsx"),
        route("wallet", "routes/wallet.tsx"),
    ]),
] satisfies RouteConfig;
