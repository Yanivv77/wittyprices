"use client"

import "react-responsive-carousel/lib/styles/carousel.min.css"; 
import { Carousel } from 'react-responsive-carousel';
import Image from "next/image";

const heroImages = [
  { imgUrl: '/assets/images/hero-1.jpg', alt: 'Hero image 1'},
  { imgUrl: '/assets/images/hero-2.jpg', alt: 'Hero image 2'},
  { imgUrl: '/assets/images/hero-3.jpg', alt: 'Hero image 3'},
  { imgUrl: '/assets/images/hero-4.jpg', alt: 'Hero image 4'},

]

const HeroCarousel = () => {
  return (
    <div className="hero-carousel">
      <Carousel
        showThumbs={false}
        autoPlay
        infiniteLoop
        interval={3000}
        showArrows={true}
        showStatus={false}
      >
        {heroImages.map((image) => (
          <div key={image.alt} className="relative w-full h-[440px]">
            <Image 
              src={image.imgUrl}
              alt={image.alt}
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
          </div>
        ))}
      </Carousel>

      <Image 
        src="assets/icons/hand-drawn-arrow.svg"
        alt="arrow"
        width={200}
        height={175}
        className="max-xl:hidden absolute -left-[15%] bottom-0 z-0"
      />
    </div>
  )
}

export default HeroCarousel