export const countryList = [
	{
		value: "ad",
		label: {
			en: "Andorra",
			cs: "Andorra",
		},
	},
	{
		value: "al",
		label: {
			en: "Albania",
			cs: "Albánie",
		},
	},
	{
		value: "at",
		label: {
			en: "Austria",
			cs: "Rakousko",
		},
	},
	{
		value: "ba",
		label: {
			en: "Bosnia and Herzegovina",
			cs: "Bosna a Hercegovina",
		},
	},
	{
		value: "be",
		label: {
			en: "Belgium",
			cs: "Belgie",
		},
	},
	{
		value: "bg",
		label: {
			en: "Bulgaria",
			cs: "Bulharsko",
		},
	},
	{
		value: "by",
		label: {
			en: "Belarus",
			cs: "Bělorusko",
		},
	},
	{
		value: "ch",
		label: {
			en: "Switzerland",
			cs: "Švýcarsko",
		},
	},
	{
		value: "cy",
		label: {
			en: "Cyprus",
			cs: "Kypr",
		},
	},
	{
		value: "cz",
		label: {
			en: "Czech Republic",
			cs: "Česká republika",
		},
	},
	{
		value: "de",
		label: {
			en: "Germany",
			cs: "Německo",
		},
	},
	{
		value: "dk",
		label: {
			en: "Denmark",
			cs: "Dánsko",
		},
	},
	{
		value: "ee",
		label: {
			en: "Estonia",
			cs: "Estonsko",
		},
	},
	{
		value: "es",
		label: {
			en: "Spain",
			cs: "Španělsko",
		},
	},
	{
		value: "fi",
		label: {
			en: "Finland",
			cs: "Finsko",
		},
	},
	{
		value: "fr",
		label: {
			en: "France",
			cs: "Francie",
		},
	},
	{
		value: "gb",
		label: {
			en: "United Kingdom",
			cs: "Spojené království",
		},
	},
	{
		value: "gr",
		label: {
			en: "Greece",
			cs: "Řecko",
		},
	},
	{
		value: "hr",
		label: {
			en: "Croatia",
			cs: "Chorvatsko",
		},
	},
	{
		value: "hu",
		label: {
			en: "Hungary",
			cs: "Maďarsko",
		},
	},
	{
		value: "ie",
		label: {
			en: "Ireland",
			cs: "Irsko",
		},
	},
	{
		value: "is",
		label: {
			en: "Iceland",
			cs: "Island",
		},
	},
	{
		value: "it",
		label: {
			en: "Italy",
			cs: "Itálie",
		},
	},
	{
		value: "li",
		label: {
			en: "Liechtenstein",
			cs: "Lichtenštejnsko",
		},
	},
	{
		value: "lt",
		label: {
			en: "Lithuania",
			cs: "Litva",
		},
	},
	{
		value: "lu",
		label: {
			en: "Luxembourg",
			cs: "Lucembursko",
		},
	},
	{
		value: "lv",
		label: {
			en: "Latvia",
			cs: "Lotyšsko",
		},
	},
	{
		value: "mc",
		label: {
			en: "Monaco",
			cs: "Monako",
		},
	},
	{
		value: "md",
		label: {
			en: "Moldova",
			cs: "Moldavsko",
		},
	},
	{
		value: "me",
		label: {
			en: "Montenegro",
			cs: "Černá Hora",
		},
	},
	{
		value: "mk",
		label: {
			en: "North Macedonia",
			cs: "Severní Makedonie",
		},
	},
	{
		value: "mt",
		label: {
			en: "Malta",
			cs: "Malta",
		},
	},
	{
		value: "nl",
		label: {
			en: "Netherlands",
			cs: "Nizozemsko",
		},
	},
	{
		value: "no",
		label: {
			en: "Norway",
			cs: "Norsko",
		},
	},
	{
		value: "pl",
		label: {
			en: "Poland",
			cs: "Polsko",
		},
	},
	{
		value: "pt",
		label: {
			en: "Portugal",
			cs: "Portugalsko",
		},
	},
	{
		value: "ro",
		label: {
			en: "Romania",
			cs: "Rumunsko",
		},
	},
	{
		value: "rs",
		label: {
			en: "Serbia",
			cs: "Srbsko",
		},
	},
	{
		value: "ru",
		label: {
			en: "Russia",
			cs: "Rusko",
		},
	},
	{
		value: "se",
		label: {
			en: "Sweden",
			cs: "Švédsko",
		},
	},
	{
		value: "si",
		label: {
			en: "Slovenia",
			cs: "Slovinsko",
		},
	},
	{
		value: "sk",
		label: {
			en: "Slovakia",
			cs: "Slovensko",
		},
	},
	{
		value: "sm",
		label: {
			en: "San Marino",
			cs: "San Marino",
		},
	},
	{
		value: "ua",
		label: {
			en: "Ukraine",
			cs: "Ukrajina",
		},
	},
	{
		value: "va",
		label: {
			en: "Vatican City",
			cs: "Vatikán",
		},
	},
] as const;

export type Country = (typeof countryList)[number]["value"];
