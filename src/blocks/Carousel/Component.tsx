"use client";

import AutoScrollPlugin from "embla-carousel-auto-scroll";
import AutoplayPlugin from "embla-carousel-autoplay";
import Link from "next/link";

import {
	spacingTopClasses,
	spacingBottomClasses,
	paddingTopClasses,
	paddingBottomClasses,
} from "@/blocks/globals";
import { Media } from "@/components/Media";
import RichText from "@/components/RichText";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	type CarouselProps,
} from "@/components/ui/carousel";
import { cn } from "@/utilities/cn";

import type { CarouselBlock as CarouselBlockProps } from "@/payload-types";

export const CarouselBlock = ({
	type,
	slides,
	autoplay,
	spacingBottom,
	spacingTop,
	paddingBottom,
	paddingTop,
	title,
}: CarouselBlockProps) => {
	const plugins = {
		logo: [
			AutoScrollPlugin({
				speed: 3,
			}),
		],
		default: [
			...(autoplay && autoplay !== 0
				? [
						AutoplayPlugin({
							delay: autoplay,
						}),
					]
				: []),
		],
	};

	const options: Record<string, Partial<CarouselProps["opts"]>> = {
		logo: {
			loop: true,
			watchDrag: false,
		},
		default: {
			loop: true,
		},
	};

	return (
		<section
			className={cn(
				"container",
				spacingTopClasses[spacingTop ?? "medium"],
				spacingBottomClasses[spacingBottom ?? "medium"],
				paddingTopClasses[paddingTop ?? "medium"],
				paddingBottomClasses[paddingBottom ?? "medium"],
			)}
		>
			{title && <RichText data={title} className="mb-6" />}
			<Carousel opts={options[type]} plugins={plugins[type]}>
				<CarouselContent>
					{slides?.map((slide) => (
						<CarouselItem
							key={slide.id}
							className={cn(
								"basis-full md:basis-[50%] lg:basis-[33.33%] 2xl:basis-[25%]",
							)}
						>
							{typeof slide.image !== "string" && slide.image.url && (
								<>
									{slide.link &&
									(slide.link.url ||
										(typeof slide.link.reference?.value !== "string" &&
											slide.link.reference?.value.slug)) ? (
										<Link
											// @ts-expect-error - reference.value is not a string! TypeScript doesn't know that, it was checked above
											href={
												slide.link.url ?? `/${slide.link.reference?.value.slug}`
											}
											target={slide.link.newTab ? "_blank" : "_self"}
										>
											<Media resource={slide.image} />
										</Link>
									) : (
										<Media resource={slide.image} />
									)}
								</>
							)}
						</CarouselItem>
					))}
				</CarouselContent>
				{type === "default" && (
					<>
						<CarouselPrevious />
						<CarouselNext />
					</>
				)}
			</Carousel>
		</section>
	);
};
