import { IMAGE_BASE } from "@/constants/constants";
import React, {
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import "./BannerStyle.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "../../ui/carousel";

const images: string[] = [
  `${IMAGE_BASE}labour-commissionerate-west-bengal-banner-00.jpg`,
  `${IMAGE_BASE}labour-commissionerate-west-bengal-banner-01.jpg`,
  `${IMAGE_BASE}labour-commissionerate-west-bengal-banner-02.jpg`,
  `${IMAGE_BASE}labour-commissionerate-west-bengal-banner-03.jpg`,
  `${IMAGE_BASE}labour-commissionerate-west-bengal-banner-04.jpg`,
  `${IMAGE_BASE}labour-commissionerate-west-bengal-banner-05.jpg`,
  `${IMAGE_BASE}labour-commissionerate-west-bengal-banner-06.jpg`,
];

const Banner: FC = () => {
  const plugin = useRef<ReturnType<typeof Autoplay>>(
    Autoplay({ delay: 2500, stopOnInteraction: false })
  );

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [emblaApi, setEmblaApi] = useState<CarouselApi | null>(null);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full">
      <Carousel
        opts={{ loop: true }}
        plugins={[plugin.current]}
        setApi={setEmblaApi}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {images.map((src, index) => (
            <CarouselItem key={index}>
              <img
                src={src}
                alt={`Slide-${index}`}
                className="w-full h-auto object-cover"
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* ← LEFT ARROW */}
        <CarouselPrevious
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-white 
                     text-white rounded-full flex items-center justify-center h-10 w-10"
        >
          <ChevronLeft className="h-8 w-8" />
        </CarouselPrevious>

        {/* → RIGHT ARROW */}
        <CarouselNext
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-white 
                     text-white rounded-full flex items-center justify-center h-10 w-10"
        >
          <ChevronRight className="h-8 w-8" />
        </CarouselNext>
      </Carousel>

      {/* ●●● Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`w-3 h-3 rounded-full transition-all 
              ${selectedIndex === index ? "bg-white" : "bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;
