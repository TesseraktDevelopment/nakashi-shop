import { Parser } from "xml2js";

const parser = new Parser({ explicitArray: false });

export const parseXml = async <T>(xml: string): Promise<T> => {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const result = await parser.parseStringPromise(xml);
	return result as T;
};
