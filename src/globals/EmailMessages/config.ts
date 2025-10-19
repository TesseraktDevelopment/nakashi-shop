import { type GlobalConfig } from "payload";

import { authenticated } from "@/access/authenticated";
import { revalidateGlobal } from "@/hooks/revalidateGlobal";

export const EmailMessages: GlobalConfig = {
	slug: "emailMessages",
	label: {
		en: "Email Messages",
		cs: "Emailové zprávy",
	},
	access: {
		read: authenticated,
		update: authenticated,
	},
	admin: {
		group: {
			en: "Shop settings",
			cs: "Nastavení obchodu",
		},
	},
	fields: [
		{
			type: "tabs",
			tabs: [
				{
					name: "smtp",
					label: {
						en: "SMTP",
						cs: "SMTP",
					},
					fields: [
						{
							name: "host",
							type: "text",
							required: true,
							label: {
								en: "Host",
								cs: "Host",
							},
						},
						{
							name: "port",
							type: "number",
							required: true,
							label: {
								en: "SMTP Port",
								cs: "Port SMTP",
							},
						},
						{
							name: "secure",
							type: "checkbox",
							label: {
								en: "Secure",
								cs: "Zabezpečené",
							},
							required: true,
							defaultValue: false,
						},
						{
							name: "user",
							type: "text",
							required: true,
							label: {
								en: "User",
								cs: "Uživatel",
							},
						},
						{
							name: "password",
							type: "text",
							required: true,
							label: {
								en: "Password",
								cs: "Heslo",
							},
						},
						{
							name: "fromEmail",
							type: "text",
							required: true,
							label: {
								en: "From Email",
								cs: "Z emailu",
							},
						},
					],
				},
				{
					name: "messages",
					label: {
						en: "Messages",
						cs: "Zprávy",
					},
					fields: [
						{
							name: "logo",
							type: "upload",
							label: {
								en: "Logo",
								cs: "Logo",
							},
							relationTo: "media",
						},
						{
							name: "additionalText",
							type: "textarea",
							label: {
								en: "Additional text",
								cs: "Dodatečný text",
							},
						},
						{
							name: "template",
							type: "select",
							required: true,
							defaultValue: "default",
							options: [
								{ value: "default", label: { en: "Default", cs: "Výchozí" } },
							],
						},
					],
				},
			],
		},
	],
	hooks: {
		afterChange: [revalidateGlobal],
	},
};
