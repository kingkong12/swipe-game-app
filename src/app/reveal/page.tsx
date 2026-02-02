'use client';

import { useRouter } from 'next/navigation';
import { RevealSlideshow } from '@/components/swipe/RevealSlideshow';
import { getAllRevealSlides } from '@/lib/mock-data';

export default function RevealPage() {
  const router = useRouter();

  const handleComplete = () => {
    router.push('/');
  };

  const slides = getAllRevealSlides().map((slide) => ({
    id: slide.id,
    title: slide.title,
    body: slide.body,
    imageUrl: slide.imageUrl,
    quote: slide.quote,
    quoteAuthor: slide.quoteAuthor,
  }));

  return <RevealSlideshow slides={slides} onComplete={handleComplete} />;
}
