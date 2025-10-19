import {
	type SerializedEditorState,
	type SerializedLexicalNode,
} from "@payloadcms/richtext-lexical/lexical";

import {
	paddingBottomClasses,
	paddingTopClasses,
	spacingBottomClasses,
	spacingTopClasses,
} from "@/blocks/globals";
import { CMSLink } from "@/components/Link";
import RichText from "@/components/RichText";
import { cn } from "src/utilities/cn";

import { Media } from "../../components/Media";

import type { linkGroup as LinkGroupType } from "@/fields/linkGroup";
import type { MediaBlock as MediaBlockProps } from "@/payload-types";
import type { StaticImageData } from "next/image";

type Props = MediaBlockProps & {
	breakout?: boolean;
	captionClassName?: string;
	className?: string;
	enableGutter?: boolean;
	imgClassName?: string;
	staticImage?: StaticImageData;
	disableInnerContainer?: boolean;
	isLink?: boolean;
	links?: (typeof LinkGroupType)[];
};

export const MediaBlock = (props: Props) => {
	const {
		captionClassName,
		className,
		enableGutter = true,
		imgClassName,
		media,
		staticImage,
		disableInnerContainer,
		spacingTop,
		spacingBottom,
		paddingBottom,
		paddingTop,
	} = props;

	let caption: SerializedEditorState<SerializedLexicalNode> | null | undefined;
	if (media && typeof media === "object") caption = media.caption;

	const links = props.links;

	return (
		<div
			className={cn(
				"",
				{
					container: enableGutter,
				},
				className,
				spacingTopClasses[spacingTop ?? "medium"],
				spacingBottomClasses[spacingBottom ?? "medium"],
				paddingTopClasses[paddingTop ?? "medium"],
				paddingBottomClasses[paddingBottom ?? "medium"],
			)}
		>
			{Array.isArray(links) && links.length > 0 ? (
				<CMSLink {...links[0].link} size="lg" appearance="link">
					<Media
						imgClassName={cn(
							"border border-border rounded-[0.8rem]",
							imgClassName,
						)}
						resource={media}
						src={staticImage}
					/>
				</CMSLink>
			) : (
				<Media
					imgClassName={cn(
						"border border-border rounded-[0.8rem]",
						imgClassName,
					)}
					resource={media}
					src={staticImage}
				/>
			)}
			{caption && (
				<div
					className={cn(
						"mt-6",
						{
							container: !disableInnerContainer,
						},
						captionClassName,
					)}
				>
					<RichText data={caption} enableGutter={false} />
				</div>
			)}
		</div>
	);
};
