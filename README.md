# Nakashi Army

A modern ecommerce storefront for Nakashi Army, powered by Payload and Next.js. This is a fully functional online store tailored to deliver a unique shopping experience for Nakashi Army’s customers.

## 🌐 Live demo

You can access the live Nakashi Army store at [https://nakashi-army.cz/](https://nakashi-army.cz/cs).

## ✨ Features

- **Modern Storefront**: A sleek and responsive storefront built with Next.js, Tailwind CSS, and Radix UI components.
- **Powerful Admin Panel**: Manage products, orders, and customers effortlessly with Payload’s intuitive admin UI.
- **Product Management**: Easily add and manage products with variants (e.g., size, color) using Payload’s payload.find queries.
- **Shopping Cart & Checkout**: A secure and user-friendly checkout flow.
- **User Accounts**: Customers can create accounts to view order history and manage their profiles.
- **SEO Friendly**: Optimized for search engines with @payloadcms/plugin-seo.
- **Multi-language**: Supports multiple languages out of the box with next-intl.
- **Payments and Shipping**: Integrated with Stripe for payments and customizable shipping options.
- **Customizable**: Tailored to the Nakashi Army brand, with flexible design and functionality using Tailwind CSS and Payload.

## 🚀 Getting Started

Follow these steps to set up the Nakashi Army store locally.

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/TesseraktDevelopment/nakashi-shop.git
    cd nakashi-shop
    ```

2.  **Install dependencies:**

    ```bash
    bun install
    ```

3.  **Set up environment variables:**

    Copy the example environment file. If `.env.example` does not exist, create a new file named `.env`.

    ```bash
    cp .env.example .env
    ```

    Open the `.env` file and configure the required variables, such as `MONGODB_URI`, `PAYLOAD_SECRET`, and any Stripe or S3 credentials if using `@payloadcms/storage-s3`.

4.  **Run the development server:**

    ```bash
    bun dev
    ```

5.  **Access your store:**
    - The Nakashi Army website will be available at [http://localhost:3000](http://localhost:3000)
    - The Payload admin panel will be accessible at [http://localhost:3000/admin](http://localhost:3000/admin)

    On your first visit to the admin panel, you’ll be prompted to create an admin user.

## Usage

- **Managing Products**: Go to the `/admin` panel, navigate to the 'Products' collection to add, edit, or remove products.
- **Viewing Orders**: Customer orders will appear in the 'Orders' collection in the admin panel.
- **Customizing Pages**: You can edit pages like 'About Us' or create new ones using the 'Pages' collection.

Explore the admin panel to manage and customize the Nakashi Army store!
