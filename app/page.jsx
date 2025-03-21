"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirects the user to the "/transacciones" page upon component mount.
 *
 * @component
 * @remarks This component uses the `useRouter` hook from Next.js to programmatically navigate to another route.
 * It also uses the `useEffect` hook to trigger the redirection after the component is mounted.
 *
 * @returns {JSX.Element} Renders nothing as it is solely for redirection purposes.
 *
 * @example
 * // Usage in a Next.js application
 * import Home from './path/to/Home';
 *
 * export default function App() {
 *   return <Home />;
 * }
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/transacciones");
  }, []);

  return null;
}
