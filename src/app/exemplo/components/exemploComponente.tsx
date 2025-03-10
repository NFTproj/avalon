"use client";

import { ConfigContext } from "@/contexts/ConfigContext";
import { useContext } from "react";

function ExemploComponente() {
	const { config } = useContext(ConfigContext);
	return (
		<div className="bg-primary">
			<h1 className="text-primary">{config?.landingPage.bodyText}</h1>

			<button className="bg-primary text-white hover:bg-secondary">
				Meu Botão
			</button>
		</div>
	);
}

export default ExemploComponente;
