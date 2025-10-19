import { getServerSideURL } from "./getURL";

import type { Metadata } from "next";

const defaultOpenGraph: Metadata["openGraph"] = {
	type: "website",
	description: "An open-source website built with Payload and Next.js.",
	images: [
		{
			url: `${getServerSideURL()}/website-template-OG.webp`,
		},
	],
	siteName: "Nakashi Army",
	title: "Nakashi Army",
};

export const mergeOpenGraph = (
	og?: Metadata["openGraph"],
): Metadata["openGraph"] => {
	return {
		...defaultOpenGraph,
		...og,
		images: og?.images ?? defaultOpenGraph.images,
	};
};
