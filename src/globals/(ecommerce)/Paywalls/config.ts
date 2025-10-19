import { authenticated } from "@/access/authenticated";
import { revalidateGlobal } from "@/hooks/revalidateGlobal";

import type { GlobalConfig } from "payload";

export const Paywalls: GlobalConfig = {
	slug: "paywalls",
	label: {
		en: "Paywalls",
		cs: "Platební brány",
	},
	access: {
		read: () => true,
	},
	admin: {
		group: {
			en: "Payments settings",
			cs: "Nastavení plateb",
		},
	},
	fields: [
		{
			name: "paywall",
			label: {
				en: "Paywall",
				cs: "Platební brána",
			},
			type: "select",
			options: [
				{
					label: {
						en: "Stripe",
						cs: "Stripe",
					},
					value: "stripe",
				},
				{
					label: {
						en: "Autopay",
						cs: "Autopay",
					},
					value: "autopay",
				},
				{
					label: {
						en: "Przelewy24",
						cs: "Przelewy24",
					},
					value: "p24",
				},
			],
			defaultValue: "stripe",
			required: true,
		},
		{
			name: "stripe",
			label: {
				en: "Stripe configuration",
				cs: "Konfigurace Stripe",
			},
			type: "group",
			admin: {
				condition: (data) => {
					return data.paywall === "stripe";
				},
				description: {
					cs: "Pokud chcete používat testovací prostředí, zadejte zde odpovídající klíče.",
					en: "If you want to use test environment, you can also provide test keys here.",
				},
			},
			fields: [
				{
					name: "secret",
					type: "text",
					label: {
						en: "Secret API Key",
						cs: "Tajný klíč API",
					},
					access: {
						read: authenticated,
						create: authenticated,
						update: authenticated,
					},
					required: true,
				},
				{
					name: "webhookSecret",
					type: "text",
					label: {
						en: "Webhook Secret API Key",
						cs: "Tajný klíč API pro Webhook",
					},
					access: {
						read: authenticated,
						create: authenticated,
						update: authenticated,
					},
					required: true,
				},
				{
					name: "public",
					type: "text",
					label: {
						en: "Public API Key",
						cs: "Veřejný klíč API",
					},
					access: {
						read: authenticated,
						create: authenticated,
						update: authenticated,
					},
				},
			],
		},
		{
			name: "autopay",
			label: {
				en: "Autopay configuration",
				cs: "Konfigurace Autopay",
			},
			type: "group",
			admin: {
				condition: (data) => {
					return data.paywall === "autopay";
				},
				description: {
					cs: "Pokud chcete používat testovací prostředí, zadejte zde odpovídající klíče.",
					en: "If you want to use test environment, you can also provide test keys here.",
				},
			},
			fields: [
				{
					name: "serviceID",
					type: "text",
					label: {
						en: "Service ID",
						cs: "ID služby",
					},
					access: {
						read: authenticated,
						create: authenticated,
						update: authenticated,
					},
					required: true,
				},
				{
					name: "hashKey",
					type: "text",
					label: {
						en: "Hash Key",
						cs: "Hash klíč",
					},
					access: {
						read: authenticated,
						create: authenticated,
						update: authenticated,
					},
					required: true,
				},
				{
					name: "endpoint",
					type: "text",
					label: {
						en: "Endpoint",
						cs: "Endpoint",
					},
					access: {
						read: authenticated,
						create: authenticated,
						update: authenticated,
					},
					required: true,
				},
			],
		},
		{
			name: "p24",
			label: {
				en: "Przelewy24 configuration",
				cs: "Konfigurace Przelewy24",
			},
			type: "group",
			admin: {
				condition: (data) => {
					return data.paywall === "p24";
				},
				description: {
					cs: "Pokud chcete používat testovací prostředí, zadejte zde odpovídající klíče.",
					en: "If you want to use test environment, you can also provide test keys here.",
				},
			},
			fields: [
				{
					name: "posId",
					type: "text",
					label: {
						en: "POS ID (User ID)",
						cs: "POS ID (ID uživatele)",
					},
					access: {
						read: authenticated,
						create: authenticated,
						update: authenticated,
					},
					required: true,
				},
				{
					name: "crc",
					type: "text",
					label: {
						en: "CRC Key",
						cs: "CRC klíč",
					},
					access: {
						read: authenticated,
						create: authenticated,
						update: authenticated,
					},
					required: true,
				},
				{
					name: "secretId",
					type: "text",
					label: {
						en: "Secret ID (Klucz do raportów)",
						cs: "Tajné ID (Klíč pro reporty)",
					},
					access: {
						read: authenticated,
						create: authenticated,
						update: authenticated,
					},
					required: true,
				},
				{
					name: "endpoint",
					type: "text",
					label: {
						en: "Endpoint",
						cs: "Endpoint",
					},
					access: {
						read: authenticated,
						create: authenticated,
						update: authenticated,
					},
					required: true,
				},
			],
		},
	],
	hooks: {
		afterChange: [revalidateGlobal],
	},
};
