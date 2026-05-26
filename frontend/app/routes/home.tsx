import type { Route } from "./+types/home";
import { type LoaderFunctionArgs } from "react-router";
import Login from "../welcome/login";

export async function loader({ request }: LoaderFunctionArgs) {
  console.log("--- O LOADER ESTÁ RODANDO NO SERVIDOR ---");

  const data = {
    env: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL!,
      VITE_SUPABASE_PUBLISHABLE_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_KEY!,
    },
  };

  return Response.json(data);
}

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <Login />;
}
