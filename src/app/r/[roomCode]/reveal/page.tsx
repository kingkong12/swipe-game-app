'use client';

import { useRouter, useParams } from 'next/navigation';
import { RevealSlideshow } from '@/components/swipe/RevealSlideshow';
import { getAllRevealSlides } from '@/lib/mock-data';

export default function RoomRevealPage() {
  const router = useRouter();
  const params = useParams();
  const roomCode = params.roomCode as string;

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
