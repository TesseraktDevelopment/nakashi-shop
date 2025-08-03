import { setRequestLocale } from "next-intl/server";
import { getPayload } from "payload";
import React, { cache } from "react";

import { RenderBlocks } from "@/blocks/RenderBlocks";
import { PayloadRedirects } from "@/components/PayloadRedirects";
import { RenderHero } from "@/components/heros/RenderHero";
import { type Locale } from "@/i18n/config";
import { routing } from "@/i18n/routing";
import { generateMeta } from "@/utilities/generateMeta";
import config from "@payload-config";

import PageClient from "./page.client";

import type { Metadata } from "next";

export async function generateStaticParams() {
  const payload = await getPayload({ config });
  const pages = await payload.find({
    collection: "pages",
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  });

  const params = routing.locales.flatMap((locale) =>
    pages.docs
      ?.filter((doc) => doc.slug !== "home")
      .map(({ slug }) => ({ locale, slug }))
  );

  return params;
}

type Args = {
  params: Promise<{
    locale: Locale;
    slug?: string;
  }>;
  searchParams?: Promise<{ draft?: string }>;
};

export default async function Page({ params: paramsPromise, searchParams }: Args) {
  const { slug = "home", locale } = await paramsPromise;
  const searchParamsResolved = await searchParams;
  const isDraft = searchParamsResolved?.draft === "true";

  const url = `/${locale}/${slug}`;

  setRequestLocale(locale);

  const page = await queryPageBySlug({
    slug,
    locale,
    draft: isDraft,
  });

  if (!page) {
    return <PayloadRedirects url={url} locale={locale} />;
  }

  const { hero, layout } = page;

  return (
    <article className="pb-24 pt-16">
      <PageClient />
      {/* Allows redirects for valid pages too */}
      {!page && slug !== "home" && <PayloadRedirects locale={locale} url={url} />}
      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  );
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = "home", locale } = await paramsPromise;
  setRequestLocale(locale); // Required for generateMetadata to be static
  const page = await queryPageBySlug({
    slug,
    locale,
    draft: false, // Metadata should not use draft content
  });

  return generateMeta({ doc: page! });
}

const queryPageBySlug = cache(async ({ slug, locale, draft = false }: { slug: string; locale: Locale; draft?: boolean }) => {
  const payload = await getPayload({ config });

  try {
    const result = await payload.find({
      collection: "pages",
      draft,
      limit: 1,
      locale,
      pagination: false,
      overrideAccess: draft,
      where: {
        slug: {
          equals: slug,
        },
      },
    });
    return result.docs?.[0] || null;
  } catch (error) {
    console.error("Main page error:", error);
    return null;
  }
});
