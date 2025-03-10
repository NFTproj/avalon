import { getClientConfig } from "./lib/config";

export default async function Home() {
  const config = await getClientConfig();
    return (
        <h1>{config.landingPage.heroText}</h1>
    );
}
