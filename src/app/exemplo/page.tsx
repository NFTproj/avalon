import { getClientConfig } from "../lib/config";
import ExemploComponente from "./components/exemploComponente";

export default async function Page() {
	const config = await getClientConfig();
	return (
		<div className="flex flex-col items-center justify-center h-screen gap-4">
			<h1 className="text-3xl">{config.landingPage.heroText}</h1>

			<ExemploComponente />
		</div>
	);
}
