
import { useEffect, useState } from "react";
import api from "../services/api";

import {
  Images,
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
  Loader2,
} from "lucide-react";

export default function Gallery() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch published gallery images from the backend
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/gallery");

        setGalleryItems(response.data.data || []);
      } catch (err) {
        console.error("Unable to load gallery:", err);
        setError(
          "We could not load the gallery at the moment. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  // Generate categories from available gallery images
  const categories = [
    "All",
    ...new Set(
      galleryItems
        .map((item) => item.category)
        .filter(Boolean)
    ),
  ];

  // Filter gallery images
  const filteredItems =
    activeCategory === "All"
      ? galleryItems
      : galleryItems.filter(
          (item) => item.category === activeCategory
        );

  // Open image
  const openImage = (item) => {
    setSelectedImage(item);
  };

  // Close image
  const closeImage = () => {
    setSelectedImage(null);
  };

  // Navigate to previous image
  const showPrevious = () => {
    if (!selectedImage || filteredItems.length === 0) return;

    const currentIndex = filteredItems.findIndex(
      (item) => item.id === selectedImage.id
    );

    const previousIndex =
      (currentIndex - 1 + filteredItems.length) %
      filteredItems.length;

    setSelectedImage(filteredItems[previousIndex]);
  };

  // Navigate to next image
  const showNext = () => {
    if (!selectedImage || filteredItems.length === 0) return;

    const currentIndex = filteredItems.findIndex(
      (item) => item.id === selectedImage.id
    );

    const nextIndex =
      (currentIndex + 1) % filteredItems.length;

    setSelectedImage(filteredItems[nextIndex]);
  };

  return (
    <div className="bg-white">
      {/* Page Header */}
      <section className="bg-green-950 px-5 py-20 text-white md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-green-300">
            <Images size={18} />
            <span>OUR GALLERY</span>
          </div>

          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">
            Stories of Hope, Action and Community
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-green-100">
            Explore moments that represent our commitment to
            education, healthcare, environmental conservation
            and community empowerment.
          </p>
        </div>
      </section>

      {/* Gallery Introduction */}
      <section className="px-5 py-16">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700">
            <Camera size={28} />
          </div>

          <h2 className="text-3xl font-bold text-green-950 md:text-4xl">
            Moments That Matter
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-gray-600">
            Every photograph tells a story of people, partnerships
            and collective efforts towards a stronger and more
            sustainable community.
          </p>
        </div>
      </section>

      {/* Category Filters */}
      {!loading && !error && galleryItems.length > 0 && (
        <section className="px-5 pb-6">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setSelectedImage(null);
                }}
                className={`rounded-full px-6 py-3 text-sm font-semibold transition ${
                  activeCategory === category
                    ? "bg-green-700 text-white shadow-lg"
                    : "border border-gray-200 bg-white text-gray-600 hover:border-green-600 hover:text-green-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Gallery Grid */}
      <section className="px-5 pb-20">
        <div className="mx-auto max-w-7xl">

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-green-700">
              <Loader2 size={38} className="animate-spin" />

              <p className="mt-4 text-gray-500">
                Loading gallery...
              </p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-600">
              {error}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && galleryItems.length === 0 && (
            <div className="rounded-2xl bg-green-50 px-6 py-16 text-center">
              <Images
                size={48}
                className="mx-auto text-green-700"
              />

              <h3 className="mt-5 text-xl font-bold text-green-950">
                Our Gallery Is Coming Soon
              </h3>

              <p className="mx-auto mt-3 max-w-lg leading-7 text-gray-600">
                Photographs of our community activities and
                initiatives will appear here as they are published.
              </p>
            </div>
          )}

          {/* Filtered Empty State */}
          {!loading &&
            !error &&
            galleryItems.length > 0 &&
            filteredItems.length === 0 && (
              <p className="py-12 text-center text-gray-500">
                No images found in this category.
              </p>
            )}

          {/* Gallery Images */}
          {!loading && !error && filteredItems.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredItems.map((item) => (
                <button
                  key={item.id || item._id || item.title}
                  onClick={() => openImage(item)}
                  className="group overflow-hidden rounded-2xl bg-white text-left shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title || "Foundation gallery"}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-green-950/80 via-transparent to-transparent opacity-80" />

                    <div className="absolute bottom-0 left-0 p-5 text-white">
                      <span className="mb-2 inline-block rounded-full bg-green-600 px-3 py-1 text-xs font-semibold">
                        {item.category}
                      </span>

                      <h3 className="text-lg font-bold">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Gallery Call to Action */}
      <section className="bg-green-50 px-5 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-green-950">
            Be Part of the Story
          </h2>

          <p className="mt-5 leading-8 text-gray-600">
            Join us in creating meaningful change and building
            brighter futures for communities.
          </p>

          <a
            href="/get-involved"
            className="mt-8 inline-flex rounded-lg bg-green-700 px-8 py-4 font-bold text-white transition hover:bg-green-800"
          >
            Get Involved
          </a>
        </div>
      </section>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={closeImage}
        >
          {/* Close Button */}
          <button
            onClick={closeImage}
            className="absolute right-5 top-5 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
            aria-label="Close image"
          >
            <X size={26} />
          </button>

          {/* Previous Image */}
          <button
            onClick={(event) => {
              event.stopPropagation();
              showPrevious();
            }}
            className="absolute left-3 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 md:left-8"
            aria-label="Previous image"
          >
            <ChevronLeft size={30} />
          </button>

          {/* Selected Image */}
          <div
            className="max-h-[85vh] max-w-5xl text-center"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={selectedImage.imageUrl}
              alt={selectedImage.title}
              className="max-h-[75vh] max-w-full rounded-xl object-contain"
            />

            <h3 className="mt-4 text-xl font-bold text-white">
              {selectedImage.title}
            </h3>

            <p className="mt-1 text-sm text-green-300">
              {selectedImage.category}
            </p>
          </div>

          {/* Next Image */}
          <button
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            className="absolute right-3 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 md:right-8"
            aria-label="Next image"
          >
            <ChevronRight size={30} />
          </button>
        </div>
      )}
    </div>
  );
}
