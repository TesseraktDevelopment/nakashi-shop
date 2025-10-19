import { Link } from "@/i18n/routing";
import { type Product } from "@/payload-types";

export const ProductBreadcrumbs = ({ product }: { product: Product }) => {
	return (
		<>
			<nav
				aria-label="Breadcrumb"
				className="container mr-auto px-4 pt-6 sm:px-6 lg:px-8"
			>
				<ol role="list" className="flex items-center space-x-4">
					{product.categoriesArr &&
						typeof product.categoriesArr[0].category !== "string" && (
							<li key={product.categoriesArr[0].category.id}>
								<div className="flex items-center">
									<Link
										href={`/category/${product.categoriesArr[0].category.slug}`}
										className="mr-4 text-sm font-medium text-gray-900"
									>
										{product.categoriesArr[0].category.title}
									</Link>
									<svg
										viewBox="0 0 6 20"
										aria-hidden="true"
										className="h-5 w-auto text-gray-300"
									>
										<path
											d="M4.878 4.34H3.551L.27 16.532h1.327l3.281-12.19z"
											fill="currentColor"
										/>
									</svg>
								</div>
							</li>
						)}
					{product.categoriesArr?.[0].subcategories &&
						typeof product.categoriesArr[0].category !== "string" &&
						typeof product.categoriesArr[0].subcategories[0] !== "string" && (
							<li key={product.categoriesArr[0].subcategories[0].id}>
								<div className="flex items-center">
									<Link
										href={`/category/${product.categoriesArr[0].category.slug}/${product.categoriesArr[0].subcategories[0].slug}`}
										className="mr-4 text-sm font-medium text-gray-900"
									>
										{product.categoriesArr[0].subcategories[0].title}
									</Link>
									<svg
										viewBox="0 0 6 20"
										aria-hidden="true"
										className="h-5 w-auto text-gray-300"
									>
										<path
											d="M4.878 4.34H3.551L.27 16.532h1.327l3.281-12.19z"
											fill="currentColor"
										/>
									</svg>
								</div>
							</li>
						)}
					<li className="text-sm">
						<Link
							href={`/product/${product.slug}`}
							aria-current="page"
							className="font-medium text-gray-500 hover:text-gray-600"
						>
							{product.title}
						</Link>
					</li>
				</ol>
			</nav>
		</>
	);
};
