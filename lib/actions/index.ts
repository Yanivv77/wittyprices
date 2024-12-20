"use server"

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { User } from "@/types";
import { redirect } from "next/navigation";
import { generateEmailBody, sendEmail } from "../nodemailer";

export async function scrapeAndStoreProduct(productUrl: string) {
  if (!productUrl) return;

  try {
    await connectToDB();
    const scrapedProduct = await scrapeAmazonProduct(productUrl);

    if (!scrapedProduct) return;

    if (isNaN(scrapedProduct.originalPrice) || isNaN(scrapedProduct.currentPrice)) {
      console.error(`Invalid prices for product: ${scrapedProduct.url}`);
      return {
        error: `Invalid prices for product: ${scrapedProduct.url}`
      };
    }

    let product = scrapedProduct;
    const existingProduct = await Product.findOne({ url: scrapedProduct.url });

    if (existingProduct) {
      const updatedPriceHistory: any = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice }
      ];

      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      product,
      { upsert: true, new: true }
    );
    revalidatePath(`/products/${newProduct._id.toString()}`);
    redirect(`/products/${newProduct._id.toString()}`);
  } catch (error: any) {
    if (error?.message === 'NEXT_REDIRECT') {
      throw error;
    }
    
    console.error('Error in scrapeAndStoreProduct:', error);
    return {
      error: `Failed to create/update product: ${error.message}`
    };
  }
}

export async function getProductById(productId: string) {
  try {
    await connectToDB();

    const product = await Product.findOne({ _id: productId });

    if(!product) return null;

    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

export async function getAllProducts() {
  try {
    await connectToDB();

    const products = await Product.find();
    if (!products) {
      console.log('No products found');
      return [];
    }
    
    console.log(`Fetched ${products.length} products`);
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export async function getSimilarProducts(productId: string) {
  try {
    await connectToDB();

    const currentProduct = await Product.findById(productId);

    if(!currentProduct) return null;

    const similarProducts = await Product.find({
      _id: { $ne: productId },
    }).limit(3);

    return similarProducts;
  } catch (error) {
    console.log(error);
  }
}

export async function addUserEmailToProduct(productId: string, userEmail: string) {
  try {
    await connectToDB();
    const product = await Product.findById(productId);

    if(!product) return;

    const userExists = product.users.some((user: User) => user.email === userEmail);

    if(!userExists) {
      product.users.push({ email: userEmail });

      await product.save();

      const emailContent = await generateEmailBody(product, "WELCOME");

      await sendEmail(emailContent, [userEmail]);
      console.log("Email sent");
    }
  } catch (error) {
    console.log(error);
  }
}

export async function cleanupInvalidPrices() {
  try {
    await connectToDB();
    
    // Get all products first
    const products = await Product.find({});

    // Filter and update products with invalid prices
    for (const product of products) {
      if (isNaN(product.originalPrice) || isNaN(product.currentPrice)) {
        console.log(`Fixing invalid prices for product: ${product._id}`);
        await Product.findByIdAndUpdate(product._id, {
          $set: {
            originalPrice: 0,
            currentPrice: 0
          }
        });
      }
    }
  } catch (error) {
    console.error('Error cleaning up invalid prices:', error);
  }
}