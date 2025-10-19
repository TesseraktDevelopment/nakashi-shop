import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import cheerio from "cheerio";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const { ico } = req.query;
	if (!ico || typeof ico !== "string" || !/^\d{10}$/.test(ico)) {
		return res.status(400).json({ error: "Invalid ICO format" });
	}

	try {
		const response = await axios.get(
			`https://www.orsr.sk/hladaj_ico.asp?ICO=${ico}`,
		);
		const $ = cheerio.load(response.data);
		// Upravte selektory podle aktuální struktury HTML ORSR
		const nazov = $("table tr:contains('Obchodné meno') td:nth-child(2)")
			.text()
			.trim();
		const ulica = $("table tr:contains('Ulica') td:nth-child(2)").text().trim();
		const obec = $("table tr:contains('Obec') td:nth-child(2)").text().trim();
		const psc = $("table tr:contains('PSČ') td:nth-child(2)").text().trim();
		const kraj = $("table tr:contains('Kraj') td:nth-child(2)").text().trim();
		const dic = $("table tr:contains('DIČ') td:nth-child(2)").text().trim();

		if (!nazov) {
			return res.status(404).json({ error: "IČO not found" });
		}

		res.status(200).json({
			nazov,
			sídlo: { ulica, obec, psc, kraj },
			dic,
		});
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch ORSR data" });
	}
}
