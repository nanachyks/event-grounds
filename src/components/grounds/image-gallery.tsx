"use client"
import { useEffect, useState } from "react"

export default function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    if (!lightboxOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false)
      if (e.key === "ArrowRight") setActiveIndex((i) => (i + 1) % images.length)
      if (e.key === "ArrowLeft") setActiveIndex((i) => (i - 1 + images.length) % images.length)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [lightboxOpen, images.length])

  if (images.length === 0) {
    return <div className="w-full h-[400px] bg-gray-200 rounded-xl flex items-center justify-center text-gray-400">No image</div>
  }

  function goPrev() {
    setActiveIndex((i) => (i - 1 + images.length) % images.length)
  }
  function goNext() {
    setActiveIndex((i) => (i + 1) % images.length)
  }

  return (
    <div>
      <div className="relative w-full h-[400px] rounded-xl overflow-hidden bg-gray-100 group">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="w-full h-full cursor-zoom-in"
          aria-label="View full size image"
        >
          <img src={images[activeIndex]} alt={alt} className="w-full h-full object-cover" />
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              &#8249;
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              &#8250;
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Show image ${i + 1}`}
                  onClick={() => setActiveIndex(i)}
                  className={`w-2 h-2 rounded-full transition ${i === activeIndex ? "bg-white" : "bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 mt-2">
          {images.slice(0, 4).map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`h-24 w-full rounded-lg overflow-hidden border-2 ${i === activeIndex ? "border-green-600" : "border-transparent"}`}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
            className="absolute top-4 right-4 text-white text-3xl leading-none hover:text-gray-300"
          >
            &times;
          </button>

          <img
            src={images[activeIndex]}
            alt={alt}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goPrev() }}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl leading-none hover:text-gray-300"
              >
                &#8249;
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goNext() }}
                aria-label="Next image"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl leading-none hover:text-gray-300"
              >
                &#8250;
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm">
                {activeIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
