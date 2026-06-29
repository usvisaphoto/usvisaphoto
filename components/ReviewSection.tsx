export default function ReviewSection() {
  const reviews = [
    {
      name: "Michael",
      state: "California",
      text: "Accepted on my first submission. Very easy to use.",
      time: "2 hours ago",
    },
    {
      name: "Emily",
      state: "Texas",
      text: "Saved me a trip to a photo studio.",
      time: "Yesterday",
    },
    {
      name: "David",
      state: "New York",
      text: "Background removal worked perfectly.",
      time: "2 days ago",
    },
    {
      name: "Sarah",
      state: "Florida",
      text: "Fast download and great quality.",
      time: "3 days ago",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-200">
          CUSTOMER REVIEWS
        </p>

        <h2 className="mt-4 text-5xl font-extrabold text-white">
          Trusted by customers.
        </h2>

        <p className="mt-4 text-blue-100">
          Real experiences from people using USVisaPhoto.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {reviews.map((r) => (
          <div
            key={r.name}
            className="rounded-3xl border border-white/10 bg-white/10 p-8"
          >
            <div className="text-yellow-300 text-xl">★★★★★</div>

            <p className="mt-5 text-white">
              "{r.text}"
            </p>

            <div className="mt-6 flex justify-between">
              <div>
                <div className="font-bold text-white">{r.name}</div>
                <div className="text-blue-200">{r.state}</div>
              </div>

              <div className="text-blue-200">
                {r.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}