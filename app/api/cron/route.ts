import { NextResponse } from "next/server";

import { getLowestPrice, getHighestPrice, getAveragePrice, getEmailNotifType } from "@/lib/utils";
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.model";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";

export const maxDuration = 300; // This function can run for a maximum of 300 seconds
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const expectedAuthHeader = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedAuthHeader) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectToDB();

    const products = await Product.find({});
    if (!products?.length) {
      console.log('No products found');
      return NextResponse.json({ message: "No products found", data: [] });
    }

    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        try {
          const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);
          if (!scrapedProduct) {
            console.log(`Failed to scrape product: ${currentProduct.url}`);
            return null;
          }

          // Add price validation
          if (isNaN(scrapedProduct.currentPrice)) {
            console.error(`Invalid price for product: ${scrapedProduct.url}`);
            scrapedProduct.currentPrice = 0;
          }

          const updatedPriceHistory = [
            ...currentProduct.priceHistory,
            {
              price: scrapedProduct.currentPrice,
            },
          ];

          const product = {
            ...scrapedProduct,
            priceHistory: updatedPriceHistory,
            lowestPrice: getLowestPrice(updatedPriceHistory),
            highestPrice: getHighestPrice(updatedPriceHistory),
            averagePrice: getAveragePrice(updatedPriceHistory),
          };

          // Update Products in DB
          const updatedProduct = await Product.findOneAndUpdate(
            {
              url: product.url,
            },
            product
          );

          // ======================== 2 CHECK EACH PRODUCT'S STATUS & SEND EMAIL ACCORDINGLY
          const emailNotifType = getEmailNotifType(
            scrapedProduct,
            currentProduct
          );

          if (emailNotifType && updatedProduct.users.length > 0) {
            const productInfo = {
              title: updatedProduct.title,
              url: updatedProduct.url,
            };
            // Construct emailContent
            const emailContent = await generateEmailBody(productInfo, emailNotifType);
            // Get array of user emails
            const userEmails = updatedProduct.users.map((user: any) => user.email);
            // Send email notification
            await sendEmail(emailContent, userEmails);
          }

          return updatedProduct;
        } catch (error) {
          console.error(`Error processing product ${currentProduct.url}:`, error);
          return null;
        }
      })
    );

    const filteredProducts = updatedProducts.filter(Boolean);

    return NextResponse.json({
      message: "Ok",
      data: filteredProducts,
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json({
      message: "Error",
      error: error.message
    }, { status: 500 });
  }
}
